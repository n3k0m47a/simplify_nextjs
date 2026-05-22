"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updatePokedex } from "@/app/(backend)/pokedex/actions";
import type { Pokedex } from "@/db/schema";

const BOOL_FIELDS: { key: keyof BoolFields; label: string }[] = [
  { key: "baby", label: "Baby" },
  { key: "legendary", label: "Legendär" },
  { key: "mythical", label: "Mysteriös" },
  { key: "ultraBeast", label: "Ultra-Kreatur" },
  { key: "released", label: "Verfügbar" },
  { key: "exclusive", label: "Exklusiv" },
  { key: "regional", label: "Regional" },
  { key: "notTradeable", label: "Nicht tauschbar" },
];

type BoolFields = Pick<
  Pokedex,
  "baby" | "legendary" | "mythical" | "ultraBeast" | "released" | "exclusive" | "regional" | "notTradeable"
>;

export function PokedexEditSheet({
  entry,
  open,
  onClose,
}: {
  entry: Pokedex;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(entry.name);
  const [nameEn, setNameEn] = useState(entry.nameEn ?? "");
  const [form, setForm] = useState(entry.form ?? "");
  const [src, setSrc] = useState(entry.src ?? "");
  const [generation, setGeneration] = useState(entry.generation != null ? String(entry.generation) : "");
  const [type1, setType1] = useState(entry.type1 ?? "");
  const [type2, setType2] = useState(entry.type2 ?? "");
  const [note, setNote] = useState(entry.note ?? "");
  const [bools, setBools] = useState<BoolFields>({
    baby: entry.baby,
    legendary: entry.legendary,
    mythical: entry.mythical,
    ultraBeast: entry.ultraBeast,
    released: entry.released,
    exclusive: entry.exclusive,
    regional: entry.regional,
    notTradeable: entry.notTradeable,
  });

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await updatePokedex(entry.id, {
          name,
          nameEn: nameEn || null,
          form: form || null,
          src: src || null,
          generation: generation ? parseInt(generation) : null,
          type1: type1 || null,
          type2: type2 || null,
          note: note || null,
          ...bools,
        });
        router.refresh();
        onClose();
      } catch {
        setError("Fehler beim Speichern. Bitte erneut versuchen.");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle>Pokémon bearbeiten</SheetTitle>
          <p className="text-sm text-muted-foreground">
            #{entry.pokemonNo} · {entry.name}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="edit-name">Name (DE)</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-name-en">Name (EN)</Label>
              <Input id="edit-name-en" value={nameEn} onChange={(e) => setNameEn(e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-form">Form</Label>
              <Input id="edit-form" value={form} onChange={(e) => setForm(e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-type1">Typ 1</Label>
              <Input id="edit-type1" value={type1} onChange={(e) => setType1(e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-type2">Typ 2</Label>
              <Input id="edit-type2" value={type2} onChange={(e) => setType2(e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-generation">Generation</Label>
              <Input
                id="edit-generation"
                type="number"
                value={generation}
                onChange={(e) => setGeneration(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="edit-src">Bild-URL</Label>
              <Input id="edit-src" value={src} onChange={(e) => setSrc(e.target.value)} disabled={isPending} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="edit-note">Notiz</Label>
              <textarea
                id="edit-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isPending}
                rows={3}
                className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Flags</p>
            <div className="grid grid-cols-2 gap-y-2">
              {BOOL_FIELDS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={bools[key] ?? false}
                    onChange={(e) => setBools((prev) => ({ ...prev, [key]: e.target.checked }))}
                    disabled={isPending}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={isPending} className="w-full">
            {isPending ? "Speichern…" : "Speichern"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
