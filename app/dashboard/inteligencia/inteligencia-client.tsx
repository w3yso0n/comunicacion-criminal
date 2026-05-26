"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Brain,
  Loader2,
  MapPin,
  Radio,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { emptyInteligenciaPayload } from "@/lib/inteligencia-empty";
import type { InteligenciaIAPayload, TendenciaSerie } from "@/lib/inteligencia-schema";
import { useDashboardFiltersStore } from "@/lib/stores/dashboard-filters-store";
import { labelPrioridad } from "@/lib/db/inteligencia-senales";
import { regionCoincideFiltro } from "@/lib/db/inteligencia-zonas";
import { cn, formatIntegerEsMx } from "@/lib/utils";

const LINE_COLORS = ["#f87171", "#fbbf24", "#60a5fa", "#a78bfa", "#34d399"];

type ApiEnvelope = {
  ok: boolean;
  message?: string;
  data: InteligenciaIAPayload;
};

function severidadClass(s: "alta" | "media" | "baja") {
  if (s === "alta")
    return "border-red-800/80 bg-red-950/50 text-red-300 hover:bg-red-950/50";
  if (s === "media")
    return "border-amber-800/80 bg-amber-950/40 text-amber-200 hover:bg-amber-950/40";
  return "border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800/80";
}

function tendenciaArrow(t: "sube" | "baja" | "estable") {
  if (t === "sube") return "↑";
  if (t === "baja") return "↓";
  return "→";
}

function tendenciasGrupoVisibles(
  data: InteligenciaIAPayload,
  narrativasIds: Set<string>,
): TendenciaSerie[] {
  if (data.tendenciasPorGrupo.length === 0) return [];
  if (narrativasIds.size === 0) return data.tendenciasPorGrupo;
  const alineadas = data.tendenciasPorGrupo.filter((s) => narrativasIds.has(s.id));
  return alineadas.length > 0 ? alineadas : data.tendenciasPorGrupo;
}

function filtrarPorRegion(
  data: InteligenciaIAPayload,
  region: string,
): InteligenciaIAPayload {
  if (region === "todas") return data;
  const narrativas = data.narrativasPorGrupo.filter(
    (n) =>
      n.estado === region ||
      n.estado.toLowerCase().includes(region.toLowerCase()),
  );
  const ids = new Set(narrativas.map((n) => n.grupoId));
  const tendenciasPorGrupo = tendenciasGrupoVisibles(data, ids);
  return {
    ...data,
    narrativasPorGrupo: narrativas,
    senalesEscalada: data.senalesEscalada.filter(
      (s) => !s.grupoId || ids.has(s.grupoId),
    ),
    correlaciones: data.correlaciones.filter(
      (c) => c.zona.includes(region) || c.zona.startsWith(region),
    ),
    zonasTension: data.zonasTension.filter((z) =>
      regionCoincideFiltro(z, region),
    ),
    tendenciasEjeTemporal: data.tendenciasEjeTemporal,
    tendenciasPorGrupo,
    tendenciasPorZona: data.tendenciasPorZona.filter((z) =>
      regionCoincideFiltro({ zona: z.etiqueta }, region),
    ),
  };
}

function buildSerieRows(
  eje: string[],
  series: { id: string; etiqueta: string; valores: number[] }[],
): Record<string, string | number>[] {
  return eje.map((name, i) => {
    const row: Record<string, string | number> = { name };
    series.forEach((s, idx) => {
      row[`v${idx}`] = s.valores[i] ?? 0;
    });
    return row;
  });
}

export function InteligenciaClient() {
  const searchParams = useSearchParams();
  const fuenteParam =
    searchParams.get("fuente") ?? searchParams.get("autor");

  const region = useDashboardFiltersStore((s) => s.region);

  const [raw, setRaw] = useState<InteligenciaIAPayload>(emptyInteligenciaPayload);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const data = useMemo(() => filtrarPorRegion(raw, region), [raw, region]);

  const tieneAnalisis =
    data.narrativasPorGrupo.length > 0 ||
    data.senalesEscalada.length > 0 ||
    data.correlaciones.length > 0 ||
    data.zonasTension.length > 0;

  const cargarCache = useCallback(async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ region });
      const res = await fetch(`/api/inteligencia?${params}`);
      const json = (await res.json()) as ApiEnvelope;
      setRaw(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el análisis.");
    } finally {
      setInitialLoading(false);
    }
  }, [region]);

  useEffect(() => {
    void cargarCache();
  }, [cargarCache]);

  const analizar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inteligencia/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, force: true }),
      });
      const json = (await res.json()) as ApiEnvelope;
      setRaw(json.data);
      if (!json.ok) {
        setError(json.message ?? "No se pudo completar el análisis.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar el análisis.");
    } finally {
      setLoading(false);
    }
  }, [region]);

  const seriesGrupo = useMemo(() => {
    const ids = new Set(data.narrativasPorGrupo.map((n) => n.grupoId));
    return tendenciasGrupoVisibles(data, ids);
  }, [data]);

  const rowsGrupo = useMemo(
    () => buildSerieRows(data.tendenciasEjeTemporal, seriesGrupo),
    [data.tendenciasEjeTemporal, seriesGrupo],
  );
  const rowsZona = useMemo(
    () =>
      buildSerieRows(data.tendenciasEjeTemporal, data.tendenciasPorZona.slice(0, 4)),
    [data.tendenciasEjeTemporal, data.tendenciasPorZona],
  );

  const tickStyle = {
    fontFamily: "var(--font-geist-mono)",
    fontSize: 10,
    fill: "#71717a",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="size-6 text-red-500" />
            <h1 className="text-lg font-semibold text-zinc-100">
              Inteligencia estratégica
            </h1>
          </div>
          <p className="max-w-2xl text-xs text-zinc-500">
            Síntesis de narrativas, riesgo territorial y tendencias a partir de
            menciones y alertas monitoreadas en el Estado de México. Solo incluye
            menciones con perspectiva{" "}
            <span className="text-emerald-400/90">Ciudadano</span> o{" "}
            <span className="text-red-400/90">Criminal</span> (excluye Informativo).
          </p>
          {fuenteParam ? (
            <p className="text-[11px] text-zinc-400">
              Fuente: <span className="text-zinc-200">{fuenteParam}</span>
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          onClick={() => void analizar()}
          disabled={loading}
          className="shrink-0 gap-2 bg-red-600 text-white hover:bg-red-500"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Analizar con IA
        </Button>
      </header>

      {error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}

      {initialLoading ? (
        <p className="text-xs text-zinc-500">Cargando…</p>
      ) : !tieneAnalisis && !loading ? (
        <p className="text-xs text-zinc-500">
          Pulsa «Analizar con IA» para generar el informe con los filtros actuales.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-950/60 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-100">
              <Radio className="size-4 text-red-400" />
              Narrativas por grupo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.narrativasPorGrupo.length === 0 ? (
              <p className="text-xs text-zinc-500">Sin resultados para este filtro.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.narrativasPorGrupo.map((n) => (
                  <div
                    key={n.grupoId}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-zinc-100">
                          {n.grupoNombre}
                        </p>
                        <p className="text-[10px] text-zinc-500">{n.estado}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-zinc-600 font-mono text-[10px] text-zinc-300"
                      >
                        {n.confianzaPct}%
                      </Badge>
                    </div>
                    <p className="mt-2 text-[11px] leading-snug text-zinc-400">
                      {n.resumenNarrativa}
                    </p>
                    <ul className="mt-2 space-y-1 border-t border-zinc-800/80 pt-2">
                      {n.vectoresNarrativos.map((v) => (
                        <li
                          key={v}
                          className="text-[10px] text-zinc-500 before:mr-1 before:text-red-500 before:content-['·']"
                        >
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-100">
              Avisos que requieren atención
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.senalesEscalada.length === 0 ? (
              <p className="text-xs text-zinc-500">
                No hay avisos destacados en el monitoreo.
              </p>
            ) : (
              data.senalesEscalada.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="flex-1 text-sm font-medium leading-snug text-zinc-100">
                      {s.titulo}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-[10px]", severidadClass(s.severidad))}
                    >
                      {labelPrioridad(s.severidad)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    {s.descripcion}
                  </p>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>Claridad del aviso</span>
                      <span>{formatIntegerEsMx(s.confianzaPct)}%</span>
                    </div>
                    <Progress value={s.confianzaPct} className="h-1.5 bg-zinc-800" />
                  </div>
                  {s.periodoEtiqueta ? (
                    <p className="mt-2 text-[10px] text-zinc-600">{s.periodoEtiqueta}</p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-100">
              <TrendingUp className="size-4 text-amber-400" />
              Patrones que coinciden
            </CardTitle>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              Publicaciones, cuentas o municipios del top de menciones que
              aparecen relacionadas entre sí o con un hecho reportado.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.correlaciones.length === 0 ? (
              <p className="text-xs text-zinc-500">
                No hay patrones destacados en el monitoreo.
              </p>
            ) : (
              data.correlaciones.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3"
                >
                  <p className="text-sm font-medium leading-snug text-zinc-100">
                    {c.titulo ?? c.hechoTipo}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    {c.resumen}
                  </p>
                  <ul className="mt-3 space-y-1 text-[11px] text-zinc-500">
                    <li>
                      <span className="text-zinc-600">Tipo: </span>
                      {c.hechoTipo}
                    </li>
                    <li>
                      <span className="text-zinc-600">Dónde: </span>
                      {c.zona}
                    </li>
                    {c.publicacionesEnVentana > 0 ? (
                      <li>
                        <span className="text-zinc-600">Publicaciones: </span>
                        {formatIntegerEsMx(c.publicacionesEnVentana)}
                      </li>
                    ) : null}
                    {c.alcanceEtiqueta ? (
                      <li>
                        <span className="text-zinc-600">Alcance: </span>
                        {c.alcanceEtiqueta}
                      </li>
                    ) : null}
                    <li>
                      <span className="text-zinc-600">Qué tan claro es: </span>
                      {formatIntegerEsMx(c.indiceConfianza)}%
                    </li>
                  </ul>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/60 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-100">
              <MapPin className="size-4 text-sky-400" />
              Regiones Edomex
            </CardTitle>
            <p className="text-[11px] text-zinc-500">
              Intensidad por región oficial (19 regiones en 7 zonas).
            </p>
          </CardHeader>
          <CardContent>
            {data.zonasTension.length === 0 ? (
              <p className="text-xs text-zinc-500">
                Sin regiones con municipios Edomex en el monitoreo.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.zonasTension.map((z) => (
                  <div
                    key={z.zona}
                    className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
                    style={{
                      boxShadow: `inset 0 -3px 0 rgba(239,68,68,${0.2 + z.intensidad0_100 / 200})`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold leading-snug text-zinc-100">
                          {z.zona}
                        </span>
                        {z.zonaMacro ? (
                          <span className="mt-0.5 block text-[10px] text-zinc-500">
                            {z.zonaMacro}
                          </span>
                        ) : null}
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {tendenciaArrow(z.tendencia)} {z.tendencia}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Intensidad</span>
                        <span className="font-mono">{z.intensidad0_100}</span>
                      </div>
                      <Progress
                        value={z.intensidad0_100}
                        className="h-2 bg-zinc-800"
                      />
                    </div>
                    {z.notaCorta ? (
                      <p className="mt-2 text-[10px] leading-snug text-zinc-600">
                        {z.notaCorta}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/60 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-100">Tendencias</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grupo">
              <TabsList className="border border-zinc-800 bg-zinc-900">
                <TabsTrigger value="grupo" className="text-xs">
                  Por grupo
                </TabsTrigger>
                <TabsTrigger value="zona" className="text-xs">
                  Por región
                </TabsTrigger>
              </TabsList>
              <TabsContent value="grupo" className="mt-4">
                {seriesGrupo.length === 0 ? (
                  <p className="py-8 text-center text-xs text-zinc-500">
                    Sin grupos con menciones en el periodo analizado. Ejecuta
                    &quot;Analizar con IA&quot; o amplía el filtro regional.
                  </p>
                ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rowsGrupo}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" tick={tickStyle} />
                      <YAxis tick={tickStyle} width={28} />
                      <Tooltip
                        contentStyle={{
                          background: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {seriesGrupo.map((s, idx) => (
                        <Line
                          key={s.id}
                          type="monotone"
                          dataKey={`v${idx}`}
                          name={s.etiqueta}
                          stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                )}
              </TabsContent>
              <TabsContent value="zona" className="mt-4">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rowsZona}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" tick={tickStyle} />
                      <YAxis tick={tickStyle} width={28} />
                      <Tooltip
                        contentStyle={{
                          background: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {data.tendenciasPorZona.slice(0, 4).map((s, idx) => (
                        <Line
                          key={s.id}
                          type="monotone"
                          dataKey={`v${idx}`}
                          name={s.etiqueta}
                          stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
