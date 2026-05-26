import {
  agregarConteosPorRegion,
  agregarSeriePorRegion,
} from "@/lib/edomex-regiones";
import { slugifyGrupo } from "@/lib/inteligencia-slug";
import type { TendenciaSerie } from "@/lib/inteligencia-schema";

type PuntoDia = { dia: string; total: number };
type SerieDia = { clave: string; dia: string; total: number };
type SerieGrupoDia = { grupo: string; dia: string; total: number };

export type GrupoTendenciaClave = { id: string; etiqueta: string };

const MAX_GRUPOS_GRAFICA = 8;
const MAX_REGIONES_GRAFICA = 6;

function normClave(s: string): string {
  return s.trim().toLowerCase();
}

function ultimos7Dias(porDia: PuntoDia[]): { eje: string[]; indices: Map<string, number> } {
  const dias = [...porDia]
    .filter((d) => d.dia && d.dia !== "sin_dia" && !d.dia.startsWith("—"))
    .sort((a, b) => a.dia.localeCompare(b.dia))
    .slice(-7);

  if (dias.length === 0) {
    const labels = ["D1", "D2", "D3", "D4", "D5", "D6", "D7"];
    return {
      eje: labels,
      indices: new Map(labels.map((l, i) => [l, i])),
    };
  }

  while (dias.length < 7) {
    dias.unshift({ dia: `—${7 - dias.length}`, total: 0 });
  }

  const eje = dias.map((d) => d.dia);
  return { eje, indices: new Map(eje.map((d, i) => [d, i])) };
}

function buildSeries(
  claves: GrupoTendenciaClave[],
  serieDia: SerieDia[],
  indices: Map<string, number>,
): TendenciaSerie[] {
  const porEtiqueta = new Map<string, Map<string, number>>();

  for (const row of serieDia) {
    const k = normClave(row.clave);
    if (!porEtiqueta.has(k)) porEtiqueta.set(k, new Map());
    const diaMap = porEtiqueta.get(k)!;
    diaMap.set(row.dia, (diaMap.get(row.dia) ?? 0) + row.total);
  }

  return claves.map(({ id, etiqueta }) => {
    const valores = Array<number>(7).fill(0);
    const diaMap = porEtiqueta.get(normClave(etiqueta));
    if (diaMap) {
      for (const [dia, total] of diaMap) {
        const idx = indices.get(dia);
        if (idx != null) valores[idx] = total;
      }
    }
    return { id, etiqueta, valores };
  });
}

function resolveGruposEnfasis(
  porGrupo: { grupo: string; total: number }[],
  gruposEnfasis?: GrupoTendenciaClave[],
): GrupoTendenciaClave[] {
  if (gruposEnfasis && gruposEnfasis.length > 0) {
    return gruposEnfasis.slice(0, MAX_GRUPOS_GRAFICA);
  }

  return porGrupo
    .filter((g) => g.grupo !== "sin_grupo" && g.total > 0)
    .slice(0, MAX_GRUPOS_GRAFICA)
    .map((g) => ({
      id: slugifyGrupo(g.grupo),
      etiqueta: g.grupo.trim(),
    }));
}

export function buildTendenciasDesdeAgregados(input: {
  porDia: PuntoDia[];
  porGrupo: { grupo: string; total: number }[];
  porMunicipio: { municipio: string; total: number }[];
  serieGrupoPorDia: SerieGrupoDia[];
  serieMunicipioPorDia: { municipio: string; dia: string; total: number }[];
  /** Grupos a graficar (p. ej. catálogo de BD o narrativas del análisis). */
  gruposEnfasis?: GrupoTendenciaClave[];
}): {
  tendenciasEjeTemporal: string[];
  tendenciasPorGrupo: TendenciaSerie[];
  tendenciasPorZona: TendenciaSerie[];
} {
  const { eje, indices } = ultimos7Dias(input.porDia);

  const gruposGrafica = resolveGruposEnfasis(input.porGrupo, input.gruposEnfasis);

  const serieGrupo: SerieDia[] = input.serieGrupoPorDia.map((r) => ({
    clave: r.grupo.trim(),
    dia: r.dia,
    total: r.total,
  }));

  const topRegiones = agregarConteosPorRegion(input.porMunicipio)
    .slice(0, MAX_REGIONES_GRAFICA)
    .map(({ region }) => ({
      id: slugifyGrupo(region.etiqueta),
      etiqueta: region.etiqueta,
    }));

  const serieRegion: SerieDia[] = agregarSeriePorRegion(
    input.serieMunicipioPorDia,
  ).map((r) => ({
    clave: r.region.etiqueta,
    dia: r.dia,
    total: r.total,
  }));

  return {
    tendenciasEjeTemporal: eje,
    tendenciasPorGrupo: buildSeries(gruposGrafica, serieGrupo, indices),
    tendenciasPorZona: buildSeries(topRegiones, serieRegion, indices),
  };
}
