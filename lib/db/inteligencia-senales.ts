import type { InteligenciaContextSnapshot } from "@/lib/db/inteligencia-context";
import type { SenalEscalada } from "@/lib/inteligencia-schema";
import {
  formatearHandle,
  humanizarAutorReincidente,
  labelPlataforma,
  limpiarTextoParaLectura,
} from "@/lib/texto-lectura";

import { slugifyGrupo } from "@/lib/inteligencia-slug";

export type AutorDestacado = {
  handle: string;
  plataforma: string;
  menciones: number;
  maxScore: number;
  avgScore: number;
  primeraMencion: string;
  ultimaMencion: string;
  esNuevaCuenta: boolean;
  verificado: boolean;
};

function toConfianzaPct(score: number | null | undefined): number {
  if (score == null || Number.isNaN(score)) return 50;
  if (score <= 1) return Math.round(score * 100);
  return Math.min(100, Math.round(score));
}

function mapSeveridad(nivel: string, score?: number): SenalEscalada["severidad"] {
  const n = nivel
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (n.includes("crit") || n === "alta") return "alta";
  if (n === "baja") return "baja";
  if (score != null && score >= 85) return "alta";
  if (score != null && score >= 60) return "media";
  return "media";
}

function labelPrioridad(s: SenalEscalada["severidad"]): string {
  if (s === "alta") return "Prioridad alta";
  if (s === "baja") return "Prioridad baja";
  return "Prioridad media";
}

export { labelPrioridad };

function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "fecha reciente";
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function semanaDe(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "el periodo analizado";
  const inicio = new Date(d);
  inicio.setDate(inicio.getDate() - inicio.getDay() + 1);
  return `la semana del ${formatearFecha(inicio.toISOString())}`;
}

function senalDesdeAutor(a: AutorDestacado): SenalEscalada {
  const handle = formatearHandle(a.handle);
  const red = labelPlataforma(a.plataforma);
  const semana = semanaDe(a.ultimaMencion);

  let contextoCuenta = "";
  if (a.esNuevaCuenta) {
    contextoCuenta = " Es una cuenta recién detectada en el monitoreo.";
  } else if (a.verificado) {
    contextoCuenta = " La cuenta está verificada en la red.";
  } else {
    contextoCuenta = " No parece ser un medio informativo tradicional.";
  }

  return {
    id: `autor-${slugifyGrupo(handle)}`,
    titulo: `Cuenta que repite publicaciones graves: ${handle}`,
    descripcion: `${handle} en ${red} concentró ${a.menciones} publicaciones preocupantes en ${semana}. La más grave alcanzó ${a.maxScore} de 100 en nivel de riesgo.${contextoCuenta}`,
    confianzaPct: Math.min(100, Math.round(a.avgScore)),
    severidad: mapSeveridad("", a.maxScore),
    periodoEtiqueta: `Última publicación: ${formatearFecha(a.ultimaMencion)}`,
  };
}

function senalDesdeAlerta(
  a: InteligenciaContextSnapshot["alertas"][number],
): SenalEscalada {
  const grupo = a.grupoCriminal?.trim();
  const humanizado = humanizarAutorReincidente({
    titulo: a.titulo,
    descripcion: a.descripcion,
    plataforma: a.plataforma,
    nMenciones: a.nMenciones,
  });
  const titulo = humanizado?.titulo ?? limpiarTextoParaLectura(a.titulo);
  const descRaw =
    humanizado?.descripcion ?? limpiarTextoParaLectura(a.descripcion);

  const zonaTxt = [a.municipio, a.estado].filter(Boolean).join(", ");
  const mencionesTxt =
    !humanizado && a.nMenciones != null && a.nMenciones > 0
      ? ` En el monitoreo hay ${a.nMenciones} publicaciones vinculadas.`
      : "";

  return {
    id: `alerta-${a.id}`,
    titulo,
    descripcion:
      descRaw.length > 0
        ? `${descRaw}${mencionesTxt}`
        : `Se detectó actividad relevante en el monitoreo.${mencionesTxt}${
            zonaTxt ? ` Zona: ${zonaTxt}.` : ""
          }`,
    confianzaPct: toConfianzaPct(a.scoreConfianza),
    severidad: mapSeveridad(a.nivel),
    grupoId: grupo ? slugifyGrupo(grupo) : undefined,
    zona: zonaTxt || undefined,
    periodoEtiqueta: "Detectado en el monitoreo de alertas",
  };
}

function senalDesdeMencion(
  m: InteligenciaContextSnapshot["menciones"][number],
): SenalEscalada | null {
  if (!m.senalEscalada?.trim()) return null;
  const handle = m.handle ? formatearHandle(m.handle) : "una cuenta";
  const red = labelPlataforma(m.plataforma);
  const score = m.scoreSeveridad ?? 0;

  return {
    id: `mencion-${m.id}`,
    titulo: `Publicación que llama la atención (${handle})`,
    descripcion: `${handle} en ${red}: ${limpiarTextoParaLectura(m.senalEscalada)}${
      m.resumen ? ` Contexto: ${m.resumen}` : ""
    }`,
    confianzaPct: toConfianzaPct(score),
    severidad: mapSeveridad(m.nivelRiesgo ?? "", score),
    zona: m.municipio ?? m.zona ?? undefined,
    periodoEtiqueta: formatearFecha(m.publicadoEn),
  };
}

/** Avisos en lenguaje claro, solo con datos consultados. */
export function buildSenalesEscalada(
  ctx: InteligenciaContextSnapshot,
): SenalEscalada[] {
  const vistos = new Set<string>();
  const out: SenalEscalada[] = [];

  const push = (s: SenalEscalada) => {
    if (vistos.has(s.id)) return;
    vistos.add(s.id);
    out.push(s);
  };

  for (const autor of ctx.autoresDestacados ?? []) {
    if (autor.menciones >= 2) push(senalDesdeAutor(autor));
  }

  for (const a of ctx.alertas) {
    push(senalDesdeAlerta(a));
    if (out.length >= 8) break;
  }

  for (const m of ctx.menciones) {
    const s = senalDesdeMencion(m);
    if (s) push(s);
    if (out.length >= 10) break;
  }

  return out.slice(0, 8);
}
