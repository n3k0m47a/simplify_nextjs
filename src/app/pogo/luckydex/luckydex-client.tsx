"use client";

import { useState, useTransition, useMemo } from "react";
import { toggleLucky } from "../actions";
import type { Avatar, Pokedex } from "@/db/schema";

type LuckyEntry = { avatarId: number; pokedexId: number };

interface Props {
  pokedex: Pokedex[];
  avatars: Avatar[];
  luckyEntries: LuckyEntry[];
}

export function LuckydexClient({ pokedex, avatars, luckyEntries }: Props) {
  const [luckySet, setLuckySet] = useState(
    () => new Set(luckyEntries.map((e) => `${e.avatarId}-${e.pokedexId}`)),
  );
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pokedex;
    return pokedex.filter(
      (p) => p.name.toLowerCase().includes(q) || String(p.id).includes(q),
    );
  }, [pokedex, search]);

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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Luckydex</h1>
        {pending && <span className="text-sm text-muted-foreground">Speichern…</span>}
      </div>

      <input
        type="search"
        placeholder="Suche nach Name oder Nummer…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-3 py-1.5 text-sm w-full max-w-xs"
      />

      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left px-2 py-1 w-12">#</th>
              <th className="text-left px-2 py-1">Name</th>
              {avatars.map((av) => (
                <th key={av.id} className="px-2 py-1 text-center whitespace-nowrap">
                  {av.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b hover:bg-muted/30">
                <td className="px-2 py-1 text-muted-foreground">{p.id}</td>
                <td className="px-2 py-1 font-medium">{p.name}</td>
                {avatars.map((av) => {
                  const isLucky = luckySet.has(`${av.id}-${p.id}`);
                  return (
                    <td key={av.id} className="px-2 py-1 text-center">
                      <button
                        onClick={() => handleToggle(av.id, p.id)}
                        className="w-6 h-6 rounded text-base leading-none hover:scale-110 transition-transform"
                        title={isLucky ? "Lucky entfernen" : "Als Lucky markieren"}
                      >
                        {isLucky ? "⭐" : "·"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
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
