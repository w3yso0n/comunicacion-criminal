"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";

import { MencionCard } from "@/components/dashboard/mencion-card";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import type { Mencion } from "@/lib/types";
import { cn, formatIntegerEsMx } from "@/lib/utils";

const PAGE_SIZE = 50;

export function FuenteHistorialClient({ handle }: { handle: string }) {
  const [menciones, setMenciones] = useState<Mencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      const params = new URLSearchParams({
        handle,
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      const res = await fetch(`/api/menciones?${params}`);
      const json = (await res.json()) as {
        ok: boolean;
        data?: Mencion[];
        hasMore?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.data) {
        throw new Error(json.error ?? "No se pudieron cargar las menciones.");
      }
      setMenciones((prev) => (append ? [...prev, ...json.data!] : json.data!));
      setHasMore(Boolean(json.hasMore));
    },
    [handle],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchPage(0, false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error al cargar menciones.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    setError(null);
    try {
      await fetchPage(menciones.length, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar más.");
    } finally {
      setLoadingMore(false);
    }
  };

  const displayHandle = handle.startsWith("@") ? handle : `@${handle}`;

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
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
          Menciones · {displayHandle}
        </h1>
        <p className="text-xs text-zinc-500">
          {loading
            ? "Cargando…"
            : `${formatIntegerEsMx(menciones.length)} menciones cargadas`}
        </p>
      </header>

      {error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12 text-zinc-500">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : menciones.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay menciones para esta cuenta.</p>
      ) : (
        <div className="space-y-4">
          {menciones.map((m, index) => (
            <MencionCard key={m.id} mencion={m} index={index} />
          ))}
        </div>
      )}

      {hasMore && !loading ? (
        <div className="flex justify-center pb-6">
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-800"
            disabled={loadingMore}
            onClick={() => void loadMore()}
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Cargando…
              </>
            ) : (
              "Cargar más"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
