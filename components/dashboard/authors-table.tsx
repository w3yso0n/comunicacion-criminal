"use client";

import Link from "next/link";
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
import { Send, Twitter } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NarrativaBadge } from "@/components/dashboard/narrativa-badge";
import { RiskBadge } from "@/components/dashboard/risk-badge";
import { ScoreBar } from "@/components/dashboard/score-bar";
import { getPublicacionesByAutorId } from "@/lib/mock-data";
import { labelNarrativa, labelPlataforma } from "@/lib/labels";
import type { Autor, Plataforma } from "@/lib/types";
import {
  cn,
  formatCompactEsMx,
  formatIntegerEsMx,
} from "@/lib/utils";

function PlataformaIcon({ p }: { p: Plataforma }) {
  if (p === "twitter") return <Twitter className="size-3.5 text-sky-400" />;
  if (p === "telegram") return <Send className="size-3.5 text-sky-300" />;
  return (
    <span className="text-[9px] font-bold text-fuchsia-400" aria-hidden>
      TT
    </span>
  );
}

const columnHelper = createColumnHelper<Autor>();

export function AuthorsTable({ data }: { data: Autor[] }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "index",
        header: "#",
        cell: (ctx) => (
          <span className="font-mono text-xs text-zinc-600">
            {ctx.row.index + 1}
          </span>
        ),
      }),
      columnHelper.accessor("handle", {
        header: "Handle",
        cell: (ctx) => (
          <div className="flex min-w-0 items-center gap-2">
            <PlataformaIcon p={ctx.row.original.plataforma} />
            <span className="truncate font-medium text-zinc-100">
              {ctx.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("plataforma", {
        header: "Plataforma",
        cell: (ctx) => labelPlataforma(ctx.getValue()),
      }),
      columnHelper.accessor("publicaciones", {
        header: "Publicaciones",
        cell: (ctx) => (
          <span className="font-mono text-xs">
            {formatIntegerEsMx(ctx.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("engagementTotal", {
        header: "Engagement",
        cell: (ctx) => (
          <span className="font-mono text-xs">
            {formatCompactEsMx(ctx.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("reachSeguidores", {
        header: "Reach",
        cell: (ctx) => (
          <span className="font-mono text-xs">
            {formatCompactEsMx(ctx.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("scoreApologiaPromedio", {
        header: "Score",
        cell: (ctx) => (
          <div className="flex items-center gap-2">
            <ScoreBar score={ctx.getValue()} />
            <span className="font-mono text-xs text-zinc-400">
              {formatIntegerEsMx(ctx.getValue())}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("narrativaDominante", {
        header: "Narrativa",
        cell: (ctx) => <NarrativaBadge id={ctx.getValue()} />,
      }),
      columnHelper.accessor("riesgo", {
        header: "Riesgo",
        cell: (ctx) => <RiskBadge riesgo={ctx.getValue()} />,
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: (ctx) => (
          <Link
            href={`/dashboard/explorador?autor=${encodeURIComponent(ctx.row.original.handle)}`}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 text-xs",
            )}
          >
            Ver publicaciones
          </Link>
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
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue).toLowerCase().trim();
      if (!q) return true;
      const a = row.original;
      return (
        a.handle.toLowerCase().includes(q) ||
        a.plataforma.toLowerCase().includes(q) ||
        labelNarrativa(a.narrativaDominante).toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar handle o plataforma…"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm border-zinc-800 bg-zinc-900"
      />
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className={cn(
                      "px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500",
                      h.column.getCanSort() &&
                        "cursor-pointer select-none hover:text-zinc-300",
                    )}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[h.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const a = row.original;
              const open = expandedId === a.id;
              return (
                <Fragment key={row.id}>
                  <tr
                    className={cn(
                      "cursor-pointer border-b border-zinc-800/80 hover:bg-zinc-900/50",
                      open && "bg-zinc-900/40",
                    )}
                    onClick={() => setExpandedId(open ? null : a.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                  {open ? (
                    <tr className="bg-zinc-950/80">
                      <td colSpan={columns.length} className="px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                          Publicaciones recientes (mock)
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                          {getPublicacionesByAutorId(a.id).map((p) => (
                            <li key={p.id} className="font-mono">
                              <span className="text-zinc-500">{p.id}</span> —{" "}
                              {p.textoResumido.slice(0, 120)}
                              …
                            </li>
                          ))}
                          {getPublicacionesByAutorId(a.id).length === 0 ? (
                            <li>Sin publicaciones en el conjunto demo.</li>
                          ) : null}
                        </ul>
                        <p className="mt-2 text-[11px] text-zinc-600">
                          Narrativa dominante:{" "}
                          {labelNarrativa(a.narrativaDominante)} · Reincidente:{" "}
                          {a.reincidente ? "sí" : "no"}
                        </p>
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
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-800"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-800"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
