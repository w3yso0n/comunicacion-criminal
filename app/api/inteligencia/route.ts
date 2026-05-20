import { NextResponse } from "next/server";

import { loadInteligenciaCached } from "@/lib/inteligencia-analyze";

function isConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("econnrefused") || msg.includes("connection") || msg.includes("timeout");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") ?? "todas";
  const periodo = searchParams.get("periodo") ?? "7d";

  try {
    const result = await loadInteligenciaCached({ region, periodo });
    return NextResponse.json({
      ok: result.ok,
      source: result.source,
      cached: result.cached,
      dataHash: result.dataHash,
      fuenteDatos: result.fuenteDatos,
      mencionesCount: result.mencionesCount,
      alertasCount: result.alertasCount,
      mencionesEnPeriodo: result.mencionesEnPeriodo,
      alertasEnPeriodo: result.alertasEnPeriodo,
      message: result.message,
      data: result.data,
    });
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
