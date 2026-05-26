import {
  labelPerspectivaAutor,
  normalizarPerspectivaAutor,
  type PerspectivaAutor,
} from "@/lib/perspectiva-autor";
import { cn } from "@/lib/utils";

const STYLES: Record<PerspectivaAutor, string> = {
  informativo: "border-sky-800/80 bg-sky-950/40 text-sky-300",
  ciudadano: "border-emerald-800/80 bg-emerald-950/40 text-emerald-300",
  criminal: "border-red-900/60 bg-red-950/40 text-red-300",
};

export function PerspectivaAutorBadge({
  value,
  className,
}: {
  value: string | null | undefined;
  className?: string;
}) {
  const id = normalizarPerspectivaAutor(value);
  if (!id) {
    return <span className={cn("text-xs text-zinc-600", className)}>—</span>;
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
        STYLES[id],
        className,
      )}
    >
      {labelPerspectivaAutor(id)}
    </span>
  );
}
