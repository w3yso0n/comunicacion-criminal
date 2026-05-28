"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { emparejarMunicipioEdomex } from "@/lib/edomex-regiones";
import type { Mencion, NivelRiesgo } from "@/lib/types";
import { formatIntegerEsMx } from "@/lib/utils";

const GEOJSON_URL = "/geo/edomex-municipios.json";

const NIVEL_PESO: Record<NivelRiesgo, number> = {
  critico: 1.0,
  alto: 0.75,
  medio: 0.5,
  bajo: 0.25,
  neutral: 0.1,
};

const ESCALA_COLORES = [
  { t: 0, color: "#1e3a5f" },
  { t: 0.25, color: "#0e7490" },
  { t: 0.5, color: "#15803d" },
  { t: 0.75, color: "#ca8a04" },
  { t: 1, color: "#dc2626" },
];

type GeoMunicipioProps = {
  NOMGEO: string;
  CVEGEO?: string;
};

type GeoMunicipios = GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, GeoMunicipioProps>;

interface MunicipioStats {
  count: number;
  peso: number;
  menciones: Mencion[];
}

function pesoMencion(m: Mencion): number {
  const base = m.nivelRiesgo ? (NIVEL_PESO[m.nivelRiesgo] ?? 0.3) : 0.3;
  const score = (m.scoreSeveridad ?? 50) / 100;
  return base * 0.6 + score * 0.4;
}

function colorIntensidad(valor: number, max: number): string {
  if (max <= 0 || valor <= 0) return "#27272a";
  const t = Math.min(1, valor / max);
  for (let i = ESCALA_COLORES.length - 1; i >= 0; i--) {
    if (t >= ESCALA_COLORES[i].t) return ESCALA_COLORES[i].color;
  }
  return ESCALA_COLORES[0].color;
}

function contenedorListo(el: HTMLElement | null): el is HTMLElement {
  return Boolean(el && el.isConnected && el.offsetWidth > 0 && el.offsetHeight > 0);
}

function invalidateSizeSeguro(map: L.Map | null) {
  if (!map) return;
  try {
    const container = map.getContainer();
    if (!container?.isConnected) return;
    map.invalidateSize();
  } catch {
    // Mapa ya destruido
  }
}

interface Props {
  menciones: Mencion[];
  highlightedId?: string | null;
  onSelectMencion?: (m: Mencion | null) => void;
  modo?: "completo" | "preview";
}

export function MapaCoropletico({
  menciones,
  highlightedId,
  onSelectMencion,
  modo = "completo",
}: Props) {
  const esPreview = modo === "preview";
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const boundsAjustadosRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [geojson, setGeojson] = useState<GeoMunicipios | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);

  const nombresOficiales = useMemo(() => {
    if (!geojson) return new Set<string>();
    return new Set(
      geojson.features
        .map((f) => f.properties?.NOMGEO)
        .filter((n): n is string => Boolean(n)),
    );
  }, [geojson]);

  const statsPorMunicipio = useMemo(() => {
    const map = new Map<string, MunicipioStats>();
    if (nombresOficiales.size === 0) return map;

    for (const m of menciones) {
      const nombre = emparejarMunicipioEdomex(m.municipio, nombresOficiales);
      if (!nombre) continue;
      const cur = map.get(nombre) ?? { count: 0, peso: 0, menciones: [] };
      cur.count += 1;
      cur.peso += pesoMencion(m);
      cur.menciones.push(m);
      map.set(nombre, cur);
    }
    return map;
  }, [menciones, nombresOficiales]);

  const maxPeso = useMemo(() => {
    let max = 0;
    for (const s of statsPorMunicipio.values()) {
      if (s.peso > max) max = s.peso;
    }
    return max;
  }, [statsPorMunicipio]);

  const municipioDestacado = useMemo(() => {
    if (!highlightedId) return null;
    const mencion = menciones.find((m) => m.id === highlightedId);
    if (!mencion?.municipio || nombresOficiales.size === 0) return null;
    return emparejarMunicipioEdomex(mencion.municipio, nombresOficiales);
  }, [highlightedId, menciones, nombresOficiales]);

  const statsKey = useMemo(
    () =>
      [...statsPorMunicipio.entries()]
        .map(([k, v]) => `${k}:${v.count}:${v.peso.toFixed(2)}`)
        .sort()
        .join("|"),
    [statsPorMunicipio],
  );

  const onSelectRef = useRef(onSelectMencion);
  onSelectRef.current = onSelectMencion;

  useEffect(() => {
    let cancelled = false;
    setGeoError(null);
    fetch(GEOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el mapa de municipios.");
        return res.json() as Promise<GeoMunicipios>;
      })
      .then((data) => {
        if (!cancelled) setGeojson(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setGeoError(err instanceof Error ? err.message : "Error al cargar municipios.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) return;

    let cancelled = false;
    let rafId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let map: L.Map | null = null;

    const finalizarMontaje = () => {
      if (cancelled || !map) return;
      invalidateSizeSeguro(map);
      setReady(true);
    };

    const montarMapa = () => {
      if (cancelled || mapRef.current || !divRef.current) return;
      if (!contenedorListo(divRef.current)) {
        rafId = requestAnimationFrame(montarMapa);
        return;
      }

      map = L.map(divRef.current, {
        center: [19.35, -99.6],
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
      rafId = requestAnimationFrame(finalizarMontaje);

      resizeObserver = new ResizeObserver(() => {
        if (mapRef.current === map) invalidateSizeSeguro(map);
      });
      resizeObserver.observe(divRef.current);
    };

    montarMapa();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      if (map) {
        try {
          map.remove();
        } catch {
          /* ya destruido */
        }
      }
      mapRef.current = null;
      geoLayerRef.current = null;
      boundsAjustadosRef.current = false;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esPreview]);

  useEffect(() => {
    if (!ready || !mapRef.current || !geojson) return;

    const map = mapRef.current;

    if (geoLayerRef.current) {
      geoLayerRef.current.remove();
      geoLayerRef.current = null;
    }

    const layer = L.geoJSON(geojson, {
      style: (feature) => {
        const nombre = feature?.properties?.NOMGEO ?? "";
        const stats = statsPorMunicipio.get(nombre);
        const peso = stats?.peso ?? 0;
        const activo =
          nombre === municipioDestacado || nombre === selectedMunicipio;

        return {
          fillColor: colorIntensidad(peso, maxPeso),
          fillOpacity: activo ? 0.88 : 0.72,
          color: activo ? "#38bdf8" : "#52525b",
          weight: activo ? 2.5 : 1,
          opacity: activo ? 1 : 0.85,
        };
      },
      onEachFeature: (feature, leafletLayer) => {
        const nombre = feature.properties?.NOMGEO ?? "Municipio";
        const stats = statsPorMunicipio.get(nombre);
        const count = stats?.count ?? 0;
        const peso = stats?.peso ?? 0;

        if (!esPreview) {
          leafletLayer.bindTooltip(
            `<strong>${nombre}</strong><br/>${formatIntegerEsMx(count)} menciones · intensidad ${peso.toFixed(1)}`,
            { sticky: true, opacity: 0.95 },
          );

          leafletLayer.on("click", () => {
            setSelectedMunicipio(nombre);
            const primera = stats?.menciones[0] ?? null;
            onSelectRef.current?.(primera);
          });
        }
      },
    }).addTo(map);

    geoLayerRef.current = layer;

    if (!boundsAjustadosRef.current) {
      try {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [24, 24], maxZoom: 11 });
          boundsAjustadosRef.current = true;
        }
      } catch {
        /* mapa no listo */
      }
    }
  }, [ready, geojson, statsKey, maxPeso, municipioDestacado, selectedMunicipio, esPreview, statsPorMunicipio]);

  useEffect(() => {
    if (!ready || !geoLayerRef.current) return;
    geoLayerRef.current.setStyle((feature) => {
      const nombre = feature?.properties?.NOMGEO ?? "";
      const stats = statsPorMunicipio.get(nombre);
      const peso = stats?.peso ?? 0;
      const activo = nombre === municipioDestacado || nombre === selectedMunicipio;

      return {
        fillColor: colorIntensidad(peso, maxPeso),
        fillOpacity: activo ? 0.88 : 0.72,
        color: activo ? "#38bdf8" : "#52525b",
        weight: activo ? 2.5 : 1,
        opacity: activo ? 1 : 0.85,
      };
    });
  }, [ready, municipioDestacado, selectedMunicipio, statsKey, maxPeso, statsPorMunicipio]);

  const panelMencion = useMemo(() => {
    if (!selectedMunicipio) return null;
    const stats = statsPorMunicipio.get(selectedMunicipio);
    if (!stats?.menciones.length) return null;
    return stats.menciones.find((m) => m.id === highlightedId) ?? stats.menciones[0];
  }, [selectedMunicipio, statsPorMunicipio, highlightedId]);

  function handleClose() {
    setSelectedMunicipio(null);
    onSelectRef.current?.(null);
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <div ref={divRef} className="h-full w-full" aria-hidden={!ready} />

      {!ready || !geojson ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/80 text-sm text-zinc-500">
          {geoError ?? "Cargando mapa..."}
        </div>
      ) : null}

      {ready && geojson && !esPreview ? (
        <div className="pointer-events-none absolute bottom-3 right-3 z-1000 rounded-lg border border-zinc-700/80 bg-zinc-900/90 px-2.5 py-2 backdrop-blur-sm">
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
            Intensidad
          </p>
          <div className="flex h-2 w-28 overflow-hidden rounded-sm">
            {ESCALA_COLORES.map((c) => (
              <div key={c.t} className="flex-1" style={{ backgroundColor: c.color }} />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-zinc-500">
            <span>Baja</span>
            <span>Alta</span>
          </div>
        </div>
      ) : null}

      {panelMencion && !esPreview ? (
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
            {panelMencion.plataforma} · {selectedMunicipio}
          </p>
          <p className="text-sm font-medium leading-snug text-zinc-100">
            {panelMencion.descripcionCorta ?? panelMencion.contenido.slice(0, 120)}
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            {formatIntegerEsMx(statsPorMunicipio.get(selectedMunicipio!)?.count ?? 0)} menciones en
            este municipio
          </p>
          {panelMencion.grupoCriminal ? (
            <p className="mt-1 text-xs text-orange-400">Grupo: {panelMencion.grupoCriminal}</p>
          ) : null}
          <a
            href={panelMencion.url}
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
