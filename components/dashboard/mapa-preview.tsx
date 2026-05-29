"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";

import type { Mencion } from "@/lib/types";
import { formatIntegerEsMx } from "@/lib/utils";

const PREVIEW_LIMIT = 150;

const MapaCoropletico = dynamic(
  () => import("@/components/dashboard/mapa-coropletico").then((m) => m.MapaCoropletico),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Cargando mapa...
      </div>
    ),
  },
);

export function MapaPreview() {
  const [menciones, setMenciones] = useState<Mencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/menciones?limit=${PREVIEW_LIMIT}&offset=0`)
      .then((r) => r.json())
      .then((json: { ok: boolean; data?: Mencion[]; error?: string }) => {
        if (!json.ok || !json.data) {
          throw new Error(json.error ?? "No se pudieron cargar las menciones.");
        }
        setMenciones(json.data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error al cargar el mapa.");
      })
      .finally(() => setLoading(false));
  }, []);

  const municipiosConDatos = useMemo(() => {
    const set = new Set<string>();
    for (const m of menciones) {
      if (m.municipio?.trim()) set.add(m.municipio.trim());
    }
    return set.size;
  }, [menciones]);

  const conMunicipio = useMemo(
    () => menciones.filter((m) => m.municipio?.trim()),
    [menciones],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/60 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-sky-400" />
            <h2 className="text-sm font-medium text-zinc-100">Mapa coroplético</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            {loading ? (
              "Cargando municipios..."
            ) : error ? (
              error
            ) : (
              <>
                <span className="font-medium text-zinc-300">
                  {formatIntegerEsMx(municipiosConDatos)}
                </span>{" "}
                municipios ·{" "}
                <span className="font-medium text-zinc-300">
                  {formatIntegerEsMx(conMunicipio.length)}
                </span>{" "}
                menciones con municipio
              </>
            )}
          </p>
        </div>
        <Link
          href="/Mapa"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-sky-700/60 hover:text-sky-300"
        >
          Ver mapa completo
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="relative h-[280px] w-full sm:h-[300px]">
        {loading ? (
          <div className="absolute inset-0 animate-pulse bg-zinc-900/80" />
        ) : error ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-red-300/90">
            {error}
          </div>
        ) : conMunicipio.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <MapPin className="size-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">No hay menciones con municipio para mostrar.</p>
            <Link href="/Mapa" className="text-xs text-sky-400 hover:text-sky-300">
              Ir al mapa →
            </Link>
          </div>
        ) : (
          <>
            <MapaCoropletico menciones={conMunicipio} modo="preview" />
            <Link
              href="/Mapa"
              className="absolute inset-0 z-10 flex items-end justify-end bg-linear-to-t from-zinc-950/40 via-transparent to-transparent p-3 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100"
              aria-label="Abrir mapa completo"
            >
              <span className="rounded-lg border border-zinc-700/80 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-sm">
                Explorar en mapa interactivo
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
