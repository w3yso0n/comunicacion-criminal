import type { InteligenciaContextSnapshot } from "@/lib/db/inteligencia-context";
import { buildTendenciasDesdeAgregados } from "@/lib/db/inteligencia-tendencias";
import { buildCorrelacionesLegibles } from "@/lib/db/inteligencia-correlaciones";
import { buildSenalesEscalada } from "@/lib/db/inteligencia-senales";
import { computeZonasTensionDesdeContexto } from "@/lib/db/inteligencia-zonas";
import type {
  InteligenciaIAPayload,
  NarrativaGrupoActiva,
} from "@/lib/inteligencia-schema";
import { slugifyGrupo } from "@/lib/inteligencia-slug";

export { slugifyGrupo };

function toConfianzaPct(score: number | null | undefined): number {
  if (score == null || Number.isNaN(score)) return 50;
  if (score <= 1) return Math.round(score * 100);
  return Math.min(100, Math.round(score));
}

function ubicacionGrupo(
  ctx: InteligenciaContextSnapshot,
  grupoNombre: string,
): string {
  const mencion = ctx.menciones.find(
    (m) =>
      (m.grupoCriminal ?? "").trim() === grupoNombre.trim() ||
      slugifyGrupo(m.grupoCriminal ?? "") === slugifyGrupo(grupoNombre),
  );
  return (
    mencion?.municipio?.trim() ||
    mencion?.zona?.trim() ||
    ctx.alertas.find((a) => (a.grupoCriminal ?? "").trim() === grupoNombre.trim())
      ?.estado?.trim() ||
    ctx.alertas.find((a) => (a.grupoCriminal ?? "").trim() === grupoNombre.trim())
      ?.municipio?.trim() ||
    "Ubicación no especificada"
  );
}

export type GrupoCatalogo = {
  grupoId: string;
  grupoNombre: string;
  totalMenciones: number;
  scorePromedio: number;
};

/** Todos los grupos con menciones en la consulta (sin límite fijo). */
export function buildCatalogoGrupos(
  ctx: InteligenciaContextSnapshot,
): GrupoCatalogo[] {
  return ctx.agregados.porGrupo
    .filter((g) => g.grupo !== "sin_grupo" && g.total > 0)
    .map((g) => ({
      grupoId: slugifyGrupo(g.grupo),
      grupoNombre: g.grupo,
      totalMenciones: g.total,
      scorePromedio: Math.min(100, Math.max(0, g.scorePromedio)),
    }));
}

function buildNarrativaGrupo(
  ctx: InteligenciaContextSnapshot,
  catalogo: GrupoCatalogo,
  texto?: { resumenNarrativa: string; vectoresNarrativos: string[] },
): NarrativaGrupoActiva {
  const mencionesGrupo = ctx.menciones.filter(
    (m) => slugifyGrupo(m.grupoCriminal ?? "") === catalogo.grupoId,
  );
  const ultima = mencionesGrupo[0]?.publicadoEn ?? ctx.generadoEn;
  const resumenDb =
    mencionesGrupo.find((m) => m.analisisIa)?.analisisIa ??
    mencionesGrupo.find((m) => m.resumen)?.resumen ??
    "";
  const vectoresDb = [
    ...new Set(
      mencionesGrupo
        .map((m) => m.subTipo?.trim())
        .filter((v): v is string => Boolean(v)),
    ),
  ].slice(0, 5);

  return {
    grupoId: catalogo.grupoId,
    grupoNombre: catalogo.grupoNombre,
    estado: ubicacionGrupo(ctx, catalogo.grupoNombre),
    resumenNarrativa: texto?.resumenNarrativa.trim() || resumenDb,
    vectoresNarrativos:
      texto && texto.vectoresNarrativos.length > 0
        ? texto.vectoresNarrativos.slice(0, 5)
        : vectoresDb,
    actualizadoEn: ultima,
    confianzaPct: catalogo.scorePromedio,
    fuenteModelo: "deepseek",
  };
}

/** Solo grupos que DeepSeek eligió y que existen en el catálogo. */
export function buildNarrativasDesdeSeleccionLlm(
  ctx: InteligenciaContextSnapshot,
  catalogo: GrupoCatalogo[],
  seleccion: {
    grupoId: string;
    resumenNarrativa: string;
    vectoresNarrativos: string[];
  }[],
): NarrativaGrupoActiva[] {
  const porId = new Map(catalogo.map((g) => [g.grupoId, g]));
  const usados = new Set<string>();
  const out: NarrativaGrupoActiva[] = [];

  for (const item of seleccion) {
    const cat = porId.get(item.grupoId);
    if (!cat || usados.has(item.grupoId)) continue;
    usados.add(item.grupoId);
    out.push(buildNarrativaGrupo(ctx, cat, item));
  }

  return out;
}

/** Sin IA: una ficha por cada grupo del catálogo con texto de BD. */
export function buildNarrativasDesdeCatalogo(
  ctx: InteligenciaContextSnapshot,
  catalogo: GrupoCatalogo[],
): NarrativaGrupoActiva[] {
  return catalogo.map((g) => buildNarrativaGrupo(ctx, g));
}

export function buildPayloadDesdeContexto(
  ctx: InteligenciaContextSnapshot,
  modelo: string,
): InteligenciaIAPayload {
  const tendencias = buildTendenciasDesdeAgregados({
    porDia: ctx.agregados.porDia,
    porGrupo: ctx.agregados.porGrupo.map((g) => ({
      grupo: g.grupo,
      total: g.total,
    })),
    porMunicipio: ctx.agregados.porMunicipio,
    serieGrupoPorDia: ctx.agregados.serieGrupoPorDia,
    serieMunicipioPorDia: ctx.agregados.serieMunicipioPorDia,
  });

  return {
    generadoEn: new Date().toISOString(),
    modelo,
    narrativasPorGrupo: [],
    senalesEscalada: buildSenalesEscalada(ctx),
    correlaciones: buildCorrelacionesLegibles(ctx),
    zonasTension: computeZonasTensionDesdeContexto(ctx),
    tendenciasEjeTemporal: tendencias.tendenciasEjeTemporal,
    tendenciasPorGrupo: tendencias.tendenciasPorGrupo,
    tendenciasPorZona: tendencias.tendenciasPorZona,
  };
}

/** Reconstruye métricas desde BD; narrativas solo si el grupo sigue en catálogo. */
export function reconciliarPayloadConContexto(
  guardado: InteligenciaIAPayload,
  ctx: InteligenciaContextSnapshot,
): InteligenciaIAPayload {
  const base = buildPayloadDesdeContexto(ctx, guardado.modelo);
  const catalogo = buildCatalogoGrupos(ctx);
  const idsCatalogo = new Set(catalogo.map((g) => g.grupoId));

  const seleccion = guardado.narrativasPorGrupo
    .filter((n) => idsCatalogo.has(n.grupoId))
    .map((n) => ({
      grupoId: n.grupoId,
      resumenNarrativa: n.resumenNarrativa,
      vectoresNarrativos: n.vectoresNarrativos,
    }));

  return {
    ...base,
    narrativasPorGrupo: buildNarrativasDesdeSeleccionLlm(
      ctx,
      catalogo,
      seleccion,
    ),
  };
}
