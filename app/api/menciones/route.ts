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
  const offsetRaw = searchParams.get("offset");
  const limit = limitRaw ? Math.min(Number.parseInt(limitRaw, 10) || 50, 200) : 50;
  const offset = offsetRaw ? Math.max(Number.parseInt(offsetRaw, 10) || 0, 0) : 0;

  const clusterId = searchParams.get("clusterId") ?? undefined;
  const municipio = searchParams.get("municipio") ?? undefined;
  const plataforma = searchParams.get("plataforma") ?? undefined;
  const zona = searchParams.get("zona") ?? undefined;
  const subTipo = searchParams.get("subTipo") ?? undefined;
  const nivelRiesgo = searchParams.get("nivelRiesgo") ?? undefined;
  const grupoCriminal = searchParams.get("grupoCriminal") ?? undefined;

  try {
    const data = await listarMenciones({
      limit,
      offset,
      clusterId,
      municipio,
      plataforma,
      zona,
      subTipo,
      nivelRiesgo,
      grupoCriminal,
    });
    return NextResponse.json({ ok: true, data, hasMore: data.length === limit });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al consultar menciones.";

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
