import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { ExploradorClient } from "./explorador-client";

export default function ExploradorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-0 w-full flex-1 flex-col">
          <div className="shrink-0 space-y-4 pb-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/20 p-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="mt-3 h-32 w-full" />
          </div>
        </div>
      }
    >
      <ExploradorClient />
    </Suspense>
  );
}
