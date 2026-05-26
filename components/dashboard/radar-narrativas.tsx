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
import { narrativasRadarTieneDatos } from "@/lib/narrativas-radar";
import { formatIntegerEsMx } from "@/lib/utils";

export function RadarNarrativas() {
  const { data, loading } = useDashboardCharts();
  const narrativasRadar = data?.narrativasRadar ?? [];

  if (loading) {
    return (
      <div className="h-[520px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
    );
  }

  if (!narrativasRadarTieneDatos(narrativasRadar)) {
    return (
      <ChartEmpty message="Sin subtipos con menciones en el último mes (campo sub_tipo en BD)." />
    );
  }

  const chartData = narrativasRadar.map((n) => ({
    subject: n.label,
    valor: n.valor,
    fullMark: 100,
  }));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 md:p-4">
      <div className="mb-3 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Subtipos de menciones
        </p>
        <p className="text-[11px] text-zinc-600">
          Últimos 30 días · agrupado por <span className="font-mono">sub_tipo</span> en
          base de datos (máx. 12)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
          <PolarGrid stroke="#27272a" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#a1a1aa", fontSize: 9 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Score"
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
              const row = payload[0]?.payload as
                | { subject: string; valor: number }
                | undefined;
              if (!row) return null;
              const meta = narrativasRadar.find((n) => n.label === row.subject);
              return (
                <div className="max-w-xs rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-xl">
                  <p className="font-medium text-zinc-100">{row.subject}</p>
                  <p className="font-mono text-zinc-300">
                    Score {row.valor}
                    {meta
                      ? ` · ${formatIntegerEsMx(meta.menciones)} menciones`
                      : null}
                  </p>
                  {meta ? (
                    <p className="mt-1 line-clamp-4 text-zinc-500">{meta.descripcion}</p>
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
