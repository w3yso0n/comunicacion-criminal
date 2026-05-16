"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RegionFiltro } from "@/lib/types";
import {
  useDashboardFiltersStore,
  type DateRangePreset,
} from "@/lib/stores/dashboard-filters-store";

const regiones: { value: RegionFiltro; label: string }[] = [
  { value: "todas", label: "Todas las regiones" },
  { value: "Jalisco", label: "Jalisco" },
  { value: "Sinaloa", label: "Sinaloa" },
  { value: "Guanajuato", label: "Guanajuato" },
  { value: "Michoacán", label: "Michoacán" },
  { value: "Tamaulipas", label: "Tamaulipas" },
];

const presets: { value: DateRangePreset; label: string }[] = [
  { value: "24h", label: "Últimas 24 h" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
];

function onSelectString(setter: (v: string) => void) {
  return (value: string | null) => {
    if (value !== null) setter(value);
  };
}

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  narrativas: "Narrativas",
  autores: "Autores",
  correlacion: "Correlación",
  explorador: "Explorador IA",
  alertas: "Alertas",
};

export function Topbar() {
  const pathname = usePathname();
  const region = useDashboardFiltersStore((s) => s.region);
  const setRegion = useDashboardFiltersStore((s) => s.setRegion);
  const datePreset = useDashboardFiltersStore((s) => s.datePreset);
  const setDatePreset = useDashboardFiltersStore((s) => s.setDatePreset);

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    const label = segmentLabels[seg] ?? seg;
    crumbs.push({ href: acc, label });
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950 px-4">
      <nav className="flex min-w-0 flex-1 items-center gap-1 text-xs text-zinc-500">
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1 truncate">
            {i > 0 ? <ChevronRight className="size-3 shrink-0" /> : null}
            {i < crumbs.length - 1 ? (
              <Link
                href={c.href}
                className="truncate hover:text-zinc-300"
              >
                {c.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-zinc-200">
                {c.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="hidden items-center gap-2 md:flex">
        <Select
          value={region}
          onValueChange={onSelectString((v) => setRegion(v as RegionFiltro))}
        >
          <SelectTrigger className="h-9 w-[160px] border-zinc-800 bg-zinc-900 text-zinc-200">
            <SelectValue placeholder="Región" />
          </SelectTrigger>
          <SelectContent>
            {regiones.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={datePreset}
          onValueChange={onSelectString((v) => setDatePreset(v as DateRangePreset))}
        >
          <SelectTrigger className="h-9 w-[150px] border-zinc-800 bg-zinc-900 text-zinc-200">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
            Vigilancia activa
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden border border-zinc-800 text-zinc-300 sm:inline-flex"
          onClick={() => {
            /* demo: sin backend */
          }}
        >
          <Download className="size-4 text-red-500" />
          <span className="ml-1.5">Exportar inteligencia</span>
        </Button>
      </div>
    </header>
  );
}
