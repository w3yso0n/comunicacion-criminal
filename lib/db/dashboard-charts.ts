import {
  SQL_MENCION_ALTO_RIESGO,
  SQL_MENCION_MEDIO_RIESGO,
} from "@/lib/nivel-riesgo";
import { buildNarrativasRadar } from "@/lib/narrativas-radar";
import type {
  CategoriaDistribucion,
  EngagementPorCategoria,
  NarrativaRadarDato,
  PuntoCorrelacionTemporal,
} from "@/lib/types";

import { getPool } from "./mssql";

const DIAS_VENTANA = 90;
const DIAS_NARRATIVAS = 30;

export interface DashboardChartsData {
  correlacionPorDia: PuntoCorrelacionTemporal[];
  diasPicoDetectados: number[];
  categoriaDistribucion: CategoriaDistribucion[];
  engagementPorCategoria: EngagementPorCategoria[];
  narrativasRadar: NarrativaRadarDato[];
}

function labelFromKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function startOfDayUtc(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function toIsoDateKey(value: Date | string): string {
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return String(value).slice(0, 10);
}

function formatDiaEs(d: Date): string {
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

function emptyDaySeries(days: number): PuntoCorrelacionTemporal[] {
  const today = startOfDayUtc(new Date());
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    const fechaIso = toIsoDateKey(d);
    return {
      fecha: formatDiaEs(d),
      fechaIso,
      publicaciones: 0,
      publicacionesMedioRiesgo: 0,
      publicacionesAltoRiesgo: 0,
      hechos: 0,
      scoreSeveridadPromedio: null,
    };
  });
}

export async function getDashboardCharts(): Promise<DashboardChartsData> {
  const pool = await getPool();

  const [porDia, porTipo, engagementPorTipo, porSubTipo, engagementTotalRow] =
    await Promise.all([
      pool.request().query<{
        dia: Date | string;
        publicaciones: number;
        publicaciones_medio_riesgo: number;
        publicaciones_alto_riesgo: number;
        score_promedio: number;
      }>(`
        SELECT
          CAST(published_at AS DATE) AS dia,
          COUNT(*) AS publicaciones,
          SUM(CASE WHEN ${SQL_MENCION_MEDIO_RIESGO} THEN 1 ELSE 0 END) AS publicaciones_medio_riesgo,
          SUM(CASE WHEN ${SQL_MENCION_ALTO_RIESGO} THEN 1 ELSE 0 END) AS publicaciones_alto_riesgo,
          AVG(CAST(ISNULL(score_severidad, 0) AS FLOAT)) AS score_promedio
        FROM [Centinela].[Menciones]
        WHERE published_at IS NOT NULL
          AND published_at >= DATEADD(DAY, -${DIAS_VENTANA}, CAST(SYSUTCDATETIME() AS DATE))
        GROUP BY CAST(published_at AS DATE)
        ORDER BY dia
      `),
      pool.request().query<{
        categoria: string;
        total: number;
      }>(`
        SELECT
          ISNULL(NULLIF(LTRIM(RTRIM(tipo_principal)), ''), 'sin_clasificar') AS categoria,
          COUNT(*) AS total
        FROM [Centinela].[Menciones]
        GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(tipo_principal)), ''), 'sin_clasificar')
        ORDER BY total DESC
      `),
      pool.request().query<{
        categoria: string;
        engagement: number;
      }>(`
        SELECT
          ISNULL(NULLIF(LTRIM(RTRIM(tipo_principal)), ''), 'sin_clasificar') AS categoria,
          SUM(ISNULL(engagement_total, 0)) AS engagement
        FROM [Centinela].[Menciones]
        GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(tipo_principal)), ''), 'sin_clasificar')
      `),
      pool.request().query<{
        id: string;
        total: number;
        score_promedio: number;
        prev_total: number;
        ejemplo: string | null;
      }>(`
        WITH actual AS (
          SELECT
            LTRIM(RTRIM(sub_tipo)) AS id,
            COUNT(*) AS total,
            AVG(CAST(ISNULL(score_severidad, 0) AS FLOAT)) AS score_promedio
          FROM [Centinela].[Menciones]
          WHERE published_at >= DATEADD(DAY, -${DIAS_NARRATIVAS}, SYSUTCDATETIME())
            AND sub_tipo IS NOT NULL
            AND LTRIM(RTRIM(sub_tipo)) <> ''
          GROUP BY LTRIM(RTRIM(sub_tipo))
        ),
        anterior AS (
          SELECT
            LTRIM(RTRIM(sub_tipo)) AS id,
            COUNT(*) AS total
          FROM [Centinela].[Menciones]
          WHERE published_at >= DATEADD(DAY, -${DIAS_NARRATIVAS * 2}, SYSUTCDATETIME())
            AND published_at < DATEADD(DAY, -${DIAS_NARRATIVAS}, SYSUTCDATETIME())
            AND sub_tipo IS NOT NULL
            AND LTRIM(RTRIM(sub_tipo)) <> ''
          GROUP BY LTRIM(RTRIM(sub_tipo))
        )
        SELECT
          a.id,
          a.total,
          a.score_promedio,
          ISNULL(p.total, 0) AS prev_total,
          (
            SELECT TOP 1 COALESCE(
              NULLIF(LTRIM(RTRIM(m.descripcion_corta)), ''),
              NULLIF(LEFT(LTRIM(RTRIM(m.contenido)), 220), ''),
              NULLIF(LTRIM(RTRIM(m.analisis_ia)), '')
            )
            FROM [Centinela].[Menciones] m
            WHERE LTRIM(RTRIM(m.sub_tipo)) = a.id
              AND m.published_at >= DATEADD(DAY, -${DIAS_NARRATIVAS}, SYSUTCDATETIME())
            ORDER BY ISNULL(m.score_severidad, 0) DESC, m.published_at DESC
          ) AS ejemplo
        FROM actual a
        LEFT JOIN anterior p ON p.id = a.id
        ORDER BY a.total DESC
      `),
      pool.request().query<{ engagement_total: number }>(`
        SELECT SUM(ISNULL(engagement_total, 0)) AS engagement_total
        FROM [Centinela].[Menciones]
      `),
    ]);

  const diaMap = new Map(
    porDia.recordset.map((r) => [
      toIsoDateKey(r.dia),
      {
        publicaciones: r.publicaciones,
        publicacionesMedioRiesgo: r.publicaciones_medio_riesgo,
        publicacionesAltoRiesgo: r.publicaciones_alto_riesgo,
        scoreSeveridadPromedio: Math.round(r.score_promedio ?? 0),
      },
    ]),
  );

  const correlacionPorDia = emptyDaySeries(DIAS_VENTANA).map((punto) => {
    const row = diaMap.get(punto.fechaIso);
    if (!row) return punto;
    return {
      ...punto,
      publicaciones: row.publicaciones,
      publicacionesMedioRiesgo: row.publicacionesMedioRiesgo,
      publicacionesAltoRiesgo: row.publicacionesAltoRiesgo,
      scoreSeveridadPromedio: row.scoreSeveridadPromedio,
    };
  });

  const diasPicoDetectados = [...correlacionPorDia]
    .map((p, i) => ({ i, v: p.publicaciones }))
    .sort((a, b) => b.v - a.v)
    .filter((x) => x.v > 0)
    .slice(0, 3)
    .map((x) => x.i);

  const tipoRows = porTipo.recordset;
  const tipoTotal = tipoRows.reduce((s, r) => s + r.total, 0);
  const engagementMap = new Map(
    engagementPorTipo.recordset.map((r) => [r.categoria, r.engagement]),
  );

  const categoriaDistribucion: CategoriaDistribucion[] = tipoRows.map((r) => ({
    categoria: r.categoria as CategoriaDistribucion["categoria"],
    label: labelFromKey(r.categoria),
    pct: tipoTotal > 0 ? Math.round((r.total / tipoTotal) * 100) : 0,
    ejemplo: `${r.total} mención${r.total === 1 ? "" : "es"}`,
  }));

  const engagementTotal = engagementTotalRow.recordset[0]?.engagement_total ?? 0;

  const engagementPorCategoria: EngagementPorCategoria[] = tipoRows.map((r) => {
    const engagement = engagementMap.get(r.categoria) ?? 0;
    return {
      categoria: r.categoria as EngagementPorCategoria["categoria"],
      label: labelFromKey(r.categoria),
      engagement,
      pctDelTotal:
        engagementTotal > 0
          ? Math.round((engagement / engagementTotal) * 1000) / 10
          : 0,
    };
  });

  const narrativasRadar = buildNarrativasRadar(porSubTipo.recordset);

  return {
    correlacionPorDia,
    diasPicoDetectados,
    categoriaDistribucion,
    engagementPorCategoria,
    narrativasRadar,
  };
}
