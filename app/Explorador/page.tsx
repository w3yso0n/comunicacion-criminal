import { PublicacionCard } from "@/components/dashboard/publicacion-card";
import { publicaciones } from "@/lib/mock-data";

export default function ExploradorPage() {
  const ordenadas = [...publicaciones].sort(
    (a, b) =>
      new Date(b.publicadoEn).getTime() - new Date(a.publicadoEn).getTime(),
  );

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-100">Explorador</h1>
        <p className="text-xs text-zinc-500">
          Denuncias detectadas en el dataset de demostración. Cada tarjeta refleja los
          campos almacenados en la publicación (texto, entidades, métricas y correlación
          opcional con hechos del mock).
        </p>
      </header>

      <div className="space-y-4">
        {ordenadas.map((pub, index) => (
          <PublicacionCard key={pub.id} pub={pub} index={index} />
        ))}
      </div>
    </div>
  );
}
