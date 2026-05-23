"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#ef4444",
  "#f59e0b",
  "#a855f7",
  "#06b6d4",
];

const RANGES = [
  { label: "7T", days: 7 },
  { label: "14T", days: 14 },
  { label: "30T", days: 30 },
  { label: "60T", days: 60 },
] as const;

export type Row = {
  date: string;
  avatarId: number;
  avatarName: string;
  luckyCount: number;
};

type ChartEntry = Record<string, string | number>;

function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  });
}

function cellOpacity(count: number): number {
  if (count === 0) return 0.08;
  if (count === 1) return 0.4;
  if (count === 2) return 0.65;
  if (count <= 4) return 0.85;
  return 1;
}

function buildLookup(rows: Row[]) {
  const lookup = new Map<string, Map<string, number>>();
  for (const row of rows) {
    if (!lookup.has(row.avatarName)) lookup.set(row.avatarName, new Map());
    lookup.get(row.avatarName)!.set(row.date, row.luckyCount);
  }
  return lookup;
}

function buildCumulativeData(
  avatarNames: string[],
  lookup: Map<string, Map<string, number>>,
  days: string[],
  allTimeTotals: Record<string, number>,
): ChartEntry[] {
  const periodSums: Record<string, number> = Object.fromEntries(avatarNames.map((n) => [n, 0]));
  for (const name of avatarNames) {
    for (const day of days) {
      periodSums[name] += lookup.get(name)?.get(day) ?? 0;
    }
  }
  const running: Record<string, number> = Object.fromEntries(
    avatarNames.map((n) => [n, (allTimeTotals[n] ?? 0) - periodSums[n]]),
  );
  return days.map((day) => {
    const entry: ChartEntry = { date: formatDate(day) };
    for (const name of avatarNames) {
      running[name] += lookup.get(name)?.get(day) ?? 0;
      entry[name] = running[name];
    }
    return entry;
  });
}

function MonthLabels({ days }: { days: string[] }) {
  const labels: { label: string; index: number }[] = [];
  let lastMonth = "";
  days.forEach((d, i) => {
    const month = new Date(d).toLocaleDateString("de-DE", { month: "short" });
    if (month !== lastMonth) {
      labels.push({ label: month, index: i });
      lastMonth = month;
    }
  });
  return (
    <div className="relative h-5 mb-1 ml-[5.5rem]">
      {labels.map(({ label, index }) => (
        <span
          key={index}
          className="absolute text-xs text-muted-foreground"
          style={{ left: index * 14 }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function RangeSelector({
  selected,
  onChange,
}: {
  selected: number;
  onChange: (days: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {RANGES.map(({ label, days }) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-7 px-2.5 text-xs rounded-full",
            selected === days && "bg-accent font-semibold"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function LuckyCharts({ rows, totals }: { rows: Row[]; totals: Record<string, number> }) {
  const [rangeDays, setRangeDays] = useState(30);

  const avatarNames = [...new Set(rows.map((r) => r.avatarName))];
  if (avatarNames.length === 0) return null;

  const heatmapDays = getLastNDays(60);
  const lineDays = getLastNDays(rangeDays);
  const lookup = buildLookup(rows);
  const lineData = buildCumulativeData(avatarNames, lookup, lineDays, totals);
  const tickInterval = rangeDays <= 14 ? 1 : rangeDays <= 30 ? 3 : 6;

  return (
    <div className="mt-8 flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Lucky-Verlauf</h2>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Einträge pro Tag</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="overflow-x-auto pb-2">
              <MonthLabels days={heatmapDays} />
              <div className="flex flex-col gap-1.5">
                {avatarNames.map((name, i) => {
                  const color = COLORS[i % COLORS.length];
                  return (
                    <div key={name} className="flex items-center gap-2">
                      <span
                        className="w-20 text-xs text-right shrink-0 truncate"
                        style={{ color }}
                      >
                        {name}
                      </span>
                      <div className="flex gap-0.5">
                        {heatmapDays.map((day) => {
                          const count = lookup.get(name)?.get(day) ?? 0;
                          return (
                            <Tooltip key={day}>
                              <TooltipTrigger
                                render={
                                  <div
                                    className="w-3 h-3 rounded-xs cursor-default"
                                    style={{
                                      backgroundColor: color,
                                      opacity: cellOpacity(count),
                                    }}
                                  />
                                }
                              />
                              <TooltipContent>
                                <span>
                                  {formatDate(day)} — {count}{" "}
                                  {count === 1 ? "Lucky" : "Luckys"}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Line chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Gesamtstand</CardTitle>
            <RangeSelector selected={rangeDays} onChange={setRangeDays} />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                interval={tickInterval}
                className="fill-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                domain={["auto", "auto"]}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                }}
              />
              <Legend />
              {avatarNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
