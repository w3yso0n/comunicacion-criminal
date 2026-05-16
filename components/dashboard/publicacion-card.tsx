"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "motion/react";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Twitter,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoriaBadge } from "@/components/dashboard/categoria-badge";
import { EntidadTags } from "@/components/dashboard/entidad-tags";
import { NarrativaBadge } from "@/components/dashboard/narrativa-badge";
import { RiskBadge } from "@/components/dashboard/risk-badge";
import { getAutorById, hechos } from "@/lib/mock-data";
import { labelPlataforma } from "@/lib/labels";
import type { Plataforma, Publicacion } from "@/lib/types";
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

export function PublicacionCard({
  pub,
  index,
}: {
  pub: Publicacion;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const autor = getAutorById(pub.autorId);
  const handle = autor?.handle ?? `@${pub.autorId}`;
  const hecho = pub.correlacionHechoId
    ? hechos.find((h) => h.id === pub.correlacionHechoId)
    : undefined;

  const long = pub.textoCompleto.length > 220;
  const bodyText = expanded || !long ? pub.textoCompleto : pub.textoResumido;

  const scoreColor =
    pub.nivelApologia >= 60
      ? "text-red-400"
      : pub.nivelApologia >= 30
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
            delay: index * 0.06,
          },
        },
      }}
      initial="hidden"
      animate="show"
      whileHover={{ scale: 1.005 }}
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm",
        pub.riesgo === "critico" && "border-red-900/50",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-200">
            {initialsFromHandle(handle)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-medium text-zinc-100">
                {handle}
              </span>
              <PlataformaIcon p={pub.plataforma} />
              <span className="text-[10px] text-zinc-500">
                {labelPlataforma(pub.plataforma)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              {formatDistanceToNow(new Date(pub.publicadoEn), {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <RiskBadge riesgo={pub.riesgo} />
          <span className={cn("font-mono text-2xl font-semibold", scoreColor)}>
            {formatIntegerEsMx(pub.nivelApologia)}
          </span>
        </div>
      </header>

      <p className="mt-3 text-[13px] leading-relaxed text-zinc-300">
        {bodyText}
      </p>
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

      <div className="mt-3 flex flex-wrap gap-2">
        <NarrativaBadge id={pub.narrativaPrincipal} />
        <CategoriaBadge categoria={pub.categoria} />
      </div>
      <div className="mt-2">
        <EntidadTags
          grupos={pub.entidades.grupos}
          lugares={pub.entidades.lugares}
          alias={pub.entidades.alias}
          instituciones={pub.entidades.instituciones}
        />
      </div>

      <div
        className={cn(
          "mt-4 border-l-2 border-zinc-600 bg-zinc-950/60 px-3 py-2",
          pub.riesgo === "critico" && "border-red-500",
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Análisis IA
        </p>
        <p className="mt-1 text-xs italic text-zinc-400">{pub.justificacionIA}</p>
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 pt-3 text-xs text-zinc-500">
        <div className="flex flex-wrap items-center gap-4 font-mono text-zinc-300">
          <span className="flex items-center gap-1">
            <Heart className="size-3.5 text-zinc-500" />
            {formatCompactEsMx(pub.engagement.reacciones)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3.5 text-zinc-500" />
            {formatCompactEsMx(pub.engagement.comentarios)}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="size-3.5 text-zinc-500" />
            {formatCompactEsMx(pub.engagement.compartidos)}
          </span>
        </div>
        <span className="font-mono">
          Reach est. {formatCompactEsMx(pub.reachEstimado)}
        </span>
      </footer>
      {hecho ? (
        <div className="mt-2">
          <Badge
            variant="outline"
            className="border-red-900/50 bg-red-950/30 text-[10px] text-red-200"
          >
            Correlacionado con hecho del{" "}
            {new Date(hecho.fecha).toLocaleDateString("es-MX")}
          </Badge>
        </div>
      ) : null}
    </motion.article>
  );
}
