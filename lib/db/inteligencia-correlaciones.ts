import type { InteligenciaContextSnapshot } from "@/lib/db/inteligencia-context";
import type { CorrelacionComunicacionHecho } from "@/lib/inteligencia-schema";
import {
  formatearHandle,
  humanizarAutorReincidente,
  labelPlataforma,
  limpiarTextoCorrelacion,
} from "@/lib/texto-lectura";

type AlertaCtx = InteligenciaContextSnapshot["alertas"][number];

function toConfianzaPct(score: number | null | undefined): number {
  if (score == null || Number.isNaN(score)) return 50;
  if (score <= 1) return Math.round(score * 100);
  return Math.min(100, Math.round(score));
}

function labelTipoHallazgo(tipo: string): string {
  const t = tipo
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (t.includes("correlacion_accion") || t.includes("accion_hecho")) {
    return "Publicaciones y un hecho reportado";
  }
  if (t.includes("correlacion")) return "Coincidencia en el tiempo";
  if (t.includes("coincidencia_territorial") || t.includes("territorial")) {
    return "Actividad en la misma zona";
  }
  if (t.includes("pico")) return "Subida repentina de mensajes";
  if (t.includes("narrativa")) return "Cambio en el tipo de mensajes";
  if (t.includes("autor")) return "Misma cuenta, muchas veces";
  return "Patrón detectado en el monitoreo";
}

function tieneCruceTemporalExplicito(texto: string): boolean {
  return /±\s*72|ventana de|amenaza.*hecho|hecho.*amenaza/i.test(texto);
}

function alcanceEtiqueta(a: AlertaCtx): string {
  const raw = `${a.titulo} ${a.descripcion}`;
  if (tieneCruceTemporalExplicito(raw)) {
    return "Cruce con margen de ~3 días alrededor del hecho reportado";
  }
  return "Del conjunto de menciones más relevantes del monitoreo";
}

function zonaLegible(a: AlertaCtx): string {
  const partes = [a.municipio, a.estado].filter(Boolean);
  if (partes.length > 0) return partes.join(", ");
  if (a.grupoCriminal?.trim()) return `Vinculado a ${a.grupoCriminal.trim()}`;
  return "Zona no indicada en el registro";
}

function extraerHandle(texto: string): string | null {
  const m = texto.match(/@[\w.]+/i);
  return m ? formatearHandle(m[0]) : null;
}

function tituloDesdeAlerta(a: AlertaCtx): string {
  const humanizado = humanizarAutorReincidente({
    titulo: a.titulo,
    descripcion: a.descripcion,
    plataforma: a.plataforma,
    nMenciones: a.nMenciones,
  });
  if (humanizado) return humanizado.titulo;
  const t = limpiarTextoCorrelacion(a.titulo);
  if (t.length > 8) return t;
  return labelTipoHallazgo(a.tipo);
}

function resumenAutorReincidente(a: AlertaCtx): string {
  const humanizado = humanizarAutorReincidente({
    titulo: a.titulo,
    descripcion: a.descripcion,
    plataforma: a.plataforma,
    nMenciones: a.nMenciones,
  });
  if (humanizado) return humanizado.descripcion;

  const handle = extraerHandle(`${a.titulo} ${a.descripcion}`) ?? "Una cuenta";
  const red = labelPlataforma(a.plataforma);
  const base = limpiarTextoCorrelacion(a.descripcion);
  const n = a.nMenciones ?? 0;

  if (base.length > 20) {
    const extra =
      n > 0 && !/publicacion/i.test(base)
        ? ` En el análisis aparecen ${n} publicaciones vinculadas.`
        : "";
    return `${handle} en ${red}: ${base}${extra}`;
  }

  return `${handle} en ${red} concentra muchas publicaciones con riesgo alto en el monitoreo. Conviene revisar si es la misma voz repitiendo el mismo mensaje.`;
}

function resumenCorrelacionClasica(a: AlertaCtx): string {
  const desc = limpiarTextoCorrelacion(a.descripcion);
  const n = a.nMenciones ?? 0;
  const grupo = a.grupoCriminal?.trim();
  const zona = zonaLegible(a);

  if (desc.length > 30) {
    let out = desc;
    if (n > 0 && !/publicacion|mencion/i.test(out)) {
      out += ` En este patrón participan ${n} publicaciones del monitoreo.`;
    }
    if (grupo && !out.includes(grupo)) {
      out += ` Se asocia al grupo «${grupo}».`;
    }
    return out;
  }

  const tipo = labelTipoHallazgo(a.tipo).toLowerCase();
  return `Se detectó ${tipo} en ${zona}.${n > 0 ? ` Participan ${n} publicaciones del monitoreo.` : ""}${grupo ? ` Contexto: ${grupo}.` : ""}`;
}

function correlacionDesdeAlerta(
  ctx: InteligenciaContextSnapshot,
  a: AlertaCtx,
): CorrelacionComunicacionHecho {
  const tipoNorm = a.tipo.toLowerCase();
  const esAutor =
    tipoNorm.includes("autor") ||
    /reincidente|misma cuenta|acumuló/i.test(`${a.titulo} ${a.descripcion}`);

  return {
    id: `corr-alerta-${a.id}`,
    titulo: tituloDesdeAlerta(a),
    resumen: esAutor ? resumenAutorReincidente(a) : resumenCorrelacionClasica(a),
    indiceConfianza: toConfianzaPct(a.scoreConfianza),
    publicacionesEnVentana: Math.max(0, a.nMenciones ?? 0),
    hechoTipo: labelTipoHallazgo(a.tipo),
    zona: zonaLegible(a),
    alcanceEtiqueta: alcanceEtiqueta(a),
  };
}

function prioridadAlerta(a: AlertaCtx): number {
  const t = a.tipo.toLowerCase();
  if (t.includes("correlacion")) return 0;
  if (t.includes("coincidencia") || t.includes("territorial")) return 1;
  if (t.includes("pico") || t.includes("narrativa")) return 2;
  if (t.includes("autor")) return 3;
  return 4;
}

/**
 * Patrones legibles a partir de alertas del top de menciones (no implica filtro 24h).
 */
export function buildCorrelacionesLegibles(
  ctx: InteligenciaContextSnapshot,
): CorrelacionComunicacionHecho[] {
  const ordenadas = [...ctx.alertas].sort(
    (a, b) => prioridadAlerta(a) - prioridadAlerta(b),
  );

  const out: CorrelacionComunicacionHecho[] = [];
  const vistos = new Set<string>();

  for (const a of ordenadas) {
    const c = correlacionDesdeAlerta(ctx, a);
    if (vistos.has(c.id)) continue;
    vistos.add(c.id);
    out.push(c);
    if (out.length >= 6) break;
  }

  return out;
}
