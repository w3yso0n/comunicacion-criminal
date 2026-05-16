"use client";

import { useMemo, useState } from "react";

import { AlertCard } from "@/components/dashboard/alert-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { selectUnreadCount, useAlertsStore } from "@/lib/stores/alerts-store";
import type { Alerta } from "@/lib/types";
import { formatIntegerEsMx } from "@/lib/utils";

function filtrar(items: Alerta[], tab: string): Alerta[] {
  const base = items.filter((a) => !a.descartada);
  if (tab === "criticas")
    return base.filter((a) => a.severidad === "critica");
  if (tab === "altas") return base.filter((a) => a.severidad === "alta");
  if (tab === "leidas") return base.filter((a) => a.leida);
  return base;
}

export default function AlertasPage() {
  const items = useAlertsStore((s) => s.items);
  const markAllRead = useAlertsStore((s) => s.markAllRead);
  const [tab, setTab] = useState("todas");

  const unread = useMemo(() => selectUnreadCount(items), [items]);
  const list = useMemo(() => filtrar(items, tab), [items, tab]);

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Alertas</h1>
          <p className="text-xs text-zinc-500">
            {formatIntegerEsMx(unread)} no leídas
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-zinc-700"
          onClick={() => markAllRead()}
        >
          Marcar todas como leídas
        </Button>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4 bg-zinc-900">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="criticas">Críticas</TabsTrigger>
          <TabsTrigger value="altas">Altas</TabsTrigger>
          <TabsTrigger value="leidas">Leídas</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4 space-y-3">
          {list.map((a) => (
            <AlertCard key={a.id} alerta={a} />
          ))}
          {list.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No hay alertas en esta vista.
            </p>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
