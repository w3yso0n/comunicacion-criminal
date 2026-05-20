import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { ExploradorClient } from "./explorador-client";

export default function ExploradorPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[720px] space-y-4 p-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <ExploradorClient />
    </Suspense>
  );
}
