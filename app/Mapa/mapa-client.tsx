"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";

import { MencionCard } from "@/components/dashboard/mencion-card";
import { Button } from "@/components/ui/button";
import type { Mencion, NivelRiesgo } from "@/lib/types";
import { cn, formatIntegerEsMx } from "@/lib/utils";

const PAGE_SIZE = 50;
const MAPA_PAGE_SIZE = 200;

const MapaCalor = dynamic(
  () => import("@/components/dashboard/mapa-calor").then((m) => m.MapaCalor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Cargando mapa...
      </div>
    ),
  },
);

const NIVELES_RIESGO: { value: NivelRiesgo | "todos"; label: string; color: string }[] = [
  { value: "todos",   label: "Todos",   color: "border-zinc-600 bg-zinc-800 text-zinc-100" },
  { value: "alto",    label: "Alto",    color: "border-orange-700 bg-orange-900/50 text-orange-200" },
  { value: "medio",   label: "Medio",   color: "border-yellow-700 bg-yellow-900/50 text-yellow-200" },
  { value: "bajo",    label: "Bajo",    color: "border-green-700 bg-green-900/50 text-green-200" },
];

export function MapaClient() {
  // — mapa: primeros 200 puntos con coordenadas + paginación propia
  const [puntosCalor, setPuntosCalor] = useState<Mencion[]>([]);
  const [mapaLoading, setMapaLoading] = useState(true);
  const [mapaOffset, setMapaOffset] = useState(0);
  const [mapaHasMore, setMapaHasMore] = useState(false);
  const [mapaLoadingMore, setMapaLoadingMore] = useState(false);

  // — lista: paginada con lazy loading
  const [items, setItems] = useState<Mencion[]>([]);
  const [listaLoading, setListaLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // — filtros (aplicados en cliente sobre items cargados)
  const [filtroRiesgo, setFiltroRiesgo] = useState<NivelRiesgo | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const mapaRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Carga inicial del mapa — solo 200 puntos
  const fetchPuntosCalor = useCallback(async () => {
    setMapaLoading(true);
    try {
      const res = await fetch(`/api/menciones?limit=${MAPA_PAGE_SIZE}&offset=0`);
      const json = (await res.json()) as { ok: boolean; data?: Mencion[]; hasMore?: boolean };
      if (!json.ok || !json.data) return;
      setPuntosCalor(json.data.filter((m) => typeof m.lat === "number" && typeof m.lon === "number"));
      setMapaOffset(json.data.length);
      setMapaHasMore(json.hasMore ?? false);
    } catch {
      // silencioso
    } finally {
      setMapaLoading(false);
    }
  }, []);

  // Carga siguiente página del mapa
  const fetchMoreMapa = useCallback(async () => {
    if (mapaLoadingMore || !mapaHasMore) return;
    setMapaLoadingMore(true);
    try {
      const res = await fetch(`/api/menciones?limit=${MAPA_PAGE_SIZE}&offset=${mapaOffset}`);
      const json = (await res.json()) as { ok: boolean; data?: Mencion[]; hasMore?: boolean };
      if (!json.ok || !json.data) return;
      setPuntosCalor((prev) => [
        ...prev,
        ...json.data!.filter((m) => typeof m.lat === "number" && typeof m.lon === "number"),
      ]);
      setMapaOffset((prev) => prev + json.data!.length);
      setMapaHasMore(json.hasMore ?? false);
    } catch {
      // silencioso
    } finally {
      setMapaLoadingMore(false);
    }
  }, [mapaLoadingMore, mapaHasMore, mapaOffset]);

  // Carga inicial de la lista
  const fetchFirst = useCallback(async () => {
    setListaLoading(true);
    setError(null);
    setItems([]);
    setOffset(0);
    setHasMore(true);
    try {
      const res = await fetch(`/api/menciones?limit=${PAGE_SIZE}&offset=0`);
      const json = (await res.json()) as { ok: boolean; data?: Mencion[]; hasMore?: boolean; error?: string };
      if (!res.ok || !json.ok || !json.data) throw new Error(json.error ?? "Error al cargar menciones.");
      setItems(json.data);
      setOffset(json.data.length);
      setHasMore(json.hasMore ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar menciones.");
    } finally {
      setListaLoading(false);
    }
  }, []);

  // Carga siguiente página
  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/menciones?limit=${PAGE_SIZE}&offset=${offset}`);
      const json = (await res.json()) as { ok: boolean; data?: Mencion[]; hasMore?: boolean };
      if (!json.ok || !json.data) return;
      setItems((prev) => [...prev, ...json.data!]);
      setOffset((prev) => prev + json.data!.length);
      setHasMore(json.hasMore ?? false);
    } catch {
      // silencioso
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, offset]);

  // IntersectionObserver en el sentinel de la lista
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) void fetchMore(); },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchMore]);

  useEffect(() => {
    void fetchPuntosCalor();
    void fetchFirst();
  }, [fetchPuntosCalor, fetchFirst]);

  // Filtros en cliente (sobre items ya cargados)
  const listadoFiltrado = useMemo(() => {
    let result = items;
    if (filtroRiesgo !== "todos") result = result.filter((m) => m.nivelRiesgo === filtroRiesgo);
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
        ? puntosCalor
        : puntosCalor.filter((m) => m.nivelRiesgo === filtroRiesgo),
    [puntosCalor, filtroRiesgo],
  );

  const loading = mapaLoading || listaLoading;

  return (
    <div className="flex w-full flex-col gap-3" style={{ height: "calc(100dvh - 112px)" }}>
      {/* Mapa */}
      <div ref={mapaRef} className="relative shrink-0 overflow-hidden rounded-xl border border-zinc-800/70" style={{ height: "45%" }}>
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/90 px-3 py-1.5 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Mapa de calor</p>
            <p className="text-xs text-zinc-300">
              <span className="font-semibold text-zinc-100">{formatIntegerEsMx(mapaFiltrado.length)}</span> puntos
              {mapaHasMore ? <span className="text-zinc-500"> de {formatIntegerEsMx(mapaOffset)}+ cargados</span> : null}
            </p>
          </div>
          {mapaHasMore ? (
            <button
              type="button"
              onClick={() => void fetchMoreMapa()}
              disabled={mapaLoadingMore}
              className="rounded-lg border border-zinc-700/80 bg-zinc-900/90 px-3 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur-sm transition-colors hover:border-sky-700/60 hover:text-sky-300 disabled:opacity-50"
            >
              {mapaLoadingMore ? "Cargando..." : `+ 200 puntos más`}
            </button>
          ) : null}
        </div>

        {mapaLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">Cargando mapa...</div>
        ) : error && puntosCalor.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
            <p className="text-sm text-red-300">{error}</p>
            <Button type="button" variant="outline" size="sm" className="border-red-800/60" onClick={() => void fetchPuntosCalor()}>
              Reintentar
            </Button>
          </div>
        ) : puntosCalor.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">No hay menciones con coordenadas geográficas.</div>
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
                <button type="button" onClick={() => setBusqueda("")} className="text-zinc-600 hover:text-zinc-400">✕</button>
              ) : null}
            </div>

            <span className="text-xs text-zinc-500">
              <span className="font-medium text-zinc-300">{formatIntegerEsMx(listadoFiltrado.length)}</span> cargadas
              {hasMore && !busqueda && filtroRiesgo === "todos" ? (
                <span className="text-zinc-600"> · hay más</span>
              ) : null}
            </span>
          </div>
        </div>

        {/* Lista de menciones */}
        <div className="scrollbar-dashboard min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          {listaLoading ? (
            <p className="py-8 text-center text-sm text-zinc-500">Cargando menciones...</p>
          ) : error && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <p className="text-sm text-red-300">{error}</p>
              <Button type="button" variant="outline" size="sm" className="border-red-800/60" onClick={() => void fetchFirst()}>Reintentar</Button>
            </div>
          ) : listadoFiltrado.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <MapPin className="size-8 text-zinc-700" />
              <p className="text-sm text-zinc-500">No hay menciones que coincidan con los filtros.</p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 xl:grid-cols-3">
                {listadoFiltrado.map((m, i) => {
                  const tieneCoordenadas = typeof m.lat === "number" && typeof m.lon === "number";
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

              {/* Sentinel lazy loading */}
              <div ref={sentinelRef} className="py-4 text-center">
                {loadingMore ? (
                  <p className="text-xs text-zinc-500">Cargando más menciones...</p>
                ) : hasMore ? (
                  <p className="text-xs text-zinc-700">Scroll para cargar más</p>
                ) : (
                  <p className="text-xs text-zinc-700">
                    {formatIntegerEsMx(items.length)} menciones · fin de resultados
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
