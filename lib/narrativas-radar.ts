import type { NarrativaRadarDato } from "@/lib/types";
import { formatIntegerEsMx } from "@/lib/utils";

const SUBTIPOS_IGNORADOS = new Set([
  "",
  "sin_clasificar",
  "sin_subtipo",
  "null",
  "n/a",
]);

export type SubTipoRadarRow = {
  id: string;
  total: number;
  score_promedio: number;
  prev_total: number;
  ejemplo: string | null;
};

function labelSubtipo(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isSubtipoIgnorado(id: string): boolean {
  const norm = id.trim().toLowerCase();
  return !norm || SUBTIPOS_IGNORADOS.has(norm);
}

export function buildNarrativasRadar(rows: SubTipoRadarRow[]): NarrativaRadarDato[] {
  const valid = rows.filter((r) => !isSubtipoIgnorado(r.id) && r.total > 0);
  const maxTotal = Math.max(...valid.map((r) => r.total), 0);

  return valid
    .sort((a, b) => b.total - a.total)
    .slice(0, 12)
    .map((r) => {
      const scoreProm = Math.round(r.score_promedio ?? 0);
      const valor =
        scoreProm > 0
          ? Math.min(100, scoreProm)
          : maxTotal > 0
            ? Math.min(100, Math.round((r.total / maxTotal) * 100))
            : 0;

      let variacionMesPct = 0;
      if (r.prev_total > 0) {
        variacionMesPct = Math.round(
          ((r.total - r.prev_total) / r.prev_total) * 100,
        );
      } else if (r.total > 0) {
        variacionMesPct = 100;
      }

      const ejemplo = r.ejemplo?.trim();
      const descripcion =
        ejemplo ||
        `${formatIntegerEsMx(r.total)} mención${r.total === 1 ? "" : "es"} en el último mes`;

      return {
        id: r.id,
        label: labelSubtipo(r.id),
        valor,
        variacionMesPct,
        descripcion,
        menciones: r.total,
      };
    });
}

export function narrativasRadarTieneDatos(items: NarrativaRadarDato[]): boolean {
  return items.length > 0;
}
