"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";

import { MapaCalor } from "@/components/dashboard/mapa-calor";
import { MencionCard } from "@/components/dashboard/mencion-card";
import { Button } from "@/components/ui/button";
import type { Mencion, NivelRiesgo } from "@/lib/types";
import { cn } from "@/lib/utils";

const NIVELES_RIESGO: { value: NivelRiesgo | "todos"; label: string; color: string }[] = [
  { value: "todos", label: "Todos", color: "border-zinc-600 bg-zinc-800 text-zinc-100" },
  { value: "critico", label: "Crítico", color: "border-red-700 bg-red-900/50 text-red-200" },
  { value: "alto", label: "Alto", color: "border-orange-700 bg-orange-900/50 text-orange-200" },
  { value: "medio", label: "Medio", color: "border-yellow-700 bg-yellow-900/50 text-yellow-200" },
  { value: "bajo", label: "Bajo", color: "border-green-700 bg-green-900/50 text-green-200" },
];

export function MapaClient() {
  const [items, setItems] = useState<Mencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroRiesgo, setFiltroRiesgo] = useState<NivelRiesgo | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const mapaRef = useRef<HTMLDivElement>(null);

  const fetchMenciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/menciones?limit=500");
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
      setError(err instanceof Error ? err.message : "Error al cargar menciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMenciones();
  }, [fetchMenciones]);

  const conCoordenadas = useMemo(
    () => items.filter((m) => typeof m.lat === "number" && typeof m.lon === "number"),
    [items],
  );

  const listadoFiltrado = useMemo(() => {
    let result = items;
    if (filtroRiesgo !== "todos") {
      result = result.filter((m) => m.nivelRiesgo === filtroRiesgo);
    }
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.contenido.toLowerCase().includes(q) ||
          (m.descripcionCorta ?? "").toLowerCase().includes(q) ||
          (m.municipio ?? "").toLowerCase().includes(q) ||
          (m.grupoCriminal ?? "").toLowerCase().includes(q) ||
          (m.handle ?? "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, filtroRiesgo, busqueda]);

  const mapaFiltrado = useMemo(
    () =>
      filtroRiesgo === "todos"
        ? conCoordenadas
        : conCoordenadas.filter((m) => m.nivelRiesgo === filtroRiesgo),
    [conCoordenadas, filtroRiesgo],
  );

  return (
    <div className="flex w-full flex-col gap-3" style={{ height: "calc(100dvh - 112px)" }}>
      {/* Mapa */}
      <div ref={mapaRef} className="relative shrink-0 overflow-hidden rounded-xl border border-zinc-800/70" style={{ height: "45%" }}>
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/90 px-3 py-1.5 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Mapa de calor
            </p>
            <p className="text-xs text-zinc-300">
              <span className="font-semibold text-zinc-100">{mapaFiltrado.length}</span> puntos geolocalizados
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Cargando menciones...
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
            <p className="text-sm text-red-300">{error}</p>
            <Button type="button" variant="outline" size="sm" className="border-red-800/60" onClick={() => void fetchMenciones()}>
              Reintentar
            </Button>
          </div>
        ) : conCoordenadas.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No hay menciones con coordenadas geográficas.
          </div>
        ) : (
          <MapaCalor menciones={mapaFiltrado} highlightedId={highlighted} onSelectMencion={(m) => setHighlighted(m?.id ?? null)} />
        )}
      </div>

      {/* Lista */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/20">
        {/* Barra de filtros */}
        <div className="shrink-0 border-b border-zinc-800/70 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <SlidersHorizontal className="size-3.5" />
              Filtrar
            </div>

            {/* Filtro riesgo */}
            <div className="flex flex-wrap gap-1">
              {NIVELES_RIESGO.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => setFiltroRiesgo(n.value)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                    filtroRiesgo === n.value
                      ? n.color
                      : "border-zinc-700 bg-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-300",
                  )}
                >
                  {n.label}
                </button>
              ))}
            </div>

            {/* Búsqueda */}
            <div className="ml-auto flex items-center gap-2 rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5">
              <Search className="size-3.5 shrink-0 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por contenido, municipio, grupo…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-48 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none"
              />
              {busqueda ? (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="text-zinc-600 hover:text-zinc-400"
                >
                  ✕
                </button>
              ) : null}
            </div>

            <span className="text-xs text-zinc-500">
              <span className="font-medium text-zinc-300">{listadoFiltrado.length}</span> de{" "}
              <span className="font-medium text-zinc-300">{items.length}</span> menciones
            </span>
          </div>
        </div>

        {/* Lista de menciones */}
        <div className="scrollbar-dashboard min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-zinc-500">Cargando menciones...</p>
          ) : listadoFiltrado.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <MapPin className="size-8 text-zinc-700" />
              <p className="text-sm text-zinc-500">No hay menciones que coincidan con los filtros.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 xl:grid-cols-3">
              {listadoFiltrado.map((m, i) => {
                const tieneCoordenadas =
                  typeof m.lat === "number" && typeof m.lon === "number";
                return (
                  <li
                    key={m.id}
                    className={cn(
                      "group relative transition-all",
                      highlighted === m.id && "rounded-xl ring-2 ring-sky-500/60",
                    )}
                  >
                    <MencionCard mencion={m} index={i} />
                    {tieneCoordenadas ? (
                      <button
                        type="button"
                        onClick={() => {
                          setHighlighted(m.id);
                          mapaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className={cn(
                          "absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all",
                          highlighted === m.id
                            ? "border-sky-600 bg-sky-900/60 text-sky-200"
                            : "border-zinc-700 bg-zinc-900/90 text-zinc-400 opacity-0 group-hover:opacity-100 hover:border-sky-700 hover:text-sky-300",
                        )}
                      >
                        <MapPin className="size-3.5" />
                        {highlighted === m.id ? "En el mapa" : "Ver en mapa"}
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
