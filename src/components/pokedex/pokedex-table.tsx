"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PencilIcon, CheckCircleIcon, CircleIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { setTrade, updatePokedex } from "@/app/(backend)/pokedex/actions";
import { PokedexEditSheet } from "@/components/pokedex/pokedex-edit-sheet";
import type { Pokedex } from "@/db/schema";

type BoolFilterKey =
  | "baby"
  | "legendary"
  | "mythical"
  | "ultraBeast"
  | "released"
  | "exclusive"
  | "regional"
  | "notTradeable"
  | "trade";

type BoolFilterState = "include" | "exclude" | "neutral";

const BOOL_COLUMNS: { key: BoolFilterKey; short: string; label: string }[] = [
  { key: "baby", short: "Ba", label: "Baby" },
  { key: "legendary", short: "Le", label: "Legendär" },
  { key: "mythical", short: "My", label: "Mysteriös" },
  { key: "ultraBeast", short: "UB", label: "Ultra-Kreatur" },
  { key: "released", short: "Ve", label: "Verfügbar" },
  { key: "exclusive", short: "Ex", label: "Exklusiv" },
  { key: "regional", short: "Re", label: "Regional" },
  { key: "notTradeable", short: "NT", label: "Nicht tauschbar" },
  { key: "trade", short: "Tr", label: "Trade" },
];

export function PokedexTable({
  entries,
  total,
  page,
  pageSize,
  search,
  form,
  boolFilters,
}: {
  entries: Pokedex[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  form: string;
  boolFilters: Record<BoolFilterKey, BoolFilterState>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(search);
  const [formValue, setFormValue] = useState(form);
  const [debounceSearch, setDebounceSearch] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [debounceForm, setDebounceForm] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [editEntry, setEditEntry] = useState<Pokedex | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  function buildParams(overrides: Partial<Record<string, string | undefined>>) {
    const current: Record<string, string> = {};
    if (searchValue) current.search = searchValue;
    if (formValue) current.form = formValue;
    for (const key of Object.keys(boolFilters) as BoolFilterKey[]) {
      if (boolFilters[key] === "include") current[key] = "1";
      else if (boolFilters[key] === "exclude") current[key] = "0";
    }
    const merged = { ...current, ...overrides };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "") p.set(k, v);
    }
    return p;
  }

  function nextBoolState(current: BoolFilterState): BoolFilterState {
    if (current === "neutral") return "include";
    if (current === "include") return "exclude";
    return "neutral";
  }

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceSearch) clearTimeout(debounceSearch);
      const timer = setTimeout(() => {
        router.replace(`/pokedex?${buildParams({ search: value || undefined, page: undefined }).toString()}`);
      }, 300);
      setDebounceSearch(timer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debounceSearch, router, formValue, boolFilters],
  );

  const handleFormFilter = useCallback(
    (value: string) => {
      setFormValue(value);
      if (debounceForm) clearTimeout(debounceForm);
      const timer = setTimeout(() => {
        router.replace(`/pokedex?${buildParams({ form: value || undefined, page: undefined }).toString()}`);
      }, 300);
      setDebounceForm(timer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debounceForm, router, searchValue, boolFilters],
  );

  const handleBoolFilter = (key: BoolFilterKey) => {
    const next = nextBoolState(boolFilters[key]);
    const paramVal = next === "include" ? "1" : next === "exclude" ? "0" : undefined;
    router.replace(
      `/pokedex?${buildParams({ [key]: paramVal, page: undefined }).toString()}`,
    );
  };

  const handlePageChange = (newPage: number) => {
    router.replace(`/pokedex?${buildParams({ page: String(newPage) }).toString()}`);
  };

  const handleToggleTrade = (entry: Pokedex) => {
    startTransition(async () => {
      await setTrade(entry.id, !entry.trade);
      router.refresh();
    });
  };

  const handleToggleBool = (entry: Pokedex, key: BoolFilterKey) => {
    startTransition(async () => {
      await updatePokedex(entry.id, { [key]: !entry[key] });
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Suche nach Name oder Nummer…"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="Form filtern…"
          value={formValue}
          onChange={(e) => handleFormFilter(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-1">
          {BOOL_COLUMNS.map(({ key, label }) => {
            const state = boolFilters[key];
            return (
              <button
                key={key}
                onClick={() => handleBoolFilter(key)}
                className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                  state === "include"
                    ? "bg-primary text-primary-foreground border-primary"
                    : state === "exclude"
                      ? "bg-destructive text-destructive-foreground border-destructive"
                      : "bg-background text-muted-foreground border-input hover:border-ring"
                }`}
                title={
                  state === "include"
                    ? `${label} ausblenden (nochmal klicken)`
                    : state === "exclude"
                      ? `${label} – Filter entfernen`
                      : `Nur ${label} anzeigen`
                }
              >
                {state === "include" && <span className="mr-0.5">✓</span>}
                {state === "exclude" && <span className="mr-0.5">✗</span>}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">#</TableHead>
              <TableHead className="w-12" />
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Form</TableHead>
              <TableHead className="hidden md:table-cell">Typen</TableHead>
              {BOOL_COLUMNS.map(({ key, short, label }) => (
                <TableHead
                  key={key}
                  className="hidden xl:table-cell w-10 text-center px-1"
                  title={label}
                >
                  {short}
                </TableHead>
              ))}
              <TableHead className="w-20 text-center">Trade</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center text-muted-foreground py-8">
                  Keine Einträge gefunden.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-muted-foreground text-xs">
                    {entry.pokemonNo}
                  </TableCell>
                  <TableCell>
                    {entry.src && (
                      <Image
                        src={`/images/pogo/${entry.src}`}
                        alt={entry.name}
                        width={40}
                        height={40}
                        loading="lazy"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{entry.name}</div>
                    {entry.nameEn && (
                      <div className="text-xs text-muted-foreground">{entry.nameEn}</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {entry.form ?? "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex gap-1">
                      {entry.type1 && <Badge variant="outline">{entry.type1}</Badge>}
                      {entry.type2 && <Badge variant="outline">{entry.type2}</Badge>}
                    </div>
                  </TableCell>
                  {BOOL_COLUMNS.map(({ key, label }) => (
                    <TableCell key={key} className="hidden xl:table-cell text-center px-1">
                      <button
                        onClick={() => handleToggleBool(entry, key)}
                        disabled={isPending}
                        className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:bg-accent disabled:opacity-50"
                        title={
                          entry[key]
                            ? `${label} aktiv – klicken zum Deaktivieren`
                            : `${label} inaktiv – klicken zum Aktivieren`
                        }
                      >
                        {entry[key] ? (
                          <CheckCircleIcon className="size-3.5 text-primary" />
                        ) : (
                          <CircleIcon className="size-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleToggleTrade(entry)}
                      disabled={isPending}
                      className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:bg-accent disabled:opacity-50"
                      title={entry.trade ? "Trade aktiv – klicken zum Deaktivieren" : "Trade inaktiv – klicken zum Aktivieren"}
                    >
                      {entry.trade ? (
                        <CheckCircleIcon className="size-4 text-primary" />
                      ) : (
                        <CircleIcon className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditEntry(entry)}
                      title="Bearbeiten"
                    >
                      <PencilIcon className="size-3.5" />
                      <span className="sr-only">Bearbeiten</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Seite {page} von {totalPages} ({total} Einträge)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Weiter
            </Button>
          </div>
        </div>
      )}

      {editEntry && (
        <PokedexEditSheet
          entry={editEntry}
          open={true}
          onClose={() => setEditEntry(null)}
        />
      )}
    </div>
  );
}
