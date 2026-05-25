"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import type { Mencion, NivelRiesgo } from "@/lib/types";

const NIVEL_PESO: Record<NivelRiesgo, number> = {
  critico: 1.0,
  alto: 0.75,
  medio: 0.5,
  bajo: 0.25,
  neutral: 0.1,
};

const HEAT_GRADIENT: Record<number, string> = {
  0.0: "rgba(0,100,255,0.35)",
  0.25: "rgba(0,200,200,0.5)",
  0.5: "rgba(0,255,100,0.65)",
  0.75: "rgba(255,200,0,0.8)",
  1.0: "rgba(255,50,0,0.95)",
};

type HeatLayer = L.HeatLayer;

function pesoMencion(m: Mencion): number {
  const base = m.nivelRiesgo ? (NIVEL_PESO[m.nivelRiesgo] ?? 0.3) : 0.3;
  const score = (m.scoreSeveridad ?? 50) / 100;
  return base * 0.6 + score * 0.4;
}

function colorNivelRiesgo(nivel?: NivelRiesgo): string {
  if (nivel === "critico" || nivel === "alto") return "#f97316";
  if (nivel === "medio") return "#eab308";
  return "#22c55e";
}

interface Props {
  menciones: Mencion[];
  highlightedId?: string | null;
  onSelectMencion?: (m: Mencion | null) => void;
  /** Vista compacta para el resumen: sin panel ni interacción de zoom. */
  modo?: "completo" | "preview";
}

export function MapaCalor({
  menciones,
  highlightedId,
  onSelectMencion,
  modo = "completo",
}: Props) {
  const esPreview = modo === "preview";
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatRef = useRef<HeatLayer | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const boundsAjustadosRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Mencion | null>(null);

  const puntos = useMemo(
    () =>
      menciones
        .filter((m) => typeof m.lat === "number" && typeof m.lon === "number")
        .map((m) => ({
          lat: m.lat as number,
          lon: m.lon as number,
          peso: pesoMencion(m),
          mencion: m,
        })),
    [menciones],
  );

  const puntosKey = useMemo(
    () =>
      puntos
        .map((p) => `${p.mencion.id}:${p.lat}:${p.lon}:${p.peso.toFixed(2)}`)
        .join("|"),
    [puntos],
  );

  const onSelectRef = useRef(onSelectMencion);
  onSelectRef.current = onSelectMencion;

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    const center: L.LatLngExpression =
      puntos.length > 0 ? [puntos[0].lat, puntos[0].lon] : [19.5, -99.1];

    const map = L.map(divRef.current, {
      center,
      zoom: 9,
      zoomControl: !esPreview,
      attributionControl: !esPreview,
      dragging: !esPreview,
      scrollWheelZoom: !esPreview,
      doubleClickZoom: !esPreview,
      touchZoom: !esPreview,
      boxZoom: !esPreview,
      keyboard: !esPreview,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;
    requestAnimationFrame(() => map.invalidateSize());
    setReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      heatRef.current = null;
      markersRef.current = [];
      setReady(false);
    };
  // Solo montar el mapa una vez; el centro inicial usa el primer lote de puntos.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const map = mapRef.current;
    const heatData: [number, number, number][] = puntos.map((p) => [
      p.lat,
      p.lon,
      p.peso,
    ]);

    if (heatRef.current) {
      heatRef.current.setLatLngs(heatData);
    } else {
      heatRef.current = L.heatLayer(heatData, {
        radius: 28,
        blur: 22,
        maxZoom: 14,
        minOpacity: 0.35,
        gradient: HEAT_GRADIENT,
      }).addTo(map);
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    puntos.forEach((p) => {
      const marker = L.circleMarker([p.lat, p.lon], {
        radius: esPreview ? 5 : 7,
        color: "#000",
        weight: 1,
        fillColor: colorNivelRiesgo(p.mencion.nivelRiesgo),
        fillOpacity: 0.9,
      }).addTo(map);

      if (!esPreview) {
        marker.bindTooltip(
          p.mencion.descripcionCorta ?? p.mencion.contenido.slice(0, 60),
          { direction: "top", opacity: 0.95 },
        );

        marker.on("click", () => {
          setSelected(p.mencion);
          onSelectRef.current?.(p.mencion);
        });
      }

      markersRef.current.push(marker);
    });

    if (puntos.length > 0 && !boundsAjustadosRef.current) {
      const bounds = L.latLngBounds(puntos.map((p) => [p.lat, p.lon] as L.LatLngTuple));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [32, 32], maxZoom: 12 });
        boundsAjustadosRef.current = true;
      }
    }
  }, [ready, puntosKey, esPreview]);

  useEffect(() => {
    if (!ready || !mapRef.current || !highlightedId) return;
    const punto = puntos.find((p) => p.mencion.id === highlightedId);
    if (punto) {
      mapRef.current.setView([punto.lat, punto.lon], 12, { animate: true });
    }
  }, [highlightedId, puntosKey, ready]);

  function handleClose() {
    setSelected(null);
    onSelectRef.current?.(null);
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      {!ready ? (
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          Cargando mapa...
        </div>
      ) : null}

      <div ref={divRef} className="h-full w-full" />

      {selected && !esPreview ? (
        <div className="absolute bottom-4 left-4 z-1000 w-80 rounded-xl border border-zinc-700 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-sm">
          <button
            type="button"
            className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-200"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {selected.plataforma} · {selected.municipio ?? "Sin municipio"}
          </p>
          <p className="text-sm font-medium leading-snug text-zinc-100">
            {selected.descripcionCorta ?? selected.contenido.slice(0, 120)}
          </p>
          {selected.grupoCriminal ? (
            <p className="mt-2 text-xs text-orange-400">Grupo: {selected.grupoCriminal}</p>
          ) : null}
          {selected.tipoDelito ? (
            <p className="mt-1 text-xs text-zinc-400">Delito: {selected.tipoDelito}</p>
          ) : null}
          <a
            href={selected.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-sky-400 hover:text-sky-300"
          >
            Ver publicación →
          </a>
        </div>
      ) : null}
    </div>
  );
}
