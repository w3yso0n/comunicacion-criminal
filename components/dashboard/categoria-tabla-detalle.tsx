"use client";

import { motion } from "motion/react";

import { ChartEmpty } from "@/components/dashboard/chart-empty";
import { useDashboardCharts } from "@/lib/hooks/use-dashboard-charts";
import { formatIntegerEsMx } from "@/lib/utils";

export function CategoriaTablaDetalle() {
  const { data, loading } = useDashboardCharts();
  const categoriaDistribucion = data?.categoriaDistribucion ?? [];

  if (loading) {
    return <div className="h-32 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/40" />;
  }

  if (categoriaDistribucion.length === 0) {
    return <ChartEmpty message="Sin distribución por tipo principal." />;
  }

  return (
    <div className="space-y-3">
      {categoriaDistribucion.map((c) => (
        <div key={c.categoria} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-zinc-200">{c.label}</span>
            <span className="font-mono text-sm text-zinc-300">
              {formatIntegerEsMx(c.pct)}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-red-500/80"
              initial={{ width: 0 }}
              animate={{ width: `${c.pct}%` }}
              transition={{ duration: 0.55, ease: "easeOut" as const }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">{c.ejemplo}</p>
        </div>
      ))}
    </div>
  );
}
