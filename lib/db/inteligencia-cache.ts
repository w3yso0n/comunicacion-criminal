import type { InteligenciaIAPayload } from "@/lib/inteligencia-schema";

import { getPool, sql } from "./mssql";

export type CachedInteligencia = {
  payload: InteligenciaIAPayload;
  modelo: string;
  dataHash: string;
  generadoEn: string;
  mencionesCount: number;
  alertasCount: number;
};

export async function getCachedInteligencia(
  region: string,
  periodo: string,
  dataHash: string,
): Promise<CachedInteligencia | null> {
  const pool = await getPool();
  try {
    const result = await pool
      .request()
      .input("region", sql.NVarChar(50), region)
      .input("periodo", sql.NVarChar(10), periodo)
      .input("dataHash", sql.Char(64), dataHash)
      .query<{
        payload_json: string;
        modelo: string;
        data_hash: string;
        generado_en: Date | string;
        menciones_count: number;
        alertas_count: number;
      }>(`
        SELECT TOP 1
          payload_json,
          modelo,
          data_hash,
          generado_en,
          menciones_count,
          alertas_count
        FROM [Centinela].[InteligenciaAnalisis]
        WHERE region = @region
          AND periodo = @periodo
          AND data_hash = @dataHash
        ORDER BY generado_en DESC
      `);

    const row = result.recordset[0];
    if (!row) return null;

    const payload = JSON.parse(row.payload_json) as InteligenciaIAPayload;
    const generadoEn =
      row.generado_en instanceof Date
        ? row.generado_en.toISOString()
        : new Date(row.generado_en).toISOString();

    return {
      payload: { ...payload, generadoEn, modelo: row.modelo },
      modelo: row.modelo,
      dataHash: row.data_hash,
      generadoEn,
      mencionesCount: row.menciones_count,
      alertasCount: row.alertas_count,
    };
  } catch {
    return null;
  }
}

export async function saveInteligenciaCache(params: {
  region: string;
  periodo: string;
  dataHash: string;
  modelo: string;
  payload: InteligenciaIAPayload;
  mencionesCount: number;
  alertasCount: number;
}): Promise<void> {
  const pool = await getPool();
  const payloadJson = JSON.stringify(params.payload);

  await pool
    .request()
    .input("region", sql.NVarChar(50), params.region)
    .input("periodo", sql.NVarChar(10), params.periodo)
    .input("dataHash", sql.Char(64), params.dataHash)
    .input("modelo", sql.NVarChar(100), params.modelo)
    .input("payloadJson", sql.NVarChar(sql.MAX), payloadJson)
    .input("mencionesCount", sql.Int, params.mencionesCount)
    .input("alertasCount", sql.Int, params.alertasCount)
    .query(`
      MERGE [Centinela].[InteligenciaAnalisis] AS target
      USING (
        SELECT
          @region AS region,
          @periodo AS periodo
      ) AS source
      ON target.region = source.region AND target.periodo = source.periodo
      WHEN MATCHED THEN
        UPDATE SET
          data_hash = @dataHash,
          modelo = @modelo,
          payload_json = @payloadJson,
          menciones_count = @mencionesCount,
          alertas_count = @alertasCount,
          generado_en = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (
          region,
          periodo,
          data_hash,
          modelo,
          payload_json,
          menciones_count,
          alertas_count
        )
        VALUES (
          @region,
          @periodo,
          @dataHash,
          @modelo,
          @payloadJson,
          @mencionesCount,
          @alertasCount
        );
    `);
}
