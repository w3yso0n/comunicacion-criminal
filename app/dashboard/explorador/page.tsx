import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ExploradorClient } from "./explorador-client";

function ExploradorFallback() {
  return (
    <div className="mx-auto max-w-[720px] space-y-3 p-2">
      <Skeleton className="h-8 w-48 bg-zinc-800" />
      <Skeleton className="h-24 w-full bg-zinc-800" />
      <Skeleton className="h-40 w-full bg-zinc-800" />
    </div>
  );
}

export default function ExploradorPage() {
  return (
    <Suspense fallback={<ExploradorFallback />}>
      <ExploradorClient />
    </Suspense>
  );
}
