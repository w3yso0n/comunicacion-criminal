"use client";

import { motion } from "motion/react";
import {
  Activity,
  GitMerge,
  Radio,
  Rss,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { AlertBanner } from "@/components/dashboard/alert-banner";
import { CategoriaDonut } from "@/components/dashboard/categoria-donut";
import { ChartErrorBoundary } from "@/components/dashboard/chart-error-boundary";
import { CorrelacionTemporalChart } from "@/components/dashboard/correlacion-temporal-chart";
import { EngagementBars } from "@/components/dashboard/engagement-bars";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RadarNarrativas } from "@/components/dashboard/radar-narrativas";
import { isAlertaNueva, useAlertsStore } from "@/lib/stores/alerts-store";
import { kpiDia as kpi } from "@/lib/mock-data";
import { formatCompactEsMx } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export default function DashboardResumenPage() {
  const alertaCriticaBanner = useAlertsStore((s) =>
    s.items.find((a) => a.severidad === "critica" && isAlertaNueva(a)),
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-[1600px] space-y-8"
    >
      <motion.header variants={item} className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
          Resumen ejecutivo
        </h1>
        <p className="max-w-3xl text-xs text-zinc-500">
          Vista general de narrativas de apología y propaganda en redes. Los datos son
          demostrativos y no constituyen evidencia pericial.
        </p>
      </motion.header>

      {alertaCriticaBanner ? (
        <AlertBanner alertas={[alertaCriticaBanner]} />
      ) : null}

      <motion.section
        variants={item}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        <KpiCard
          label="Detecciones hoy"
          value={kpi.publicacionesDetectadas}
          subtext="vs periodo anterior"
          trend="up"
          trendValue={kpi.publicacionesTrendPct}
          trendSentiment="risk"
          icon={Activity}
        />
        <KpiCard
          label="Riesgo extremo"
          value={kpi.riesgoExtremo}
          subtext="Requiere revisión prioritaria"
          icon={ShieldAlert}
          variant="danger"
        />
        <KpiCard
          label="Índice apología"
          value={kpi.indiceApologiaPromedio}
          valueSuffix="/100"
          subtext="Tendencia crítica"
          icon={Radio}
          variant="warning"
        />
        <KpiCard
          label="Engagement"
          value={kpi.engagementTotal}
          subtext="Impacto estimado agregado"
          icon={TrendingUp}
          formatValue={formatCompactEsMx}
        />
        <KpiCard
          label="Cruce con hechos públicos (demo)"
          value={kpi.hechosCorrelacionados}
          subtext={`Ejemplos · ${kpi.hechosCorrelacionConfianzaPct}% confianza simulada`}
          icon={GitMerge}
          variant="warning"
        />
        <KpiCard
          label="Fuentes clave"
          value={kpi.autoresClave}
          subtext="Cuentas monitoreadas"
          icon={Rss}
        />
      </motion.section>

      <motion.section
        variants={item}
        className="grid grid-cols-1 gap-4 xl:grid-cols-12"
      >
        <div className="min-w-0 xl:col-span-8 space-y-2">
          <ChartErrorBoundary title="Publicaciones por hora">
            <CorrelacionTemporalChart />
          </ChartErrorBoundary>
          <p className="text-[11px] leading-relaxed text-zinc-500">
            <strong className="font-medium text-zinc-400">Lectura rápida:</strong>{" "}
            barras = volumen de publicaciones (parte roja = alto riesgo); línea punteada
            = índice de apología; puntos rojos = horas con un hecho público de ejemplo en
            el mock. No implica que un hecho haya sido causado por un post.
          </p>
        </div>
        <div className="min-w-0 xl:col-span-4">
          <ChartErrorBoundary title="Distribución por categoría">
            <CategoriaDonut />
          </ChartErrorBoundary>
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <ChartErrorBoundary title="Narrativas">
          <RadarNarrativas />
        </ChartErrorBoundary>
        <ChartErrorBoundary title="Engagement por categoría">
          <EngagementBars />
        </ChartErrorBoundary>
      </motion.section>
    </motion.div>
  );
}
