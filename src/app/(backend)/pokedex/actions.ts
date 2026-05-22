"use server";

import { revalidatePath } from "next/cache";
import { eq, and, isNull, like, or, count } from "drizzle-orm";
import { db } from "@/db";
import { pokedex } from "@/db/schema";
import { getSession } from "@/lib/session";
import type { Pokedex } from "@/db/schema";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

type BoolFilterState = "include" | "exclude" | undefined;

function boolCond(
  col: Parameters<typeof eq>[0],
  state: BoolFilterState,
) {
  if (state === "include") return eq(col, true);
  if (state === "exclude") return or(eq(col, false), isNull(col));
  return undefined;
}

export async function getPokedexEntries(params: {
  limit?: number;
  offset?: number;
  search?: string;
  form?: string;
  baby?: BoolFilterState;
  legendary?: BoolFilterState;
  mythical?: BoolFilterState;
  ultraBeast?: BoolFilterState;
  released?: BoolFilterState;
  exclusive?: BoolFilterState;
  regional?: BoolFilterState;
  notTradeable?: BoolFilterState;
  trade?: BoolFilterState;
}) {
  await requireAdmin();
  const {
    limit = 50,
    offset = 0,
    search,
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
  } = params;

  const conditions = [
    isNull(pokedex.deletedAt),
    ...(search
      ? [
          or(
            like(pokedex.name, `%${search}%`),
            like(pokedex.nameEn, `%${search}%`),
            ...(!isNaN(parseInt(search)) ? [eq(pokedex.pokemonNo, parseInt(search))] : []),
          ),
        ]
      : []),
    ...(form ? [like(pokedex.form, `%${form}%`)] : []),
    boolCond(pokedex.baby, baby),
    boolCond(pokedex.legendary, legendary),
    boolCond(pokedex.mythical, mythical),
    boolCond(pokedex.ultraBeast, ultraBeast),
    boolCond(pokedex.released, released),
    boolCond(pokedex.exclusive, exclusive),
    boolCond(pokedex.regional, regional),
    boolCond(pokedex.notTradeable, notTradeable),
    boolCond(pokedex.trade, trade),
  ].filter(Boolean);

  const where = and(...(conditions as Parameters<typeof and>));

  const [entries, [{ total }]] = await Promise.all([
    db.select().from(pokedex).where(where).orderBy(pokedex.pokemonNo).limit(limit).offset(offset),
    db.select({ total: count() }).from(pokedex).where(where),
  ]);

  return { entries, total };
}

type PokedexUpdateData = Partial<
  Pick<
    Pokedex,
    | "name"
    | "nameEn"
    | "form"
    | "src"
    | "generation"
    | "type1"
    | "type2"
    | "baby"
    | "legendary"
    | "mythical"
    | "ultraBeast"
    | "released"
    | "exclusive"
    | "regional"
    | "notTradeable"
    | "note"
  >
>;

export async function updatePokedex(id: number, data: PokedexUpdateData) {
  await requireAdmin();
  await db.update(pokedex).set(data).where(and(eq(pokedex.id, id), isNull(pokedex.deletedAt)));
  revalidatePath("/pokedex");
}

export async function setTrade(id: number, trade: boolean) {
  await requireAdmin();
  await db.update(pokedex).set({ trade }).where(and(eq(pokedex.id, id), isNull(pokedex.deletedAt)));
  revalidatePath("/pokedex");
}
