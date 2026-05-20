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
import type { PuntoCorrelacionHora } from "@/lib/types";
import { formatIntegerEsMx } from "@/lib/utils";

type Row = PuntoCorrelacionHora & {
  pubBase: number;
  pubCrit: number;
};

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
      <p className="font-mono text-[11px] text-zinc-400">{row.hora}</p>
      <p className="font-mono text-sm text-zinc-100">
        Publicaciones: {formatIntegerEsMx(row.publicaciones)}
      </p>
      <p className="font-mono text-sm text-zinc-300">
        Críticas: {formatIntegerEsMx(row.publicacionesCriticas)}
      </p>
      <p className="font-mono text-sm text-zinc-400">
        Índice severidad: {formatIntegerEsMx(row.indiceApologiaPromedio)}
      </p>
    </div>
  );
}

export function CorrelacionTemporalChart() {
  const { data, loading } = useDashboardCharts();
  const correlacionPorHora = data?.correlacionPorHora ?? [];
  const horasPicoDetectadas = data?.horasPicoDetectadas ?? [];
  const hasData = correlacionPorHora.some((d) => d.publicaciones > 0);

  if (loading) {
    return <div className="h-[320px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />;
  }

  if (!hasData) {
    return <ChartEmpty message="Sin menciones con fecha de publicación para agregar por hora." />;
  }

  const chartData: Row[] = correlacionPorHora.map((d) => ({
    ...d,
    pubBase: Math.max(0, d.publicaciones - d.publicacionesCriticas),
    pubCrit: d.publicacionesCriticas,
  }));

  const tickMono = { fontFamily: "var(--font-geist-mono)", fontSize: 10, fill: "#71717a" };

  return (
    <div className="w-full min-w-0 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-zinc-800/60 pb-2 text-[10px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-zinc-600" />
          <span>Menciones</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-red-500/50" />
          <span>Alto riesgo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-zinc-400" />
          <span>Score severidad prom.</span>
        </div>
      </div>
      <div className="h-[280px] w-full min-w-0 sm:h-[300px] xl:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 26, right: 28, left: 6, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="1 3" stroke="#27272a" />
            <XAxis
              dataKey="hora"
              tick={tickMono}
              interval={2}
              height={28}
              tickMargin={6}
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
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Bar
              yAxisId="left"
              dataKey="pubBase"
              stackId="pub"
              fill="#52525b"
              name="Menciones"
              isAnimationActive
              animationDuration={800}
            />
            <Bar
              yAxisId="left"
              dataKey="pubCrit"
              stackId="pub"
              fill="rgba(239,68,68,0.5)"
              name="Alto riesgo"
              isAnimationActive
              animationDuration={800}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="indiceApologiaPromedio"
              stroke="#a1a1aa"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              name="Score"
              isAnimationActive
              animationDuration={800}
            />
            {horasPicoDetectadas.slice(0, 2).map((h) => (
              <ReferenceLine
                key={h}
                yAxisId="left"
                x={correlacionPorHora[h]?.hora}
                stroke="#71717a"
                strokeDasharray="3 3"
                label={{
                  value: "Pico detectado",
                  position: h >= 12 ? "insideTopRight" : "insideTopLeft",
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
