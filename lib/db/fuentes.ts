import { SQL_MENCION_ALTO_RIESGO } from "@/lib/nivel-riesgo";
import type { PerspectivaAutor } from "@/lib/perspectiva-autor";

import { COL_PERSPECTIVA_AUTOR, T_MENCIONES } from "./schema";
import { getPool, sql } from "./mssql";

export interface FuenteRow {
  handle: string;
  autor_nombre: string | null;
  autor_image_url: string | null;
  autor_verificado: string | null;
  autor_seguidores: number | null;
  plataforma: string | null;
  es_nueva_cuenta: string | null;
  perspectiva_dominante: string | null;
  menciones: number;
  engagement_total: number;
  score_severidad_promedio: number | null;
  nivel_riesgo_dominante: string | null;
  tipo_delito_frecuente: string | null;
  ultima_mencion: Date | string;
}

export interface Fuente {
  handle: string;
  autorNombre: string | null;
  autorImageUrl: string | null;
  autorVerificado: boolean;
  autorSeguidores: number;
  plataforma: string;
  esNuevaCuenta: boolean;
  perspectivaDominante: string | null;
  menciones: number;
  engagementTotal: number;
  scoreSeveridadPromedio: number;
  nivelRiesgoDominante: string | null;
  tipoDelitoFrecuente: string | null;
  ultimaMencion: string;
}

export type ListarFuentesOptions = {
  perspectiva?: PerspectivaAutor;
};

function bindPerspectivaFiltro(
  request: sql.Request,
  perspectiva?: PerspectivaAutor,
): string {
  if (!perspectiva) return "";
  request.input("perspectiva", sql.NVarChar(50), perspectiva);
  return ` AND LOWER(LTRIM(RTRIM(m.${COL_PERSPECTIVA_AUTOR}))) = @perspectiva`;
}

export async function listarFuentes(
  options: ListarFuentesOptions = {},
): Promise<Fuente[]> {
  const pool = await getPool();
  const request = pool.request();
  const filtroPerspectiva = bindPerspectivaFiltro(request, options.perspectiva);

  const result = await request.query<FuenteRow>(`
    SELECT
      handle,
      MAX(autor_nombre)                                   AS autor_nombre,
      MAX(autor_image_url)                                AS autor_image_url,
      MAX(CAST(autor_verificado AS TINYINT))               AS autor_verificado,
      MAX(autor_seguidores)                               AS autor_seguidores,
      MAX(plataforma)                                     AS plataforma,
      MAX(CAST(es_nueva_cuenta AS TINYINT))               AS es_nueva_cuenta,
      (
        SELECT TOP 1 m4.${COL_PERSPECTIVA_AUTOR}
        FROM ${T_MENCIONES} m4
        WHERE m4.handle = m.handle
          AND m4.${COL_PERSPECTIVA_AUTOR} IS NOT NULL
          AND LTRIM(RTRIM(m4.${COL_PERSPECTIVA_AUTOR})) <> ''
        GROUP BY m4.${COL_PERSPECTIVA_AUTOR}
        ORDER BY COUNT(*) DESC
      )                                                   AS perspectiva_dominante,
      COUNT(*)                                            AS menciones,
      SUM(ISNULL(engagement_total, 0))                    AS engagement_total,
      AVG(CAST(ISNULL(score_severidad, 0) AS FLOAT))      AS score_severidad_promedio,
      (
        SELECT TOP 1 m2.nivel_riesgo
        FROM ${T_MENCIONES} m2
        WHERE m2.handle = m.handle AND m2.nivel_riesgo IS NOT NULL
        GROUP BY m2.nivel_riesgo
        ORDER BY COUNT(*) DESC
      )                                                   AS nivel_riesgo_dominante,
      (
        SELECT TOP 1 m3.tipo_delito
        FROM ${T_MENCIONES} m3
        WHERE m3.handle = m.handle AND m3.tipo_delito IS NOT NULL
        GROUP BY m3.tipo_delito
        ORDER BY COUNT(*) DESC
      )                                                   AS tipo_delito_frecuente,
      MAX(published_at)                                   AS ultima_mencion
    FROM ${T_MENCIONES} m
    WHERE handle IS NOT NULL
    ${filtroPerspectiva}
    GROUP BY handle
    ORDER BY menciones DESC, engagement_total DESC
  `);

  return result.recordset.map((row) => ({
    handle: row.handle.startsWith("@") ? row.handle : `@${row.handle}`,
    autorNombre: row.autor_nombre ?? null,
    autorImageUrl: row.autor_image_url ?? null,
    autorVerificado: Number(row.autor_verificado) === 1,
    autorSeguidores: row.autor_seguidores ?? 0,
    plataforma: row.plataforma ?? "X",
    esNuevaCuenta: Number(row.es_nueva_cuenta) === 1,
    perspectivaDominante: row.perspectiva_dominante?.trim() || null,
    menciones: row.menciones,
    engagementTotal: row.engagement_total,
    scoreSeveridadPromedio: Math.round(row.score_severidad_promedio ?? 0),
    nivelRiesgoDominante: row.nivel_riesgo_dominante ?? null,
    tipoDelitoFrecuente: row.tipo_delito_frecuente ?? null,
    ultimaMencion: row.ultima_mencion instanceof Date
      ? row.ultima_mencion.toISOString()
      : String(row.ultima_mencion),
  }));
}

export async function getFuentesStats(
  options: ListarFuentesOptions = {},
): Promise<{
  total: number;
  verificadas: number;
  nuevas: number;
  altoRiesgo: number;
}> {
  const pool = await getPool();
  const request = pool.request();
  const filtroPerspectiva = bindPerspectivaFiltro(request, options.perspectiva);

  const result = await request.query<{
    total: number;
    verificadas: number;
    nuevas: number;
    alto_riesgo: number;
  }>(`
    SELECT
      COUNT(DISTINCT handle)                                           AS total,
      COUNT(DISTINCT CASE WHEN CAST(autor_verificado AS TINYINT) = 1 THEN handle END) AS verificadas,
      COUNT(DISTINCT CASE WHEN CAST(es_nueva_cuenta AS TINYINT) = 1 THEN handle END)  AS nuevas,
      COUNT(DISTINCT CASE WHEN ${SQL_MENCION_ALTO_RIESGO} THEN handle END) AS alto_riesgo
    FROM ${T_MENCIONES} m
    WHERE handle IS NOT NULL
    ${filtroPerspectiva}
  `);

  const row = result.recordset[0];
  return {
    total: row?.total ?? 0,
    verificadas: row?.verificadas ?? 0,
    nuevas: row?.nuevas ?? 0,
    altoRiesgo: row?.alto_riesgo ?? 0,
  };
}
