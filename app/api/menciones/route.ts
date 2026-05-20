import { NextResponse } from "next/server";

import { listarMenciones } from "@/lib/db/menciones";

function isConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("econnrefused") ||
    msg.includes("failed to connect") ||
    msg.includes("connection") ||
    msg.includes("timeout") ||
    msg.includes("enotfound")
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitRaw = searchParams.get("limit");
  const clusterId = searchParams.get("clusterId") ?? undefined;

  const parsedLimit = limitRaw != null ? Number.parseInt(limitRaw, 10) : 100;
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : 100;

  try {
    const data = await listarMenciones({ limit, clusterId });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error desconocido al consultar menciones.";

    if (isConnectionError(err)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No se pudo conectar a la base de datos. Verifica que el túnel SSH esté activo (127.0.0.1:14330).",
          detail: message,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Error al cargar menciones.", detail: message },
      { status: 500 },
    );
  }
}
