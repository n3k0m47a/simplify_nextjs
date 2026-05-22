"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { PokedexCard } from "@/components/pokedex/pokedex-card";
import { PokedexPagination } from "@/components/pokedex/pokedex-pagination";
import { setTrade } from "@/app/(backend)/pokedex/actions";
import type { Pokedex } from "@/db/schema";

export function PokedexCardsGrid({
  entries,
  total,
  page,
  pageSize,
  onEdit,
  onPageChange,
}: {
  entries: Pokedex[];
  total: number;
  page: number;
  pageSize: number;
  onEdit: (entry: Pokedex) => void;
  onPageChange: (page: number) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.ceil(total / pageSize);

  const handleToggleTrade = (entry: Pokedex) => {
    startTransition(async () => {
      await setTrade(entry.id, !entry.trade);
      router.refresh();
    });
  };

  if (entries.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8 rounded-lg border">
        Keine Einträge gefunden.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {entries.map((entry) => (
          <PokedexCard
            key={entry.id}
            entry={entry}
            disabled={isPending}
            onEdit={() => onEdit(entry)}
            onToggleTrade={() => handleToggleTrade(entry)}
          />
        ))}
      </div>
      <PokedexPagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={onPageChange}
      />
    </div>
  );
}
