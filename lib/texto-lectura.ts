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

function formatearFechaIso(iso: string): string {
  const dt = new Date(`${iso}T12:00:00`);
  return Number.isNaN(dt.getTime())
    ? iso
    : dt.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

function extraerHandleDeTexto(texto: string): string | null {
  const m = texto.match(/@[\w.]+/i);
  return m ? formatearHandle(m[0]) : null;
}

export type TextoAutorReincidente = {
  titulo: string;
  descripcion: string;
};

/** Convierte alertas tipo «Autor reincidente: @cuenta» a lenguaje cotidiano. */
export function humanizarAutorReincidente(input: {
  titulo: string;
  descripcion: string;
  plataforma?: string | null;
  nMenciones?: number | null;
}): TextoAutorReincidente | null {
  const combined = `${input.titulo} ${input.descripcion}`;
  if (
    !/autor\s+reincidente|acumul[oó]\s+\d+\s+menciones|reincidente:/i.test(
      combined,
    )
  ) {
    return null;
  }

  const handle =
    extraerHandleDeTexto(input.titulo) ??
    extraerHandleDeTexto(input.descripcion);
  if (!handle) return null;

  const redEnTexto = combined.match(/\(\s*(X|Twitter|Telegram|TikTok)\s*\)/i)?.[1];
  const red = redEnTexto ? labelPlataforma(redEnTexto) : labelPlataforma(input.plataforma);

  const nMenciones =
    input.nMenciones ??
    Number(
      combined.match(/acumul[oó]\s+(\d+)\s+menciones/i)?.[1] ??
        combined.match(/(\d+)\s+menciones/i)?.[1] ??
        0,
    );

  const umbralRiesgo = combined.match(/score\s*≥\s*(\d+)/i)?.[1];
  const maxRiesgo =
    combined.match(/m[aá]ximo\s+score:\s*(\d+)/i)?.[1] ??
    combined.match(/maximo\s+score:\s*(\d+)/i)?.[1];
  const fechaSemana = combined.match(
    /semana del\s+(\d{4}-\d{2}-\d{2})/i,
  )?.[1];

  const partes: string[] = [];
  partes.push(
    `En ${red}, ${handle} apareció en ${nMenciones || "varias"} publicaciones que el monitoreo marcó como preocupantes`,
  );
  if (umbralRiesgo) {
    partes.push(` (la mayoría con riesgo alto, desde ${umbralRiesgo} de 100)`);
  }
  if (fechaSemana) {
    partes.push(`, sobre todo en la semana del ${formatearFechaIso(fechaSemana)}`);
  }
  partes.push(".");

  if (maxRiesgo) {
    partes.push(` La publicación más grave llegó a ${maxRiesgo} de 100.`);
  }

  if (/medio\s+noticios|medio de comunicaci[oó]n tradicional/i.test(combined)) {
    partes.push(" No parece ser un medio de comunicación tradicional.");
  } else if (/no\s+es\s+cuenta/i.test(combined)) {
    partes.push(" No parece ser un medio de comunicación tradicional.");
  }

  return {
    titulo: `La misma cuenta repite publicaciones graves: ${handle}`,
    descripcion: partes.join("").replace(/\s+/g, " ").trim(),
  };
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
