"use client";

import { cn } from "@/lib/utils";

export function EntidadTags({
  grupos,
  lugares,
  alias,
  instituciones,
  className,
}: {
  grupos: string[];
  lugares: string[];
  alias: string[];
  instituciones: string[];
  className?: string;
}) {
  const chunks: { text: string; style: string }[] = [
    ...grupos.map((t) => ({
      text: t,
      style: "border-red-900/40 bg-red-950/30 text-red-200",
    })),
    ...lugares.map((t) => ({
      text: t,
      style: "border-blue-900/40 bg-blue-950/30 text-blue-200",
    })),
    ...alias.map((t) => ({
      text: t,
      style: "border-violet-900/40 bg-violet-950/30 text-violet-200",
    })),
    ...instituciones.map((t) => ({
      text: t,
      style: "border-zinc-600 bg-zinc-800/90 text-zinc-300",
    })),
  ];
  if (chunks.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {chunks.map((c) => (
        <span
          key={c.text}
          className={cn(
            "rounded border px-1.5 py-0.5 text-[10px] font-medium",
            c.style,
          )}
        >
          {c.text}
        </span>
      ))}
    </div>
  );
}
