import { NextResponse } from "next/server";
import { getFuentesStats, listarFuentes } from "@/lib/db/fuentes";

function isConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("econnrefused") || msg.includes("connection") || msg.includes("timeout");
}

export async function GET() {
  try {
    const [fuentes, stats] = await Promise.all([listarFuentes(), getFuentesStats()]);
    return NextResponse.json({ ok: true, fuentes, stats });
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
