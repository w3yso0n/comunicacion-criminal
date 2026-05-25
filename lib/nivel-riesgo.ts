import type { NivelRiesgo, SeveridadAlerta } from "@/lib/types";

/** Normaliza texto de nivel/severidad para comparación (minúsculas, sin acentos). */
export function normalizarNivelTexto(raw: string | null | undefined): string {
  return (raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Menciones: alto es el nivel canónico; critico se absorbe como legacy. */
export function esMencionAltoRiesgo(nivel: string | null | undefined): boolean {
  const n = normalizarNivelTexto(nivel);
  return n === "alto" || n === "critico";
}

/** Alertas: alta es la severidad canónica; critica se absorbe como legacy. */
export function esAlertaAltoRiesgo(severidad: string | null | undefined): boolean {
  const n = normalizarNivelTexto(severidad);
  return n === "alta" || n === "critica";
}

/** Mapea valores legacy de menciones al nivel unificado. */
export function normalizarNivelRiesgo(
  raw: string | null | undefined,
): NivelRiesgo | undefined {
  if (!raw) return undefined;
  const n = normalizarNivelTexto(raw);
  if (n === "critico" || n === "alto") return "alto";
  if (n === "medio") return "medio";
  if (n === "bajo") return "bajo";
  return "neutral";
}

/** Mapea severidades legacy de alertas al nivel unificado. */
export function normalizarSeveridadAlerta(
  raw: string | null | undefined,
): SeveridadAlerta | undefined {
  if (!raw) return undefined;
  const n = normalizarNivelTexto(raw);
  if (n === "critica" || n === "alta") return "alta";
  if (n === "media") return "media";
  if (n === "baja") return "baja";
  return undefined;
}

/** Fragmento SQL reutilizable para contar menciones de alto riesgo. */
export const SQL_MENCION_ALTO_RIESGO =
  "LOWER(LTRIM(RTRIM(nivel_riesgo))) IN ('alto', 'critico')";

/** Fragmento SQL reutilizable para contar menciones de riesgo medio. */
export const SQL_MENCION_MEDIO_RIESGO =
  "LOWER(LTRIM(RTRIM(nivel_riesgo))) = 'medio'";

/** Fragmento SQL reutilizable para contar alertas de alto riesgo. */
export const SQL_ALERTA_ALTO_RIESGO =
  "LOWER(LTRIM(RTRIM(nivel))) IN ('alta', 'critica', 'crítica')";
