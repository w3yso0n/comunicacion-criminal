/** Prompts para análisis con LLM (DeepSeek). La respuesta debe ser JSON puro parseable por `inteligenciaPayloadSchema`. */

export const INTELIGENCIA_SYSTEM_PROMPT = `Eres analista de OSINT especializado en narrativas de apología y propaganda en redes (México).
Responde ÚNICAMENTE con un objeto JSON (sin markdown, sin bloques de código, sin texto adicional).
No uses nombres de personas reales. Los grupos delictivos deben ir marcados como ficticios.
Los estados permitidos en el JSON son exactamente: Jalisco, Sinaloa, Guanajuato, Michoacán, Tamaulipas.
Sé conservador con la confianza (0-100).`;

export function buildInteligenciaUserPrompt(contexto: {
  region: string;
  periodo: string;
}): string {
  return `Devuelve un JSON con EXACTAMENTE estas claves y tipos (en inglés, como en el esquema interno del producto):
{
  "generadoEn": string ISO-8601 UTC,
  "modelo": "deepseek-chat",
  "narrativasPorGrupo": [
    {
      "grupoId": string,
      "grupoNombre": string,
      "estado": "Jalisco"|"Sinaloa"|"Guanajuato"|"Michoacán"|"Tamaulipas",
      "resumenNarrativa": string,
      "vectoresNarrativos": string[],
      "actualizadoEn": string ISO-8601,
      "confianzaPct": number 0-100,
      "fuenteModelo": "deepseek"
    }
  ],
  "senalesEscalada": [
    {
      "id": string,
      "titulo": string,
      "descripcion": string,
      "confianzaPct": number,
      "severidad": "alta"|"media"|"baja",
      "grupoId": string (opcional),
      "zona": string (opcional),
      "periodoEtiqueta": string
    }
  ],
  "correlaciones": [
    {
      "id": string,
      "resumen": string,
      "indiceConfianza": number,
      "publicacionesEnVentana": number,
      "hechoTipo": string,
      "zona": string,
      "ventanaHoras": number
    }
  ],
  "zonasTension": [
    {
      "estado": mismo enum que arriba,
      "intensidad0_100": number,
      "tendencia": "sube"|"baja"|"estable",
      "notaCorta": string
    }
  ],
  "tendenciasEjeTemporal": [7 strings, ej. Lun..Dom],
  "tendenciasPorGrupo": [ { "id", "etiqueta", "valores": number[7] } ],
  "tendenciasPorZona": [ { "id", "etiqueta", "valores": number[7] } ]
}
Contexto: región_filtro=${contexto.region}, periodo=${contexto.periodo}.
Incluye 2-4 narrativas (grupos distintos), 3-5 señales, 2-4 correlaciones, exactamente 5 zonasTension (una por cada estado listado), 3 series en tendenciasPorGrupo y 3 en tendenciasPorZona.`;
}
