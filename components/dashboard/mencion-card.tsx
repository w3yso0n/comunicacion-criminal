"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "motion/react";
import {
  ExternalLink,
  Heart,
  MessageCircle,
  Send,
  Share2,
  Twitter,
} from "lucide-react";
import { useState } from "react";

import { RiskBadge } from "@/components/dashboard/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { labelPlataforma } from "@/lib/labels";
import type { Mencion, Plataforma } from "@/lib/types";
import {
  cn,
  formatCompactEsMx,
  formatIntegerEsMx,
  initialsFromHandle,
} from "@/lib/utils";

function PlataformaIcon({ p }: { p: Plataforma }) {
  if (p === "twitter") return <Twitter className="size-3.5 text-sky-400" />;
  if (p === "telegram") return <Send className="size-3.5 text-sky-300" />;
  return (
    <span className="text-[10px] font-bold text-fuchsia-400" aria-hidden>
      TT
    </span>
  );
}

function labelTipoDelito(tipo?: string): string | undefined {
  if (!tipo) return undefined;
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

export function MencionCard({
  mencion,
  index,
}: {
  mencion: Mencion;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayName = mencion.autorNombre ?? mencion.handle;
  const bodyBase = mencion.descripcionCorta || mencion.contenido;
  const long = bodyBase.length > 280;
  const bodyText = expanded || !long ? mencion.contenido || bodyBase : bodyBase;

  const scoreColor =
    (mencion.scoreSeveridad ?? 0) >= 70
      ? "text-red-400"
      : (mencion.scoreSeveridad ?? 0) >= 40
        ? "text-amber-300"
        : "text-emerald-400";

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.35,
            ease: "easeOut" as const,
            delay: index * 0.04,
          },
        },
      }}
      initial="hidden"
      animate="show"
      className={cn(
        "h-full rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 shadow-sm md:p-4",
        mencion.nivelRiesgo === "critico" && "border-red-900/50",
        mencion.nivelRiesgo === "alto" && "border-amber-900/40",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-200">
            {initialsFromHandle(mencion.handle)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-medium text-zinc-100">
                {mencion.handle}
              </span>
              {mencion.autorVerificado ? (
                <Badge
                  variant="outline"
                  className="border-sky-800/60 text-[9px] text-sky-300"
                >
                  verificado
                </Badge>
              ) : null}
              <PlataformaIcon p={mencion.plataforma} />
              <span className="text-[10px] text-zinc-500">
                {labelPlataforma(mencion.plataforma)}
              </span>
            </div>
            {displayName !== mencion.handle ? (
              <p className="truncate text-[11px] text-zinc-500">{displayName}</p>
            ) : null}
            <p className="text-[11px] text-zinc-500">
              {formatDistanceToNow(new Date(mencion.publicadoEn), {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {mencion.nivelRiesgo ? (
            <RiskBadge riesgo={mencion.nivelRiesgo} />
          ) : null}
          {mencion.scoreSeveridad != null ? (
            <span className={cn("font-mono text-2xl font-semibold", scoreColor)}>
              {formatIntegerEsMx(mencion.scoreSeveridad)}
            </span>
          ) : null}
        </div>
      </header>

      <p className="mt-3 text-[13px] leading-relaxed text-zinc-300">{bodyText}</p>
      {long ? (
        <Button
          type="button"
          variant="link"
          className="h-auto px-0 py-1 text-xs text-zinc-400"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Ver menos" : "Ver más"}
        </Button>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {mencion.municipio ? (
          <Badge
            variant="outline"
            className="border-zinc-700 text-[10px] text-zinc-400"
          >
            {mencion.municipio}
          </Badge>
        ) : null}
        {mencion.tipoDelito ? (
          <Badge
            variant="outline"
            className="border-zinc-700 text-[10px] text-zinc-400"
          >
            {labelTipoDelito(mencion.tipoDelito)}
          </Badge>
        ) : null}
        {mencion.subTipo ? (
          <Badge
            variant="outline"
            className="border-zinc-700 text-[10px] text-zinc-400"
          >
            {mencion.subTipo}
          </Badge>
        ) : null}
        {mencion.grupoCriminal ? (
          <Badge
            variant="outline"
            className="border-zinc-700 text-[10px] text-zinc-400"
          >
            {mencion.grupoCriminal}
          </Badge>
        ) : null}
        {mencion.zona ? (
          <Badge
            variant="outline"
            className="border-zinc-700 text-[10px] text-zinc-400"
          >
            {mencion.zona}
          </Badge>
        ) : null}
      </div>

      {mencion.analisisIa ? (
        <div
          className={cn(
            "mt-4 border-l-2 border-zinc-600 bg-zinc-950/60 px-3 py-2",
            mencion.nivelRiesgo === "critico" && "border-red-500",
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Análisis IA
          </p>
          <p className="mt-1 text-xs italic text-zinc-400">{mencion.analisisIa}</p>
        </div>
      ) : null}

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 pt-3 text-xs text-zinc-500">
        <div className="flex flex-wrap items-center gap-4 font-mono text-zinc-300">
          <span className="flex items-center gap-1">
            <Heart className="size-3.5 text-zinc-500" />
            {formatCompactEsMx(mencion.engagement.reacciones)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3.5 text-zinc-500" />
            {formatCompactEsMx(mencion.engagement.comentarios)}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="size-3.5 text-zinc-500" />
            {formatCompactEsMx(mencion.engagement.compartidos)}
          </span>
        </div>
        {mencion.reach != null ? (
          <span className="font-mono">
            Reach {formatCompactEsMx(mencion.reach)}
          </span>
        ) : null}
      </footer>

      {mencion.url ? (
        <div className="mt-2">
          <a
            href={mencion.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
          >
            Ver publicación original
            <ExternalLink className="size-3" />
          </a>
        </div>
      ) : null}
    </motion.article>
  );
}
