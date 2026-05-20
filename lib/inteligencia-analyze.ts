import { chatJsonCompletion, isDeepSeekConfigured } from "@/lib/deepseek-client";
import { getCachedInteligencia, saveInteligenciaCache } from "@/lib/db/inteligencia-cache";
import {
  getInteligenciaContext,
  INTELIGENCIA_PERIODO_CACHE,
  type InteligenciaContextSnapshot,
} from "@/lib/db/inteligencia-context";
import {
  buildCatalogoGrupos,
  buildNarrativasDesdeCatalogo,
  buildNarrativasDesdeSeleccionLlm,
  buildPayloadDesdeContexto,
  reconciliarPayloadConContexto,
} from "@/lib/db/inteligencia-payload";
import {
  INTELIGENCIA_SYSTEM_PROMPT,
  buildNarrativasUserPrompt,
} from "@/lib/inteligencia-prompts";
import { narrativasLlmSchema } from "@/lib/inteligencia-narrativas-schema";
import { emptyInteligenciaPayload } from "@/lib/inteligencia-empty";
import { inteligenciaPayloadSchema } from "@/lib/inteligencia-schema";
import type { InteligenciaIAPayload } from "@/lib/inteligencia-schema";

function parseJsonFromLlmContent(content: string): unknown {
  const trimmed = content.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence?.[1]?.trim() ?? trimmed;
  return JSON.parse(raw) as unknown;
}

export type AnalyzeInteligenciaResult = {
  ok: boolean;
  source: "cache" | "deepseek" | "error";
  message?: string;
  cached?: boolean;
  dataHash?: string;
  fuenteDatos?: InteligenciaContextSnapshot["fuenteDatos"];
  mencionesCount?: number;
  alertasCount?: number;
  mencionesEnPeriodo?: number;
  alertasEnPeriodo?: number;
  data: InteligenciaIAPayload;
};

function metaDesdeContexto(ctx: InteligenciaContextSnapshot) {
  return {
    fuenteDatos: ctx.fuenteDatos,
    mencionesCount: ctx.mencionesCount,
    alertasCount: ctx.alertasCount,
    mencionesEnPeriodo: ctx.mencionesEnPeriodo,
    alertasEnPeriodo: ctx.alertasEnPeriodo,
  };
}

export async function analyzeInteligencia(options: {
  region: string;
  /** Ignorado: siempre se usa top global de menciones. */
  periodo?: string;
  force?: boolean;
}): Promise<AnalyzeInteligenciaResult> {
  const { region, force = false } = options;
  const context = await getInteligenciaContext({ region });
  const meta = metaDesdeContexto(context);

  if (!force) {
    const cached = await getCachedInteligencia(
      region,
      INTELIGENCIA_PERIODO_CACHE,
      context.dataHash,
    );
    if (cached) {
      const data = reconciliarPayloadConContexto(cached.payload, context);
      return {
        ok: true,
        source: "cache",
        cached: true,
        dataHash: context.dataHash,
        ...meta,
        data,
      };
    }
  }

  const sinDatos =
    context.menciones.length === 0 && context.alertas.length === 0;

  if (sinDatos) {
    return {
      ok: false,
      source: "error",
      message: "No hay menciones ni alertas en la base para los filtros actuales.",
      dataHash: context.dataHash,
      mencionesCount: 0,
      alertasCount: 0,
      data: emptyInteligenciaPayload(),
    };
  }

  try {
    const catalogo = buildCatalogoGrupos(context);
    let data = buildPayloadDesdeContexto(context, "deepseek-chat");

    if (isDeepSeekConfigured() && catalogo.length > 0) {
      const { content, model } = await chatJsonCompletion(
        INTELIGENCIA_SYSTEM_PROMPT,
        buildNarrativasUserPrompt(context, catalogo),
      );
      data.modelo = model;
      const parsedJson = parseJsonFromLlmContent(content);
      const parsed = narrativasLlmSchema.safeParse(parsedJson);
      if (parsed.success) {
        data.narrativasPorGrupo = buildNarrativasDesdeSeleccionLlm(
          context,
          catalogo,
          parsed.data.narrativasPorGrupo,
        );
      } else {
        data.narrativasPorGrupo = buildNarrativasDesdeCatalogo(context, catalogo);
      }
    } else if (catalogo.length > 0) {
      data.narrativasPorGrupo = buildNarrativasDesdeCatalogo(context, catalogo);
    }

    const validado = inteligenciaPayloadSchema.safeParse(data);
    if (!validado.success) {
      throw new Error("El informe generado no cumple el esquema interno.");
    }
    data = validado.data;

    try {
      await saveInteligenciaCache({
        region,
        periodo: INTELIGENCIA_PERIODO_CACHE,
        dataHash: context.dataHash,
        modelo: data.modelo,
        payload: data,
        mencionesCount: context.mencionesCount,
        alertasCount: context.alertasCount,
      });
    } catch (cacheErr) {
      console.warn("[inteligencia] No se pudo guardar caché:", cacheErr);
    }

    return {
      ok: true,
      source: isDeepSeekConfigured() ? "deepseek" : "cache",
      cached: false,
      dataHash: context.dataHash,
      ...meta,
      data,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      source: "error",
      message,
      dataHash: context.dataHash,
      ...meta,
      data: reconciliarPayloadConContexto(
        buildPayloadDesdeContexto(context, "—"),
        context,
      ),
    };
  }
}

export async function loadInteligenciaCached(options: {
  region: string;
  /** Ignorado: siempre top global. */
  periodo?: string;
}): Promise<AnalyzeInteligenciaResult> {
  const context = await getInteligenciaContext({ region: options.region });
  const meta = metaDesdeContexto(context);
  const cached = await getCachedInteligencia(
    options.region,
    INTELIGENCIA_PERIODO_CACHE,
    context.dataHash,
  );

  if (cached) {
    return {
      ok: true,
      source: "cache",
      cached: true,
      dataHash: context.dataHash,
      ...meta,
      data: reconciliarPayloadConContexto(cached.payload, context),
    };
  }

  const hayDatos = context.menciones.length > 0 || context.alertas.length > 0;

  return {
    ok: true,
    source: "cache",
    cached: false,
    dataHash: context.dataHash,
    ...meta,
    data: hayDatos
      ? buildPayloadDesdeContexto(context, "—")
      : emptyInteligenciaPayload(),
  };
}
