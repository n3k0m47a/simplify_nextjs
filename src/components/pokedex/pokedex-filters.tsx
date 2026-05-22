"use client";

import { useState, useCallback } from "react";
import { FORM_NONE } from "@/lib/pokedex-constants";
import { useRouter } from "next/navigation";
import { LayoutGrid, TableIcon, GitBranch, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type BoolFilterKey =
  | "baby"
  | "legendary"
  | "mythical"
  | "ultraBeast"
  | "released"
  | "exclusive"
  | "regional"
  | "notTradeable"
  | "trade";

export type BoolFilterState = "include" | "exclude" | "neutral";

export type PokedexView = "table" | "cards";

export const BOOL_COLUMNS: { key: BoolFilterKey; short: string; label: string }[] = [
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

function nextBoolState(current: BoolFilterState): BoolFilterState {
  if (current === "neutral") return "include";
  if (current === "include") return "exclude";
  return "neutral";
}

export function usePokedexParams({
  search,
  forms,
  generations,
  boolFilters,
  view,
  familyMode,
}: {
  search: string;
  forms: string[];
  generations: number[];
  boolFilters: Record<BoolFilterKey, BoolFilterState>;
  view: PokedexView;
  familyMode: boolean;
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(search);
  const [formsValue, setFormsValue] = useState<string[]>(forms);
  const [generationsValue, setGenerationsValue] = useState<number[]>(generations);
  const [debounceSearch, setDebounceSearch] = useState<ReturnType<typeof setTimeout> | null>(null);

  function buildParams(overrides: Partial<Record<string, string | undefined>>) {
    const current: Record<string, string> = {};
    if (searchValue) current.search = searchValue;
    if (formsValue.length > 0) current.form = formsValue.join(",");
    if (generationsValue.length > 0) current.generation = generationsValue.join(",");
    if (view === "cards") current.view = "cards";
    if (view === "cards" && familyMode) current.family = "1";
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

  const navigate = (overrides: Partial<Record<string, string | undefined>>) => {
    router.replace(`/pokedex?${buildParams(overrides).toString()}`);
  };

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceSearch) clearTimeout(debounceSearch);
      const timer = setTimeout(() => {
        navigate({ search: value || undefined, page: undefined });
      }, 300);
      setDebounceSearch(timer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debounceSearch, router, formsValue, generationsValue, boolFilters, view, familyMode],
  );

  const handleFormToggle = (form: string) => {
    const next = formsValue.includes(form)
      ? formsValue.filter((f) => f !== form)
      : [...formsValue, form];
    setFormsValue(next);
    navigate({ form: next.length > 0 ? next.join(",") : undefined, page: undefined });
  };

  const handleFormsClear = () => {
    setFormsValue([]);
    navigate({ form: undefined, page: undefined });
  };

  const handleGenerationToggle = (gen: number) => {
    const next = generationsValue.includes(gen)
      ? generationsValue.filter((g) => g !== gen)
      : [...generationsValue, gen].sort((a, b) => a - b);
    setGenerationsValue(next);
    navigate({ generation: next.length > 0 ? next.join(",") : undefined, page: undefined });
  };

  const handleGenerationsClear = () => {
    setGenerationsValue([]);
    navigate({ generation: undefined, page: undefined });
  };

  const handleBoolFilter = (key: BoolFilterKey) => {
    const next = nextBoolState(boolFilters[key]);
    const paramVal = next === "include" ? "1" : next === "exclude" ? "0" : undefined;
    navigate({ [key]: paramVal, page: undefined });
  };

  const handlePageChange = (newPage: number) => {
    navigate({ page: String(newPage) });
  };

  const handleViewChange = (newView: PokedexView) => {
    navigate({
      view: newView === "cards" ? "cards" : undefined,
      family: newView === "cards" && familyMode ? "1" : undefined,
      page: undefined,
    });
  };

  const handleFamilyModeToggle = () => {
    navigate({
      view: "cards",
      family: familyMode ? undefined : "1",
      page: undefined,
    });
  };

  return {
    searchValue,
    formsValue,
    generationsValue,
    handleSearch,
    handleFormToggle,
    handleFormsClear,
    handleGenerationToggle,
    handleGenerationsClear,
    handleBoolFilter,
    handlePageChange,
    handleViewChange,
    handleFamilyModeToggle,
  };
}

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function PokedexFilters({
  searchValue,
  formsValue,
  distinctForms,
  generationsValue,
  boolFilters,
  view,
  familyMode,
  onSearch,
  onFormToggle,
  onFormsClear,
  onGenerationToggle,
  onGenerationsClear,
  onBoolFilter,
  onViewChange,
  onFamilyModeToggle,
}: {
  searchValue: string;
  formsValue: string[];
  distinctForms: string[];
  generationsValue: number[];
  boolFilters: Record<BoolFilterKey, BoolFilterState>;
  view: PokedexView;
  familyMode: boolean;
  onSearch: (value: string) => void;
  onFormToggle: (form: string) => void;
  onFormsClear: () => void;
  onGenerationToggle: (gen: number) => void;
  onGenerationsClear: () => void;
  onBoolFilter: (key: BoolFilterKey) => void;
  onViewChange: (view: PokedexView) => void;
  onFamilyModeToggle: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative">
        <Input
          placeholder="Suche nach Name oder Nummer… (Komma trennt)"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className={`max-w-xs${searchValue ? " pr-7" : ""}`}
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({
              variant: formsValue.length > 0 ? "default" : "outline",
              size: "sm",
            }),
            "gap-1",
          )}
        >
          <span>{formsValue.length > 0 ? `Form (${formsValue.length})` : "Form"}</span>
          <ChevronDown className="size-4 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-64 min-w-40 overflow-y-auto">
          {formsValue.length > 0 && (
            <>
              <DropdownMenuItem onClick={onFormsClear}>Auswahl löschen</DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuCheckboxItem
            checked={formsValue.includes(FORM_NONE)}
            closeOnClick={false}
            onCheckedChange={() => onFormToggle(FORM_NONE)}
          >
            Ohne Angabe
          </DropdownMenuCheckboxItem>
          {distinctForms.length > 0 && <DropdownMenuSeparator />}
          {distinctForms.map((form) => (
            <DropdownMenuCheckboxItem
              key={form}
              checked={formsValue.includes(form)}
              closeOnClick={false}
              onCheckedChange={() => onFormToggle(form)}
            >
              {form}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({
              variant: generationsValue.length > 0 ? "default" : "outline",
              size: "sm",
            }),
            "gap-1",
          )}
        >
          <span>
            {generationsValue.length > 0
              ? `Generation (${generationsValue.length})`
              : "Generation"}
          </span>
          <ChevronDown className="size-4 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-40">
          {generationsValue.length > 0 && (
            <>
              <DropdownMenuItem onClick={onGenerationsClear}>Auswahl löschen</DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {GENERATIONS.map((gen) => (
            <DropdownMenuCheckboxItem
              key={gen}
              checked={generationsValue.includes(gen)}
              closeOnClick={false}
              onCheckedChange={() => onGenerationToggle(gen)}
            >
              Generation {gen}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex gap-1 border rounded-lg p-0.5">
        <Button
          type="button"
          variant={view === "table" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange("table")}
          title="Tabellenansicht"
        >
          <TableIcon className="size-4" />
          <span className="sr-only">Tabelle</span>
        </Button>
        <Button
          type="button"
          variant={view === "cards" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange("cards")}
          title="Kartenansicht"
        >
          <LayoutGrid className="size-4" />
          <span className="sr-only">Karten</span>
        </Button>
      </div>
      {view === "cards" && (
        <Button
          type="button"
          variant={familyMode ? "default" : "outline"}
          size="sm"
          onClick={onFamilyModeToggle}
        >
          <GitBranch className="size-4" />
          Familien
        </Button>
      )}
      <div className="flex flex-wrap gap-1">
        {BOOL_COLUMNS.map(({ key, label }) => {
          const state = boolFilters[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onBoolFilter(key)}
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
  );
}
