"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Mencion, NivelRiesgo } from "@/lib/types";

const NIVEL_PESO: Record<NivelRiesgo, number> = {
  critico: 1.0,
  alto: 0.75,
  medio: 0.5,
  bajo: 0.25,
  neutral: 0.1,
};

function pesoMencion(m: Mencion): number {
  const base = m.nivelRiesgo ? (NIVEL_PESO[m.nivelRiesgo] ?? 0.3) : 0.3;
  const score = (m.scoreSeveridad ?? 50) / 100;
  return base * 0.6 + score * 0.4;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    __gmapsLoaded?: boolean;
    __gmapsCallbacks?: Array<() => void>;
  }
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (window.__gmapsLoaded) {
      resolve();
      return;
    }
    if (!window.__gmapsCallbacks) window.__gmapsCallbacks = [];
    window.__gmapsCallbacks.push(resolve);

    if (document.getElementById("gmaps-script")) return;

    const script = document.createElement("script");
    script.id = "gmaps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization&callback=__gmapsInit`;
    script.async = true;
    script.defer = true;

    (window as Window & { __gmapsInit?: () => void }).__gmapsInit = () => {
      window.__gmapsLoaded = true;
      window.__gmapsCallbacks?.forEach((cb) => cb());
      window.__gmapsCallbacks = [];
    };

    document.head.appendChild(script);
  });
}

interface Props {
  menciones: Mencion[];
  highlightedId?: string | null;
  onSelectMencion?: (m: Mencion | null) => void;
}

export function MapaCalor({ menciones, highlightedId, onSelectMencion }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heatmapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Mencion | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

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

  useEffect(() => {
    if (!apiKey) {
      setError("Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en las variables de entorno.");
      return;
    }
    loadGoogleMaps(apiKey)
      .then(() => setReady(true))
      .catch(() => setError("No se pudo cargar Google Maps."));
  }, [apiKey]);

  // Construir/actualizar mapa y heatmap
  useEffect(() => {
    if (!ready || !divRef.current) return;

    const google = window.google;

    const center =
      puntos.length > 0
        ? { lat: puntos[0].lat, lng: puntos[0].lon }
        : { lat: 19.5, lng: -99.1 };

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(divRef.current, {
        center,
        zoom: 9,
        mapTypeId: "roadmap",
        styles: darkMapStyles,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
    }

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const heatData = puntos.map((p) => ({
      location: new google.maps.LatLng(p.lat, p.lon),
      weight: p.peso,
    }));

    if (heatmapRef.current) {
      heatmapRef.current.setData(heatData);
    } else {
      heatmapRef.current = new google.maps.visualization.HeatmapLayer({
        data: heatData,
        map: mapRef.current,
        radius: 40,
        opacity: 0.8,
        gradient: [
          "rgba(0,0,0,0)",
          "rgba(0,100,255,0.4)",
          "rgba(0,200,200,0.6)",
          "rgba(0,255,100,0.7)",
          "rgba(255,255,0,0.8)",
          "rgba(255,150,0,0.9)",
          "rgba(255,50,0,1)",
          "rgba(200,0,0,1)",
        ],
      });
    }

    puntos.forEach((p) => {
      const color =
        p.mencion.nivelRiesgo === "critico"
          ? "#ef4444"
          : p.mencion.nivelRiesgo === "alto"
            ? "#f97316"
            : p.mencion.nivelRiesgo === "medio"
              ? "#eab308"
              : "#22c55e";

      const marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lon },
        map: mapRef.current,
        title: p.mencion.descripcionCorta ?? p.mencion.contenido.slice(0, 60),
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: "#000",
          strokeWeight: 1,
        },
      });

      marker.addListener("click", () => {
        setSelected(p.mencion);
        onSelectMencion?.(p.mencion);
      });
      markersRef.current.push(marker);
    });
  }, [ready, puntos, onSelectMencion]);

  // Centrar mapa en elemento destacado desde la lista
  useEffect(() => {
    if (!ready || !mapRef.current || !highlightedId) return;
    const punto = puntos.find((p) => p.mencion.id === highlightedId);
    if (punto) {
      mapRef.current.panTo({ lat: punto.lat, lng: punto.lon });
      mapRef.current.setZoom(12);
    }
  }, [highlightedId, puntos, ready]);

  function handleClose() {
    setSelected(null);
    onSelectMencion?.(null);
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      {error ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-red-900/40 bg-red-950/20 p-6 text-sm text-red-300">
          {error}
        </div>
      ) : !ready ? (
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          Cargando mapa...
        </div>
      ) : null}

      <div
        ref={divRef}
        className="h-full w-full"
        style={{ display: ready && !error ? "block" : "none" }}
      />

      {selected ? (
        <div className="absolute bottom-4 left-4 z-10 w-80 rounded-xl border border-zinc-700 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-sm">
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

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b949e" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d1d5db" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2d333b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#161b22" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6e7681" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#30363d" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0d1117" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3b82f6" }],
  },
];
