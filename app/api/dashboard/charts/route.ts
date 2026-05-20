import { NextResponse } from "next/server";

import { getDashboardCharts } from "@/lib/db/dashboard-charts";

function isConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("econnrefused") || msg.includes("connection") || msg.includes("timeout");
}

export async function GET() {
  try {
    const data = await getDashboardCharts();
    return NextResponse.json({ ok: true, data });
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
