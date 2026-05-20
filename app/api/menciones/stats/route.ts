import { NextResponse } from "next/server";
import { getMencionesStats } from "@/lib/db/menciones-stats";

export async function GET() {
  try {
    const data = await getMencionesStats();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
