"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { PublicacionCard } from "@/components/dashboard/publicacion-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAutorById, publicaciones } from "@/lib/mock-data";
import { labelCategoria, labelNarrativa, labelPlataforma, labelRiesgo } from "@/lib/labels";
import type {
  CategoriaContenido,
  NarrativaId,
  NivelRiesgo,
  Plataforma,
} from "@/lib/types";

const categorias: CategoriaContenido[] = [
  "narcomanta_digital",
  "demostracion_armamento",
  "comunicado_territorial",
  "advertencia_publica",
  "propaganda_grupo",
  "noticia_neutral",
  "otro",
];

const narrativas: NarrativaId[] = [
  "control_territorial",
  "amenaza_directa",
  "poder_armado",
  "propaganda",
  "justificacion_criminal",
  "reclutamiento",
  "proteccion_social",
];

const plataformas: Plataforma[] = ["twitter", "telegram", "tiktok"];

const riesgos: NivelRiesgo[] = ["critico", "alto", "medio", "bajo", "neutral"];

function onSelectString(setter: (v: string) => void) {
  return (value: string | null) => {
    if (value !== null) setter(value);
  };
}

export function ExploradorClient() {
  const searchParams = useSearchParams();
  const autorParam = searchParams.get("autor");

  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [riesgo, setRiesgo] = useState<string>("todas");
  const [narrativa, setNarrativa] = useState<string>("todas");
  const [plataforma, setPlataforma] = useState<string>("todas");
  const [soloAlto, setSoloAlto] = useState(false);

  const filtradas = useMemo(() => {
    const decoded = autorParam ? decodeURIComponent(autorParam) : "";
    return publicaciones.filter((p) => {
      if (decoded) {
        const au = getAutorById(p.autorId);
        if (!au || au.handle !== decoded) return false;
      }
      const hay = (t: string) => t !== "todas";
      if (soloAlto && p.nivelApologia < 60) return false;
      if (hay(categoria) && p.categoria !== categoria) return false;
      if (hay(riesgo) && p.riesgo !== riesgo) return false;
      if (hay(narrativa) && p.narrativaPrincipal !== narrativa) return false;
      if (hay(plataforma) && p.plataforma !== plataforma) return false;
      if (q.trim()) {
        const n = q.toLowerCase();
        const blob = `${p.textoCompleto} ${p.textoResumido}`.toLowerCase();
        if (!blob.includes(n)) return false;
      }
      return true;
    });
  }, [
    autorParam,
    categoria,
    narrativa,
    plataforma,
    q,
    riesgo,
    soloAlto,
  ]);

  function limpiar() {
    setQ("");
    setCategoria("todas");
    setRiesgo("todas");
    setNarrativa("todas");
    setPlataforma("todas");
    setSoloAlto(false);
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-100">Explorador IA</h1>
        <p className="text-xs text-zinc-500">
          Publicaciones analizadas con clasificación y score de apología (demo).
        </p>
      </header>

      <div className="sticky top-0 z-10 space-y-3 border-b border-zinc-800 bg-zinc-950/95 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Buscar en texto…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-[160px] flex-1 border-zinc-800 bg-zinc-900"
          />
          <Select value={categoria} onValueChange={onSelectString(setCategoria)}>
            <SelectTrigger className="w-[160px] border-zinc-800 bg-zinc-900">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c} value={c}>
                  {labelCategoria(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={riesgo} onValueChange={onSelectString(setRiesgo)}>
            <SelectTrigger className="w-[140px] border-zinc-800 bg-zinc-900">
              <SelectValue placeholder="Riesgo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos</SelectItem>
              {riesgos.map((r) => (
                <SelectItem key={r} value={r}>
                  {labelRiesgo(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={narrativa} onValueChange={onSelectString(setNarrativa)}>
            <SelectTrigger className="w-[180px] border-zinc-800 bg-zinc-900">
              <SelectValue placeholder="Narrativa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {narrativas.map((n) => (
                <SelectItem key={n} value={n}>
                  {labelNarrativa(n)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={plataforma} onValueChange={onSelectString(setPlataforma)}>
            <SelectTrigger className="w-[150px] border-zinc-800 bg-zinc-900">
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {plataformas.map((p) => (
                <SelectItem key={p} value={p}>
                  {labelPlataforma(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={soloAlto}
              onChange={(e) => setSoloAlto(e.target.checked)}
              className="rounded border-zinc-600"
            />
            Solo alto riesgo
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-zinc-500"
            onClick={limpiar}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filtradas.map((p, i) => (
          <PublicacionCard key={p.id} pub={p} index={i} />
        ))}
      </div>
    </div>
  );
}
