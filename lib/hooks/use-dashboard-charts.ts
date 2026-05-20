"use client";

import { useEffect, useState } from "react";

import type { DashboardChartsData } from "@/lib/db/dashboard-charts";

let inflight: Promise<DashboardChartsData | null> | null = null;

function fetchDashboardCharts(): Promise<DashboardChartsData | null> {
  if (!inflight) {
    inflight = fetch("/api/dashboard/charts")
      .then((r) => r.json())
      .then((json: { ok: boolean; data?: DashboardChartsData }) =>
        json.ok && json.data ? json.data : null,
      )
      .catch(() => null);
  }
  return inflight;
}

export function useDashboardCharts() {
  const [data, setData] = useState<DashboardChartsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardCharts()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
