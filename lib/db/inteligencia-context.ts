import { createHash } from "crypto";

import { getPool, sql } from "./mssql";

export type InteligenciaFiltros = {
  region: string;
  periodo: string;
};

export type FuenteDatosInteligencia = "top_global";

/** Clave fija de caché: el análisis no depende del preset 24h/7d del tablero. */
export const INTELIGENCIA_PERIODO_CACHE = "top_global";

export type InteligenciaContextSnapshot = {
  filtros: InteligenciaFiltros;
  fuenteDatos: FuenteDatosInteligencia;
  generadoEn: string;
  dataHash: string;
  mencionesCount: number;
  alertasCount: number;
  mencionesEnPeriodo: number;
  alertasEnPeriodo: number;
  agregados: {
    porGrupo: { grupo: string; total: number; scorePromedio: number }[];
    porZona: { zona: string; total: number }[];
    porMunicipio: { municipio: string; total: number }[];
    porSubTipo: { subTipo: string; total: number }[];
    porDia: { dia: string; total: number }[];
    porHora: { hora: number; total: number }[];
    alertasPorEstado: { estado: string; total: number }[];
    alertasPorNivel: { nivel: string; total: number }[];
    serieGrupoPorDia: { grupo: string; dia: string; total: number }[];
    serieZonaPorDia: { zona: string; dia: string; total: number }[];
  };
  menciones: {
    id: number;
    publicadoEn: string;
    plataforma: string | null;
    handle: string | null;
    grupoCriminal: string | null;
    municipio: string | null;
    zona: string | null;
    subTipo: string | null;
    tipoPrincipal: string | null;
    scoreSeveridad: number | null;
    nivelRiesgo: string | null;
    engagementTotal: number | null;
    resumen: string | null;
    senalEscalada: string | null;
    analisisIa: string | null;
  }[];
  alertas: {
    id: number;
    tipo: string;
    nivel: string;
    titulo: string;
    descripcion: string;
    grupoCriminal: string | null;
    municipio: string | null;
    estado: string | null;
    plataforma: string | null;
    nMenciones: number | null;
    scoreConfianza: number | null;
    creadaEn: string;
  }[];
  autoresDestacados: {
    handle: string;
    plataforma: string;
    menciones: number;
    maxScore: number;
    avgScore: number;
    primeraMencion: string;
    ultimaMencion: string;
    esNuevaCuenta: boolean;
    verificado: boolean;
  }[];
};

const TOP_MENCIONES = 50;
const TOP_ALERTAS = 40;

function bindRegion(request: sql.Request, region: string) {
  if (region !== "todas") {
    request.input("region", sql.NVarChar(100), region);
    request.input("regionLike", sql.NVarChar(120), `%${region}%`);
  }
}

function mencionesRegionSql(region: string): string {
  if (region === "todas") return "";
  return ` AND (m.municipio LIKE @regionLike OR m.zona LIKE @regionLike OR m.grupo_criminal LIKE @regionLike)`;
}

function alertasRegionSql(region: string): string {
  if (region === "todas") return "";
  return ` AND (a.estado = @region OR a.municipio LIKE @regionLike OR a.grupo_criminal LIKE @regionLike)`;
}

function truncar(s: string | null, max = 280): string | null {
  if (!s) return null;
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function toIso(v: Date | string) {
  if (v instanceof Date) return v.toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

type QueryBundle = {
  counts: { menciones: number; alertas: number };
  porGrupo: { grupo: string; total: number; score_promedio: number }[];
  porZona: { zona: string; total: number }[];
  porMunicipio: { municipio: string; total: number }[];
  porSubTipo: { sub_tipo: string; total: number }[];
  porDia: { dia: string; total: number }[];
  porHora: { hora: number; total: number }[];
  alertasEstado: { estado: string; total: number }[];
  alertasNivel: { nivel: string; total: number }[];
  serieGrupoPorDia: { grupo: string; dia: string; total: number }[];
  serieZonaPorDia: { zona: string; dia: string; total: number }[];
  mencionesRows: MencionRowDb[];
  alertasRows: AlertaRowDb[];
  autoresRows: AutorDestacadoRowDb[];
};

type AutorDestacadoRowDb = {
  handle: string;
  plataforma: string | null;
  menciones: number;
  max_score: number;
  avg_score: number;
  primera: Date | string;
  ultima: Date | string;
  es_nueva: number | boolean | null;
  verificado: number | boolean | null;
};

type MencionRowDb = {
  mencion_id: number;
  published_at: Date | string | null;
  plataforma: string | null;
  handle: string | null;
  grupo_criminal: string | null;
  municipio: string | null;
  zona: string | null;
  sub_tipo: string | null;
  tipo_principal: string | null;
  score_severidad: number | null;
  nivel_riesgo: string | null;
  engagement_total: number | null;
  descripcion_corta: string | null;
  contenido: string | null;
  senal_escalada: string | null;
  analisis_ia: string | null;
};

type AlertaRowDb = {
  alerta_id: number;
  tipo: string;
  nivel: string;
  titulo: string;
  descripcion: string;
  grupo_criminal: string | null;
  municipio: string | null;
  estado: string | null;
  plataforma: string | null;
  n_menciones: number | null;
  score_confianza: number | null;
  created_at: Date | string;
};

async function runContextQueries(
  pool: sql.ConnectionPool,
  region: string,
  baseMenciones: string,
  baseAlertas: string,
): Promise<QueryBundle> {
  async function query<T>(sqlText: string): Promise<T[]> {
    const req = pool.request();
    bindRegion(req, region);
    const result = await req.query<T>(sqlText);
    return result.recordset;
  }

  const [
    counts,
    porGrupo,
    porZona,
    porMunicipio,
    porSubTipo,
    porDia,
    porHora,
    alertasEstado,
    alertasNivel,
    serieGrupoPorDia,
    serieZonaPorDia,
    mencionesRows,
    alertasRows,
    autoresRows,
  ] = await Promise.all([
    query<{ menciones: number; alertas: number }>(`
      SELECT
        (SELECT COUNT(*) ${baseMenciones}) AS menciones,
        (SELECT COUNT(*) ${baseAlertas}) AS alertas
    `),
    query<{ grupo: string; total: number; score_promedio: number }>(`
      SELECT
        ISNULL(NULLIF(LTRIM(RTRIM(m.grupo_criminal)), ''), 'sin_grupo') AS grupo,
        COUNT(*) AS total,
        AVG(CAST(ISNULL(m.score_severidad, 0) AS FLOAT)) AS score_promedio
      ${baseMenciones}
      GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(m.grupo_criminal)), ''), 'sin_grupo')
      ORDER BY total DESC
    `),
    query<{ zona: string; total: number }>(`
      SELECT TOP 10
        ISNULL(NULLIF(LTRIM(RTRIM(m.zona)), ''), 'sin_zona') AS zona,
        COUNT(*) AS total
      ${baseMenciones}
      GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(m.zona)), ''), 'sin_zona')
      ORDER BY total DESC
    `),
    query<{ municipio: string; total: number }>(`
      SELECT TOP 15
        ISNULL(NULLIF(LTRIM(RTRIM(m.municipio)), ''), 'sin_municipio') AS municipio,
        COUNT(*) AS total
      ${baseMenciones}
      GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(m.municipio)), ''), 'sin_municipio')
      ORDER BY total DESC
    `),
    query<{ sub_tipo: string; total: number }>(`
      SELECT TOP 10
        ISNULL(NULLIF(LTRIM(RTRIM(m.sub_tipo)), ''), 'sin_subtipo') AS sub_tipo,
        COUNT(*) AS total
      ${baseMenciones}
      GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(m.sub_tipo)), ''), 'sin_subtipo')
      ORDER BY total DESC
    `),
    query<{ dia: string; total: number }>(`
      SELECT TOP 14
        CONVERT(VARCHAR(10), m.published_at, 23) AS dia,
        COUNT(*) AS total
      ${baseMenciones}
      AND m.published_at IS NOT NULL
      GROUP BY CONVERT(VARCHAR(10), m.published_at, 23)
      ORDER BY dia DESC
    `),
    query<{ hora: number; total: number }>(`
      SELECT
        DATEPART(HOUR, m.published_at) AS hora,
        COUNT(*) AS total
      ${baseMenciones}
      AND m.published_at IS NOT NULL
      GROUP BY DATEPART(HOUR, m.published_at)
      ORDER BY hora
    `),
    query<{ estado: string; total: number }>(`
      SELECT
        ISNULL(NULLIF(LTRIM(RTRIM(a.estado)), ''), 'sin_estado') AS estado,
        COUNT(*) AS total
      ${baseAlertas}
      GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(a.estado)), ''), 'sin_estado')
      ORDER BY total DESC
    `),
    query<{ nivel: string; total: number }>(`
      SELECT
        ISNULL(NULLIF(LTRIM(RTRIM(a.nivel)), ''), 'sin_nivel') AS nivel,
        COUNT(*) AS total
      ${baseAlertas}
      GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(a.nivel)), ''), 'sin_nivel')
      ORDER BY total DESC
    `),
    query<{ grupo: string; dia: string; total: number }>(`
      SELECT
        ISNULL(NULLIF(LTRIM(RTRIM(m.grupo_criminal)), ''), 'sin_grupo') AS grupo,
        CONVERT(VARCHAR(10), m.published_at, 23) AS dia,
        COUNT(*) AS total
      ${baseMenciones}
      AND m.published_at IS NOT NULL
      GROUP BY
        ISNULL(NULLIF(LTRIM(RTRIM(m.grupo_criminal)), ''), 'sin_grupo'),
        CONVERT(VARCHAR(10), m.published_at, 23)
    `),
    query<{ zona: string; dia: string; total: number }>(`
      SELECT
        ISNULL(NULLIF(LTRIM(RTRIM(m.zona)), ''), 'sin_zona') AS zona,
        CONVERT(VARCHAR(10), m.published_at, 23) AS dia,
        COUNT(*) AS total
      ${baseMenciones}
      AND m.published_at IS NOT NULL
      GROUP BY
        ISNULL(NULLIF(LTRIM(RTRIM(m.zona)), ''), 'sin_zona'),
        CONVERT(VARCHAR(10), m.published_at, 23)
    `),
    query<MencionRowDb>(`
      SELECT TOP ${TOP_MENCIONES}
        m.mencion_id,
        m.published_at,
        m.plataforma,
        m.handle,
        m.grupo_criminal,
        m.municipio,
        m.zona,
        m.sub_tipo,
        m.tipo_principal,
        m.score_severidad,
        m.nivel_riesgo,
        m.engagement_total,
        m.descripcion_corta,
        m.contenido,
        m.senal_escalada,
        m.analisis_ia
      ${baseMenciones}
      ORDER BY
        ISNULL(m.score_severidad, 0) DESC,
        ISNULL(m.engagement_total, 0) DESC,
        m.published_at DESC
    `),
    query<AlertaRowDb>(`
      SELECT TOP ${TOP_ALERTAS}
        a.alerta_id,
        a.tipo,
        a.nivel,
        a.titulo,
        a.descripcion,
        a.grupo_criminal,
        a.municipio,
        a.estado,
        a.plataforma,
        a.n_menciones,
        a.score_confianza,
        a.created_at
      ${baseAlertas}
      ORDER BY
        ISNULL(a.score_confianza, 0) DESC,
        ISNULL(a.n_menciones, 0) DESC,
        a.created_at DESC
    `),
    query<AutorDestacadoRowDb>(`
      SELECT TOP 20
        m.handle,
        MAX(m.plataforma) AS plataforma,
        COUNT(*) AS menciones,
        MAX(ISNULL(m.score_severidad, 0)) AS max_score,
        AVG(CAST(ISNULL(m.score_severidad, 0) AS FLOAT)) AS avg_score,
        MIN(m.published_at) AS primera,
        MAX(m.published_at) AS ultima,
        MAX(CAST(m.es_nueva_cuenta AS TINYINT)) AS es_nueva,
        MAX(CAST(m.autor_verificado AS TINYINT)) AS verificado
      ${baseMenciones}
      AND m.handle IS NOT NULL
      GROUP BY m.handle
      HAVING COUNT(*) >= 2
      ORDER BY menciones DESC, max_score DESC
    `),
  ]);

  return {
    counts: counts[0] ?? { menciones: 0, alertas: 0 },
    porGrupo,
    porZona,
    porMunicipio,
    porSubTipo,
    porDia,
    porHora,
    alertasEstado,
    alertasNivel,
    serieGrupoPorDia,
    serieZonaPorDia,
    mencionesRows,
    alertasRows,
    autoresRows,
  };
}

function mapRows(bundle: QueryBundle) {
  const menciones = bundle.mencionesRows.map((m) => ({
    id: m.mencion_id,
    publicadoEn: m.published_at ? toIso(m.published_at) : new Date().toISOString(),
    plataforma: m.plataforma,
    handle: m.handle,
    grupoCriminal: m.grupo_criminal,
    municipio: m.municipio,
    zona: m.zona,
    subTipo: m.sub_tipo,
    tipoPrincipal: m.tipo_principal,
    scoreSeveridad: m.score_severidad,
    nivelRiesgo: m.nivel_riesgo,
    engagementTotal: m.engagement_total,
    resumen: truncar(m.descripcion_corta) ?? truncar(m.contenido, 200),
    senalEscalada: truncar(m.senal_escalada, 120),
    analisisIa: truncar(m.analisis_ia, 200),
  }));

  const alertas = bundle.alertasRows.map((a) => ({
    id: a.alerta_id,
    tipo: a.tipo,
    nivel: a.nivel,
    titulo: a.titulo,
    descripcion: truncar(a.descripcion, 400) ?? a.descripcion,
    grupoCriminal: a.grupo_criminal,
    municipio: a.municipio,
    estado: a.estado,
    plataforma: a.plataforma,
    nMenciones: a.n_menciones,
    scoreConfianza: a.score_confianza,
    creadaEn: toIso(a.created_at),
  }));

  return { menciones, alertas };
}

function buildSnapshot(
  filtros: InteligenciaFiltros,
  fuenteDatos: FuenteDatosInteligencia,
  bundle: QueryBundle,
  mencionesEnPeriodo: number,
  alertasEnPeriodo: number,
): InteligenciaContextSnapshot {
  const { menciones, alertas } = mapRows(bundle);
  const mencionesCount = bundle.counts.menciones;
  const alertasCount = bundle.counts.alertas;

  const dataHash = createHash("sha256")
    .update(
      JSON.stringify({
        region: filtros.region,
        fuenteDatos,
        mencionesCount,
        alertasCount,
        porGrupo: bundle.porGrupo,
        porDia: bundle.porDia,
        alertasNivel: bundle.alertasNivel,
        topIds: menciones.slice(0, 5).map((m) => m.id),
        ultimaAlerta: alertas[0]?.creadaEn ?? null,
      }),
    )
    .digest("hex");

  return {
    filtros,
    fuenteDatos,
    generadoEn: new Date().toISOString(),
    dataHash,
    mencionesCount,
    alertasCount,
    mencionesEnPeriodo,
    alertasEnPeriodo,
    agregados: {
      porGrupo: bundle.porGrupo.map((r) => ({
        grupo: r.grupo,
        total: r.total,
        scorePromedio: Math.round(r.score_promedio ?? 0),
      })),
      porZona: bundle.porZona.map((r) => ({ zona: r.zona, total: r.total })),
      porMunicipio: bundle.porMunicipio.map((r) => ({
        municipio: r.municipio,
        total: r.total,
      })),
      porSubTipo: bundle.porSubTipo.map((r) => ({
        subTipo: r.sub_tipo,
        total: r.total,
      })),
      porDia: bundle.porDia.map((r) => ({ dia: r.dia, total: r.total })),
      porHora: bundle.porHora.map((r) => ({ hora: r.hora, total: r.total })),
      alertasPorEstado: bundle.alertasEstado.map((r) => ({
        estado: r.estado,
        total: r.total,
      })),
      alertasPorNivel: bundle.alertasNivel.map((r) => ({
        nivel: r.nivel,
        total: r.total,
      })),
      serieGrupoPorDia: bundle.serieGrupoPorDia,
      serieZonaPorDia: bundle.serieZonaPorDia,
    },
    menciones,
    alertas,
    autoresDestacados: bundle.autoresRows.map((r) => ({
      handle: r.handle,
      plataforma: r.plataforma ?? "X",
      menciones: r.menciones,
      maxScore: Math.round(r.max_score ?? 0),
      avgScore: Math.round(r.avg_score ?? 0),
      primeraMencion: toIso(r.primera),
      ultimaMencion: toIso(r.ultima),
      esNuevaCuenta: Number(r.es_nueva) === 1,
      verificado: Number(r.verificado) === 1,
    })),
  };
}

export async function getInteligenciaContext(
  filtros: Pick<InteligenciaFiltros, "region">,
): Promise<InteligenciaContextSnapshot> {
  const pool = await getPool();
  const { region } = filtros;
  const mRegion = mencionesRegionSql(region);
  const aRegion = alertasRegionSql(region);

  const baseMenciones = `
    FROM [Centinela].[Menciones] m
    WHERE 1=1
    ${mRegion}
  `;
  const baseAlertas = `
    FROM [Centinela].[Alertas] a
    WHERE 1=1
    ${aRegion}
  `;

  const bundle = await runContextQueries(pool, region, baseMenciones, baseAlertas);
  const filtrosSnapshot: InteligenciaFiltros = {
    region,
    periodo: INTELIGENCIA_PERIODO_CACHE,
  };

  return buildSnapshot(
    filtrosSnapshot,
    "top_global",
    bundle,
    bundle.counts.menciones,
    bundle.counts.alertas,
  );
}
