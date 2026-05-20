"use client";

import { useMemo, useState } from "react";

import { AlertCard } from "@/components/dashboard/alert-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  selectNuevasCount,
  useAlertsStore,
} from "@/lib/stores/alerts-store";
import type { Alerta } from "@/lib/types";
import { cn, formatIntegerEsMx } from "@/lib/utils";

function filtrar(items: Alerta[], tab: string): Alerta[] {
  if (tab === "criticas")
    return items.filter((a) => a.severidad === "critica");
  if (tab === "altas") return items.filter((a) => a.severidad === "alta");
  return items;
}

function StatMini({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-800/80 bg-zinc-900/50 px-3 py-2",
        className,
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-zinc-100">
        {formatIntegerEsMx(value)}
      </p>
    </div>
  );
}

export default function AlertasPage() {
  const items = useAlertsStore((s) => s.items);
  const loading = useAlertsStore((s) => s.loading);
  const error = useAlertsStore((s) => s.error);
  const fetchAlertas = useAlertsStore((s) => s.fetchAlertas);
  const [tab, setTab] = useState("todas");

  const nuevas = useMemo(() => selectNuevasCount(items), [items]);
  const list = useMemo(() => filtrar(items, tab), [items, tab]);

  const resumen = useMemo(
    () => ({
      criticas: items.filter((a) => a.severidad === "critica").length,
      altas: items.filter((a) => a.severidad === "alta").length,
    }),
    [items],
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <header className="shrink-0 space-y-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Alertas</h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              {loading
                ? "Cargando..."
                : "Monitoreo de señales y clusters detectados en tiempo real"}
            </p>
          </div>
          {!loading && !error ? (
            <p className="text-xs text-zinc-500 sm:text-right">
              <span className="font-medium text-zinc-300">
                {formatIntegerEsMx(nuevas)}
              </span>{" "}
              nuevas de{" "}
              <span className="font-medium text-zinc-300">
                {formatIntegerEsMx(items.length)}
              </span>{" "}
              totales
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatMini label="Total" value={items.length} />
          <StatMini
            label="Nuevas"
            value={nuevas}
            className={nuevas > 0 ? "border-sky-900/50 bg-sky-950/20" : undefined}
          />
          <StatMini
            label="Críticas"
            value={resumen.criticas}
            className={
              resumen.criticas > 0 ? "border-red-900/40 bg-red-950/15" : undefined
            }
          />
          <StatMini
            label="Altas"
            value={resumen.altas}
            className={
              resumen.altas > 0 ? "border-amber-900/40 bg-amber-950/15" : undefined
            }
          />
        </div>
      </header>

      {error ? (
        <div className="mb-4 shrink-0 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 border-red-800/60"
            onClick={() => void fetchAlertas()}
          >
            Reintentar
          </Button>
        </div>
      ) : null}

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <TabsList className="grid w-full shrink-0 grid-cols-3 bg-zinc-900">
          <TabsTrigger value="todas">
            Todas
            {!loading ? (
              <span className="ml-1 text-[10px] text-zinc-500">
                ({formatIntegerEsMx(items.length)})
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="criticas">
            Críticas
            {!loading ? (
              <span className="ml-1 text-[10px] text-zinc-500">
                ({formatIntegerEsMx(resumen.criticas)})
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="altas">
            Altas
            {!loading ? (
              <span className="ml-1 text-[10px] text-zinc-500">
                ({formatIntegerEsMx(resumen.altas)})
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/20">
          <TabsContent
            value={tab}
            className="scrollbar-dashboard min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 md:p-4"
          >
            {loading && items.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">
                Cargando alertas...
              </p>
            ) : null}
            {!loading && !error && list.length > 0 ? (
              <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 xl:grid-cols-2">
                {list.map((a) => (
                  <li key={a.id}>
                    <AlertCard alerta={a} />
                  </li>
                ))}
              </ul>
            ) : null}
            {!loading && !error && list.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">
                No hay alertas en esta vista.
              </p>
            ) : null}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
