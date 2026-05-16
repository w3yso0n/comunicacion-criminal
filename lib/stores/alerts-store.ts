import { create } from "zustand";

import { alertas as alertasIniciales } from "@/lib/mock-data";
import type { Alerta } from "@/lib/types";

type AlertsState = {
  items: Alerta[];
  markAllRead: () => void;
  markRead: (id: string) => void;
  discard: (id: string) => void;
};

function cloneAlertas(): Alerta[] {
  return alertasIniciales.map((a) => ({ ...a }));
}

export const useAlertsStore = create<AlertsState>((set) => ({
  items: cloneAlertas(),
  markAllRead: () =>
    set((s) => ({
      items: s.items.map((a) => ({ ...a, leida: true })),
    })),
  markRead: (id) =>
    set((s) => ({
      items: s.items.map((a) => (a.id === id ? { ...a, leida: true } : a)),
    })),
  discard: (id) =>
    set((s) => ({
      items: s.items.map((a) =>
        a.id === id ? { ...a, descartada: true } : a,
      ),
    })),
}));

export function selectUnreadCount(items: Alerta[]): number {
  return items.filter((a) => !a.leida && !a.descartada).length;
}

export function selectUnreadCriticas(items: Alerta[]): Alerta[] {
  return items.filter(
    (a) => a.severidad === "critica" && !a.leida && !a.descartada,
  );
}
