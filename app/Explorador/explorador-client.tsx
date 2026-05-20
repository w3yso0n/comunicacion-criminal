"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListFilter, X } from "lucide-react";

import { MencionCard } from "@/components/dashboard/mencion-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlertsStore } from "@/lib/stores/alerts-store";
import type { Mencion, NivelRiesgo, Plataforma } from "@/lib/types";
import { cn, formatIntegerEsMx } from "@/lib/utils";

const PAGE_SIZE = 50;

interface Stats {
  total: number;
  altoRiesgo: number;
  nivelDominante: string | null;
  zonaPrincipal: string | null;
  subTipoPrincipal: string | null;
}

const NIVELES_RIESGO: { value: NivelRiesgo; label: string; chip: string; active: string }[] = [
  { value: "alto",  label: "Alto",  chip: "border-red-900/60 text-red-400 hover:border-red-700",       active: "border-red-600 bg-red-950/60 text-red-200" },
  { value: "medio", label: "Medio", chip: "border-amber-900/60 text-amber-400 hover:border-amber-700", active: "border-amber-600 bg-amber-950/60 text-amber-200" },
  { value: "bajo",  label: "Bajo",  chip: "border-zinc-700 text-zinc-400 hover:border-zinc-500",       active: "border-zinc-500 bg-zinc-800 text-zinc-100" },
];

function StatMini({ label, value, loading, className }: { label: string; value: number; loading?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-zinc-800/80 bg-zinc-900/50 px-3 py-2", className)}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      {loading ? (
        <div className="mt-1.5 h-6 w-16 animate-pulse rounded bg-zinc-800" />
      ) : (
        <p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-zinc-100">
          {formatIntegerEsMx(value)}
        </p>
      )}
    </div>
  );
}

function StatMiniText({ label, value, loading, className }: { label: string; value: string | null; loading?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-zinc-800/80 bg-zinc-900/50 px-3 py-2", className)}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      {loading ? (
        <div className="mt-1.5 h-6 w-24 animate-pulse rounded bg-zinc-800" />
      ) : (
        <p className="mt-0.5 truncate text-base font-semibold tracking-tight text-zinc-100">
          {value ?? <span className="text-sm text-zinc-600">—</span>}
        </p>
      )}
    </div>
  );
}

type Filtros = {
  nivelRiesgo: NivelRiesgo | "";
  municipio: string;
  plataforma: string;
  zona: string;
  subTipo: string;
  grupoCriminal: string;
};

const FILTROS_VACIOS: Filtros = {
  nivelRiesgo: "",
  municipio: "",
  plataforma: "",
  zona: "",
  subTipo: "",
  grupoCriminal: "",
};

// Opciones estáticas de plataforma
const PLATAFORMAS: { value: Plataforma; label: string }[] = [
  { value: "twitter", label: "Twitter / X" },
  { value: "telegram", label: "Telegram" },
  { value: "tiktok", label: "TikTok" },
];

export function ExploradorClient() {
  const searchParams = useSearchParams();
  const clusterId = searchParams.get("clusterId")?.trim() || undefined;

  const alertas = useAlertsStore((s) => s.items);
  const alertaRelacionada = useMemo(
    () => clusterId ? alertas.find((a) => a.clusterId?.toLowerCase() === clusterId.toLowerCase()) : undefined,
    [alertas, clusterId],
  );

  const [stats, setStats] = useState<Stats | null>(null);
  const [items, setItems] = useState<Mencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);

  // Opciones dinámicas derivadas de los items cargados
  const municipiosDisponibles = useMemo(() => Array.from(new Set(items.map((m) => m.municipio).filter(Boolean) as string[])).sort(), [items]);
  const zonasDisponibles = useMemo(() => Array.from(new Set(items.map((m) => m.zona).filter(Boolean) as string[])).sort(), [items]);
  const subTiposDisponibles = useMemo(() => Array.from(new Set(items.map((m) => m.subTipo).filter(Boolean) as string[])).sort(), [items]);
  const gruposDisponibles = useMemo(() => Array.from(new Set(items.map((m) => m.grupoCriminal).filter(Boolean) as string[])).sort(), [items]);

  const hayFiltros = Object.values(filtros).some((v) => v !== "");

  function buildParams(currentOffset: number, f: Filtros) {
    const p = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(currentOffset) });
    if (clusterId) p.set("clusterId", clusterId);
    if (f.nivelRiesgo) p.set("nivelRiesgo", f.nivelRiesgo);
    if (f.municipio) p.set("municipio", f.municipio);
    if (f.plataforma) p.set("plataforma", f.plataforma);
    if (f.zona) p.set("zona", f.zona);
    if (f.subTipo) p.set("subTipo", f.subTipo);
    if (f.grupoCriminal) p.set("grupoCriminal", f.grupoCriminal);
    return p;
  }

  // Carga inicial / reset cuando cambian filtros
  const fetchFirst = useCallback(async (f: Filtros) => {
    setLoading(true);
    setError(null);
    setItems([]);
    setOffset(0);
    setHasMore(true);
    try {
      const res = await fetch(`/api/menciones?${buildParams(0, f).toString()}`);
      const json = (await res.json()) as { ok: boolean; data?: Mencion[]; hasMore?: boolean; error?: string };
      if (!res.ok || !json.ok || !json.data) throw new Error(json.error ?? "No se pudieron cargar las menciones.");
      setItems(json.data);
      setOffset(json.data.length);
      setHasMore(json.hasMore ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar menciones.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterId]);

  // Carga siguiente página
  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/menciones?${buildParams(offset, filtros).toString()}`);
      const json = (await res.json()) as { ok: boolean; data?: Mencion[]; hasMore?: boolean; error?: string };
      if (!res.ok || !json.ok || !json.data) throw new Error(json.error ?? "Error al cargar más.");
      setItems((prev) => [...prev, ...json.data!]);
      setOffset((prev) => prev + json.data!.length);
      setHasMore(json.hasMore ?? false);
    } catch {
      // silencioso — el usuario puede hacer scroll de nuevo
    } finally {
      setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMore, offset, filtros, clusterId]);

  // IntersectionObserver para lazy loading
  const sentinelRef = useRef<HTMLDivElement>(null);
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

  // Stats globales (una sola vez)
  useEffect(() => {
    fetch("/api/menciones/stats")
      .then((r) => r.json())
      .then((j: { ok: boolean; data?: Stats }) => { if (j.ok && j.data) setStats(j.data); })
      .catch(() => null);
  }, []);

  // Carga inicial
  useEffect(() => { void fetchFirst(filtros); }, [fetchFirst]);

  function aplicarFiltro<K extends keyof Filtros>(key: K, value: Filtros[K]) {
    const next = { ...filtros, [key]: value };
    setFiltros(next);
    void fetchFirst(next);
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_VACIOS);
    void fetchFirst(FILTROS_VACIOS);
  }

  const selectTriggerClass = "h-8 border-zinc-700/80 bg-zinc-900/80 text-xs";

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <header className="shrink-0 space-y-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Explorador</h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              {clusterId ? "Menciones vinculadas al cluster de una alerta" : "Hechos delictivos y cobertura mediática detectados en redes"}
            </p>
          </div>
          {!loading && !error ? (
            <p className="text-xs text-zinc-500 sm:text-right">
              <span className="font-medium text-zinc-300">{formatIntegerEsMx(items.length)}</span> menciones cargadas
              {hasMore ? <span className="text-zinc-600"> · hay más</span> : null}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatMini
            label="Total menciones"
            value={stats?.total ?? 0}
            loading={!stats}
          />
          <StatMini
            label="Alto riesgo"
            value={stats?.altoRiesgo ?? 0}
            loading={!stats}
            className={stats && stats.altoRiesgo > 0 ? "border-red-900/40 bg-red-950/15" : undefined}
          />
          <StatMiniText
            label="Nivel más frecuente"
            value={stats?.nivelDominante ?? null}
            loading={!stats}
          />
          <StatMiniText
            label="Zona principal"
            value={stats?.zonaPrincipal ?? null}
            loading={!stats}
          />
        </div>
      </header>

      {/* Cluster banner */}
      {clusterId ? (
        <div className="mb-4 shrink-0 rounded-xl border border-sky-900/40 bg-sky-950/20 px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400">Cluster de alerta</p>
              {alertaRelacionada ? (
                <p className="mt-1 text-sm font-medium text-zinc-100">{alertaRelacionada.titulo}</p>
              ) : (
                <p className="mt-1 text-sm text-zinc-400">Filtrando por cluster</p>
              )}
              <p className="mt-1 font-mono text-[10px] text-zinc-600">{clusterId}</p>
            </div>
            <Link href="/Explorador" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200">
              <X className="size-3.5" />
              Quitar filtro
            </Link>
          </div>
        </div>
      ) : null}

      {/* Error */}
      {error ? (
        <div className="mb-4 shrink-0 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3 border-red-800/60" onClick={() => void fetchFirst(filtros)}>
            Reintentar
          </Button>
        </div>
      ) : null}

      {/* Barra de filtros */}
      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-zinc-800/70 bg-zinc-900/30 px-3 py-2.5">
        <ListFilter className="size-3.5 shrink-0 text-zinc-500" />

        {/* Nivel de riesgo — chips */}
        <div className="flex items-center gap-1">
          {NIVELES_RIESGO.map((n) => (
            <button
              key={n.value}
              type="button"
              onClick={() => aplicarFiltro("nivelRiesgo", filtros.nivelRiesgo === n.value ? "" : n.value)}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all",
                filtros.nivelRiesgo === n.value ? n.active : n.chip,
              )}
            >
              {n.label}
              {filtros.nivelRiesgo === n.value ? <X className="size-2.5 opacity-70" /> : null}
            </button>
          ))}
        </div>

        <div className="h-4 w-px shrink-0 bg-zinc-700/60" />

        {/* Plataforma */}
        <Select value={filtros.plataforma || undefined} onValueChange={(v) => aplicarFiltro("plataforma", v)}>
          <SelectTrigger className={cn(selectTriggerClass, "w-36", filtros.plataforma && "border-sky-700/60 text-sky-300")}>
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            {filtros.plataforma ? <SelectItem value="">Todas las plataformas</SelectItem> : null}
            {PLATAFORMAS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Municipio */}
        {municipiosDisponibles.length > 0 ? (
          <Select value={filtros.municipio || undefined} onValueChange={(v) => aplicarFiltro("municipio", v)}>
            <SelectTrigger className={cn(selectTriggerClass, "w-44", filtros.municipio && "border-sky-700/60 text-sky-300")}>
              <SelectValue placeholder="Municipio" />
            </SelectTrigger>
            <SelectContent className="w-56">
              {filtros.municipio ? <SelectItem value="">Todos los municipios</SelectItem> : null}
              {municipiosDisponibles.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : null}

        {/* Zona */}
        {zonasDisponibles.length > 0 ? (
          <Select value={filtros.zona || undefined} onValueChange={(v) => aplicarFiltro("zona", v)}>
            <SelectTrigger className={cn(selectTriggerClass, "w-40", filtros.zona && "border-purple-700/60 text-purple-300")}>
              <SelectValue placeholder="Zona" />
            </SelectTrigger>
            <SelectContent className="w-52">
              {filtros.zona ? <SelectItem value="">Todas las zonas</SelectItem> : null}
              {zonasDisponibles.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : null}

        {/* Sub tipo */}
        {subTiposDisponibles.length > 0 ? (
          <Select value={filtros.subTipo || undefined} onValueChange={(v) => aplicarFiltro("subTipo", v)}>
            <SelectTrigger className={cn(selectTriggerClass, "w-36", filtros.subTipo && "border-amber-700/60 text-amber-300")}>
              <SelectValue placeholder="Sub tipo" />
            </SelectTrigger>
            <SelectContent className="w-48">
              {filtros.subTipo ? <SelectItem value="">Todos los tipos</SelectItem> : null}
              {subTiposDisponibles.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : null}

        {/* Grupo criminal */}
        {gruposDisponibles.length > 0 ? (
          <Select value={filtros.grupoCriminal || undefined} onValueChange={(v) => aplicarFiltro("grupoCriminal", v)}>
            <SelectTrigger className={cn(selectTriggerClass, "w-44", filtros.grupoCriminal && "border-orange-700/60 text-orange-300")}>
              <SelectValue placeholder="Grupo criminal" />
            </SelectTrigger>
            <SelectContent className="w-60">
              {filtros.grupoCriminal ? <SelectItem value="">Todos los grupos</SelectItem> : null}
              {gruposDisponibles.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : null}

        {/* Limpiar */}
        {hayFiltros ? (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          >
            <X className="size-3" />
            Limpiar
          </button>
        ) : null}
      </div>

      {/* Lista */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/20">
        <div className="scrollbar-dashboard min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 md:p-4">
          {loading ? (
            <p className="py-12 text-center text-sm text-zinc-500">Cargando menciones...</p>
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <>
              <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                {items.map((m, i) => (
                  <li key={m.id}>
                    <MencionCard mencion={m} index={i} />
                  </li>
                ))}
              </ul>

              {/* Sentinel para lazy loading */}
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
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              No hay menciones{hayFiltros ? " con los filtros seleccionados" : " para mostrar"}.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
