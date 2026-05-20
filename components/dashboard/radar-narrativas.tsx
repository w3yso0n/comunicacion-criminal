"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { ChartEmpty } from "@/components/dashboard/chart-empty";
import { NarrativasTabla } from "@/components/dashboard/narrativas-tabla";
import { useDashboardCharts } from "@/lib/hooks/use-dashboard-charts";
export function RadarNarrativas() {
  const { data, loading } = useDashboardCharts();
  const narrativasRadar = data?.narrativasRadar ?? [];

  if (loading) {
    return <div className="h-[320px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />;
  }

  if (narrativasRadar.length === 0) {
    return (
      <ChartEmpty message="Sin subtipos de menciones en los últimos 7 días." />
    );
  }

  const chartData = narrativasRadar.map((n) => ({
    subject: n.label,
    valor: n.valor,
    fullMark: 100,
  }));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Subtipos de menciones (7 días)
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#27272a" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#a1a1aa", fontSize: 9 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Intensidad"
            dataKey="valor"
            stroke="#f87171"
            strokeWidth={1.5}
            fill="#ef4444"
            fillOpacity={0.15}
            isAnimationActive
            animationDuration={800}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload as { subject: string; valor: number } | undefined;
              if (!row) return null;
              const meta = narrativasRadar.find((n) => n.label === row.subject);
              return (
                <div className="max-w-xs rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-xl">
                  <p className="font-medium text-zinc-100">{row.subject}</p>
                  <p className="font-mono text-zinc-300">{row.valor}</p>
                  {meta ? (
                    <p className="mt-1 text-zinc-500">{meta.descripcion}</p>
                  ) : null}
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <NarrativasTabla items={narrativasRadar} />
    </div>
  );
}
