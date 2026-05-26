"use client";

import type { NarrativaRadarDato } from "@/lib/types";
import { formatIntegerEsMx } from "@/lib/utils";

type NarrativasTablaProps = {
  items: NarrativaRadarDato[];
};

export function NarrativasTabla({ items }: NarrativasTablaProps) {
  if (items.length === 0) return null;

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] uppercase tracking-widest text-zinc-500">
          <tr>
            <th className="px-3 py-2">Subtipo</th>
            <th className="px-3 py-2">Score</th>
            <th className="px-3 py-2">Menciones</th>
            <th className="px-3 py-2">Δ mes</th>
            <th className="px-3 py-2">Ejemplo (BD)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((n) => (
            <tr key={n.id} className="border-b border-zinc-800/80">
              <td className="px-3 py-2 font-medium text-zinc-200">{n.label}</td>
              <td className="px-3 py-2 font-mono text-zinc-300">
                {formatIntegerEsMx(n.valor)}
              </td>
              <td className="px-3 py-2 font-mono text-zinc-400">
                {formatIntegerEsMx(n.menciones)}
              </td>
              <td
                className={
                  n.variacionMesPct >= 0
                    ? "px-3 py-2 font-mono text-red-300"
                    : "px-3 py-2 font-mono text-emerald-400"
                }
              >
                {n.variacionMesPct >= 0 ? "+" : ""}
                {formatIntegerEsMx(n.variacionMesPct)}%
              </td>
              <td className="px-3 py-2 text-zinc-500">{n.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
