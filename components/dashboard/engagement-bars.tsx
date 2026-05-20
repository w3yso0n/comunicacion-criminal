"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartEmpty } from "@/components/dashboard/chart-empty";
import { useDashboardCharts } from "@/lib/hooks/use-dashboard-charts";
import { formatCompactEsMx } from "@/lib/utils";

const tickMono = { fontFamily: "var(--font-geist-mono)", fontSize: 10, fill: "#71717a" };

export function EngagementBars() {
  const { data, loading } = useDashboardCharts();
  const rows = [...(data?.engagementPorCategoria ?? [])].sort(
    (a, b) => b.engagement - a.engagement,
  );

  if (loading) {
    return <div className="h-[280px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />;
  }

  if (rows.length === 0) {
    return <ChartEmpty message="Sin engagement registrado por categoría." />;
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Engagement por categoría
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
        >
          <XAxis type="number" tick={tickMono} />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            tick={{ ...tickMono, fontSize: 9 }}
          />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-200">
                  <div>{String(payload[0].payload.label)}</div>
                  <div className="text-zinc-400">
                    {formatCompactEsMx(Number(payload[0].value))}
                  </div>
                  <div className="text-zinc-500">
                    {String(payload[0].payload.pctDelTotal)}% del total
                  </div>
                </div>
              ) : null
            }
          />
          <Bar
            dataKey="engagement"
            fill="#71717a"
            radius={[0, 4, 4, 0]}
            isAnimationActive
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
