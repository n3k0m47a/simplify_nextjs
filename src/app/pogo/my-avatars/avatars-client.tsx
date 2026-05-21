"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { createAvatar, updateAvatar, deleteAvatar } from "../actions";
import type { Avatar } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AvatarsClient({ initialAvatars }: { initialAvatars: Avatar[] }) {
  const [newName, setNewName] = useState("");
  const [editTarget, setEditTarget] = useState<Avatar | null>(null);
  const [editName, setEditName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await createAvatar(trimmed);
      setNewName("");
    });
  }

  function openEdit(av: Avatar) {
    setEditTarget(av);
    setEditName(av.name);
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget || !editName.trim()) return;
    startTransition(async () => {
      await updateAvatar(editTarget.id, editName.trim());
      setEditTarget(null);
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteAvatar(id);
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-bold">Meine Avatare</h1>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          placeholder="Neuer Avatar-Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || !newName.trim()}>
          <Plus className="h-4 w-4" />
          Hinzufügen
        </Button>
      </form>

      {initialAvatars.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Noch keine Avatare. Erstelle deinen ersten!
        </p>
      ) : (
        <ul className="space-y-2">
          {initialAvatars.map((av) => (
            <li
              key={av.id}
              className="flex items-center gap-2 rounded-lg border p-3"
            >
              <span className="flex-1 text-sm font-medium">{av.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(av)}
                disabled={isPending}
                aria-label="Bearbeiten"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(av.id)}
                disabled={isPending}
                aria-label="Löschen"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avatar bearbeiten</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="py-4">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={isPending}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isPending || !editName.trim()}>
                Speichern
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
