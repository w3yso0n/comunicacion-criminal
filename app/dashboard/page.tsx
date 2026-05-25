"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  GitMerge,
  MapPin,
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
import { MapaPreview } from "@/components/dashboard/mapa-preview";
import { isAlertaNueva, useAlertsStore } from "@/lib/stores/alerts-store";
import { esAlertaAltoRiesgo } from "@/lib/nivel-riesgo";
import type { DashboardKpis } from "@/lib/db/dashboard-kpis";
import { formatCompactEsMx } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

function KpiSkeleton() {
  return <div className="h-[88px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />;
}

export default function DashboardResumenPage() {
  const alertaAltoRiesgoBanner = useAlertsStore((s) =>
    s.items.find((a) => esAlertaAltoRiesgo(a.severidad) && isAlertaNueva(a)),
  );

  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/kpis")
      .then((r) => r.json())
      .then((j: { ok: boolean; data?: DashboardKpis }) => {
        if (j.ok && j.data) setKpis(j.data);
      })
      .catch(() => null)
      .finally(() => setKpisLoading(false));
  }, []);

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
          Vista general de menciones delictivas y alertas detectadas. KPIs calculados en tiempo real desde la base de datos.
        </p>
      </motion.header>

      {alertaAltoRiesgoBanner ? (
        <AlertBanner alertas={[alertaAltoRiesgoBanner]} />
      ) : null}

      <motion.section
        variants={item}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {kpisLoading ? (
          Array.from({ length: 8 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              label="Total menciones"
              value={kpis?.totalMenciones ?? 0}
              subtext="Registros en base de datos"
              icon={Activity}
            />
            <KpiCard
              label="Alto riesgo"
              value={kpis?.mencionesAltoRiesgo ?? 0}
              subtext="Menciones clasificadas como alto riesgo"
              icon={ShieldAlert}
              variant="danger"
            />
            <KpiCard
              label="Score severidad prom."
              value={kpis?.scorePromedio ?? 0}
              valueSuffix="/100"
              subtext="Promedio de todas las menciones"
              icon={TrendingUp}
              variant={
                (kpis?.scorePromedio ?? 0) >= 70
                  ? "danger"
                  : (kpis?.scorePromedio ?? 0) >= 50
                    ? "warning"
                    : undefined
              }
            />
            <KpiCard
              label="Engagement total"
              value={kpis?.engagementTotal ?? 0}
              subtext="Suma de interacciones"
              icon={Activity}
              formatValue={formatCompactEsMx}
            />
            <KpiCard
              label="Total alertas"
              value={kpis?.totalAlertas ?? 0}
              subtext="Alertas generadas"
              icon={GitMerge}
            />
            <KpiCard
              label="Alertas alto riesgo"
              value={kpis?.alertasAltoRiesgo ?? 0}
              subtext="Requieren atención inmediata"
              icon={ShieldAlert}
              variant={kpis && kpis.alertasAltoRiesgo > 0 ? "danger" : undefined}
            />
            <KpiCard
              label="Fuentes únicas"
              value={kpis?.fuentesUnicas ?? 0}
              subtext="Cuentas monitoreadas"
              icon={Rss}
            />
            <KpiCard
              label="Municipios afectados"
              value={kpis?.municipiosAfectados ?? 0}
              subtext="Con al menos una mención"
              icon={MapPin}
            />
          </>
        )}
      </motion.section>

      <motion.section
        variants={item}
        className="grid grid-cols-1 gap-4 xl:grid-cols-12"
      >
        <div className="min-w-0 xl:col-span-8">
          <ChartErrorBoundary title="Menciones por día">
            <CorrelacionTemporalChart />
          </ChartErrorBoundary>
        </div>
        <div className="min-w-0 xl:col-span-4">
          <ChartErrorBoundary title="Distribución por categoría">
            <CategoriaDonut />
          </ChartErrorBoundary>
        </div>
      </motion.section>

      <motion.section variants={item}>
        <ChartErrorBoundary title="Mapa de calor">
          <MapaPreview />
        </ChartErrorBoundary>
      </motion.section>

      <motion.section variants={item}>
        <ChartErrorBoundary title="Engagement por categoría">
          <EngagementBars />
        </ChartErrorBoundary>
      </motion.section>
    </motion.div>
  );
}
