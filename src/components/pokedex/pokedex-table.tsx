"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircleIcon, CircleIcon, PencilIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PokedexPagination } from "@/components/pokedex/pokedex-pagination";
import { BOOL_COLUMNS, type BoolFilterKey } from "@/components/pokedex/pokedex-filters";
import { setTrade, updatePokedex } from "@/app/(backend)/pokedex/actions";
import type { Pokedex } from "@/db/schema";

export function PokedexTableBody({
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

  const handleToggleBool = (entry: Pokedex, key: BoolFilterKey) => {
    startTransition(async () => {
      await updatePokedex(entry.id, { [key]: !entry[key] });
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
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
                        type="button"
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
                      type="button"
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
                      onClick={() => onEdit(entry)}
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

      <PokedexPagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={onPageChange}
      />
    </div>
  );
}
