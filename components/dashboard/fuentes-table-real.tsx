"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Fragment, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { BadgeCheck, Send, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreBar } from "@/components/dashboard/score-bar";
import { RiskBadge } from "@/components/dashboard/risk-badge";
import type { Fuente } from "@/lib/db/fuentes";
import type { NivelRiesgo } from "@/lib/types";
import { cn, formatCompactEsMx, formatIntegerEsMx } from "@/lib/utils";

function PlataformaIcon({ p }: { p: string }) {
  const norm = p.toLowerCase();
  if (norm === "x" || norm === "twitter") return <Twitter className="size-3.5 shrink-0 text-sky-400" />;
  if (norm === "telegram") return <Send className="size-3.5 shrink-0 text-sky-300" />;
  return <span className="text-[9px] font-bold text-fuchsia-400">TT</span>;
}

function mapNivel(raw: string | null): NivelRiesgo {
  const n = (raw ?? "").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  if (n === "critico") return "critico";
  if (n === "alto") return "alto";
  if (n === "medio") return "medio";
  if (n === "bajo") return "bajo";
  return "neutral";
}

const col = createColumnHelper<Fuente>();

export function FuentesTableReal({ data }: { data: Fuente[] }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [expandedHandle, setExpandedHandle] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      col.display({
        id: "index",
        header: "#",
        cell: (ctx) => <span className="font-mono text-xs text-zinc-600">{ctx.row.index + 1}</span>,
      }),
      col.accessor("handle", {
        header: "Cuenta",
        cell: (ctx) => {
          const f = ctx.row.original;
          return (
            <div className="flex min-w-0 items-center gap-2">
              {f.autorImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.autorImageUrl} alt="" className="size-7 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300">
                  {f.handle.replace("@", "").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <PlataformaIcon p={f.plataforma} />
                  <span className="truncate font-medium text-zinc-100">{f.handle}</span>
                  {f.autorVerificado ? <BadgeCheck className="size-3.5 shrink-0 text-sky-400" /> : null}
                </div>
                {f.autorNombre ? (
                  <p className="truncate text-[10px] text-zinc-500">{f.autorNombre}</p>
                ) : null}
              </div>
            </div>
          );
        },
      }),
      col.accessor("autorSeguidores", {
        header: "Seguidores",
        cell: (ctx) => <span className="font-mono text-xs">{formatCompactEsMx(ctx.getValue())}</span>,
      }),
      col.accessor("menciones", {
        header: "Menciones",
        cell: (ctx) => <span className="font-mono text-xs">{formatIntegerEsMx(ctx.getValue())}</span>,
      }),
      col.accessor("engagementTotal", {
        header: "Engagement",
        cell: (ctx) => <span className="font-mono text-xs">{formatCompactEsMx(ctx.getValue())}</span>,
      }),
      col.accessor("scoreSeveridadPromedio", {
        header: "Score sev.",
        cell: (ctx) => (
          <div className="flex items-center gap-2">
            <ScoreBar score={ctx.getValue()} />
            <span className="font-mono text-xs text-zinc-400">{ctx.getValue()}</span>
          </div>
        ),
      }),
      col.accessor("nivelRiesgoDominante", {
        header: "Riesgo",
        cell: (ctx) => {
          const v = ctx.getValue();
          return v ? <RiskBadge riesgo={mapNivel(v)} /> : <span className="text-xs text-zinc-600">—</span>;
        },
      }),
      col.accessor("tipoDelitoFrecuente", {
        header: "Delito frecuente",
        cell: (ctx) => {
          const v = ctx.getValue();
          return v ? (
            <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </span>
          ) : <span className="text-xs text-zinc-600">—</span>;
        },
      }),
      col.accessor("esNuevaCuenta", {
        header: "Nueva",
        cell: (ctx) => ctx.getValue()
          ? <span className="rounded-full bg-sky-900/40 px-2 py-0.5 text-[10px] text-sky-300">Nueva</span>
          : null,
      }),
      col.accessor("ultimaMencion", {
        header: "Última mención",
        cell: (ctx) => (
          <span className="text-xs text-zinc-500">
            {formatDistanceToNow(new Date(ctx.getValue()), { addSuffix: true, locale: es })}
          </span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _col, filter) => {
      const q = String(filter).toLowerCase().trim();
      if (!q) return true;
      const f = row.original;
      return (
        f.handle.toLowerCase().includes(q) ||
        (f.autorNombre ?? "").toLowerCase().includes(q) ||
        (f.tipoDelitoFrecuente ?? "").toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 20 },
      sorting: [{ id: "menciones", desc: true }],
    },
  });

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar cuenta, nombre o tipo de delito…"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm border-zinc-800 bg-zinc-900"
      />

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className={cn(
                      "px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500",
                      h.column.getCanSort() && "cursor-pointer select-none hover:text-zinc-300",
                    )}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const f = row.original;
              const open = expandedHandle === f.handle;
              return (
                <Fragment key={row.id}>
                  <tr
                    className={cn(
                      "cursor-pointer border-b border-zinc-800/80 hover:bg-zinc-900/50",
                      open && "bg-zinc-900/40",
                    )}
                    onClick={() => setExpandedHandle(open ? null : f.handle)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {open ? (
                    <tr key={`${row.id}-exp`} className="bg-zinc-950/80">
                      <td colSpan={columns.length} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600">Plataforma</p>
                            <p className="mt-0.5 text-zinc-300">{f.plataforma}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600">Seguidores</p>
                            <p className="mt-0.5 text-zinc-300">{formatIntegerEsMx(f.autorSeguidores)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600">Menciones totales</p>
                            <p className="mt-0.5 text-zinc-300">{formatIntegerEsMx(f.menciones)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600">Score severidad prom.</p>
                            <p className="mt-0.5 text-zinc-300">{f.scoreSeveridadPromedio}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} ·{" "}
          {formatIntegerEsMx(table.getFilteredRowModel().rows.length)} fuentes
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 border-zinc-800" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" className="h-8 border-zinc-800" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
