"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { Alerta } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AlertBanner({ alertas }: { alertas: Alerta[] }) {
  const first = alertas[0];
  if (!first) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" as const }}
      className="mb-6 overflow-hidden rounded-xl border border-red-900/40 bg-gradient-to-r from-red-950/80 to-transparent px-4 py-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-100">{first.titulo}</p>
            <p className="mt-1 text-xs text-red-200/80">{first.descripcion}</p>
          </div>
        </div>
        <Link
          href="/dashboard/alertas"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "shrink-0 border-red-800/60 bg-red-950/40 text-red-100 hover:bg-red-950/70",
          )}
        >
          Ver análisis completo
        </Link>
      </div>
    </motion.div>
  );
}
