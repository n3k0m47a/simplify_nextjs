"use client";

import { useState, useTransition, useMemo, useCallback, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Copy, Check, ChevronDown, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toggleLucky } from "../actions";
import type { Avatar, Pokedex } from "@/db/schema";

const FILTER_OPTIONS = [
  { value: 'schillernd', label: 'schillernd', hint: 'Shiny' },
  { value: 'Glücks-Pokémon', label: 'Glücks-Pokémon', hint: 'Lucky' },
  { value: 'legendär', label: 'legendär', hint: 'Legendary' },
  { value: 'mysteriös', label: 'mysteriös', hint: 'Mythical' },
  { value: 'Crypto', label: 'Crypto', hint: 'Shadow' },
  { value: 'erlöst', label: 'erlöst', hint: 'Purified' },
  { value: 'favorisiert', label: 'favorisiert', hint: 'Favorite' },
  { value: 'getauscht', label: 'getauscht', hint: 'Traded' },
  { value: 'geschlüpft', label: 'geschlüpft', hint: 'Hatched' },
  { value: 'entwickelbar', label: 'entwickelbar', hint: 'Evolve' },
  { value: 'neue Entwicklung', label: 'neue Entwicklung', hint: 'Evolve New' },
  { value: 'megaentwickelbar', label: 'megaentwickelbar', hint: 'Mega' },
  { value: 'Dynamax', label: 'Dynamax', hint: 'Dynamax' },
  { value: 'Gigadynamax', label: 'Gigadynamax', hint: 'Gigantamax' },
  { value: 'age0', label: 'age0', hint: 'heute gefangen' },
  { value: '@spezial', label: '@spezial', hint: 'besondere Attacke' },
  { value: '4*', label: '4*', hint: '100% IV' },
  { value: '3*', label: '3*', hint: 'gute Bewertung' },
  { value: '0*,1*,2*', label: '0*,1*,2*', hint: 'niedrige Bewertung' },
  { value: 'hintergrund', label: 'hintergrund', hint: 'mit Hintergrund' },
  { value: 'kostümiert', label: 'kostümiert', hint: 'mit Kostüm' },
  { value: 'xxl', label: 'xxl', hint: 'XXL' },
] as const

function formatNosAsRanges(nos: number[]): string {
  if (nos.length === 0) return ''
  const sorted = [...new Set(nos)].sort((a, b) => a - b)
  const parts: string[] = []
  let start = sorted[0]
  let end = sorted[0]

  function flush() {
    if (end - start >= 2) {
      parts.push(`${start}-${end}`)
    } else {
      for (let n = start; n <= end; n++) parts.push(String(n))
    }
  }

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i]
    } else {
      flush()
      start = sorted[i]
      end = sorted[i]
    }
  }
  flush()

  return parts.join(',')
}

function buildString(nos: string, filters: string[], excludeFilters: string[]): string {
  const parts = [...filters, ...excludeFilters.map((f) => `!${f}`)]
  if (nos) parts.push(nos)
  return parts.join('&')
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy} disabled={!text} className="shrink-0">
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Kopiert!' : 'Kopieren'}
    </Button>
  )
}

function FilterDropdown({
  selected,
  onChange,
  label,
}: {
  selected: string[]
  onChange: (v: string[]) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((f) => f !== value) : [...selected, value])

  return (
    <div ref={ref} className="relative">
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen((o) => !o)} className="gap-1">
        {label}
        {selected.length > 0 ? ` (${selected.length})` : ''}
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>
      {open && (
        <div className="bg-popover border-border absolute top-full left-0 z-50 mt-1 max-h-72 w-64 overflow-y-auto rounded-md border p-2 shadow-md">
          <div className="grid gap-0.5">
            {FILTER_OPTIONS.map((opt) => {
              const checked = selected.includes(opt.value)
              return (
                <label
                  key={opt.value}
                  className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt.value)}
                    className="accent-primary h-3.5 w-3.5"
                  />
                  <span className="font-mono text-xs">{opt.label}</span>
                  <span className="text-muted-foreground ml-auto text-xs">{opt.hint}</span>
                </label>
              )
            })}
          </div>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-muted-foreground hover:text-foreground mt-1 w-full rounded px-2 py-1 text-left text-xs"
            >
              Auswahl zurücksetzen
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SearchStringDialog({
  pokedex,
  avatars,
  luckySet,
}: {
  pokedex: Pokedex[]
  avatars: Avatar[]
  luckySet: Set<string>
}) {
  const [open, setOpen] = useState(false)
  const [selectedAvatarId, setSelectedAvatarId] = useState(avatars[0]?.id)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [excludeFilters, setExcludeFilters] = useState<string[]>([])
  const [onlyTrade, setOnlyTrade] = useState(false)

  const filteredPokedex = useMemo(
    () => (onlyTrade ? pokedex.filter((p) => p.trade) : pokedex),
    [pokedex, onlyTrade]
  )

  const luckyNos = useMemo(() => {
    const map = new Map<number, Set<number>>()
    for (const av of avatars) {
      map.set(av.id, new Set(filteredPokedex.filter((p) => luckySet.has(`${av.id}-${p.id}`)).map((p) => p.pokemonNo)))
    }
    return map
  }, [luckySet, filteredPokedex, avatars])

  const { missingNos, inOtherNos } = useMemo(() => {
    if (!selectedAvatarId) return { missingNos: '', inOtherNos: '' }
    const thisLucky = luckyNos.get(selectedAvatarId) ?? new Set<number>()
    const otherAvatars = avatars.filter((av) => av.id !== selectedAvatarId)

    const missing = formatNosAsRanges(filteredPokedex.filter((p) => !thisLucky.has(p.pokemonNo)).map((p) => p.pokemonNo))
    const inOther = formatNosAsRanges(
      filteredPokedex
        .filter((p) => thisLucky.has(p.pokemonNo) && otherAvatars.some((av) => luckyNos.get(av.id)?.has(p.pokemonNo)))
        .map((p) => p.pokemonNo)
    )

    return { missingNos: missing, inOtherNos: inOther }
  }, [selectedAvatarId, luckyNos, filteredPokedex, avatars])

  const missingString = buildString(missingNos, selectedFilters, excludeFilters)
  const inOtherString = buildString(inOtherNos, selectedFilters, excludeFilters)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<button className="hover:bg-muted flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors" />}
      >
        <Wand2 className="h-3.5 w-3.5" />
        Suchstrings
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pokémon GO Suchstrings</DialogTitle>
        </DialogHeader>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Avatar:</span>
            <select
              value={selectedAvatarId ?? ''}
              onChange={(e) => setSelectedAvatarId(parseInt(e.target.value, 10))}
              className="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
            >
              {avatars.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <FilterDropdown label="Enthält" selected={selectedFilters} onChange={setSelectedFilters} />
            <FilterDropdown label="Ohne" selected={excludeFilters} onChange={setExcludeFilters} />
            <label className="flex cursor-pointer items-center gap-1.5 text-sm select-none">
              <input
                type="checkbox"
                checked={onlyTrade}
                onChange={(e) => setOnlyTrade(e.target.checked)}
                className="accent-primary h-3.5 w-3.5"
              />
              <span className="text-xs">Nur trade=1</span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFilters([])
                setExcludeFilters([])
                setOnlyTrade(false)
              }}
            >
              Zurücksetzen
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFilters(['0*,1*,2*'])
                setExcludeFilters(['@spezial', 'hintergrund', 'schillernd', 'Gigadynamax', 'Dynamax', 'kostümiert', 'xxl'])
              }}
            >
              Normal
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">braucht noch</span>
                <CopyButton text={missingString} />
              </div>
              {missingString ? (
                <textarea
                  readOnly
                  value={missingString}
                  className="h-20 w-full resize-none rounded-md border px-3 py-2 font-mono text-xs"
                />
              ) : (
                <p className="text-muted-foreground text-sm">Alle lucky! ✓</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">kann weg</span>
                <CopyButton text={inOtherString} />
              </div>
              {inOtherString ? (
                <textarea
                  readOnly
                  value={inOtherString}
                  className="h-20 w-full resize-none rounded-md border px-3 py-2 font-mono text-xs"
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  {avatars.length <= 1 ? 'Kein weiterer Avatar vorhanden' : 'Keine Duplikate bei anderen Avataren'}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
        terms.some((t) => {
          if (/^\d+$/.test(t)) return p.pokemonNo === Number(t)
          return p.name.toLowerCase().includes(t)
        }),
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
        {avatars.length > 0 && (
          <SearchStringDialog pokedex={pokedex} avatars={avatars} luckySet={luckySet} />
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
