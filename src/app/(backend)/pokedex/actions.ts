"use server";

import { revalidatePath } from "next/cache";
import { eq, and, isNull, isNotNull, like, or, inArray, count, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { pokedex } from "@/db/schema";
import { getSession } from "@/lib/session";
import type { Pokedex } from "@/db/schema";
import { FORM_NONE } from "@/lib/pokedex-constants";

function buildFormCondition(forms: string[]): SQL | undefined {
  const namedForms = forms.filter((f) => f !== FORM_NONE);
  const includeNone = forms.includes(FORM_NONE);

  const parts: SQL[] = [];
  if (namedForms.length > 0) parts.push(inArray(pokedex.form, namedForms));
  if (includeNone) parts.push(isNull(pokedex.form));

  if (parts.length === 0) return undefined;
  if (parts.length === 1) return parts[0];
  return or(...parts);
}

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

function buildSearchCondition(search: string): SQL | undefined {
  const terms = search
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (terms.length === 0) return undefined;

  const termConditions = terms.map((term) => {
    if (/^\d+$/.test(term)) {
      return eq(pokedex.pokemonNo, parseInt(term, 10));
    }
    const pattern = `%${term}%`;
    return or(like(pokedex.name, pattern), like(pokedex.nameEn, pattern));
  });

  return or(...termConditions);
}

export async function getDistinctForms(): Promise<string[]> {
  await requireAdmin();
  const rows = await db
    .selectDistinct({ form: pokedex.form })
    .from(pokedex)
    .where(and(isNull(pokedex.deletedAt), isNotNull(pokedex.form)))
    .orderBy(pokedex.form);
  return rows.map((r) => r.form).filter((f): f is string => f !== null);
}

export async function getPokedexEntries(params: {
  limit?: number;
  offset?: number;
  unpaginated?: boolean;
  search?: string;
  forms?: string[];
  generations?: number[];
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
    unpaginated = false,
    search,
    forms,
    generations,
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
    ...(search ? [buildSearchCondition(search)] : []),
    ...(forms && forms.length > 0 ? [buildFormCondition(forms)] : []),
    ...(generations && generations.length > 0
      ? [inArray(pokedex.generation, generations)]
      : []),
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

  const baseQuery = db.select().from(pokedex).where(where).orderBy(pokedex.pokemonNo);
  const entriesQuery = unpaginated
    ? baseQuery
    : baseQuery.limit(limit).offset(offset);

  const [entries, [{ total }]] = await Promise.all([
    entriesQuery,
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
    | "parentId"
  >
>;

async function wouldCreateCycle(childId: number, parentId: number): Promise<boolean> {
  const rows = await db
    .select({ id: pokedex.id, parentId: pokedex.parentId })
    .from(pokedex)
    .where(isNull(pokedex.deletedAt));

  const parentById = new Map(rows.map((r) => [r.id, r.parentId]));
  let current: number | null = parentId;
  const visited = new Set<number>();

  while (current != null) {
    if (current === childId) return true;
    if (visited.has(current)) break;
    visited.add(current);
    current = parentById.get(current) ?? null;
  }

  return false;
}

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

export async function setParentId(childId: number, parentId: number | null) {
  await requireAdmin();

  if (parentId !== null && childId === parentId) {
    throw new Error("Ein Pokémon kann nicht sein eigener Parent sein.");
  }

  const [child] = await db
    .select({ id: pokedex.id })
    .from(pokedex)
    .where(and(eq(pokedex.id, childId), isNull(pokedex.deletedAt)))
    .limit(1);

  if (!child) {
    throw new Error("Kind-Eintrag nicht gefunden.");
  }

  if (parentId !== null) {
    const [parent] = await db
      .select({ id: pokedex.id })
      .from(pokedex)
      .where(and(eq(pokedex.id, parentId), isNull(pokedex.deletedAt)))
      .limit(1);

    if (!parent) {
      throw new Error("Parent-Eintrag nicht gefunden.");
    }

    if (await wouldCreateCycle(childId, parentId)) {
      throw new Error("Diese Zuordnung würde einen Zyklus erzeugen.");
    }
  }

  await db
    .update(pokedex)
    .set({ parentId })
    .where(and(eq(pokedex.id, childId), isNull(pokedex.deletedAt)));
  revalidatePath("/pokedex");
}
