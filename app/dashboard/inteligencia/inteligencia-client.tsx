"use client";

import { useCallback, useMemo, useState } from "react";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InteligenciaIAPayload } from "@/lib/inteligencia-schema";
import { mockInteligenciaPayload } from "@/lib/mock-inteligencia";
import { useDashboardFiltersStore } from "@/lib/stores/dashboard-filters-store";
import { cn, formatIntegerEsMx } from "@/lib/utils";

const LINE_COLORS = ["#f87171", "#fbbf24", "#60a5fa", "#a78bfa", "#34d399"];

type ApiEnvelope = {
  ok: boolean;
  source?: string;
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

function filtrarPorRegion(
  data: InteligenciaIAPayload,
  region: string,
): InteligenciaIAPayload {
  if (region === "todas") return data;
  const narrativas = data.narrativasPorGrupo.filter((n) => n.estado === region);
  const ids = new Set(narrativas.map((n) => n.grupoId));
  return {
    ...data,
    narrativasPorGrupo: narrativas,
    senalesEscalada: data.senalesEscalada.filter(
      (s) => !s.grupoId || ids.has(s.grupoId),
    ),
    correlaciones: data.correlaciones.filter(
      (c) => c.zona.includes(region) || c.zona.startsWith(region),
    ),
    zonasTension: data.zonasTension.filter((z) => z.estado === region),
    tendenciasEjeTemporal: data.tendenciasEjeTemporal,
    tendenciasPorGrupo: data.tendenciasPorGrupo,
    tendenciasPorZona: data.tendenciasPorZona,
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
  const datePreset = useDashboardFiltersStore((s) => s.datePreset);

  const [raw, setRaw] = useState<InteligenciaIAPayload>(mockInteligenciaPayload);
  const [fuente, setFuente] = useState<string>("mock");
  const [mensajeApi, setMensajeApi] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const data = useMemo(() => filtrarPorRegion(raw, region), [raw, region]);

  const analizar = useCallback(async () => {
    setLoading(true);
    setMensajeApi(null);
    try {
      const res = await fetch("/api/inteligencia/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, periodo: datePreset }),
      });
      const json = (await res.json()) as ApiEnvelope;
      setRaw(json.data);
      setFuente(json.source ?? "desconocido");
      if (json.message) setMensajeApi(json.message);
      if (!json.ok && json.message) setMensajeApi(json.message);
    } catch (e) {
      setFuente("error");
      setMensajeApi(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [region, datePreset]);

  const rowsGrupo = useMemo(
    () =>
      buildSerieRows(data.tendenciasEjeTemporal, data.tendenciasPorGrupo.slice(0, 4)),
    [data.tendenciasEjeTemporal, data.tendenciasPorGrupo],
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
          <p className="max-w-2xl text-xs leading-relaxed text-zinc-500">
            Narrativas activas por grupo (DeepSeek), señales de escalada con
            confianza, correlación comunicación–hechos, mapa de tensión y
            tendencias. Los filtros de región y periodo de la barra superior se
            envían al análisis con IA.
          </p>
          {fuenteParam ? (
            <p className="text-[11px] text-zinc-400">
              Contexto desde fuentes:{" "}
              <span className="font-mono text-zinc-200">{fuenteParam}</span>{" "}
              (demo; el payload no filtra por cuenta todavía).
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

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
        <Badge variant="outline" className="border-zinc-700 font-mono text-zinc-300">
          fuente: {fuente}
        </Badge>
        <Badge variant="outline" className="border-zinc-700 font-mono text-zinc-300">
          modelo: {data.modelo}
        </Badge>
        <span className="font-mono text-zinc-600">
          generado {new Date(data.generadoEn).toLocaleString("es-MX")}
        </span>
        {mensajeApi ? (
          <span className="text-amber-500/90">{mensajeApi}</span>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-950/60 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-100">
              <Radio className="size-4 text-red-400" />
              Narrativas activas por grupo
            </CardTitle>
            <CardDescription className="text-xs">
              Resumen generado por LLM; vectores narrativos y confianza por grupo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.narrativasPorGrupo.length === 0 ? (
              <p className="text-xs text-zinc-500">
                No hay narrativas para la región seleccionada. Cambia el filtro o
                ejecuta de nuevo el análisis.
              </p>
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
                        <p className="text-[10px] text-zinc-500">
                          {n.estado} · {n.fuenteModelo}
                        </p>
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
                    <p className="mt-2 font-mono text-[10px] text-zinc-600">
                      actualizado {new Date(n.actualizadoEn).toLocaleString("es-MX")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-100">
              Señales de escalada
            </CardTitle>
            <CardDescription className="text-xs">
              Indicadores con score de confianza (0–100).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.senalesEscalada.length === 0 ? (
              <p className="text-xs text-zinc-500">Sin señales en este filtro.</p>
            ) : (
              data.senalesEscalada.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="flex-1 text-xs font-medium text-zinc-100">
                      {s.titulo}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] uppercase", severidadClass(s.severidad))}
                    >
                      {s.severidad}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">{s.descripcion}</p>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>Confianza</span>
                      <span className="font-mono">{s.confianzaPct}%</span>
                    </div>
                    <Progress value={s.confianzaPct} className="h-1.5 bg-zinc-800" />
                  </div>
                  <p className="mt-2 text-[10px] text-zinc-600">
                    {s.periodoEtiqueta}
                    {s.zona ? ` · ${s.zona}` : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-100">
              <TrendingUp className="size-4 text-amber-400" />
              Correlación comunicación ↔ hechos
            </CardTitle>
            <CardDescription className="text-xs">
              Hipótesis temporales con índice de confianza (no es verificación
              judicial).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.correlaciones.length === 0 ? (
              <p className="text-xs text-zinc-500">
                Sin correlaciones para la región actual.
              </p>
            ) : (
              data.correlaciones.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3"
                >
                  <p className="text-xs text-zinc-200">{c.resumen}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-zinc-500">
                    <Badge variant="secondary" className="font-mono">
                      conf {c.indiceConfianza}%
                    </Badge>
                    <span>{c.hechoTipo}</span>
                    <span>·</span>
                    <span>{c.zona}</span>
                    <span>·</span>
                    <span>
                      {formatIntegerEsMx(c.publicacionesEnVentana)} pub. /{" "}
                      {c.ventanaHoras} h
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/60 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-100">
              <MapPin className="size-4 text-sky-400" />
              Mapa de zonas de tensión
            </CardTitle>
            <CardDescription className="text-xs">
              Intensidad 0–100 por estado (sintético / IA); tendencia semanal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.zonasTension.length === 0 ? (
              <p className="text-xs text-zinc-500">Sin zonas en el filtro actual.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {data.zonasTension.map((z) => (
                  <div
                    key={z.estado}
                    className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
                    style={{
                      boxShadow: `inset 0 -3px 0 rgba(239,68,68,${0.2 + z.intensidad0_100 / 200})`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-100">
                        {z.estado}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {tendenciaArrow(z.tendencia)} {z.tendencia}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-500">{z.notaCorta}</p>
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/60 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-100">
              Tendencias (7 puntos)
            </CardTitle>
            <CardDescription className="text-xs">
              Por grupo y por zona; eje temporal alineado al periodo de referencia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grupo">
              <TabsList className="border border-zinc-800 bg-zinc-900">
                <TabsTrigger value="grupo" className="text-xs">
                  Por grupo
                </TabsTrigger>
                <TabsTrigger value="zona" className="text-xs">
                  Por zona
                </TabsTrigger>
              </TabsList>
              <TabsContent value="grupo" className="mt-4">
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
                      {data.tendenciasPorGrupo.slice(0, 4).map((s, idx) => (
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
