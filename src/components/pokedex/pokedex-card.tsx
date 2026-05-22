"use client";

import React from "react";
import Image from "next/image";
import { PencilIcon, CheckCircleIcon, CircleIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Pokedex } from "@/db/schema";
import { cn } from "@/lib/utils";

const DRAG_TYPE = "application/x-pokedex-id";

export function getPokedexDragId(
  dataTransfer: DataTransfer,
  fallbackId?: number | null,
): number | null {
  const raw =
    dataTransfer.getData(DRAG_TYPE) || dataTransfer.getData("text/plain");
  const parsed = parseInt(raw, 10);
  if (!Number.isNaN(parsed)) return parsed;
  return fallbackId ?? null;
}

export function setPokedexDragData(dataTransfer: DataTransfer, id: number) {
  const value = String(id);
  dataTransfer.setData(DRAG_TYPE, value);
  dataTransfer.setData("text/plain", value);
  dataTransfer.effectAllowed = "move";
}

export const PokedexCard = React.memo(function PokedexCard({
  entry,
  familyMode = false,
  isDropTarget = false,
  isDragging = false,
  isDragActive = false,
  draggingIdRef,
  onEdit,
  onToggleTrade,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  disabled = false,
}: {
  entry: Pokedex;
  familyMode?: boolean;
  isDropTarget?: boolean;
  isDragging?: boolean;
  /** True while any card is being dragged — used for visual overlay */
  isDragActive?: boolean;
  /** Ref to current dragging ID — used for event handling without re-render timing issues */
  draggingIdRef?: React.RefObject<number | null>;
  onEdit: (id: number) => void;
  onToggleTrade: (id: number) => void;
  onDragStart?: (id: number) => void;
  onDragEnd?: () => void;
  onDragOver?: (id: number) => void;
  onDragLeave?: () => void;
  onDrop?: (targetId: number, dt: DataTransfer) => void;
  disabled?: boolean;
}) {
  // Visual overlay: appears after React re-render (for decoration only)
  const showDropOverlay = familyMode && isDragActive && !isDragging;

  // Check via ref whether a drag is active and this card is not the source.
  // Using a ref avoids the re-render timing gap between dragstart and dragover.
  const isValidDropTarget = () => {
    if (!familyMode) return false;
    const activeId = draggingIdRef?.current;
    return activeId != null && activeId !== entry.id;
  };

  const handleCardDragOver = (e: React.DragEvent) => {
    if (!isValidDropTarget()) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    onDragOver?.(entry.id);
  };

  const handleCardDrop = (e: React.DragEvent) => {
    if (!isValidDropTarget()) return;
    e.preventDefault();
    e.stopPropagation();
    onDrop?.(entry.id, e.dataTransfer);
  };

  const handleCardDragLeave = (e: React.DragEvent) => {
    if (!isValidDropTarget()) return;
    const related = e.relatedTarget as Node | null;
    // e.currentTarget is now the Card element — contains() works correctly for all children
    if (related && e.currentTarget.contains(related)) return;
    onDragLeave?.();
  };

  const handleGripDragStart = (e: React.DragEvent) => {
    if (!familyMode || disabled) return;
    setPokedexDragData(e.dataTransfer, entry.id);
    onDragStart?.(entry.id);
  };

  return (
    <Card
      size="sm"
      className={cn(
        "relative w-36 shrink-0 transition-shadow",
        isDragging && "opacity-50",
        isDropTarget && "ring-2 ring-primary shadow-md",
      )}
      onDragEnter={familyMode ? handleCardDragOver : undefined}
      onDragOver={familyMode ? handleCardDragOver : undefined}
      onDragLeave={familyMode ? handleCardDragLeave : undefined}
      onDrop={familyMode ? handleCardDrop : undefined}
    >
      {/* Visual drop overlay — purely decorative, pointer-events-none */}
      {showDropOverlay && (
        <div className="absolute inset-0 z-10 rounded-xl bg-primary/5 pointer-events-none" />
      )}
      <CardHeader className="pb-0">
        <div
          draggable={familyMode && !disabled}
          onDragStart={familyMode ? handleGripDragStart : undefined}
          onDragEnd={familyMode ? onDragEnd : undefined}
          className={cn(
            familyMode && [
              "rounded-md -mx-1 px-1",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-grab active:cursor-grabbing hover:bg-accent/50",
              isDragActive && !isDragging && "pointer-events-none opacity-40",
            ],
          )}
          title={familyMode ? "Am Namen ziehen und auf Parent-Karte ablegen" : undefined}
          aria-label={familyMode ? `${entry.name} verschieben` : undefined}
        >
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm leading-tight truncate" title={entry.name}>
              {entry.name}
            </CardTitle>
            <p className="font-mono text-xs text-muted-foreground">#{entry.pokemonNo}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-1 pt-0">
        {entry.src ? (
          <Image
            src={`/images/pogo/${entry.src}`}
            alt={entry.name}
            width={72}
            height={72}
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="size-[72px] rounded bg-muted" />
        )}
        {entry.form && (
          <p className="text-xs text-muted-foreground truncate w-full text-center" title={entry.form}>
            {entry.form}
          </p>
        )}
        {!familyMode && (
          <div className="flex flex-wrap gap-1 justify-center">
            {entry.type1 && <Badge variant="outline" className="text-xs">{entry.type1}</Badge>}
            {entry.type2 && <Badge variant="outline" className="text-xs">{entry.type2}</Badge>}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-1 pt-0 border-t-0">
        <button
          type="button"
          onClick={() => onToggleTrade(entry.id)}
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:bg-accent disabled:opacity-50"
          title={entry.trade ? "Trade aktiv" : "Trade inaktiv"}
        >
          {entry.trade ? (
            <CheckCircleIcon className="size-4 text-primary" />
          ) : (
            <CircleIcon className="size-4 text-muted-foreground" />
          )}
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(entry.id)}
          disabled={disabled}
          title="Bearbeiten"
        >
          <PencilIcon className="size-3.5" />
          <span className="sr-only">Bearbeiten</span>
        </Button>
      </CardFooter>
    </Card>
  );
});
