"use client";

import { formatIntegerEsMx } from "@/lib/utils";
import { narrativasRadar } from "@/lib/mock-data";

export function NarrativasTabla() {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] uppercase tracking-widest text-zinc-500">
          <tr>
            <th className="px-3 py-2">Narrativa</th>
            <th className="px-3 py-2">Score</th>
            <th className="px-3 py-2">Δ sem.</th>
            <th className="px-3 py-2">Descripción</th>
          </tr>
        </thead>
        <tbody>
          {narrativasRadar.map((n) => (
            <tr key={n.id} className="border-b border-zinc-800/80">
              <td className="px-3 py-2 font-medium text-zinc-200">{n.label}</td>
              <td className="px-3 py-2 font-mono text-zinc-300">
                {formatIntegerEsMx(n.valor)}
              </td>
              <td
                className={
                  n.variacionSemanalPct >= 0
                    ? "px-3 py-2 font-mono text-red-300"
                    : "px-3 py-2 font-mono text-emerald-400"
                }
              >
                {n.variacionSemanalPct >= 0 ? "+" : ""}
                {formatIntegerEsMx(n.variacionSemanalPct)}%
              </td>
              <td className="px-3 py-2 text-zinc-500">{n.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
