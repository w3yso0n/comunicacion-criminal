"use client";

import { useEffect } from "react";

import { useAlertsStore } from "@/lib/stores/alerts-store";

export function AlertsHydrator() {
  const fetchAlertas = useAlertsStore((s) => s.fetchAlertas);
  const fetched = useAlertsStore((s) => s.fetched);

  useEffect(() => {
    if (!fetched) {
      void fetchAlertas();
    }
  }, [fetchAlertas, fetched]);

  return null;
}
