"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NivelRiesgo } from "@/lib/types";
import { labelRiesgo } from "@/lib/labels";

const variantByRiesgo: Record<
  NivelRiesgo,
  "destructive" | "default" | "secondary"
> = {
  critico: "destructive",
  alto: "destructive",
  medio: "default",
  bajo: "secondary",
  neutral: "secondary",
};

export function RiskBadge({
  riesgo,
  className,
}: {
  riesgo: NivelRiesgo;
  className?: string;
}) {
  const v = variantByRiesgo[riesgo];
  const isSoftSuccess = riesgo === "bajo" || riesgo === "neutral";
  return (
    <Badge
      variant={v}
      className={cn(
        "shrink-0 text-[10px] font-semibold uppercase tracking-wide",
        isSoftSuccess &&
          "border border-emerald-800/80 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-950/50",
        riesgo === "medio" &&
          "border border-amber-800/80 bg-amber-950/40 text-amber-300 hover:bg-amber-950/40",
        className,
      )}
    >
      {labelRiesgo(riesgo)}
    </Badge>
  );
}
