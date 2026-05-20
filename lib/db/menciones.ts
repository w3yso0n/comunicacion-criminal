import { mapMencionRow, type MencionRow } from "@/lib/mappers/mencion";
import type { Mencion } from "@/lib/types";

import { getPool, sql } from "./mssql";

export type ListarMencionesOptions = {
  limit?: number;
  clusterId?: string;
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
    captura_url
  FROM [Centinela].[Menciones]
`;

export async function listarMenciones(
  options: ListarMencionesOptions = {},
): Promise<Mencion[]> {
  const pool = await getPool();
  const request = pool.request();
  const limit = options.limit ?? 100;

  let query = SELECT_MENCIONES;
  const conditions: string[] = [];

  if (options.clusterId) {
    conditions.push("cluster_id = @clusterId");
    request.input("clusterId", sql.UniqueIdentifier, options.clusterId);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY published_at DESC";
  query += " OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY";
  request.input("limit", sql.Int, limit);

  const result = await request.query<MencionRow>(query);
  return result.recordset.map(mapMencionRow);
}
