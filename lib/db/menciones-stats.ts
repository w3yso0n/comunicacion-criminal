import { SQL_MENCION_ALTO_RIESGO } from "@/lib/nivel-riesgo";

import { getPool } from "./mssql";

export interface MencionesStats {
  total: number;
  altoRiesgo: number;
  nivelDominante: string | null;
  zonaPrincipal: string | null;
  subTipoPrincipal: string | null;
}

export async function getMencionesStats(): Promise<MencionesStats> {
  const pool = await getPool();

  const result = await pool.request().query<{
    total: number;
    alto_riesgo: number;
    nivel_dominante: string | null;
    zona_principal: string | null;
    subtipo_principal: string | null;
  }>(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN ${SQL_MENCION_ALTO_RIESGO} THEN 1 ELSE 0 END) AS alto_riesgo,
      (
        SELECT TOP 1 nivel_riesgo
        FROM [Centinela].[Menciones]
        WHERE nivel_riesgo IS NOT NULL
        GROUP BY nivel_riesgo
        ORDER BY COUNT(*) DESC
      ) AS nivel_dominante,
      (
        SELECT TOP 1 zona
        FROM [Centinela].[Menciones]
        WHERE zona IS NOT NULL
        GROUP BY zona
        ORDER BY COUNT(*) DESC
      ) AS zona_principal,
      (
        SELECT TOP 1 sub_tipo
        FROM [Centinela].[Menciones]
        WHERE sub_tipo IS NOT NULL
        GROUP BY sub_tipo
        ORDER BY COUNT(*) DESC
      ) AS subtipo_principal
    FROM [Centinela].[Menciones]
  `);

  const row = result.recordset[0];
  return {
    total: row?.total ?? 0,
    altoRiesgo: row?.alto_riesgo ?? 0,
    nivelDominante: row?.nivel_dominante ?? null,
    zonaPrincipal: row?.zona_principal ?? null,
    subTipoPrincipal: row?.subtipo_principal ?? null,
  };
}
