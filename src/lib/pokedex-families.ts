import type { Pokedex } from "@/db/schema";

function sortByPokemonNo(a: Pokedex, b: Pokedex) {
  return a.pokemonNo - b.pokemonNo || a.id - b.id;
}

function bfsFlatten(
  root: Pokedex,
  childrenByParentId: Map<number, Pokedex[]>,
): Pokedex[] {
  const result: Pokedex[] = [];
  const queue: Pokedex[] = [root];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    result.push(current);

    const children = childrenByParentId.get(current.id) ?? [];
    for (const child of [...children].sort(sortByPokemonNo)) {
      if (!visited.has(child.id)) {
        queue.push(child);
      }
    }
  }

  return result;
}

/** Groups entries into family rows: one horizontal chain per root (BFS). */
export function buildFamilyRows(entries: Pokedex[]): Pokedex[][] {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const childrenByParentId = new Map<number, Pokedex[]>();

  for (const entry of entries) {
    if (entry.parentId != null && byId.has(entry.parentId)) {
      const list = childrenByParentId.get(entry.parentId) ?? [];
      list.push(entry);
      childrenByParentId.set(entry.parentId, list);
    }
  }

  const roots = entries
    .filter((e) => e.parentId == null || !byId.has(e.parentId))
    .sort(sortByPokemonNo);

  return roots.map((root) => bfsFlatten(root, childrenByParentId));
}

/** Returns true if setting parentId on childId would create a cycle within entries. */
export function wouldCreateCycleLocal(
  entries: Pokedex[],
  childId: number,
  parentId: number,
): boolean {
  const parentById = new Map(entries.map((e) => [e.id, e.parentId]));
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
