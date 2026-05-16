import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { InteligenciaClient } from "./inteligencia-client";

function InteligenciaFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <Skeleton className="h-10 w-72 bg-zinc-800" />
      <Skeleton className="h-6 w-full max-w-xl bg-zinc-800" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64 bg-zinc-800" />
        <Skeleton className="h-64 bg-zinc-800" />
      </div>
      <Skeleton className="h-48 w-full bg-zinc-800" />
    </div>
  );
}

export default function InteligenciaPage() {
  return (
    <Suspense fallback={<InteligenciaFallback />}>
      <InteligenciaClient />
    </Suspense>
  );
}
