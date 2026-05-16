import { NextResponse } from "next/server";

import {
  INTELIGENCIA_SYSTEM_PROMPT,
  buildInteligenciaUserPrompt,
} from "@/lib/inteligencia-prompts";
import { inteligenciaPayloadSchema } from "@/lib/inteligencia-schema";
import { mockInteligenciaPayload } from "@/lib/mock-inteligencia";

function parseJsonFromLlmContent(content: string): unknown {
  const trimmed = content.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence?.[1]?.trim() ?? trimmed;
  return JSON.parse(raw) as unknown;
}

export async function POST(req: Request) {
  let region = "todas";
  let periodo = "7d";
  try {
    const body = (await req.json()) as { region?: string; periodo?: string };
    if (typeof body.region === "string") region = body.region;
    if (typeof body.periodo === "string") periodo = body.periodo;
  } catch {
    /* vacío → defaults */
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      source: "mock" as const,
      message: "Sin DEEPSEEK_API_KEY: se devuelve payload demo.",
      data: mockInteligenciaPayload,
    });
  }

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.2,
        messages: [
          { role: "system", content: INTELIGENCIA_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildInteligenciaUserPrompt({ region, periodo }),
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`DeepSeek HTTP ${res.status}: ${errText.slice(0, 500)}`);
    }

    const raw = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = raw.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Respuesta DeepSeek sin contenido de mensaje.");
    }

    const parsedJson = parseJsonFromLlmContent(content);
    const parsed = inteligenciaPayloadSchema.safeParse(parsedJson);
    if (!parsed.success) {
      throw new Error(
        `JSON inválido frente al esquema: ${parsed.error.flatten().fieldErrors}`,
      );
    }

    return NextResponse.json({
      ok: true,
      source: "deepseek" as const,
      data: parsed.data,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        source: "mock-fallback" as const,
        message,
        data: mockInteligenciaPayload,
      },
      { status: 200 },
    );
  }
}
