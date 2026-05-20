import { mapAlertaRow, type AlertaRow } from "@/lib/mappers/alerta";
import type { Alerta } from "@/lib/types";

import { getPool, sql } from "./mssql";

export type ListarAlertasOptions = {
  limit?: number;
  nivel?: string;
};

export async function listarAlertas(
  options: ListarAlertasOptions = {},
): Promise<Alerta[]> {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT
      alerta_id,
      tipo,
      nivel,
      titulo,
      descripcion,
      grupo_criminal,
      municipio,
      plataforma,
      cluster_id,
      n_menciones,
      score_confianza,
      estado,
      created_at
    FROM [Centinela].[Alertas]
  `;

  const conditions: string[] = [];

  if (options.nivel) {
    conditions.push("nivel = @nivel");
    request.input("nivel", sql.NVarChar, options.nivel);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY created_at DESC";

  if (options.limit != null && options.limit > 0) {
    query += " OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY";
    request.input("limit", sql.Int, options.limit);
  }

  const result = await request.query<AlertaRow>(query);
  return result.recordset.map(mapAlertaRow);
}
