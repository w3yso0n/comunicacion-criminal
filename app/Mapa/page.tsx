import { Suspense } from "react";
import { MapaClient } from "./mapa-client";

export default function MapaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center">
          <p className="text-sm text-zinc-500">Cargando mapa...</p>
        </div>
      }
    >
      <MapaClient />
    </Suspense>
  );
}
