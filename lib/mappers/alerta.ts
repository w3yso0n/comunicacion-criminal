import type { Alerta, TipoAlerta } from "@/lib/types";
import { normalizarSeveridadAlerta } from "@/lib/nivel-riesgo";

export type AlertaRow = {
  alerta_id: number;
  tipo: string;
  nivel: string;
  titulo: string;
  descripcion: string;
  grupo_criminal: string | null;
  municipio: string | null;
  plataforma: string | null;
  cluster_id: string | null;
  n_menciones: number | null;
  score_confianza: number | null;
  estado: string | null;
  created_at: Date | string;
};

const TIPOS_VALIDOS: TipoAlerta[] = [
  "correlacion",
  "pico_actividad",
  "autor",
  "narrativa",
  "correlacion_accion_hecho",
  "coincidencia_territorial",
];

function mapTipo(raw: string): TipoAlerta {
  const key = raw.trim().toLowerCase() as TipoAlerta;
  if (TIPOS_VALIDOS.includes(key)) return key;
  return "correlacion";
}

function mapSeveridad(nivel: string) {
  return normalizarSeveridadAlerta(nivel) ?? "media";
}

function toIsoDate(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function toConfianzaPct(score: number | null): number | undefined {
  if (score == null || Number.isNaN(score)) return undefined;
  if (score <= 1) return Math.round(score * 100);
  return Math.round(score);
}

export function mapAlertaRow(row: AlertaRow): Alerta {
  return {
    id: String(row.alerta_id),
    tipo: mapTipo(row.tipo),
    severidad: mapSeveridad(row.nivel),
    titulo: row.titulo,
    descripcion: row.descripcion,
    creadaEn: toIsoDate(row.created_at),
    grupoCriminal: row.grupo_criminal ?? undefined,
    municipio: row.municipio ?? undefined,
    plataforma: row.plataforma ?? undefined,
    clusterId: row.cluster_id ?? undefined,
    nMenciones: row.n_menciones ?? undefined,
    scoreConfianzaPct: toConfianzaPct(row.score_confianza),
    estado: row.estado ?? undefined,
  };
}
