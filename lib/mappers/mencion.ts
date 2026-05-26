import type { Mencion, Plataforma } from "@/lib/types";
import { normalizarNivelRiesgo } from "@/lib/nivel-riesgo";

export type MencionRow = {
  mencion_id: number;
  url: string | null;
  published_at: Date | string;
  plataforma: string | null;
  handle: string | null;
  autor_nombre: string | null;
  autor_verificado: string | boolean | null;
  autor_seguidores: number | null;
  contenido: string | null;
  descripcion_corta: string | null;
  municipio: string | null;
  ubicacion_especifica: string | null;
  zona: string | null;
  likes: number | null;
  shares: number | null;
  comments: number | null;
  engagement_total: number | null;
  reach: number | null;
  tipo_principal: string | null;
  sub_tipo: string | null;
  tipo_delito: string | null;
  score_severidad: number | null;
  nivel_riesgo: string | null;
  grupo_criminal: string | null;
  senal_escalada: string | null;
  analisis_ia: string | null;
  cluster_id: string | null;
  cluster_role: string | null;
  captura_url: string | null;
  lat: number | null;
  lon: number | null;
  perspectiva_autor: string | null;
};

function toIsoDate(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function mapPlataforma(raw: string | null): Plataforma {
  const p = (raw ?? "").trim().toLowerCase();
  if (p === "x" || p === "twitter") return "twitter";
  if (p === "telegram") return "telegram";
  if (p === "tiktok") return "tiktok";
  return "twitter";
}

function mapNivelRiesgo(raw: string | null) {
  return normalizarNivelRiesgo(raw);
}

function mapVerificado(raw: string | boolean | null): boolean | undefined {
  if (raw == null) return undefined;
  if (typeof raw === "boolean") return raw;
  const v = raw.trim();
  return v === "1" || v.toLowerCase() === "true";
}

function normalizeHandle(raw: string | null): string {
  const h = (raw ?? "").trim();
  if (!h) return "desconocido";
  return h.startsWith("@") ? h : `@${h}`;
}

export function mapMencionRow(row: MencionRow): Mencion {
  const reacciones = row.likes ?? 0;
  const comentarios = row.comments ?? 0;
  const compartidos = row.shares ?? 0;
  const total =
    row.engagement_total ?? reacciones + comentarios + compartidos;

  return {
    id: String(row.mencion_id),
    url: row.url ?? "",
    publicadoEn: toIsoDate(row.published_at),
    plataforma: mapPlataforma(row.plataforma),
    handle: normalizeHandle(row.handle),
    autorNombre: row.autor_nombre ?? undefined,
    autorVerificado: mapVerificado(row.autor_verificado),
    autorSeguidores: row.autor_seguidores ?? undefined,
    perspectivaAutor: row.perspectiva_autor?.trim() || undefined,
    contenido: row.contenido ?? "",
    descripcionCorta: row.descripcion_corta ?? undefined,
    municipio: row.municipio ?? undefined,
    ubicacionEspecifica: row.ubicacion_especifica ?? undefined,
    zona: row.zona ?? undefined,
    engagement: {
      reacciones,
      comentarios,
      compartidos,
      total,
    },
    reach: row.reach ?? undefined,
    tipoPrincipal: row.tipo_principal ?? undefined,
    subTipo: row.sub_tipo ?? undefined,
    tipoDelito: row.tipo_delito ?? undefined,
    scoreSeveridad: row.score_severidad ?? undefined,
    nivelRiesgo: mapNivelRiesgo(row.nivel_riesgo),
    grupoCriminal: row.grupo_criminal ?? undefined,
    senalEscalada: row.senal_escalada ?? undefined,
    analisisIa: row.analisis_ia ?? undefined,
    clusterId: row.cluster_id ?? undefined,
    clusterRole: row.cluster_role ?? undefined,
    capturaUrl: row.captura_url ?? undefined,
    lat: row.lat ?? undefined,
    lon: row.lon ?? undefined,
  };
}
