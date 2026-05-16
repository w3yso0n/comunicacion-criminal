import { redirect } from "next/navigation";

/** Ruta histórica: las denuncias viven en `/Explorador`. */
export default async function LegacyDashboardExploradorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  const fuente = sp.fuente;
  const autor = sp.autor;
  if (typeof fuente === "string" && fuente.length > 0) {
    q.set("fuente", fuente);
  } else if (typeof autor === "string" && autor.length > 0) {
    q.set("fuente", autor);
  }
  const suffix = q.size > 0 ? `?${q.toString()}` : "";
  redirect(`/Explorador${suffix}`);
}
