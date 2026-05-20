export type Plataforma = "twitter" | "telegram" | "tiktok";

export type CategoriaContenido =
  | "narcomanta_digital"
  | "demostracion_armamento"
  | "comunicado_territorial"
  | "advertencia_publica"
  | "propaganda_grupo"
  | "noticia_neutral"
  | "otro";

export type NivelRiesgo = "critico" | "alto" | "medio" | "bajo" | "neutral";

export type NarrativaId =
  | "control_territorial"
  | "amenaza_directa"
  | "poder_armado"
  | "propaganda"
  | "justificacion_criminal"
  | "reclutamiento"
  | "proteccion_social";

export type TipoHechoDelictivo =
  | "bloqueo_carretero"
  | "enfrentamiento"
  | "extorsion"
  | "desplazamiento_forzado";

export type SeveridadAlerta = "critica" | "alta" | "media" | "baja";

export type TipoAlerta =
  | "correlacion"
  | "pico_actividad"
  | "autor"
  | "narrativa"
  | "correlacion_accion_hecho"
  | "coincidencia_territorial";

export type EstadoMexico =
  | "Jalisco"
  | "Sinaloa"
  | "Guanajuato"
  | "Michoacán"
  | "Tamaulipas";

export type RegionFiltro = "todas" | EstadoMexico;

export interface EntidadesExtraidas {
  grupos: string[];
  lugares: string[];
  alias: string[];
  instituciones: string[];
  rivales: string[];
  tipoAmenaza?: string;
}

export interface Publicacion {
  id: string;
  autorId: string;
  plataforma: Plataforma;
  textoResumido: string;
  textoCompleto: string;
  url: string;
  publicadoEn: string;
  engagement: {
    reacciones: number;
    comentarios: number;
    compartidos: number;
  };
  reachEstimado: number;
  categoria: CategoriaContenido;
  nivelApologia: number;
  riesgo: NivelRiesgo;
  narrativaPrincipal: NarrativaId;
  entidades: EntidadesExtraidas;
  justificacionIA: string;
  correlacionHechoId?: string;
}

export interface Autor {
  id: string;
  handle: string;
  plataforma: Plataforma;
  publicaciones: number;
  engagementTotal: number;
  reachSeguidores: number;
  scoreApologiaPromedio: number;
  narrativaDominante: NarrativaId;
  riesgo: NivelRiesgo;
  reincidente: boolean;
  nuevoEstaSemana: boolean;
}

export interface HechoDelictivo {
  id: string;
  tipo: TipoHechoDelictivo;
  estado: EstadoMexico;
  municipio: string;
  fecha: string;
  descripcion: string;
  indiceCorrelacion: number;
  publicaciones72hAntes: number;
  publicaciones24hDespues: number;
  zonaTag: string;
  grupoMencionado: string;
  narrativaCoincidente: NarrativaId;
}

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  severidad: SeveridadAlerta;
  titulo: string;
  descripcion: string;
  creadaEn: string;
  grupoCriminal?: string;
  municipio?: string;
  plataforma?: string;
  clusterId?: string;
  nMenciones?: number;
  scoreConfianzaPct?: number;
  estado?: string;
}

export interface Mencion {
  id: string;
  url: string;
  publicadoEn: string;
  plataforma: Plataforma;
  handle: string;
  autorNombre?: string;
  autorVerificado?: boolean;
  autorSeguidores?: number;
  contenido: string;
  descripcionCorta?: string;
  municipio?: string;
  ubicacionEspecifica?: string;
  zona?: string;
  engagement: {
    reacciones: number;
    comentarios: number;
    compartidos: number;
    total: number;
  };
  reach?: number;
  tipoPrincipal?: string;
  subTipo?: string;
  tipoDelito?: string;
  scoreSeveridad?: number;
  nivelRiesgo?: NivelRiesgo;
  grupoCriminal?: string;
  senalEscalada?: string;
  analisisIa?: string;
  clusterId?: string;
  clusterRole?: string;
  capturaUrl?: string;
}

export interface KpiDia {
  publicacionesDetectadas: number;
  publicacionesTrendPct: number;
  riesgoExtremo: number;
  indiceApologiaPromedio: number;
  engagementTotal: number;
  hechosCorrelacionados: number;
  hechosCorrelacionConfianzaPct: number;
  autoresClave: number;
}

/** Punto horario para el chart principal (último día de referencia o agregado). */
export interface PuntoCorrelacionHora {
  hora: string;
  publicaciones: number;
  publicacionesCriticas: number;
  hechos: number;
  indiceApologiaPromedio: number;
}

export interface NarrativaRadarDato {
  id: NarrativaId;
  label: string;
  valor: number;
  variacionSemanalPct: number;
  descripcion: string;
}

export interface CategoriaDistribucion {
  categoria: CategoriaContenido;
  label: string;
  pct: number;
  ejemplo: string;
}

export interface EngagementPorCategoria {
  categoria: CategoriaContenido;
  label: string;
  engagement: number;
  pctDelTotal: number;
}
