"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { categoriaDistribucion } from "@/lib/mock-data";
import { formatIntegerEsMx } from "@/lib/utils";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#a855f7",
  "#64748b",
];

export function CategoriaDonut() {
  const data = categoriaDistribucion.map((c) => ({
    name: c.label,
    value: c.pct,
  }));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Clasificación de contenido
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={2}
            isAnimationActive
            animationDuration={800}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#18181b" />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-200">
                  <div>{payload[0].name}</div>
                  <div className="text-zinc-400">{payload[0].value}%</div>
                </div>
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 space-y-1 text-[11px] text-zinc-400">
        {categoriaDistribucion.map((c, i) => (
          <li key={c.categoria} className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-sm"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="truncate">{c.label}</span>
            <span className="ml-auto font-mono text-zinc-300">
              {formatIntegerEsMx(c.pct)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
