import type { InteligenciaContextSnapshot } from "@/lib/db/inteligencia-context";
import type { GrupoCatalogo } from "@/lib/db/inteligencia-payload";
import { slugifyGrupo } from "@/lib/db/inteligencia-payload";

export const INTELIGENCIA_SYSTEM_PROMPT = `Eres analista de OSINT. Responde ÚNICAMENTE JSON válido.
PROHIBIDO inventar grupos: solo puedes usar grupoId presentes en el catálogo enviado.
Selecciona únicamente grupos con evidencia narrativa relevante en las muestras (apología, propaganda, amenaza, control territorial).
Si un grupo del catálogo no tiene patrón claro, NO lo incluyas.
No uses territorios que no aparezcan en las menciones de ese grupo.`;

export function buildNarrativasUserPrompt(
  ctx: InteligenciaContextSnapshot,
  catalogo: GrupoCatalogo[],
): string {
  const candidatos = catalogo.map((g) => {
    const menciones = ctx.menciones
      .filter((m) => slugifyGrupo(m.grupoCriminal ?? "") === g.grupoId)
      .slice(0, 6)
      .map((m) => ({
        resumen: m.resumen,
        subTipo: m.subTipo,
        score: m.scoreSeveridad,
        municipio: m.municipio,
        zona: m.zona,
        senalEscalada: m.senalEscalada,
        analisisIa: m.analisisIa,
      }));

    const alertasGrupo = ctx.alertas
      .filter(
        (a) =>
          a.grupoCriminal &&
          slugifyGrupo(a.grupoCriminal) === g.grupoId,
      )
      .slice(0, 3)
      .map((a) => ({
        titulo: a.titulo,
        nivel: a.nivel,
        descripcion: a.descripcion,
      }));

    return {
      grupoId: g.grupoId,
      grupoNombre: g.grupoNombre,
      totalMenciones: g.totalMenciones,
      scorePromedio: g.scorePromedio,
      muestraMenciones: menciones,
      alertasRelacionadas: alertasGrupo,
    };
  });

  return `Catálogo de grupos detectados en la base de datos (elige cuáles ameritan ficha narrativa):

${JSON.stringify(candidatos)}

Tarea:
1. Revisa cada grupo del catálogo.
2. Incluye en la respuesta SOLO los grupos con actividad narrativa significativa según las muestras.
3. Puedes devolver desde 0 hasta ${Math.min(catalogo.length, 8)} grupos (no estás obligado a usar todos ni a llegar a 8).

Devuelve JSON:
{
  "narrativasPorGrupo": [
    {
      "grupoId": string (debe existir en el catálogo),
      "resumenNarrativa": string (2-4 oraciones basadas en muestras/alertas),
      "vectoresNarrativos": string[] (2-4 etiquetas de subTipo o señales reales)
    }
  ]
}`;
}
