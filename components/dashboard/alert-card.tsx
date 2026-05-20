"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import {
  GitMerge,
  MapPin,
  Tag,
  TrendingUp,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Alerta, TipoAlerta } from "@/lib/types";
import { isAlertaNueva } from "@/lib/stores/alerts-store";
import { cn, formatIntegerEsMx } from "@/lib/utils";

function IconoTipo({ tipo }: { tipo: TipoAlerta }) {
  switch (tipo) {
    case "correlacion":
    case "correlacion_accion_hecho":
      return <GitMerge className="size-4 shrink-0 text-zinc-400" />;
    case "coincidencia_territorial":
      return <MapPin className="size-4 shrink-0 text-zinc-400" />;
    case "pico_actividad":
      return <TrendingUp className="size-4 shrink-0 text-zinc-400" />;
    case "autor":
      return <User className="size-4 shrink-0 text-zinc-400" />;
    case "narrativa":
      return <Tag className="size-4 shrink-0 text-zinc-400" />;
    default: {
      const _e: never = tipo;
      return _e;
    }
  }
}

function bordeSeveridad(s: Alerta["severidad"]): string {
  switch (s) {
    case "critica":
      return "border-l-red-500";
    case "alta":
      return "border-l-amber-500";
    case "media":
      return "border-l-zinc-500";
    case "baja":
      return "border-l-zinc-700";
    default: {
      const _e: never = s;
      return _e;
    }
  }
}

function labelSeveridad(s: Alerta["severidad"]): string {
  switch (s) {
    case "critica":
      return "Crítica";
    case "alta":
      return "Alta";
    case "media":
      return "Media";
    case "baja":
      return "Baja";
    default: {
      const _e: never = s;
      return _e;
    }
  }
}

export function AlertCard({ alerta }: { alerta: Alerta }) {
  const esNueva = isAlertaNueva(alerta);

  return (
    <article
      className={cn(
        "h-full rounded-xl border border-y border-r border-zinc-800 border-l-[4px] bg-zinc-900/60 p-3.5 md:p-4",
        bordeSeveridad(alerta.severidad),
        esNueva && "bg-zinc-900/90",
      )}
    >
      <div className="flex gap-3">
        <IconoTipo tipo={alerta.tipo} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-100">
              {alerta.titulo}
            </h3>
            {esNueva ? (
              <span className="mt-1 size-2 shrink-0 rounded-full bg-sky-500" />
            ) : null}
          </div>
          <p className="mt-1 text-xs text-zinc-400">{alerta.descripcion}</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className="border-zinc-700 text-[10px] text-zinc-400"
            >
              {labelSeveridad(alerta.severidad)}
            </Badge>
            {alerta.municipio ? (
              <Badge
                variant="outline"
                className="border-zinc-700 text-[10px] text-zinc-400"
              >
                {alerta.municipio}
              </Badge>
            ) : null}
            {alerta.grupoCriminal ? (
              <Badge
                variant="outline"
                className="border-zinc-700 text-[10px] text-zinc-400"
              >
                {alerta.grupoCriminal}
              </Badge>
            ) : null}
            {alerta.nMenciones != null ? (
              <Badge
                variant="outline"
                className="border-zinc-700 text-[10px] text-zinc-400"
              >
                {formatIntegerEsMx(alerta.nMenciones)} menciones
              </Badge>
            ) : null}
            {alerta.scoreConfianzaPct != null ? (
              <Badge
                variant="outline"
                className="border-zinc-700 text-[10px] text-zinc-400"
              >
                {alerta.scoreConfianzaPct}% confianza
              </Badge>
            ) : null}
          </div>

          <p className="mt-2 text-[11px] text-zinc-600">
            {formatDistanceToNow(new Date(alerta.creadaEn), {
              addSuffix: true,
              locale: es,
            })}
          </p>

          {alerta.clusterId ? (
            <Link
              href={`/Explorador?clusterId=${encodeURIComponent(alerta.clusterId)}`}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "mt-3 h-8 bg-zinc-800 text-xs",
              )}
            >
              Ver menciones del cluster
              {alerta.nMenciones != null
                ? ` (${formatIntegerEsMx(alerta.nMenciones)})`
                : ""}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
