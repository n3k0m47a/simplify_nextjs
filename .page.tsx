import { db } from "@/db"
import { pokedex, luckydex, avatars, avatarLuckydex } from "@/db/schema"
import { getSession } from "@/lib/session"
import { eq, isNull, inArray, asc } from "drizzle-orm"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const TYPE_COLORS: Record<string, string> = {
  Normal:   "bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200",
  Feuer:    "bg-orange-200 text-orange-800 dark:bg-orange-700 dark:text-orange-100",
  Wasser:   "bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100",
  Pflanze:  "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100",
  Elektro:  "bg-yellow-200 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100",
  Eis:      "bg-cyan-200 text-cyan-800 dark:bg-cyan-700 dark:text-cyan-100",
  Kampf:    "bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100",
  Gift:     "bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100",
  Boden:    "bg-amber-200 text-amber-800 dark:bg-amber-700 dark:text-amber-100",
  Flug:     "bg-sky-200 text-sky-800 dark:bg-sky-600 dark:text-sky-100",
  Psycho:   "bg-pink-200 text-pink-800 dark:bg-pink-700 dark:text-pink-100",
  Käfer:    "bg-lime-200 text-lime-800 dark:bg-lime-700 dark:text-lime-100",
  Gestein:  "bg-yellow-300 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100",
  Geist:    "bg-violet-200 text-violet-800 dark:bg-violet-700 dark:text-violet-100",
  Drache:   "bg-indigo-200 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100",
  Unlicht:  "bg-zinc-300 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100",
  Stahl:    "bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100",
  Fee:      "bg-rose-200 text-rose-800 dark:bg-rose-600 dark:text-rose-100",
  Fire:     "bg-orange-200 text-orange-800 dark:bg-orange-700 dark:text-orange-100",
  Water:    "bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100",
  Grass:    "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100",
  Electric: "bg-yellow-200 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100",
  Ice:      "bg-cyan-200 text-cyan-800 dark:bg-cyan-700 dark:text-cyan-100",
  Fighting: "bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100",
  Poison:   "bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100",
  Ground:   "bg-amber-200 text-amber-800 dark:bg-amber-700 dark:text-amber-100",
  Flying:   "bg-sky-200 text-sky-800 dark:bg-sky-600 dark:text-sky-100",
  Psychic:  "bg-pink-200 text-pink-800 dark:bg-pink-700 dark:text-pink-100",
  Bug:      "bg-lime-200 text-lime-800 dark:bg-lime-700 dark:text-lime-100",
  Rock:     "bg-yellow-300 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100",
  Ghost:    "bg-violet-200 text-violet-800 dark:bg-violet-700 dark:text-violet-100",
  Dragon:   "bg-indigo-200 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100",
  Dark:     "bg-zinc-300 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100",
  Steel:    "bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100",
  Fairy:    "bg-rose-200 text-rose-800 dark:bg-rose-600 dark:text-rose-100",
}

function TypeBadge({ type }: { type: string }) {
  const colorClass = TYPE_COLORS[type] ?? "bg-muted text-muted-foreground"
  return (
    <Badge variant="outline" className={`border-0 text-xs font-medium ${colorClass}`}>
      {type}
    </Badge>
  )
}

export default async function PogoPage() {
  const session = await getSession()

  const [dexEntries, luckyEntries] = await Promise.all([
    db
      .select()
      .from(pokedex)
      .where(isNull(pokedex.deletedAt))
      .orderBy(asc(pokedex.nationalDexNumber)),
    db
      .select()
      .from(luckydex)
      .where(isNull(luckydex.deletedAt)),
  ])

  // Map: pokedexId -> luckydexId
  const pokedexToLucky = new Map(luckyEntries.map((l) => [l.pokedexId, l.id]))

  let userAvatars: (typeof avatars.$inferSelect)[] = []
  const avatarHasLucky = new Map<number, Set<number>>()

  if (session) {
    userAvatars = await db
      .select()
      .from(avatars)
      .where(eq(avatars.userId, session.user.id))

    if (userAvatars.length > 0) {
      const avatarIds = userAvatars.map((a) => a.id)
      const luckyData = await db
        .select()
        .from(avatarLuckydex)
        .where(inArray(avatarLuckydex.avatarId, avatarIds))

      for (const entry of luckyData) {
        if (entry.value > 0) {
          if (!avatarHasLucky.has(entry.avatarId)) {
            avatarHasLucky.set(entry.avatarId, new Set())
          }
          avatarHasLucky.get(entry.avatarId)!.add(entry.luckydexId)
        }
      }
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Pokédex</h1>
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 text-right">#</TableHead>
              <TableHead className="w-14"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Typ</TableHead>
              {userAvatars.map((avatar) => (
                <TableHead key={avatar.id} className="text-center min-w-24">
                  {avatar.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dexEntries.map((entry) => {
              const luckydexId = entry.id != null ? pokedexToLucky.get(entry.id) : undefined
              return (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground text-right">
                    {entry.nationalDexNumber?.toString().padStart(4, "0")}
                  </TableCell>
                  <TableCell>
                    {entry.imageSrc && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={entry.imageSrc}
                        alt={entry.name ?? ""}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.name}
                    {entry.form && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        ({entry.form})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {entry.type1 && <TypeBadge type={entry.type1} />}
                      {entry.type2 && <TypeBadge type={entry.type2} />}
                    </div>
                  </TableCell>
                  {userAvatars.map((avatar) => {
                    if (luckydexId === undefined) {
                      return (
                        <TableCell key={avatar.id} className="text-center text-muted-foreground/40">
                          —
                        </TableCell>
                      )
                    }
                    const hasLucky = avatarHasLucky.get(avatar.id)?.has(luckydexId) ?? false
                    return (
                      <TableCell key={avatar.id} className="text-center">
                        {hasLucky ? (
                          <span className="text-yellow-500 font-bold">★</span>
                        ) : (
                          <span className="text-muted-foreground/50">✗</span>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
