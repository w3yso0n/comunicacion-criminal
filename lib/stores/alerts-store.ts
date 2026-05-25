import { create } from "zustand";

import type { Alerta } from "@/lib/types";
import { esAlertaAltoRiesgo } from "@/lib/nivel-riesgo";

type AlertsState = {
  items: Alerta[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetchAlertas: () => Promise<void>;
};

export const useAlertsStore = create<AlertsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  fetched: false,
  fetchAlertas: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/alertas");
      const json = (await res.json()) as {
        ok: boolean;
        data?: Alerta[];
        error?: string;
      };
      if (!res.ok || !json.ok || !json.data) {
        throw new Error(json.error ?? "No se pudieron cargar las alertas.");
      }
      set({ items: json.data, loading: false, fetched: true, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar alertas.";
      set({ loading: false, error: message, fetched: true });
    }
  },
}));

export function isAlertaNueva(alerta: Alerta): boolean {
  return alerta.estado?.trim().toLowerCase() === "nueva";
}

export function selectNuevasCount(items: Alerta[]): number {
  return items.filter(isAlertaNueva).length;
}

export function selectNuevasAltoRiesgo(items: Alerta[]): Alerta[] {
  return items.filter(
    (a) => esAlertaAltoRiesgo(a.severidad) && isAlertaNueva(a),
  );
}

/** @deprecated Usar selectNuevasAltoRiesgo */
export function selectNuevasCriticas(items: Alerta[]): Alerta[] {
  return selectNuevasAltoRiesgo(items);
}
