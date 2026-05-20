"use client";

import { AlertsHydrator } from "@/components/dashboard/alerts-hydrator";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-zinc-950 text-zinc-50">
      <AlertsHydrator />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-zinc-950 p-4 md:p-6">
          {children}
        </main>
        <footer className="shrink-0 border-t border-zinc-800 px-4 py-2 text-center text-[10px] text-zinc-600">
          Contenido demostrativo. El análisis discursivo no implica causalidad ni sustituye
          investigación oficial.
        </footer>
      </div>
    </div>
  );
}
