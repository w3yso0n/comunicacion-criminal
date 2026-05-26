"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FuentesTableReal } from "@/components/dashboard/fuentes-table-real";
import type { Fuente } from "@/lib/db/fuentes";
import {
  labelPerspectivaAutor,
  PERSPECTIVAS_AUTOR,
  type PerspectivaAutor,
} from "@/lib/perspectiva-autor";
import { cn, formatIntegerEsMx } from "@/lib/utils";

interface Stats {
  total: number;
  verificadas: number;
  nuevas: number;
  altoRiesgo: number;
}

type PerspectivaFiltro = PerspectivaAutor | "todas";

const FILTROS: { id: PerspectivaFiltro; label: string }[] = [
  { id: "todas", label: "Todas" },
  ...PERSPECTIVAS_AUTOR.map((id) => ({
    id,
    label: labelPerspectivaAutor(id),
  })),
];

function StatMini({
  label,
  value,
  loading,
  className,
}: {
  label: string;
  value: number;
  loading: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-3", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
      {loading ? (
        <div className="mt-1.5 h-7 w-16 animate-pulse rounded bg-zinc-800" />
      ) : (
        <p className="mt-1 font-mono text-2xl font-semibold text-zinc-100">
          {formatIntegerEsMx(value)}
        </p>
      )}
    </div>
  );
}

export default function FuentesPage() {
  const [fuentes, setFuentes] = useState<Fuente[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [perspectiva, setPerspectiva] = useState<PerspectivaFiltro>("todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (perspectiva !== "todas") params.set("perspectiva", perspectiva);
      const qs = params.toString();
      const res = await fetch(`/api/fuentes${qs ? `?${qs}` : ""}`);
      const json = (await res.json()) as {
        ok: boolean;
        fuentes?: Fuente[];
        stats?: Stats;
        error?: string;
      };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Error al cargar fuentes.");
      setFuentes(json.fuentes ?? []);
      setStats(json.stats ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, [perspectiva]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-100">Fuentes monitoreadas</h1>
        <p className="text-xs text-zinc-500">
          Cuentas agrupadas por handle. Filtra por perspectiva del autor según el campo{" "}
          <span className="font-mono text-zinc-400">perspectiva_autor</span> en la base de datos.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Perspectiva
        </span>
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setPerspectiva(f.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              perspectiva === f.id
                ? "border-sky-700/60 bg-sky-950/40 text-sky-300"
                : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatMini label="Total fuentes" value={stats?.total ?? 0} loading={loading} />
        <StatMini
          label="Alto riesgo"
          value={stats?.altoRiesgo ?? 0}
          loading={loading}
          className={stats && stats.altoRiesgo > 0 ? "border-red-900/40 bg-red-950/15" : undefined}
        />
        <StatMini
          label="Cuentas nuevas"
          value={stats?.nuevas ?? 0}
          loading={loading}
          className={stats && stats.nuevas > 0 ? "border-sky-900/40 bg-sky-950/15" : undefined}
        />
        <StatMini label="Verificadas" value={stats?.verificadas ?? 0} loading={loading} />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 border-red-800/60"
            onClick={() => void fetchData()}
          >
            Reintentar
          </Button>
        </div>
      ) : loading ? (
        <div className="py-16 text-center text-sm text-zinc-500">Cargando fuentes...</div>
      ) : (
        <FuentesTableReal data={fuentes} />
      )}
    </div>
  );
}
