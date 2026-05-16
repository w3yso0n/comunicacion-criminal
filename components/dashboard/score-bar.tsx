"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export function ScoreBar({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, score));
  const colorClass =
    score >= 60
      ? "bg-red-500"
      : score >= 30
        ? "bg-amber-500"
        : "bg-emerald-500";
  return (
    <div
      className={cn(
        "h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-zinc-800",
        className,
      )}
    >
      <motion.div
        className={cn("h-full rounded-full", colorClass)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" as const }}
      />
    </div>
  );
}
