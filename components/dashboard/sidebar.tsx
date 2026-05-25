"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Brain,
  LayoutDashboard,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Rss,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { selectNuevasCount, useAlertsStore } from "@/lib/stores/alerts-store";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: boolean;
};

const nav: NavItem[] = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/fuentes", label: "Fuentes", icon: Rss },
  { href: "/Explorador", label: "Explorador", icon: Search },
  { href: "/Mapa", label: "Mapa", icon: Map },
  {
    href: "/dashboard/inteligencia",
    label: "Inteligencia estratégica",
    icon: Brain,
  },
  { href: "/dashboard/alertas", label: "Alertas", icon: Bell, badge: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const nuevas = useAlertsStore((s) => selectNuevasCount(s.items));

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ type: "spring", stiffness: 420, damping: 38 }}
      className="relative z-20 flex h-full shrink-0 flex-col border-r border-zinc-800 bg-zinc-950"
    >
      <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-2">
        <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden">
          {collapsed ? (
            <span className="text-lg font-black text-red-500">C</span>
          ) : (
            <span className="truncate text-sm font-bold tracking-widest text-white">
              CENTINELA
            </span>
          )}
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
          aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </motion.button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-1.5 pt-3">
        {nav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : item.href === "/Explorador"
                ? pathname === "/Explorador" ||
                  pathname.startsWith("/Explorador/")
                : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <motion.div key={item.href} whileHover={{ x: 2 }}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] shrink-0",
                    active ? "text-white" : "text-zinc-500",
                  )}
                />
                {!collapsed ? (
                  <span className="truncate">{item.label}</span>
                ) : null}
                {item.badge === true && nuevas > 0 ? (
                  <Badge
                    variant="destructive"
                    className={cn(
                      "h-5 min-w-5 justify-center px-1 text-[10px] font-bold",
                      collapsed && "absolute -right-0.5 -top-0.5",
                    )}
                  >
                    {nuevas > 9 ? "9+" : nuevas}
                  </Badge>
                ) : null}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-800 p-3">
        <div className="flex items-center justify-center gap-2 overflow-hidden">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          {!collapsed ? (
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              LIVE
            </span>
          ) : null}
        </div>
      </div>
    </motion.aside>
  );
}
