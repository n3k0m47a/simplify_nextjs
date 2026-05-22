"use client";

import { useState } from "react";
import {
  PokedexFilters,
  usePokedexParams,
  type BoolFilterKey,
  type BoolFilterState,
  type PokedexView,
} from "@/components/pokedex/pokedex-filters";
import { PokedexTableBody } from "@/components/pokedex/pokedex-table";
import { PokedexCardsGrid } from "@/components/pokedex/pokedex-cards-grid";
import { PokedexFamiliesView } from "@/components/pokedex/pokedex-families-view";
import { PokedexEditSheet } from "@/components/pokedex/pokedex-edit-sheet";
import type { Pokedex } from "@/db/schema";

export function PokedexAdmin({
  entries,
  total,
  page,
  pageSize,
  search,
  forms,
  distinctForms,
  generations,
  boolFilters,
  view,
  familyMode,
}: {
  entries: Pokedex[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  forms: string[];
  distinctForms: string[];
  generations: number[];
  boolFilters: Record<BoolFilterKey, BoolFilterState>;
  view: PokedexView;
  familyMode: boolean;
}) {
  const [editEntry, setEditEntry] = useState<Pokedex | null>(null);

  const {
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
  } = usePokedexParams({ search, forms, generations, boolFilters, view, familyMode });

  const parentName =
    editEntry?.parentId != null
      ? entries.find((e) => e.id === editEntry.parentId)?.name
      : undefined;

  return (
    <div className="space-y-4">
      <PokedexFilters
        searchValue={searchValue}
        formsValue={formsValue}
        distinctForms={distinctForms}
        generationsValue={generationsValue}
        boolFilters={boolFilters}
        view={view}
        familyMode={familyMode}
        onSearch={handleSearch}
        onFormToggle={handleFormToggle}
        onFormsClear={handleFormsClear}
        onGenerationToggle={handleGenerationToggle}
        onGenerationsClear={handleGenerationsClear}
        onBoolFilter={handleBoolFilter}
        onViewChange={handleViewChange}
        onFamilyModeToggle={handleFamilyModeToggle}
      />

      {view === "table" && (
        <PokedexTableBody
          entries={entries}
          total={total}
          page={page}
          pageSize={pageSize}
          onEdit={setEditEntry}
          onPageChange={handlePageChange}
        />
      )}

      {view === "cards" && !familyMode && (
        <PokedexCardsGrid
          entries={entries}
          total={total}
          page={page}
          pageSize={pageSize}
          onEdit={setEditEntry}
          onPageChange={handlePageChange}
        />
      )}

      {view === "cards" && familyMode && (
        <PokedexFamiliesView
          key={entries.map((e) => `${e.id}:${e.parentId ?? ""}`).join(",")}
          entries={entries}
          total={total}
          onEdit={setEditEntry}
        />
      )}

      {editEntry && (
        <PokedexEditSheet
          entry={editEntry}
          parentName={parentName}
          open={true}
          onClose={() => setEditEntry(null)}
        />
      )}
    </div>
  );
}
