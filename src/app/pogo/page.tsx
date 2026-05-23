import Link from "next/link";
import { getAvatarsWithLuckyCount, getLuckyPerDay } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { LuckyCharts } from "./lucky-chart";

export default async function PogoPage() {
  const [avatars, luckyPerDay] = await Promise.all([
    getAvatarsWithLuckyCount(),
    getLuckyPerDay(),
  ]);

  if (avatars.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Noch kein Avatar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Lege einen Avatar an, um deine Lucky-Einträge zu verwalten.
            </p>
            <Link href="/pogo/my-avatars" className={buttonVariants({ variant: "default" })}>
              Avatare verwalten
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meine Avatare</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {avatars.map((av) => (
          <Card key={av.id}>
            <CardHeader>
              <CardTitle className="text-lg">{av.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lucky-Einträge:{" "}
                <span className="font-semibold text-foreground">{av.luckyCount}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <LuckyCharts
        rows={luckyPerDay}
        totals={Object.fromEntries(avatars.map((av) => [av.name, av.luckyCount]))}
      />
    </div>
  );
}
