"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { MencionCard } from "@/components/dashboard/mencion-card";
import { Button } from "@/components/ui/button";
import { useAlertsStore } from "@/lib/stores/alerts-store";
import type { Mencion } from "@/lib/types";
import { formatIntegerEsMx } from "@/lib/utils";

export function ExploradorClient() {
  const searchParams = useSearchParams();
  const clusterId = searchParams.get("clusterId")?.trim() || undefined;

  const alertas = useAlertsStore((s) => s.items);
  const alertaRelacionada = useMemo(
    () =>
      clusterId
        ? alertas.find(
            (a) =>
              a.clusterId?.toLowerCase() === clusterId.toLowerCase(),
          )
        : undefined,
    [alertas, clusterId],
  );

  const [items, setItems] = useState<Mencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (clusterId) params.set("clusterId", clusterId);
      const res = await fetch(`/api/menciones?${params.toString()}`);
      const json = (await res.json()) as {
        ok: boolean;
        data?: Mencion[];
        error?: string;
      };
      if (!res.ok || !json.ok || !json.data) {
        throw new Error(json.error ?? "No se pudieron cargar las menciones.");
      }
      setItems(json.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar menciones.";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [clusterId]);

  useEffect(() => {
    void fetchMenciones();
  }, [fetchMenciones]);

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-100">Explorador</h1>
        <p className="text-xs text-zinc-500">
          {clusterId
            ? "Menciones vinculadas al cluster de una alerta."
            : "Menciones detectadas en redes (hechos delictivos y cobertura mediática)."}
        </p>
      </header>

      {clusterId ? (
        <div className="rounded-xl border border-sky-900/40 bg-sky-950/20 px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400">
                Cluster de alerta
              </p>
              {alertaRelacionada ? (
                <p className="mt-1 text-sm font-medium text-zinc-100">
                  {alertaRelacionada.titulo}
                </p>
              ) : (
                <p className="mt-1 text-sm text-zinc-400">
                  Filtrando por cluster
                </p>
              )}
              <p className="mt-1 font-mono text-[10px] text-zinc-600">
                {clusterId}
              </p>
            </div>
            <Link
              href="/Explorador"
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
            >
              <X className="size-3.5" />
              Quitar filtro
            </Link>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 border-red-800/60"
            onClick={() => void fetchMenciones()}
          >
            Reintentar
          </Button>
        </div>
      ) : null}

      {!error && loading ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Cargando menciones...
        </p>
      ) : null}

      {!error && !loading ? (
        <p className="text-xs text-zinc-600">
          {formatIntegerEsMx(items.length)} menciones
          {clusterId ? " en este cluster" : ""}
        </p>
      ) : null}

      <div className="space-y-4">
        {!loading && !error
          ? items.map((m, index) => (
              <MencionCard key={m.id} mencion={m} index={index} />
            ))
          : null}
        {!loading && !error && items.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            No hay menciones para mostrar.
          </p>
        ) : null}
      </div>
    </div>
  );
}
