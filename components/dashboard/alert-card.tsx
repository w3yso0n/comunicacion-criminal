"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  GitMerge,
  Tag,
  TrendingUp,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Alerta, TipoAlerta } from "@/lib/types";
import { useAlertsStore } from "@/lib/stores/alerts-store";
import { cn } from "@/lib/utils";

function IconoTipo({ tipo }: { tipo: TipoAlerta }) {
  switch (tipo) {
    case "correlacion":
      return <GitMerge className="size-4 shrink-0 text-zinc-400" />;
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

export function AlertCard({ alerta }: { alerta: Alerta }) {
  const discard = useAlertsStore((s) => s.discard);
  const markRead = useAlertsStore((s) => s.markRead);

  if (alerta.descartada) return null;

  return (
    <article
      className={cn(
        "rounded-xl border border-y border-r border-zinc-800 border-l-[4px] bg-zinc-900/60 p-4",
        bordeSeveridad(alerta.severidad),
        !alerta.leida && "bg-zinc-900/90",
      )}
    >
      <div className="flex gap-3">
        <IconoTipo tipo={alerta.tipo} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-100">
              {alerta.titulo}
            </h3>
            {!alerta.leida ? (
              <span className="mt-1 size-2 shrink-0 rounded-full bg-sky-500" />
            ) : null}
          </div>
          <p className="mt-1 text-xs text-zinc-400">{alerta.descripcion}</p>
          <p className="mt-2 text-[11px] text-zinc-600">
            {formatDistanceToNow(new Date(alerta.creadaEn), {
              addSuffix: true,
              locale: es,
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 bg-zinc-800 text-xs"
              onClick={() => markRead(alerta.id)}
            >
              Ver detalle
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-zinc-500"
              onClick={() => discard(alerta.id)}
            >
              Descartar
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
