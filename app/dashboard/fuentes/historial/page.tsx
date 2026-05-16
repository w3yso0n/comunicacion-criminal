import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { PublicacionCard } from "@/components/dashboard/publicacion-card";
import { buttonVariants } from "@/components/ui/button";
import {
  getAutorById,
  getPublicacionesByAutorId,
} from "@/lib/mock-data";
import { cn, formatIntegerEsMx } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ id?: string | string[] }>;
};

export default async function FuenteHistorialPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.id;
  const id = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

  if (!id) {
    redirect("/dashboard/fuentes");
  }

  const autor = getAutorById(id);
  if (!autor) {
    redirect("/dashboard/fuentes");
  }

  const lista = [...getPublicacionesByAutorId(id)].sort(
    (a, b) =>
      new Date(b.publicadoEn).getTime() - new Date(a.publicadoEn).getTime(),
  );

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <header className="space-y-1">
          <Link
            href="/dashboard/fuentes"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 inline-flex h-8 items-center gap-1 px-2 text-zinc-400",
            )}
          >
            <ChevronLeft className="size-4" />
            Fuentes
          </Link>
          <h1 className="text-lg font-semibold text-zinc-100">
            Publicaciones · {autor.handle}
          </h1>
          <p className="text-xs text-zinc-500">
            {formatIntegerEsMx(lista.length)} publicaciones en el dataset de demostración,
            mismos datos que en la tabla expandible de Fuentes.
          </p>
        </header>
      </div>

      <div className="space-y-4">
        {lista.map((pub, index) => (
          <PublicacionCard key={pub.id} pub={pub} index={index} />
        ))}
      </div>
    </div>
  );
}
