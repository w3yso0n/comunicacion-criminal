"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  narrativas: "Narrativas",
  fuentes: "Fuentes",
  historial: "Historial",
  inteligencia: "Inteligencia estratégica",
  alertas: "Alertas",
  Explorador: "Explorador",
  Mapa: "Mapa",
};

export function Topbar() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    const label = segmentLabels[seg] ?? seg;
    crumbs.push({ href: acc, label });
  }

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-zinc-800 bg-zinc-950 px-4">
      <nav className="flex min-w-0 flex-1 items-center gap-1 text-xs text-zinc-500">
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1 truncate">
            {i > 0 ? <ChevronRight className="size-3 shrink-0" /> : null}
            {i < crumbs.length - 1 ? (
              <Link href={c.href} className="truncate hover:text-zinc-300">
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
    </header>
  );
}
