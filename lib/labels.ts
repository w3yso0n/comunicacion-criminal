import type {
  CategoriaContenido,
  NarrativaId,
  NivelRiesgo,
  Plataforma,
  TipoHechoDelictivo,
} from "@/lib/types";

export function labelPlataforma(p: Plataforma): string {
  switch (p) {
    case "twitter":
      return "X / Twitter";
    case "telegram":
      return "Telegram";
    case "tiktok":
      return "TikTok";
    default: {
      const _exhaustive: never = p;
      return _exhaustive;
    }
  }
}

export function labelNarrativa(id: NarrativaId): string {
  const map: Record<NarrativaId, string> = {
    control_territorial: "Control territorial",
    amenaza_directa: "Amenaza directa",
    poder_armado: "Poder armado",
    propaganda: "Propaganda",
    justificacion_criminal: "Justificación criminal",
    reclutamiento: "Reclutamiento",
    proteccion_social: "Protección social",
  };
  return map[id];
}

export function labelCategoria(c: CategoriaContenido): string {
  const map: Record<CategoriaContenido, string> = {
    narcomanta_digital: "Narcomanta digital",
    demostracion_armamento: "Demostración de armamento",
    comunicado_territorial: "Comunicado territorial",
    advertencia_publica: "Advertencia pública",
    propaganda_grupo: "Propaganda de grupo",
    noticia_neutral: "Noticia neutral",
    otro: "Otro",
  };
  return map[c];
}

export function labelRiesgo(r: NivelRiesgo): string {
  const map: Record<NivelRiesgo, string> = {
    critico: "Crítico",
    alto: "Alto",
    medio: "Medio",
    bajo: "Bajo",
    neutral: "Neutral",
  };
  return map[r];
}

export function labelTipoHecho(tipo: TipoHechoDelictivo): string {
  switch (tipo) {
    case "bloqueo_carretero":
      return "Bloqueo carretero";
    case "enfrentamiento":
      return "Enfrentamiento";
    case "extorsion":
      return "Extorsión";
    case "desplazamiento_forzado":
      return "Desplazamiento forzado";
    default: {
      const _e: never = tipo;
      return _e;
    }
  }
}
