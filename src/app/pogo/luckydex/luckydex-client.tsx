"use client";

import { useState, useTransition, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { toggleLucky } from "../actions";
import type { Avatar, Pokedex } from "@/db/schema";

type LuckyEntry = {
  avatarId: number;
  pokedexId: number;
  updatedAt: Date | null;
  createdAt: Date | null;
};

interface Props {
  pokedex: Pokedex[];
  avatars: Avatar[];
  luckyEntries: LuckyEntry[];
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <span className="ml-1 text-xs">▲</span>;
  if (sorted === "desc") return <span className="ml-1 text-xs">▼</span>;
  return <span className="ml-1 text-xs opacity-30">⇅</span>;
}

export function LuckydexClient({ pokedex, avatars, luckyEntries }: Props) {
  const [luckySet, setLuckySet] = useState(
    () => new Set(luckyEntries.map((e) => `${e.avatarId}-${e.pokedexId}`)),
  );
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "pokemonNo", desc: false }]);
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);

  const lastLuckyChange = useMemo(() => {
    const map = new Map<number, Date>();
    for (const e of luckyEntries) {
      const d = e.updatedAt ?? e.createdAt;
      if (!d) continue;
      const prev = map.get(e.pokedexId);
      if (!prev || d > prev) map.set(e.pokedexId, d);
    }
    return map;
  }, [luckyEntries]);

  const displayData = useMemo(() => {
    const terms = search
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    let result = pokedex;

    if (terms.length > 0) {
      result = result.filter((p) =>
        terms.some(
          (t) =>
            p.name.toLowerCase().includes(t) ||
            String(p.pokemonNo).includes(t),
        ),
      );
    }

    if (onlyIncomplete && avatars.length > 0) {
      result = result.filter((p) =>
        avatars.some((av) => !luckySet.has(`${av.id}-${p.id}`)),
      );
    }

    return result;
  }, [pokedex, search, onlyIncomplete, avatars, luckySet]);

  const columns = useMemo<ColumnDef<Pokedex>[]>(() => {
    const base: ColumnDef<Pokedex>[] = [
      {
        id: "lastChange",
        accessorFn: (row) => lastLuckyChange.get(row.id)?.getTime() ?? 0,
        header: "",
        enableHiding: true,
      },
      {
        accessorKey: "pokemonNo",
        header: ({ column }) => (
          <button
            className="flex items-center font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nr.
            <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<number>()}</span>
        ),
        size: 64,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<string>()}</span>
        ),
      },
      ...avatars.map<ColumnDef<Pokedex>>((av) => ({
        id: `avatar-${av.id}`,
        accessorFn: (row) => (luckySet.has(`${av.id}-${row.id}`) ? 1 : 0),
        header: ({ column }) => (
          <button
            className="flex items-center justify-center w-full font-semibold whitespace-nowrap"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {av.name}
            <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => {
          const isLucky = luckySet.has(`${av.id}-${row.original.id}`);
          return (
            <button
              onClick={() => handleToggle(av.id, row.original.id)}
              className="w-6 h-6 rounded text-base leading-none hover:scale-110 transition-transform"
              title={isLucky ? "Lucky entfernen" : "Als Lucky markieren"}
            >
              {isLucky ? "⭐" : "·"}
            </button>
          );
        },
        sortingFn: "basic",
      })),
    ];
    return base;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatars, luckySet]);

  const table = useReactTable({
    data: displayData,
    columns,
    state: { sorting, columnVisibility: { lastChange: false } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleToggle(avatarId: number, pokedexId: number) {
    const key = `${avatarId}-${pokedexId}`;
    setLuckySet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    startTransition(async () => {
      await toggleLucky(avatarId, pokedexId);
    });
  }

  const isLastChangeSorting = sorting.length === 1 && sorting[0].id === "lastChange";

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Luckydex</h1>
        {pending && <span className="text-sm text-muted-foreground">Speichern…</span>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Suche nach Name oder Nummer… (Komma trennt)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm w-full max-w-sm"
        />
        <button
          onClick={() =>
            setSorting(
              isLastChangeSorting
                ? [{ id: "pokemonNo", desc: false }]
                : [{ id: "lastChange", desc: true }],
            )
          }
          className={`px-3 py-1.5 text-sm rounded border transition-colors ${
            isLastChangeSorting
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:bg-muted border-border"
          }`}
        >
          Zuletzt geändert
        </button>
        {avatars.length > 0 && (
          <button
            onClick={() => setOnlyIncomplete((v) => !v)}
            className={`px-3 py-1.5 text-sm rounded border transition-colors ${
              onlyIncomplete
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted border-border"
            }`}
          >
            Nur fehlende
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-2 py-1"
                    style={header.column.id === "pokemonNo" ? { width: 64 } : undefined}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-2 py-1${cell.column.id.startsWith("avatar-") ? " text-center" : ""}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Keine Pokémon gefunden.</p>
        )}
      </div>

      {avatars.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {pokedex.length === 0
            ? "Keine Pokédex-Daten vorhanden."
            : "Melde dich an und lege Avatare an, um Lucky-Pokémon zu markieren."}
        </p>
      )}
    </div>
  );
}
