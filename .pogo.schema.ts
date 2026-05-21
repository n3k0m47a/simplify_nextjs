import { relations } from 'drizzle-orm'
import {
  mysqlTable,
  serial,
  int,
  bigint,
  varchar,
  text,
  float,
  timestamp,
  datetime,
  boolean,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core'
import { user } from './auth.schema'


export const avatars = mysqlTable('pogo_avatars', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 191 }).notNull(),
  createdAt: timestamp('created_at', { fsp: 3 }).defaultNow(),
  updatedAt: timestamp('updated_at', { fsp: 3 }).$onUpdate(() => new Date()),
})

export const avatarsRelations = relations(avatars, ({ one, many }) => ({
  user: one(user, {
    fields: [avatars.userId],
    references: [user.id],
  }),
  avatarLuckydex: many(avatarLuckydex),
}))

export type Avatar = typeof avatars.$inferSelect

export const pokedex = mysqlTable(
  'pogo_pokedex',
  {
    id: int('id').primaryKey().autoincrement(),
    familyId: int('family_id', { unsigned: true }),
    parentId: int('parent_id'),
    form: varchar('form', { length: 191 }),
    nationalDexNumber: int('national_dex_number'),
    name: varchar('name', { length: 191 }),
    nameEn: varchar('name_en', { length: 191 }),
    imageSrc: text('image_src'),
    generation: int('generation'),
    types: text('types'),
    type1: varchar('type1', { length: 191 }),
    type2: varchar('type2', { length: 191 }),
    maxCp: int('max_cp'),
    attack: int('attack'),
    defense: int('defense'),
    stamina: int('stamina'),
    createdAt: datetime('created_at', { fsp: 3 }),
    updatedAt: datetime('updated_at', { fsp: 3 }),
    deletedAt: datetime('deleted_at', { fsp: 3 }),
    baby: boolean('baby'),
    legendary: boolean('legendary'),
    mythical: boolean('mythical'),
    ultraBeast: boolean('ultra_beast'),
    generationId: int('generation_id'),
    released: boolean('released'),
    exclusive: boolean('exclusive'),
    regional: boolean('regional'),
    notTradeable: boolean('not_tradeable'),
    note: text('note'),
    dynamax: boolean('dynamax'),
  },
  (t) => [index('pokedex_family_id_fkey').on(t.familyId)]
)

export const luckydex = mysqlTable('pogo_luckydex', {
  id: int('id').primaryKey().autoincrement(),
  pokedexId: int('pokedex_id', { unsigned: true })
    .notNull()
    .references(() => pokedex.id, { onDelete: 'cascade' }),
  pokedexNo: int('pokedex_no').notNull(),
  name: varchar('name', { length: 191 }).notNull(),
  evolution: int('evolution'),
  createdAt: datetime('created_at', { fsp: 3 }),
  updatedAt: datetime('updated_at', { fsp: 3 }),
  deletedAt: datetime('deleted_at', { fsp: 3 }),
  trade: boolean('trade'),
  baseTrade: boolean('base_trade'),
})

export const avatarLuckydex = mysqlTable(
  'pogo_avatar_luckydex',
  {
    id: int('id').primaryKey().autoincrement(),
    avatarId: int('avatar_id')
      .notNull()
      .references(() => avatars.id, { onDelete: 'cascade' }),
    luckydexId: int('luckydex_id')
      .notNull()
      .references(() => luckydex.id, { onDelete: 'cascade' }),
    value: int('value').default(0).notNull(),
    createdAt: timestamp('created_at', { fsp: 3 }).defaultNow(),
    updatedAt: timestamp('updated_at', { fsp: 3 }).$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex('pogo_avatar_luckydex_avatar_id_luckydex_id_key').on(t.avatarId, t.luckydexId)]
)

export const avatarLuckydexRelations = relations(avatarLuckydex, ({ one }) => ({
  avatar: one(avatars, {
    fields: [avatarLuckydex.avatarId],
    references: [avatars.id],
  }),
  luckydex: one(luckydex, {
    fields: [avatarLuckydex.luckydexId],
    references: [luckydex.id],
  }),
}))

export const luckydexRelations = relations(luckydex, ({ many }) => ({
  avatarLuckydex: many(avatarLuckydex),
}))