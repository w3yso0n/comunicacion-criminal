import Link from "next/link";

import { CorrelacionTimelineChart } from "@/components/dashboard/correlacion-timeline-chart";
import { ChartErrorBoundary } from "@/components/dashboard/chart-error-boundary";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { hechos } from "@/lib/mock-data";
import { labelTipoHecho } from "@/lib/labels";
import { cn, formatIntegerEsMx } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CorrelacionPage() {
  return (
    <div className="mx-auto max-w-[1100px] space-y-8">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-100">
          Correlación con hechos delictivos
        </h1>
        <p className="text-xs text-zinc-500">
          Índice heurístico y transparente; no constituye prueba de responsabilidad.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
        <h2 className="text-sm font-semibold text-zinc-100">Cómo se calcula el índice</h2>
        <p className="mt-2">
          Combinamos cuatro señales ponderadas: coincidencia territorial (30%),
          coincidencia narrativa (30%), proximidad temporal (25%) y coincidencia de
          grupo mencionado (15%). El resultado es un score de 0 a 100 con texto de
          motivo para auditoría humana.
        </p>
        <p className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs text-zinc-300">
          índice = territorial×0.3 + narrativa×0.3 + temporal×0.25 + grupo×0.15
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Hechos correlacionados
        </h2>
        <div className="space-y-4">
          {hechos.map((h) => (
            <article
              key={h.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {labelTipoHecho(h.tipo)} · {h.estado}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {format(new Date(h.fecha), "PPP", { locale: es })}
                  </p>
                </div>
                <p className="font-mono text-2xl font-semibold text-zinc-100">
                  {formatIntegerEsMx(h.indiceCorrelacion)}
                </p>
              </header>
              <p className="mt-2 text-sm text-zinc-400">{h.descripcion}</p>
              <div className="mt-3">
                <Progress value={h.indiceCorrelacion} className="w-full" />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {formatIntegerEsMx(h.publicaciones72hAntes)} publicaciones 72h antes ·{" "}
                {formatIntegerEsMx(h.publicaciones24hDespues)} publicaciones 24h después
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-400">
                  {h.zonaTag}
                </span>
                <span className="rounded-md border border-red-900/40 bg-red-950/30 px-2 py-0.5 text-[10px] text-red-200">
                  {h.grupoMencionado}
                </span>
              </div>
              <div className="mt-3">
                <Link
                  href="/dashboard/explorador"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "border-zinc-700",
                  )}
                >
                  Ver publicaciones relacionadas
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Línea de tiempo
        </h2>
        <ChartErrorBoundary title="Timeline correlación">
          <CorrelacionTimelineChart />
        </ChartErrorBoundary>
      </section>
    </div>
  );
}
