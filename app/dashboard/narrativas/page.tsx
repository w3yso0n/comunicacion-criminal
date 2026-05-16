import { CategoriaDonut } from "@/components/dashboard/categoria-donut";
import { CategoriaTablaDetalle } from "@/components/dashboard/categoria-tabla-detalle";
import { ChartErrorBoundary } from "@/components/dashboard/chart-error-boundary";
import { RadarNarrativas } from "@/components/dashboard/radar-narrativas";

export default function NarrativasPage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-100">Narrativas criminales</h1>
        <p className="text-xs text-zinc-500">
          Intensidad por narrativa y distribución por tipo de contenido.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartErrorBoundary title="Radar de narrativas">
          <RadarNarrativas />
        </ChartErrorBoundary>
        <div className="space-y-4">
          <ChartErrorBoundary title="Clasificación de contenido">
            <CategoriaDonut />
          </ChartErrorBoundary>
          <CategoriaTablaDetalle />
        </div>
      </div>
    </div>
  );
}
