import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getPokedexEntries } from "@/app/(backend)/pokedex/actions";
import { PokedexTable } from "@/components/pokedex/pokedex-table";

export const metadata: Metadata = { title: "Pokédex-Verwaltung" };

const PAGE_SIZE = 50;

export default async function PokedexAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    form?: string;
    baby?: string;
    legendary?: string;
    mythical?: string;
    ultraBeast?: string;
    released?: string;
    exclusive?: string;
    regional?: string;
    notTradeable?: string;
    trade?: string;
  }>;
}) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const {
    search,
    page: pageParam,
    form,
    baby,
    legendary,
    mythical,
    ultraBeast,
    released,
    exclusive,
    regional,
    notTradeable,
    trade,
  } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  function parseState(v: string | undefined): "include" | "exclude" | "neutral" {
    if (v === "1") return "include";
    if (v === "0") return "exclude";
    return "neutral";
  }

  const boolFilters = {
    baby: parseState(baby),
    legendary: parseState(legendary),
    mythical: parseState(mythical),
    ultraBeast: parseState(ultraBeast),
    released: parseState(released),
    exclusive: parseState(exclusive),
    regional: parseState(regional),
    notTradeable: parseState(notTradeable),
    trade: parseState(trade),
  } as const;

  const { entries, total } = await getPokedexEntries({
    limit: PAGE_SIZE,
    offset,
    search,
    form,
    baby: boolFilters.baby === "neutral" ? undefined : boolFilters.baby,
    legendary: boolFilters.legendary === "neutral" ? undefined : boolFilters.legendary,
    mythical: boolFilters.mythical === "neutral" ? undefined : boolFilters.mythical,
    ultraBeast: boolFilters.ultraBeast === "neutral" ? undefined : boolFilters.ultraBeast,
    released: boolFilters.released === "neutral" ? undefined : boolFilters.released,
    exclusive: boolFilters.exclusive === "neutral" ? undefined : boolFilters.exclusive,
    regional: boolFilters.regional === "neutral" ? undefined : boolFilters.regional,
    notTradeable: boolFilters.notTradeable === "neutral" ? undefined : boolFilters.notTradeable,
    trade: boolFilters.trade === "neutral" ? undefined : boolFilters.trade,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pokédex-Verwaltung</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} {total === 1 ? "Eintrag" : "Einträge"} gesamt
        </p>
      </div>
      <PokedexTable
        entries={entries}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        search={search ?? ""}
        form={form ?? ""}
        boolFilters={boolFilters}
      />
    </div>
  );
}
