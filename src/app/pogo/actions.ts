"use server";

import { revalidatePath } from "next/cache";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { avatar, pokedex, lucky } from "@/db/schema";
import { getSession } from "@/lib/session";

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Nicht angemeldet");
  return session;
}

export async function getAvatars() {
  const session = await requireSession();
  return db
    .select()
    .from(avatar)
    .where(and(eq(avatar.userId, session.user.id), isNull(avatar.deletedAt)));
}

export async function createAvatar(name: string) {
  const session = await requireSession();
  await db.insert(avatar).values({ userId: session.user.id, name });
  revalidatePath("/pogo/my-avatars");
}

export async function updateAvatar(id: number, name: string) {
  const session = await requireSession();
  await db
    .update(avatar)
    .set({ name })
    .where(and(eq(avatar.id, id), eq(avatar.userId, session.user.id)));
  revalidatePath("/pogo/my-avatars");
}

export async function deleteAvatar(id: number) {
  const session = await requireSession();
  await db
    .update(avatar)
    .set({ deletedAt: new Date() })
    .where(and(eq(avatar.id, id), eq(avatar.userId, session.user.id)));
  revalidatePath("/pogo/my-avatars");
}

export async function getLuckydex() {
  const session = await getSession();

  const [pokedexEntries, avatars] = await Promise.all([
    db.select().from(pokedex).where(isNull(pokedex.deletedAt)).orderBy(pokedex.id),
    session
      ? db.select().from(avatar).where(and(eq(avatar.userId, session.user.id), isNull(avatar.deletedAt)))
      : Promise.resolve([]),
  ]);

  const luckyEntries =
    avatars.length > 0
      ? await db
          .select({ avatarId: lucky.avatarId, pokedexId: lucky.pokedexId })
          .from(lucky)
          .innerJoin(avatar, eq(lucky.avatarId, avatar.id))
          .where(
            and(
              eq(avatar.userId, session!.user.id),
              isNull(lucky.deletedAt),
            ),
          )
      : [];

  return { pokedexEntries, avatars, luckyEntries };
}

export async function toggleLucky(avatarId: number, pokedexId: number) {
  const session = await requireSession();

  const [ownerCheck] = await db
    .select({ id: avatar.id })
    .from(avatar)
    .where(and(eq(avatar.id, avatarId), eq(avatar.userId, session.user.id), isNull(avatar.deletedAt)))
    .limit(1);

  if (!ownerCheck) throw new Error("Avatar nicht gefunden");

  const [existing] = await db
    .select({ id: lucky.id, deletedAt: lucky.deletedAt })
    .from(lucky)
    .where(and(eq(lucky.avatarId, avatarId), eq(lucky.pokedexId, pokedexId)))
    .limit(1);

  if (!existing) {
    await db.insert(lucky).values({ avatarId, pokedexId });
  } else if (existing.deletedAt === null) {
    await db.update(lucky).set({ deletedAt: new Date() }).where(eq(lucky.id, existing.id));
  } else {
    await db.update(lucky).set({ deletedAt: null }).where(eq(lucky.id, existing.id));
  }

  revalidatePath("/pogo/luckydex");
}
