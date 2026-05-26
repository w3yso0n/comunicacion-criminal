import { COL_PERSPECTIVA_AUTOR } from "@/lib/db/schema";

/** Valores de la columna `perspectiva_autor` en [Centinela].[Menciones]. */
export type PerspectivaAutor = "informativo" | "ciudadano" | "criminal";

export const PERSPECTIVAS_AUTOR: PerspectivaAutor[] = [
  "informativo",
  "ciudadano",
  "criminal",
];

export const PERSPECTIVA_AUTOR_LABEL: Record<PerspectivaAutor, string> = {
  informativo: "Informativo",
  ciudadano: "Ciudadano",
  criminal: "Criminal",
};

/** Solo Ciudadano y Criminal entran al módulo de inteligencia. */
export const PERSPECTIVAS_INTELIGENCIA: PerspectivaAutor[] = ["ciudadano", "criminal"];

export function labelPerspectivaAutor(id: PerspectivaAutor): string {
  return PERSPECTIVA_AUTOR_LABEL[id];
}

export function normalizarPerspectivaAutor(
  raw: string | null | undefined,
): PerspectivaAutor | null {
  const n = (raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (n === "informativo") return "informativo";
  if (n === "ciudadano") return "ciudadano";
  if (n === "criminal") return "criminal";
  return null;
}

/** Filtro SQL para menciones (alias `m`) en inteligencia estratégica. */
export const SQL_MENCIONES_INTELIGENCIA =
  ` AND LOWER(LTRIM(RTRIM(m.${COL_PERSPECTIVA_AUTOR}))) IN ('ciudadano', 'criminal')`;
