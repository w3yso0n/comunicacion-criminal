import type { InteligenciaContextSnapshot } from "@/lib/db/inteligencia-context";
import type { ZonaTension } from "@/lib/inteligencia-schema";

type ConteoTerritorio = {
  menciones: number;
  alertas: number;
  scoreSum: number;
  scoreN: number;
};

function normalizarTerritorio(raw: string): string {
  const t = raw.trim();
  if (!t || t === "sin_estado" || t === "sin_zona" || t === "sin_municipio") {
    return "";
  }
  return t;
}

function acumular(
  map: Map<string, ConteoTerritorio>,
  territorio: string,
  delta: { menciones?: number; alertas?: number; score?: number },
) {
  const key = normalizarTerritorio(territorio);
  if (!key) return;

  const cur = map.get(key) ?? {
    menciones: 0,
    alertas: 0,
    scoreSum: 0,
    scoreN: 0,
  };
  cur.menciones += delta.menciones ?? 0;
  cur.alertas += delta.alertas ?? 0;
  if (delta.score != null && !Number.isNaN(delta.score)) {
    cur.scoreSum += delta.score;
    cur.scoreN += 1;
  }
  map.set(key, cur);
}

/** Zonas de tensión derivadas solo de agregados en BD (sin estados fijos del LLM). */
export function computeZonasTensionDesdeContexto(
  ctx: InteligenciaContextSnapshot,
): ZonaTension[] {
  const map = new Map<string, ConteoTerritorio>();

  for (const e of ctx.agregados.alertasPorEstado) {
    acumular(map, e.estado, { alertas: e.total });
  }

  for (const z of ctx.agregados.porZona) {
    acumular(map, z.zona, { menciones: z.total });
  }

  for (const m of ctx.agregados.porMunicipio) {
    acumular(map, m.municipio, { menciones: m.total });
  }

  for (const m of ctx.menciones) {
    const territorio = m.municipio ?? m.zona ?? "";
    if (!territorio) continue;
    acumular(map, territorio, { score: m.scoreSeveridad ?? undefined });
  }

  const entries = [...map.entries()]
    .map(([zona, v]) => ({
      zona,
      peso: v.menciones + v.alertas * 2,
      menciones: v.menciones,
      alertas: v.alertas,
      scoreProm:
        v.scoreN > 0 ? Math.round(v.scoreSum / v.scoreN) : 0,
    }))
    .filter((e) => e.peso > 0)
    .sort((a, b) => b.peso - a.peso);

  if (entries.length === 0) return [];

  const maxPeso = entries[0].peso;

  return entries.slice(0, 10).map((e, idx) => {
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
      zona: e.zona,
      intensidad0_100: intensidad,
      tendencia,
      notaCorta: `${e.menciones} menc. · ${e.alertas} alertas${e.scoreProm ? ` · sev. ~${e.scoreProm}` : ""}`,
    };
  });
}
