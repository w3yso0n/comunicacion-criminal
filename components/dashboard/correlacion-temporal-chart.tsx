"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartEmpty } from "@/components/dashboard/chart-empty";
import { useDashboardCharts } from "@/lib/hooks/use-dashboard-charts";
import type { PuntoCorrelacionTemporal } from "@/lib/types";
import { formatIntegerEsMx } from "@/lib/utils";

type Row = PuntoCorrelacionTemporal;

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
      <p className="font-mono text-[11px] text-zinc-400">{row.fecha}</p>
      <p className="font-mono text-sm text-zinc-100">
        Total: {formatIntegerEsMx(row.publicaciones)}
      </p>
      <p className="font-mono text-sm text-amber-300/90">
        Riesgo medio: {formatIntegerEsMx(row.publicacionesMedioRiesgo)}
      </p>
      <p className="font-mono text-sm text-red-300/90">
        Alto riesgo: {formatIntegerEsMx(row.publicacionesAltoRiesgo)}
      </p>
      <p className="font-mono text-sm text-sky-300/90">
        Score severidad prom.:{" "}
        {row.scoreSeveridadPromedio != null
          ? `${formatIntegerEsMx(row.scoreSeveridadPromedio)}/100`
          : "—"}
      </p>
    </div>
  );
}

export function CorrelacionTemporalChart() {
  const { data, loading } = useDashboardCharts();
  const correlacionPorDia = data?.correlacionPorDia ?? [];
  const diasPicoDetectados = data?.diasPicoDetectados ?? [];
  const hasData = correlacionPorDia.some((d) => d.publicaciones > 0);

  if (loading) {
    return <div className="h-[320px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />;
  }

  if (!hasData) {
    return (
      <ChartEmpty message="Sin menciones con fecha de publicación en los últimos 90 días." />
    );
  }

  const chartData: Row[] = correlacionPorDia;
  const tickMono = { fontFamily: "var(--font-geist-mono)", fontSize: 10, fill: "#71717a" };
  const xTickInterval = Math.max(1, Math.floor(chartData.length / 10));

  return (
    <div className="w-full min-w-0 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-zinc-800/60 pb-2 text-[10px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-amber-500/50" />
          <span>Riesgo medio</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-red-500/50" />
          <span>Alto riesgo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-sky-400" />
          <span>Score severidad prom.</span>
        </div>
      </div>
      <div className="h-[280px] w-full min-w-0 sm:h-[300px] xl:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 26, right: 36, left: 6, bottom: 28 }}
          >
            <CartesianGrid strokeDasharray="1 3" stroke="#27272a" />
            <XAxis
              dataKey="fecha"
              tick={tickMono}
              interval={xTickInterval}
              angle={-35}
              textAnchor="end"
              height={48}
              tickMargin={4}
            />
            <YAxis
              yAxisId="left"
              tick={tickMono}
              width={44}
              allowDecimals={false}
              tickMargin={4}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={tickMono}
              width={44}
              tickMargin={4}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar
              yAxisId="left"
              dataKey="publicacionesMedioRiesgo"
              stackId="pub"
              fill="rgba(245,158,11,0.45)"
              name="Riesgo medio"
              isAnimationActive
              animationDuration={800}
            />
            <Bar
              yAxisId="left"
              dataKey="publicacionesAltoRiesgo"
              stackId="pub"
              fill="rgba(239,68,68,0.55)"
              name="Alto riesgo"
              isAnimationActive
              animationDuration={800}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="scoreSeveridadPromedio"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 2, fill: "#38bdf8", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#38bdf8", stroke: "#0ea5e9", strokeWidth: 2 }}
              name="Score severidad prom."
              connectNulls
              isAnimationActive
              animationDuration={800}
            />
            {diasPicoDetectados.slice(0, 2).map((i) => (
              <ReferenceLine
                key={i}
                yAxisId="left"
                x={chartData[i]?.fecha}
                stroke="#71717a"
                strokeDasharray="3 3"
                label={{
                  value: "Pico detectado",
                  position: i >= chartData.length / 2 ? "insideTopRight" : "insideTopLeft",
                  fill: "#a1a1aa",
                  fontSize: 9,
                }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
