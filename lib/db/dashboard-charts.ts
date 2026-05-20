import type {
  CategoriaDistribucion,
  EngagementPorCategoria,
  NarrativaRadarDato,
  PuntoCorrelacionHora,
} from "@/lib/types";

import { getPool } from "./mssql";

export interface DashboardChartsData {
  correlacionPorHora: PuntoCorrelacionHora[];
  horasPicoDetectadas: number[];
  categoriaDistribucion: CategoriaDistribucion[];
  engagementPorCategoria: EngagementPorCategoria[];
  narrativasRadar: NarrativaRadarDato[];
}

function horaLabel(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

function labelFromKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function emptyHourSeries(): PuntoCorrelacionHora[] {
  return Array.from({ length: 24 }, (_, h) => ({
    hora: horaLabel(h),
    publicaciones: 0,
    publicacionesCriticas: 0,
    hechos: 0,
    indiceApologiaPromedio: 0,
  }));
}

export async function getDashboardCharts(): Promise<DashboardChartsData> {
  const pool = await getPool();

  const [porHora, porTipo, engagementPorTipo, porSubTipo, engagementTotalRow] =
    await Promise.all([
      pool.request().query<{
        hora: number;
        publicaciones: number;
        publicaciones_criticas: number;
        indice_promedio: number;
      }>(`
        SELECT
          DATEPART(HOUR, published_at) AS hora,
          COUNT(*) AS publicaciones,
          SUM(CASE WHEN LOWER(nivel_riesgo) IN ('alto', 'critico') THEN 1 ELSE 0 END) AS publicaciones_criticas,
          AVG(CAST(ISNULL(score_severidad, 0) AS FLOAT)) AS indice_promedio
        FROM [Centinela].[Menciones]
        WHERE published_at IS NOT NULL
        GROUP BY DATEPART(HOUR, published_at)
        ORDER BY hora
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
        variacion_pct: number | null;
      }>(`
        WITH actual AS (
          SELECT
            ISNULL(NULLIF(LTRIM(RTRIM(sub_tipo)), ''), 'sin_clasificar') AS id,
            COUNT(*) AS total,
            AVG(CAST(ISNULL(score_severidad, 0) AS FLOAT)) AS score_promedio
          FROM [Centinela].[Menciones]
          WHERE published_at >= DATEADD(DAY, -7, SYSUTCDATETIME())
          GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(sub_tipo)), ''), 'sin_clasificar')
        ),
        anterior AS (
          SELECT
            ISNULL(NULLIF(LTRIM(RTRIM(sub_tipo)), ''), 'sin_clasificar') AS id,
            COUNT(*) AS total
          FROM [Centinela].[Menciones]
          WHERE published_at >= DATEADD(DAY, -14, SYSUTCDATETIME())
            AND published_at < DATEADD(DAY, -7, SYSUTCDATETIME())
          GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(sub_tipo)), ''), 'sin_clasificar')
        )
        SELECT
          a.id,
          a.total,
          a.score_promedio,
          CASE
            WHEN ISNULL(p.total, 0) = 0 THEN NULL
            ELSE ROUND((CAST(a.total - ISNULL(p.total, 0) AS FLOAT) / p.total) * 100, 0)
          END AS variacion_pct
        FROM actual a
        LEFT JOIN anterior p ON p.id = a.id
        ORDER BY a.total DESC
      `),
      pool.request().query<{ engagement_total: number }>(`
        SELECT SUM(ISNULL(engagement_total, 0)) AS engagement_total
        FROM [Centinela].[Menciones]
      `),
    ]);

  const horaMap = new Map(
    porHora.recordset.map((r) => [
      r.hora,
      {
        publicaciones: r.publicaciones,
        publicacionesCriticas: r.publicaciones_criticas,
        indiceApologiaPromedio: Math.round(r.indice_promedio ?? 0),
      },
    ]),
  );

  const correlacionPorHora = emptyHourSeries().map((punto, h) => {
    const row = horaMap.get(h);
    if (!row) return punto;
    return {
      ...punto,
      publicaciones: row.publicaciones,
      publicacionesCriticas: row.publicacionesCriticas,
      indiceApologiaPromedio: row.indiceApologiaPromedio,
    };
  });

  const horasPicoDetectadas = [...correlacionPorHora]
    .map((p, h) => ({ h, v: p.publicaciones }))
    .sort((a, b) => b.v - a.v)
    .filter((x) => x.v > 0)
    .slice(0, 3)
    .map((x) => x.h);

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

  const subTipoRows = porSubTipo.recordset;
  const maxSubTipo = subTipoRows.reduce((m, r) => Math.max(m, r.total), 0);

  const narrativasRadar: NarrativaRadarDato[] = subTipoRows.slice(0, 8).map((r) => ({
    id: r.id as NarrativaRadarDato["id"],
    label: labelFromKey(r.id),
    valor:
      maxSubTipo > 0
        ? Math.round((r.total / maxSubTipo) * 100)
        : Math.round(r.score_promedio ?? 0),
    variacionSemanalPct: r.variacion_pct ?? 0,
    descripcion: `Promedio de severidad: ${Math.round(r.score_promedio ?? 0)}/100`,
  }));

  return {
    correlacionPorHora,
    horasPicoDetectadas,
    categoriaDistribucion,
    engagementPorCategoria,
    narrativasRadar,
  };
}
