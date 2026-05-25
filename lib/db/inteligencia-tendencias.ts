import {
  agregarConteosPorRegion,
  agregarSeriePorRegion,
} from "@/lib/edomex-regiones";
import type { TendenciaSerie } from "@/lib/inteligencia-schema";

type PuntoDia = { dia: string; total: number };
type SerieDia = { clave: string; dia: string; total: number };
type SerieGrupoDia = { grupo: string; dia: string; total: number };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "item";
}

function ultimos7Dias(porDia: PuntoDia[]): { eje: string[]; indices: Map<string, number> } {
  const dias = [...porDia]
    .filter((d) => d.dia && d.dia !== "sin_dia")
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
  claves: { id: string; etiqueta: string }[],
  serieDia: SerieDia[],
  indices: Map<string, number>,
): TendenciaSerie[] {
  return claves.map(({ id, etiqueta }) => {
    const valores = Array<number>(7).fill(0);
    for (const row of serieDia) {
      if (row.clave !== etiqueta) continue;
      const idx = indices.get(row.dia);
      if (idx != null) valores[idx] = row.total;
    }
    return { id, etiqueta, valores };
  });
}

export function buildTendenciasDesdeAgregados(input: {
  porDia: PuntoDia[];
  porGrupo: { grupo: string; total: number }[];
  porMunicipio: { municipio: string; total: number }[];
  serieGrupoPorDia: SerieGrupoDia[];
  serieMunicipioPorDia: { municipio: string; dia: string; total: number }[];
}): {
  tendenciasEjeTemporal: string[];
  tendenciasPorGrupo: TendenciaSerie[];
  tendenciasPorZona: TendenciaSerie[];
} {
  const { eje, indices } = ultimos7Dias(input.porDia);

  const topGrupos = input.porGrupo
    .filter((g) => g.grupo !== "sin_grupo")
    .slice(0, 3)
    .map((g) => ({ id: slugify(g.grupo), etiqueta: g.grupo }));

  const topRegiones = agregarConteosPorRegion(input.porMunicipio)
    .slice(0, 4)
    .map(({ region }) => ({
      id: slugify(region.etiqueta),
      etiqueta: region.etiqueta,
    }));

  const serieGrupo: SerieDia[] = input.serieGrupoPorDia.map((r) => ({
    clave: r.grupo,
    dia: r.dia,
    total: r.total,
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
    tendenciasPorGrupo: buildSeries(topGrupos, serieGrupo, indices),
    tendenciasPorZona: buildSeries(topRegiones, serieRegion, indices),
  };
}
