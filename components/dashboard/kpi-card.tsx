"use client";

import { animate } from "motion/react";
import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { cn, formatIntegerEsMx } from "@/lib/utils";

export type KpiVariant = "default" | "danger" | "warning" | "success";

type TrendSentiment = "risk" | "growth" | "neutral";

export function KpiCard({
  label,
  value,
  valueSuffix,
  subtext,
  trend,
  trendValue,
  trendSentiment = "neutral",
  icon: Icon,
  variant = "default",
  formatValue,
}: {
  label: string;
  value: number;
  valueSuffix?: string;
  subtext: string;
  trend?: "up" | "down";
  trendValue?: number;
  trendSentiment?: TrendSentiment;
  icon: LucideIcon;
  variant?: KpiVariant;
  formatValue?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(0);
  const fmt = formatValue ?? formatIntegerEsMx;

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut" as const,
      onUpdate: (v) => {
        setDisplay(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value]);

  const valueClass =
    variant === "danger"
      ? "text-red-400"
      : variant === "warning"
        ? "text-amber-300"
        : variant === "success"
          ? "text-emerald-400"
          : "text-zinc-50";

  const trendColor =
    trendSentiment === "risk"
      ? "text-red-400"
      : trendSentiment === "growth"
        ? "text-emerald-400"
        : "text-zinc-400";

  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-[filter] duration-200 hover:brightness-110",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {label}
        </span>
        <Icon className="size-4 shrink-0 text-zinc-600" aria-hidden />
      </div>
      <p
        className={cn(
          "font-mono text-[28px] font-semibold leading-none tracking-tight",
          valueClass,
        )}
      >
        {fmt(display)}
        {valueSuffix ? (
          <span className="text-lg font-semibold text-zinc-400">
            {valueSuffix}
          </span>
        ) : null}
      </p>
      <p className="mt-1 text-[11px] text-zinc-500">{subtext}</p>
      {trend !== undefined && trendValue !== undefined ? (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            trendColor,
          )}
        >
          <TrendIcon className="size-3.5" aria-hidden />
          <span className="font-mono">
            {trend === "up" ? "+" : "-"}
            {Math.abs(trendValue)}%
          </span>
        </div>
      ) : null}
    </div>
  );
}
