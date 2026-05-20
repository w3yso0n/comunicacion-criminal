"use client";

import { useMemo, useState } from "react";
import { ListFilter, X } from "lucide-react";

import { AlertCard } from "@/components/dashboard/alert-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  selectNuevasCount,
  useAlertsStore,
} from "@/lib/stores/alerts-store";
import type { Alerta, SeveridadAlerta } from "@/lib/types";
import { cn, formatIntegerEsMx } from "@/lib/utils";

const SEVERIDADES: {
  value: SeveridadAlerta;
  label: string;
  chip: string;
  active: string;
}[] = [
  {
    value: "critica",
    label: "Crítica",
    chip: "border-red-900/60 text-red-400 hover:border-red-700",
    active: "border-red-600 bg-red-950/60 text-red-200",
  },
  {
    value: "alta",
    label: "Alta",
    chip: "border-amber-900/60 text-amber-400 hover:border-amber-700",
    active: "border-amber-600 bg-amber-950/60 text-amber-200",
  },
  {
    value: "media",
    label: "Media",
    chip: "border-zinc-700 text-zinc-400 hover:border-zinc-500",
    active: "border-zinc-500 bg-zinc-800 text-zinc-100",
  },
];

function StatMini({
  label,
  value,
  active,
  onClick,
  className,
}: {
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-left transition-all",
        "border-zinc-800/80 bg-zinc-900/50",
        active ? "ring-2 ring-sky-600/50" : "hover:border-zinc-700",
        className,
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-zinc-100">
        {formatIntegerEsMx(value)}
      </p>
    </button>
  );
}

export default function AlertasPage() {
  const items = useAlertsStore((s) => s.items);
  const loading = useAlertsStore((s) => s.loading);
  const error = useAlertsStore((s) => s.error);
  const fetchAlertas = useAlertsStore((s) => s.fetchAlertas);

  const nuevas = useMemo(() => selectNuevasCount(items), [items]);

  const [filtroNivel, setFiltroNivel] = useState<SeveridadAlerta | "todas">("todas");
  const [filtroGrupo, setFiltroGrupo] = useState<string>("todos");
  const [filtroMunicipio, setFiltroMunicipio] = useState<string>("todos");

  const gruposDisponibles = useMemo(
    () =>
      Array.from(
        new Set(items.map((a) => a.grupoCriminal).filter(Boolean) as string[]),
      ).sort(),
    [items],
  );

  const municipiosDisponibles = useMemo(
    () =>
      Array.from(
        new Set(items.map((a) => a.municipio).filter(Boolean) as string[]),
      ).sort(),
    [items],
  );

  const hayFiltros =
    filtroNivel !== "todas" || filtroGrupo !== "todos" || filtroMunicipio !== "todos";

  function limpiar() {
    setFiltroNivel("todas");
    setFiltroGrupo("todos");
    setFiltroMunicipio("todos");
  }

  const listado = useMemo(() => {
    let r: Alerta[] = items;
    if (filtroNivel !== "todas") r = r.filter((a) => a.severidad === filtroNivel);
    if (filtroGrupo !== "todos") r = r.filter((a) => a.grupoCriminal === filtroGrupo);
    if (filtroMunicipio !== "todos") r = r.filter((a) => a.municipio === filtroMunicipio);
    return r;
  }, [items, filtroNivel, filtroGrupo, filtroMunicipio]);

  const resumen = useMemo(
    () => ({
      criticas: items.filter((a) => a.severidad === "critica").length,
      altas: items.filter((a) => a.severidad === "alta").length,
    }),
    [items],
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      {/* Cabecera */}
      <header className="shrink-0 space-y-4 pb-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Alertas</h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              {loading
                ? "Cargando..."
                : "Monitoreo de señales y clusters detectados en tiempo real"}
            </p>
          </div>
          {!loading && !error ? (
            <p className="text-xs text-zinc-500 sm:text-right">
              <span className="font-medium text-zinc-300">
                {formatIntegerEsMx(nuevas)}
              </span>{" "}
              nuevas ·{" "}
              <span className="font-medium text-zinc-300">
                {formatIntegerEsMx(items.length)}
              </span>{" "}
              totales
            </p>
          ) : null}
        </div>

        {/* KPI clicables */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatMini label="Total" value={items.length} />
          <StatMini
            label="Críticas"
            value={resumen.criticas}
            active={filtroNivel === "critica"}
            onClick={() => setFiltroNivel((p) => (p === "critica" ? "todas" : "critica"))}
            className={resumen.criticas > 0 ? "border-red-900/40 bg-red-950/15" : undefined}
          />
          <StatMini
            label="Altas"
            value={resumen.altas}
            active={filtroNivel === "alta"}
            onClick={() => setFiltroNivel((p) => (p === "alta" ? "todas" : "alta"))}
            className={resumen.altas > 0 ? "border-amber-900/40 bg-amber-950/15" : undefined}
          />
          <StatMini
            label="Nuevas"
            value={nuevas}
            className={nuevas > 0 ? "border-sky-900/50 bg-sky-950/20" : undefined}
          />
        </div>
      </header>

      {error ? (
        <div className="mb-3 shrink-0 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 border-red-800/60"
            onClick={() => void fetchAlertas()}
          >
            Reintentar
          </Button>
        </div>
      ) : null}

      {/* Barra de filtros */}
      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-zinc-800/70 bg-zinc-900/30 px-3 py-2.5">
        <ListFilter className="size-3.5 shrink-0 text-zinc-500" />

        {/* Nivel — chips */}
        <div className="flex items-center gap-1">
          {SEVERIDADES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setFiltroNivel((p) => (p === s.value ? "todas" : s.value))}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all",
                filtroNivel === s.value ? s.active : s.chip,
              )}
            >
              {s.label}
              {filtroNivel === s.value ? <X className="size-2.5 opacity-70" /> : null}
            </button>
          ))}
        </div>

        <div className="h-4 w-px shrink-0 bg-zinc-700/60" />

        {/* Grupo criminal — shadcn Select */}
        {gruposDisponibles.length > 0 ? (
          <Select
            value={filtroGrupo}
            onValueChange={(v) => { if (v) setFiltroGrupo(v); }}
          >
            <SelectTrigger
              className={cn(
                "h-8 w-52 border-zinc-700/80 bg-zinc-900/80 text-xs",
                filtroGrupo !== "todos" && "border-orange-700/60 text-orange-300",
              )}
            >
              <SelectValue placeholder="Grupo: todos" />
            </SelectTrigger>
            <SelectContent className="w-64">
              <SelectItem value="todos">Todos los grupos</SelectItem>
              {gruposDisponibles.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {/* Municipio — shadcn Select */}
        {municipiosDisponibles.length > 0 ? (
          <Select
            value={filtroMunicipio}
            onValueChange={(v) => { if (v) setFiltroMunicipio(v); }}
          >
            <SelectTrigger
              className={cn(
                "h-8 w-52 border-zinc-700/80 bg-zinc-900/80 text-xs",
                filtroMunicipio !== "todos" && "border-sky-700/60 text-sky-300",
              )}
            >
              <SelectValue placeholder="Municipio: todos" />
            </SelectTrigger>
            <SelectContent className="w-64">
              <SelectItem value="todos">Todos los municipios</SelectItem>
              {municipiosDisponibles.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {/* Contador + limpiar */}
        <div className="ml-auto flex items-center gap-3">
          {hayFiltros ? (
            <>
              <span className="text-xs text-zinc-500">
                <span className="font-medium text-zinc-300">
                  {formatIntegerEsMx(listado.length)}
                </span>{" "}
                de{" "}
                <span className="font-medium text-zinc-300">
                  {formatIntegerEsMx(items.length)}
                </span>
              </span>
              <button
                type="button"
                onClick={limpiar}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              >
                <X className="size-3" />
                Limpiar
              </button>
            </>
          ) : (
            <span className="text-xs text-zinc-600">
              {formatIntegerEsMx(items.length)} alertas
            </span>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/20">
        <div className="scrollbar-dashboard min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 md:p-4">
          {loading && items.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              Cargando alertas...
            </p>
          ) : null}
          {!loading && !error && listado.length > 0 ? (
            <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              {listado.map((a) => (
                <li key={a.id}>
                  <AlertCard alerta={a} />
                </li>
              ))}
            </ul>
          ) : null}
          {!loading && !error && listado.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              No hay alertas con los filtros seleccionados.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
