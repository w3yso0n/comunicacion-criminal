"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FuentesTableReal } from "@/components/dashboard/fuentes-table-real";
import type { Fuente } from "@/lib/db/fuentes";
import { cn, formatIntegerEsMx } from "@/lib/utils";

interface Stats {
  total: number;
  verificadas: number;
  nuevas: number;
  altoRiesgo: number;
}

function StatMini({ label, value, loading, className }: {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fuentes");
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
  }

  useEffect(() => { void fetchData(); }, []);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-100">Fuentes monitoreadas</h1>
        <p className="text-xs text-zinc-500">
          Cuentas y canales agrupados por handle, ordenados por número de menciones y severidad.
        </p>
      </header>

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
          <Button type="button" variant="outline" size="sm" className="mt-3 border-red-800/60" onClick={() => void fetchData()}>
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
