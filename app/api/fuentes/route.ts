import { NextResponse } from "next/server";

import { getFuentesStats, listarFuentes } from "@/lib/db/fuentes";
import { normalizarPerspectivaAutor } from "@/lib/perspectiva-autor";

function isConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("econnrefused") || msg.includes("connection") || msg.includes("timeout");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const perspectivaRaw = searchParams.get("perspectiva");
  const perspectiva = perspectivaRaw
    ? normalizarPerspectivaAutor(perspectivaRaw) ?? undefined
    : undefined;

  if (perspectivaRaw && !perspectiva) {
    return NextResponse.json(
      { ok: false, error: "perspectiva inválida. Use: informativo, ciudadano o criminal." },
      { status: 400 },
    );
  }

  try {
    const opts = perspectiva ? { perspectiva } : {};
    const [fuentes, stats] = await Promise.all([
      listarFuentes(opts),
      getFuentesStats(opts),
    ]);
    return NextResponse.json({ ok: true, fuentes, stats, perspectiva: perspectiva ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido.";
    if (isConnectionError(err)) {
      return NextResponse.json(
        { ok: false, error: "No se pudo conectar a la base de datos." },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
