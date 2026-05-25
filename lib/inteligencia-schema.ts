import { z } from "zod";

const severidadSenal = z.enum(["alta", "media", "baja"]);
const tendencia = z.enum(["sube", "baja", "estable"]);
const fuenteModelo = z.enum(["deepseek"]);

const narrativaGrupo = z.object({
  grupoId: z.string(),
  grupoNombre: z.string(),
  /** Ubicación principal detectada en BD (estado, municipio o zona). */
  estado: z.string(),
  resumenNarrativa: z.string(),
  vectoresNarrativos: z.array(z.string()),
  actualizadoEn: z.string(),
  confianzaPct: z.number().min(0).max(100),
  fuenteModelo,
});

const senalEscalada = z.object({
  id: z.string(),
  titulo: z.string(),
  descripcion: z.string(),
  confianzaPct: z.number().min(0).max(100),
  severidad: severidadSenal,
  grupoId: z.string().optional(),
  zona: z.string().optional(),
  periodoEtiqueta: z.string(),
});

const correlacion = z.object({
  id: z.string(),
  /** Encabezado corto en lenguaje claro (ej. «Autor reincidente: @cuenta»). */
  titulo: z.string().optional(),
  resumen: z.string(),
  indiceConfianza: z.number().min(0).max(100),
  publicacionesEnVentana: z.number().int().nonnegative(),
  hechoTipo: z.string(),
  zona: z.string(),
  /** Texto fijo de alcance (sin ventanas 24h/48h salvo cruce ±72h explícito en la alerta). */
  alcanceEtiqueta: z.string().optional(),
  ventanaHoras: z.number().int().nonnegative().optional(),
});

const zonaTension = z.object({
  /** Región oficial Edomex (ej. Región 4: Nezahualcóyotl). */
  zona: z.string(),
  /** Zona macro (ej. Zona I Oriente). */
  zonaMacro: z.string().optional(),
  intensidad0_100: z.number().min(0).max(100),
  tendencia,
  notaCorta: z.string(),
});

const tendenciaSerie = z.object({
  id: z.string(),
  etiqueta: z.string(),
  valores: z.array(z.number()).length(7),
});

export const inteligenciaPayloadSchema = z.object({
  generadoEn: z.string(),
  modelo: z.string(),
  narrativasPorGrupo: z.array(narrativaGrupo),
  senalesEscalada: z.array(senalEscalada),
  correlaciones: z.array(correlacion),
  zonasTension: z.array(zonaTension),
  tendenciasEjeTemporal: z.array(z.string()).length(7),
  tendenciasPorGrupo: z.array(tendenciaSerie),
  tendenciasPorZona: z.array(tendenciaSerie),
});

export type NarrativaGrupoActiva = z.infer<typeof narrativaGrupo>;
export type SenalEscalada = z.infer<typeof senalEscalada>;
export type CorrelacionComunicacionHecho = z.infer<typeof correlacion>;
export type ZonaTension = z.infer<typeof zonaTension>;
export type TendenciaSerie = z.infer<typeof tendenciaSerie>;
export type InteligenciaIAPayload = z.infer<typeof inteligenciaPayloadSchema>;
