/** Utilidades para mostrar textos de BD en español claro (sin jerga técnica). */

export function formatearFechaEnTexto(texto: string): string {
  return texto.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_, y, mo, d) => {
    const dt = new Date(`${y}-${mo}-${d}T12:00:00`);
    return Number.isNaN(dt.getTime())
      ? `${d}/${mo}/${y}`
      : dt.toLocaleDateString("es-MX", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  });
}

export function limpiarTextoParaLectura(texto: string): string {
  return formatearFechaEnTexto(
    texto
      .replace(/score\s*≥\s*(\d+)/gi, "riesgo alto (a partir de $1 sobre 100)")
      .replace(/score\s*>=\s*(\d+)/gi, "riesgo alto (a partir de $1 sobre 100)")
      .replace(/máximo\s+score:\s*(\d+)/gi, "el caso más grave llegó a $1 sobre 100")
      .replace(/maximo\s+score:\s*(\d+)/gi, "el caso más grave llegó a $1 sobre 100")
      .replace(/score\s*promedio/gi, "riesgo promedio")
      .replace(/\bscore\b/gi, "nivel de riesgo")
      .replace(/\bpub\./gi, "publicaciones")
      .replace(/\bBD\b/g, "base de datos")
      .replace(
        /no\s+es\s+cuenta\s+de\s+medio\s+noticioso/gi,
        "no parece ser un medio de comunicación tradicional",
      )
      .replace(/acumuló\s+(\d+)\s+menciones/gi, "apareció en $1 publicaciones relevantes"),
  ).trim();
}

export function labelPlataforma(raw: string | null | undefined): string {
  const p = (raw ?? "").trim().toLowerCase();
  if (p === "twitter" || p === "x") return "X";
  if (p === "telegram") return "Telegram";
  if (p === "tiktok") return "TikTok";
  return raw?.trim() || "red social";
}

export function formatearHandle(handle: string): string {
  const h = handle.trim();
  return h.startsWith("@") ? h : `@${h}`;
}

/** Limpieza extra para patrones/correlaciones (top global, sin filtro 24h del dashboard). */
export function limpiarTextoCorrelacion(texto: string): string {
  return limpiarTextoParaLectura(texto)
    .replace(/\s*\/\s*24\s*h\b/gi, "")
    .replace(/\(\s*(\d+)\s+menciones\s*\/\s*24\s*h\s*\)/gi, "($1 publicaciones)")
    .replace(/\ben\s+24\s*h\b/gi, "")
    .replace(/\b(\d+)\s+menciones\s+relevantes\s+en\s+/gi, "$1 publicaciones relevantes en ")
    .replace(/\bcomunicación\(es\)/gi, "publicación(es)")
    .replace(/±\s*72\s*h/gi, "±3 días")
    .replace(
      /dentro de la ventana de\s*±3 días/gi,
      "en un margen de unos 3 días antes y después del hecho",
    )
    .replace(/distancia mínima amenaza↔hecho:\s*/gi, "Tiempo entre amenaza y hecho: ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
