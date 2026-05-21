import {
  mysqlTable,
  varchar,
  timestamp,
  int,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const avatar = mysqlTable(
  "pogo_avatar",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 }).$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { fsp: 3 }),
  },
  (table) => [index("pogo_avatar_userId_idx").on(table.userId)],
);

export type Avatar = typeof avatar.$inferSelect;
export type NewAvatar = typeof avatar.$inferInsert;


export const pokedex = mysqlTable("pogo_pokedex", {
  id: int("id").primaryKey().autoincrement(),
  pokemonNo: int("pokemon_no").notNull(),
  name: varchar("name", { length: 191 }).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 }).$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { fsp: 3 }),
});

export type Pokedex = typeof pokedex.$inferSelect;

export const lucky = mysqlTable(
  "pogo_lucky",
  {
    id: int("id").primaryKey().autoincrement(),
    avatarId: int("avatar_id").notNull(),
    pokedexId: int("pokedex_id").notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 }).$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { fsp: 3 }),
  },
  (table) => [
    uniqueIndex("pogo_lucky_avatar_pokedex_uniq").on(table.avatarId, table.pokedexId),
    index("pogo_lucky_avatarId_idx").on(table.avatarId),
  ],
);

export type Lucky = typeof lucky.$inferSelect;
export type NewLucky = typeof lucky.$inferInsert;