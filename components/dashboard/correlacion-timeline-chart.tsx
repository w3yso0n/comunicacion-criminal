"use client";

import { format, parseISO, subDays } from "date-fns";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { hechos, timelineCorrelacion } from "@/lib/mock-data";
import { formatIntegerEsMx } from "@/lib/utils";

const tickMono = { fontFamily: "var(--font-geist-mono)", fontSize: 10, fill: "#71717a" };

export function CorrelacionTimelineChart() {
  const areas = hechos.map((h) => {
    const end = parseISO(h.fecha);
    const start = subDays(end, 3);
    return {
      id: h.id,
      x1: format(start, "yyyy-MM-dd"),
      x2: format(end, "yyyy-MM-dd"),
    };
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={timelineCorrelacion} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="1 3" stroke="#27272a" />
          <XAxis dataKey="fecha" tick={tickMono} tickFormatter={(v) => v.slice(5)} />
          <YAxis tick={tickMono} width={32} allowDecimals={false} />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-200">
                  <div>{String(payload[0].payload.fecha)}</div>
                  <div className="text-zinc-400">
                    Publicaciones:{" "}
                    {formatIntegerEsMx(Number(payload[0].payload.publicaciones))}
                  </div>
                  <div className="text-red-300">
                    Hechos: {formatIntegerEsMx(Number(payload[0].payload.hechos))}
                  </div>
                </div>
              ) : null
            }
          />
          {areas.map((a) => (
            <ReferenceArea
              key={a.id}
              x1={a.x1}
              x2={a.x2}
              fill="#ef4444"
              fillOpacity={0.06}
              strokeOpacity={0}
            />
          ))}
          <Line
            type="monotone"
            dataKey="publicaciones"
            stroke="#fafafa"
            strokeWidth={2}
            dot={false}
            name="Publicaciones"
            isAnimationActive
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="hechos"
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={{ r: 3, fill: "#ef4444" }}
            name="Hechos"
          />
          {hechos.map((h) => (
            <ReferenceLine
              key={`line-${h.id}`}
              x={format(parseISO(h.fecha), "yyyy-MM-dd")}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeOpacity={0.7}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
