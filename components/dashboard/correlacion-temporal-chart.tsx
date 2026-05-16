"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { horasPicoDetectadas, correlacionPorHora } from "@/lib/mock-data";
import { formatIntegerEsMx } from "@/lib/utils";

type Row = (typeof correlacionPorHora)[number] & {
  pubBase: number;
  pubCrit: number;
};

const chartData: Row[] = correlacionPorHora.map((d) => ({
  ...d,
  pubBase: Math.max(0, d.publicaciones - d.publicacionesCriticas),
  pubCrit: d.publicacionesCriticas,
}));

const scatterPoints = correlacionPorHora
  .map((d) =>
    d.hechos > 0
      ? {
          hora: d.hora,
          y: d.publicaciones * 0.92,
          hechos: d.hechos,
        }
      : null,
  )
  .filter((p): p is NonNullable<typeof p> => p !== null);

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
      {row.hechos > 0 ? (
        <p className="font-mono text-sm text-red-400">
          Hechos: {formatIntegerEsMx(row.hechos)}
        </p>
      ) : null}
      <p className="font-mono text-sm text-zinc-400">
        Índice apología: {formatIntegerEsMx(row.indiceApologiaPromedio)}
      </p>
    </div>
  );
}

export function CorrelacionTemporalChart() {
  const tickMono = { fontFamily: "var(--font-geist-mono)", fontSize: 10, fill: "#71717a" };

  return (
    <div className="w-full min-w-0 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-zinc-800/60 pb-2 text-[10px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-zinc-600" />
          <span>Propaganda</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span>Incidente</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-zinc-400" />
          <span>Índice apología</span>
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
            name="Propaganda"
            isAnimationActive
            animationDuration={800}
          />
          <Bar
            yAxisId="left"
            dataKey="pubCrit"
            stackId="pub"
            fill="rgba(239,68,68,0.5)"
            name="Crítico"
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
            name="Índice"
            isAnimationActive
            animationDuration={800}
          />
          <Scatter
            yAxisId="left"
            data={scatterPoints}
            dataKey="y"
            fill="#ef4444"
            name="Hechos"
            shape="circle"
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
                position: h === 22 ? "insideTopRight" : "insideTopLeft",
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
