import type { InteligenciaContextSnapshot } from "@/lib/db/inteligencia-context";
import {
  EDOMEX_REGIONES,
  resolverRegionEdomex,
  resolverRegionPorTexto,
} from "@/lib/edomex-regiones";
import type { ZonaTension } from "@/lib/inteligencia-schema";

type ConteoRegion = {
  menciones: number;
  alertas: number;
  scoreSum: number;
  scoreN: number;
  municipiosDetectados: Set<string>;
};

function acumularRegion(
  map: Map<number, ConteoRegion>,
  regionNumero: number,
  delta: {
    menciones?: number;
    alertas?: number;
    score?: number;
    municipio?: string;
  },
) {
  const region = EDOMEX_REGIONES.find((r) => r.numero === regionNumero);
  if (!region) return;

  const cur = map.get(regionNumero) ?? {
    menciones: 0,
    alertas: 0,
    scoreSum: 0,
    scoreN: 0,
    municipiosDetectados: new Set<string>(),
  };
  cur.menciones += delta.menciones ?? 0;
  cur.alertas += delta.alertas ?? 0;
  if (delta.score != null && !Number.isNaN(delta.score)) {
    cur.scoreSum += delta.score;
    cur.scoreN += 1;
  }
  if (delta.municipio) cur.municipiosDetectados.add(delta.municipio);
  map.set(regionNumero, cur);
}

function acumularDesdeMunicipio(
  map: Map<number, ConteoRegion>,
  municipio: string | null | undefined,
  delta: Omit<Parameters<typeof acumularRegion>[2], "municipio">,
) {
  const region = resolverRegionEdomex(municipio);
  if (!region) return;
  acumularRegion(map, region.numero, {
    ...delta,
    municipio: municipio?.trim() || undefined,
  });
}

/** Regiones de tensión del Edomex a partir de municipios en BD. */
export function computeZonasTensionDesdeContexto(
  ctx: InteligenciaContextSnapshot,
): ZonaTension[] {
  const map = new Map<number, ConteoRegion>();

  for (const m of ctx.agregados.porMunicipio) {
    acumularDesdeMunicipio(map, m.municipio, { menciones: m.total });
  }

  for (const m of ctx.menciones) {
    acumularDesdeMunicipio(map, m.municipio, {
      score: m.scoreSeveridad ?? undefined,
    });
  }

  for (const a of ctx.alertas) {
    acumularDesdeMunicipio(map, a.municipio, { alertas: 1 });
  }

  const entries = EDOMEX_REGIONES.map((region) => {
    const v = map.get(region.numero);
    if (!v || v.menciones + v.alertas === 0) return null;
    const peso = v.menciones + v.alertas * 2;
    const scoreProm =
      v.scoreN > 0 ? Math.round(v.scoreSum / v.scoreN) : 0;
    return {
      region,
      peso,
      menciones: v.menciones,
      alertas: v.alertas,
      scoreProm,
      municipios: v.municipiosDetectados.size,
    };
  })
    .filter((e): e is NonNullable<typeof e> => e != null)
    .sort((a, b) => b.peso - a.peso);

  if (entries.length === 0) return [];

  const maxPeso = entries[0].peso;

  return entries.slice(0, 12).map((e, idx) => {
    const intensidad = Math.min(
      100,
      Math.round(
        (e.peso / maxPeso) * 85 + (e.scoreProm > 0 ? e.scoreProm * 0.15 : 0),
      ),
    );
    const tendencia: ZonaTension["tendencia"] =
      idx === 0 && e.peso > maxPeso * 0.6
        ? "sube"
        : idx >= entries.length - 2 && entries.length > 3
          ? "baja"
          : "estable";

    return {
      zona: e.region.etiqueta,
      zonaMacro: e.region.zonaMacro,
      intensidad0_100: intensidad,
      tendencia,
      notaCorta: `${e.municipios} municipios · ${e.menciones} menc. · ${e.alertas} alertas${e.scoreProm ? ` · sev. ~${e.scoreProm}` : ""}`,
    };
  });
}

/** Filtra regiones por etiqueta de zona macro o región (filtro del tablero). */
export function regionCoincideFiltro(
  item: Pick<ZonaTension, "zona" | "zonaMacro">,
  filtro: string,
): boolean {
  if (filtro === "todas") return true;
  const f = filtro.toLowerCase();
  if (
    item.zona.toLowerCase().includes(f) ||
    (item.zonaMacro?.toLowerCase().includes(f) ?? false)
  ) {
    return true;
  }
  const region =
    resolverRegionPorTexto(filtro) ?? resolverRegionPorTexto(item.zona);
  if (!region) return false;
  return (
    region.etiqueta.toLowerCase().includes(f) ||
    region.zonaMacro.toLowerCase().includes(f) ||
    region.nombre.toLowerCase().includes(f)
  );
}
