import { redirect } from "next/navigation";

import { FuenteHistorialClient } from "./historial-client";

type Props = {
  searchParams: Promise<{ handle?: string | string[]; id?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default async function FuenteHistorialPage({ searchParams }: Props) {
  const sp = await searchParams;
  const handleRaw = firstParam(sp.handle) ?? firstParam(sp.id);

  if (!handleRaw?.trim()) {
    redirect("/dashboard/fuentes");
  }

  const handle = decodeURIComponent(handleRaw.trim());

  return <FuenteHistorialClient handle={handle} />;
}
