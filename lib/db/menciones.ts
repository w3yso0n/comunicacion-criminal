import { mapMencionRow, type MencionRow } from "@/lib/mappers/mencion";
import { SQL_MENCION_ALTO_RIESGO } from "@/lib/nivel-riesgo";
import type { Mencion } from "@/lib/types";

import { getPool, sql } from "./mssql";

export type ListarMencionesOptions = {
  limit?: number;
  offset?: number;
  clusterId?: string;
  municipio?: string;
  plataforma?: string;
  zona?: string;
  subTipo?: string;
  nivelRiesgo?: string;
  grupoCriminal?: string;
};

const SELECT_MENCIONES = `
  SELECT
    mencion_id,
    url,
    published_at,
    plataforma,
    handle,
    autor_nombre,
    autor_verificado,
    autor_seguidores,
    contenido,
    descripcion_corta,
    municipio,
    ubicacion_especifica,
    zona,
    likes,
    shares,
    comments,
    engagement_total,
    reach,
    tipo_principal,
    sub_tipo,
    tipo_delito,
    score_severidad,
    nivel_riesgo,
    grupo_criminal,
    senal_escalada,
    analisis_ia,
    cluster_id,
    cluster_role,
    captura_url,
    lat,
    lon
  FROM [Centinela].[Menciones]
`;

export async function listarMenciones(
  options: ListarMencionesOptions = {},
): Promise<Mencion[]> {
  const pool = await getPool();
  const request = pool.request();
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  let query = SELECT_MENCIONES;
  const conditions: string[] = [];

  if (options.clusterId) {
    conditions.push("cluster_id = @clusterId");
    request.input("clusterId", sql.UniqueIdentifier, options.clusterId);
  }
  if (options.municipio) {
    conditions.push("municipio = @municipio");
    request.input("municipio", sql.NVarChar(200), options.municipio);
  }
  if (options.plataforma) {
    conditions.push("LOWER(plataforma) = LOWER(@plataforma)");
    request.input("plataforma", sql.NVarChar(50), options.plataforma);
  }
  if (options.zona) {
    conditions.push("zona = @zona");
    request.input("zona", sql.NVarChar(200), options.zona);
  }
  if (options.subTipo) {
    conditions.push("sub_tipo = @subTipo");
    request.input("subTipo", sql.NVarChar(100), options.subTipo);
  }
  if (options.nivelRiesgo) {
    if (options.nivelRiesgo.toLowerCase() === "alto") {
      conditions.push(SQL_MENCION_ALTO_RIESGO);
    } else {
      conditions.push("LOWER(nivel_riesgo) = LOWER(@nivelRiesgo)");
      request.input("nivelRiesgo", sql.NVarChar(50), options.nivelRiesgo);
    }
  }
  if (options.grupoCriminal) {
    conditions.push("grupo_criminal = @grupoCriminal");
    request.input("grupoCriminal", sql.NVarChar(200), options.grupoCriminal);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY published_at DESC";
  query += " OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";
  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  const result = await request.query<MencionRow>(query);
  return result.recordset.map(mapMencionRow);
}
