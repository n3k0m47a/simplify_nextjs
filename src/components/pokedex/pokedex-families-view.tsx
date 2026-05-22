"use client";

import { useState, useTransition, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PokedexCard, getPokedexDragId } from "@/components/pokedex/pokedex-card";
import { setTrade, setParentId } from "@/app/(backend)/pokedex/actions";
import { buildFamilyRows, wouldCreateCycleLocal } from "@/lib/pokedex-families";
import type { Pokedex } from "@/db/schema";

export function PokedexFamiliesView({
  entries: initialEntries,
  total,
  onEdit,
}: {
  entries: Pokedex[];
  total: number;
  onEdit: (entry: Pokedex) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [entries, setEntries] = useState(initialEntries);

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTargetId, setDropTargetId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dragPayloadRef = useRef<number | null>(null);
  const draggingIdRef = useRef<number | null>(null);

  const rows = useMemo(() => buildFamilyRows(entries), [entries]);

  const handleDrop = useCallback(
    (childId: number, parentId: number | null) => {
      const childName = entries.find((e) => e.id === childId)?.name ?? childId;
      const parentName = parentId != null ? (entries.find((e) => e.id === parentId)?.name ?? parentId) : "kein Parent";
      console.log(`[DnD] handleDrop — child="${childName}" (${childId}) → parent="${parentName}" (${parentId})`);

      if (childId === parentId) {
        console.warn("[DnD] abgebrochen: Kind = Parent");
        setError("Ein Pokémon kann nicht sein eigener Parent sein.");
        return;
      }

      if (parentId != null && wouldCreateCycleLocal(entries, childId, parentId)) {
        console.warn("[DnD] abgebrochen: Zyklus erkannt");
        setError("Diese Zuordnung würde einen Zyklus erzeugen.");
        return;
      }

      setError(null);
      const prev = entries;

      setEntries((current) =>
        current.map((e) =>
          e.id === childId ? { ...e, parentId } : e,
        ),
      );

      startTransition(async () => {
        try {
          console.log(`[DnD] → server: setParentId(${childId}, ${parentId})`);
          await setParentId(childId, parentId);
          console.log("[DnD] ✓ server erfolgreich");
          router.refresh();
        } catch (err) {
          console.error("[DnD] ✗ server Fehler:", err);
          setEntries(prev);
          setError(err instanceof Error ? err.message : "Fehler beim Speichern.");
        }
      });
    },
    [entries, router],
  );

  // Stable card handlers — only recreated when entries/onEdit/handleDrop change,
  // not on every dragover. This keeps React.memo on PokedexCard effective.
  const handleCardEdit = useCallback(
    (id: number) => {
      const entry = entries.find((e) => e.id === id);
      if (entry) onEdit(entry);
    },
    [entries, onEdit],
  );

  const handleCardToggleTrade = useCallback(
    (id: number) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      const nextTrade = !entry.trade;
      const prev = entries;
      setEntries((current) =>
        current.map((e) => (e.id === id ? { ...e, trade: nextTrade } : e)),
      );
      startTransition(async () => {
        try {
          await setTrade(id, nextTrade);
          router.refresh();
        } catch {
          setEntries(prev);
        }
      });
    },
    [entries, router],
  );

  const handleCardDragStart = useCallback((id: number) => {
    const name = entries.find((e) => e.id === id)?.name ?? id;
    console.log(`[DnD] dragstart — ziehe: ${name} (id=${id})`);
    dragPayloadRef.current = id;
    draggingIdRef.current = id;
    setDraggingId(id);
  }, [entries]);

  const handleCardDragEnd = useCallback(() => {
    console.log("[DnD] dragend");
    dragPayloadRef.current = null;
    draggingIdRef.current = null;
    setDraggingId(null);
    setDropTargetId(null);
  }, []);

  const handleCardDragOver = useCallback((id: number) => {
    setDropTargetId(id);
  }, []);

  const handleCardDragLeave = useCallback(() => {
    setDropTargetId(null);
  }, []);

  const handleCardDrop = useCallback(
    (targetId: number, dt: DataTransfer) => {
      const draggedId = getPokedexDragId(dt, dragPayloadRef.current);
      console.log(`[DnD] drop — gezogen: id=${draggedId} (ref=${dragPayloadRef.current}), Ziel: id=${targetId}`);
      dragPayloadRef.current = null;
      setDraggingId(null);
      setDropTargetId(null);
      if (draggedId == null) {
        console.warn("[DnD] drop fehlgeschlagen — draggedId ist null");
        setError("Drop fehlgeschlagen – bitte erneut versuchen.");
        return;
      }
      console.log(`[DnD] → setParentId(child=${draggedId}, parent=${targetId})`);
      handleDrop(draggedId, targetId);
    },
    [handleDrop],
  );

  if (entries.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8 rounded-lg border">
        Keine Einträge gefunden.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "Eintrag" : "Einträge"} (Familien-Ansicht) — am Namen ziehen, auf Parent-Karte ablegen
      </p>
      {error && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          {error}
        </p>
      )}
      <div className="space-y-3">
        {rows.map((row, rowIndex) => (
          <div
            key={row.map((e) => e.id).join("-") || rowIndex}
            className="flex items-stretch gap-2 overflow-x-auto pb-2 rounded-lg border bg-muted/20 p-2"
          >
            {row.map((entry) => (
              <PokedexCard
                key={entry.id}
                entry={entry}
                familyMode
                disabled={isPending}
                isDragging={draggingId === entry.id}
                isDragActive={draggingId !== null}
                isDropTarget={dropTargetId === entry.id}
                draggingIdRef={draggingIdRef}
                onEdit={handleCardEdit}
                onToggleTrade={handleCardToggleTrade}
                onDragStart={handleCardDragStart}
                onDragEnd={handleCardDragEnd}
                onDragOver={handleCardDragOver}
                onDragLeave={handleCardDragLeave}
                onDrop={handleCardDrop}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
