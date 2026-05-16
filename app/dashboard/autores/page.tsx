"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";

function AutoresRedirectInner() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/fuentes");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-zinc-500">
      <Skeleton className="h-8 w-48 bg-zinc-800" />
      <p className="text-xs">Redirigiendo a fuentes…</p>
    </div>
  );
}

function AutoresFallback() {
  return (
    <div className="mx-auto max-w-md space-y-3 p-4">
      <Skeleton className="h-8 w-full bg-zinc-800" />
      <Skeleton className="h-4 w-2/3 bg-zinc-800" />
    </div>
  );
}

export default function AutoresPage() {
  return (
    <Suspense fallback={<AutoresFallback />}>
      <AutoresRedirectInner />
    </Suspense>
  );
}
