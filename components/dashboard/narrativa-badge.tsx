"use client";

import { cn } from "@/lib/utils";
import type { NarrativaId } from "@/lib/types";
import { labelNarrativa } from "@/lib/labels";

export function NarrativaBadge({
  id,
  className,
}: {
  id: NarrativaId;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300",
        className,
      )}
    >
      {labelNarrativa(id)}
    </span>
  );
}
