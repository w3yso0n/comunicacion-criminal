"use client";

import { cn } from "@/lib/utils";
import type { CategoriaContenido } from "@/lib/types";
import { labelCategoria } from "@/lib/labels";

const tone: Partial<
  Record<
    CategoriaContenido,
    string
  >
> = {
  narcomanta_digital: "border-red-900/60 bg-red-950/40 text-red-300",
  demostracion_armamento: "border-orange-900/50 bg-orange-950/35 text-orange-200",
  comunicado_territorial: "border-zinc-700 bg-zinc-800 text-zinc-200",
  advertencia_publica: "border-red-800/70 bg-red-950/50 text-red-200",
  propaganda_grupo: "border-rose-900/50 bg-rose-950/35 text-rose-200",
  noticia_neutral: "border-zinc-600 bg-zinc-800/80 text-zinc-300",
  otro: "border-zinc-700 bg-zinc-900 text-zinc-400",
};

export function CategoriaBadge({
  categoria,
  className,
}: {
  categoria: CategoriaContenido;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium",
        tone[categoria] ?? tone.otro,
        className,
      )}
    >
      {labelCategoria(categoria)}
    </span>
  );
}
