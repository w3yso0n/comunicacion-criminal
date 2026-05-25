import { SQL_ALERTA_ALTO_RIESGO, SQL_MENCION_ALTO_RIESGO } from "@/lib/nivel-riesgo";

import { getPool } from "./mssql";

export interface DashboardKpis {
  totalMenciones: number;
  mencionesAltoRiesgo: number;
  scorePromedio: number;
  engagementTotal: number;
  totalAlertas: number;
  alertasAltoRiesgo: number;
  fuentesUnicas: number;
  municipiosAfectados: number;
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const pool = await getPool();

  const [menciones, alertas] = await Promise.all([
    pool.request().query<{
      total: number;
      alto_riesgo: number;
      score_promedio: number;
      engagement_total: number;
      fuentes: number;
      municipios: number;
    }>(`
      SELECT
        COUNT(*)                                                              AS total,
        SUM(CASE WHEN ${SQL_MENCION_ALTO_RIESGO} THEN 1 ELSE 0 END) AS alto_riesgo,
        AVG(CAST(ISNULL(score_severidad, 0) AS FLOAT))                        AS score_promedio,
        SUM(ISNULL(engagement_total, 0))                                      AS engagement_total,
        COUNT(DISTINCT handle)                                                AS fuentes,
        COUNT(DISTINCT municipio)                                             AS municipios
      FROM [Centinela].[Menciones]
    `),
    pool.request().query<{
      total: number;
      alto_riesgo: number;
    }>(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN ${SQL_ALERTA_ALTO_RIESGO} THEN 1 ELSE 0 END) AS alto_riesgo
      FROM [Centinela].[Alertas]
    `),
  ]);

  const m = menciones.recordset[0];
  const a = alertas.recordset[0];

  return {
    totalMenciones: m?.total ?? 0,
    mencionesAltoRiesgo: m?.alto_riesgo ?? 0,
    scorePromedio: Math.round(m?.score_promedio ?? 0),
    engagementTotal: m?.engagement_total ?? 0,
    totalAlertas: a?.total ?? 0,
    alertasAltoRiesgo: a?.alto_riesgo ?? 0,
    fuentesUnicas: m?.fuentes ?? 0,
    municipiosAfectados: m?.municipios ?? 0,
  };
}
