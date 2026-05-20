import type {
  Alerta,
  Autor,
  CategoriaDistribucion,
  EngagementPorCategoria,
  HechoDelictivo,
  KpiDia,
  NarrativaRadarDato,
  Publicacion,
  PuntoCorrelacionHora,
} from "@/lib/types";

/** Fecha fija de referencia para datos reproducibles (demo). */
export const MOCK_ANCHOR_ISO = "2026-05-15T20:00:00.000Z";

export const kpiDia: KpiDia = {
  publicacionesDetectadas: 248,
  publicacionesTrendPct: 32,
  riesgoExtremo: 38,
  indiceApologiaPromedio: 74,
  engagementTotal: 1_200_000,
  hechosCorrelacionados: 12,
  hechosCorrelacionConfianzaPct: 87,
  autoresClave: 15,
};

export const autores: Autor[] = [
  {
    id: "a1",
    handle: "@centinela_norte_mx",
    plataforma: "twitter",
    publicaciones: 42,
    engagementTotal: 890_000,
    reachSeguidores: 248_000,
    scoreApologiaPromedio: 91,
    narrativaDominante: "amenaza_directa",
    riesgo: "critico",
    reincidente: true,
    nuevoEstaSemana: false,
  },
  {
    id: "a2",
    handle: "@canal_bajio_alertas",
    plataforma: "telegram",
    publicaciones: 38,
    engagementTotal: 620_000,
    reachSeguidores: 185_000,
    scoreApologiaPromedio: 88,
    narrativaDominante: "control_territorial",
    riesgo: "critico",
    reincidente: true,
    nuevoEstaSemana: false,
  },
  {
    id: "a3",
    handle: "@tiktok_rumores_calle",
    plataforma: "tiktok",
    publicaciones: 29,
    engagementTotal: 410_000,
    reachSeguidores: 132_000,
    scoreApologiaPromedio: 86,
    narrativaDominante: "poder_armado",
    riesgo: "alto",
    reincidente: true,
    nuevoEstaSemana: false,
  },
  {
    id: "a4",
    handle: "@monitor_gto_sur",
    plataforma: "twitter",
    publicaciones: 18,
    engagementTotal: 95_000,
    reachSeguidores: 72_000,
    scoreApologiaPromedio: 64,
    narrativaDominante: "propaganda",
    riesgo: "medio",
    reincidente: false,
    nuevoEstaSemana: true,
  },
  {
    id: "a5",
    handle: "@telegrama_frontera_norte",
    plataforma: "telegram",
    publicaciones: 22,
    engagementTotal: 120_000,
    reachSeguidores: 58_000,
    scoreApologiaPromedio: 58,
    narrativaDominante: "amenaza_directa",
    riesgo: "medio",
    reincidente: true,
    nuevoEstaSemana: false,
  },
  {
    id: "a6",
    handle: "@noticias_michoacan_rss",
    plataforma: "twitter",
    publicaciones: 15,
    engagementTotal: 78_000,
    reachSeguidores: 45_000,
    scoreApologiaPromedio: 55,
    narrativaDominante: "control_territorial",
    riesgo: "medio",
    reincidente: false,
    nuevoEstaSemana: false,
  },
  {
    id: "a7",
    handle: "@sinaloa_trafico_info",
    plataforma: "telegram",
    publicaciones: 12,
    engagementTotal: 44_000,
    reachSeguidores: 31_000,
    scoreApologiaPromedio: 52,
    narrativaDominante: "proteccion_social",
    riesgo: "medio",
    reincidente: true,
    nuevoEstaSemana: false,
  },
  {
    id: "a8",
    handle: "@tiktok_callejero_mty",
    plataforma: "tiktok",
    publicaciones: 9,
    engagementTotal: 62_000,
    reachSeguidores: 28_000,
    scoreApologiaPromedio: 48,
    narrativaDominante: "propaganda",
    riesgo: "medio",
    reincidente: false,
    nuevoEstaSemana: true,
  },
  {
    id: "a9",
    handle: "@agenda_civica_mx",
    plataforma: "twitter",
    publicaciones: 6,
    engagementTotal: 12_000,
    reachSeguidores: 18_000,
    scoreApologiaPromedio: 28,
    narrativaDominante: "proteccion_social",
    riesgo: "bajo",
    reincidente: false,
    nuevoEstaSemana: false,
  },
  {
    id: "a10",
    handle: "@radio_comunitaria_tl",
    plataforma: "telegram",
    publicaciones: 4,
    engagementTotal: 8_200,
    reachSeguidores: 8_400,
    scoreApologiaPromedio: 22,
    narrativaDominante: "proteccion_social",
    riesgo: "neutral",
    reincidente: false,
    nuevoEstaSemana: false,
  },
];

export const hechos: HechoDelictivo[] = [
  {
    id: "h1",
    tipo: "bloqueo_carretero",
    estado: "Jalisco",
    municipio: "Tlajomulco de Zúñiga",
    fecha: "2026-05-14T22:10:00.000Z",
    descripcion:
      "Cierre parcial en carretera federal con presencia de vehículos quemados reportados por medios locales.",
    indiceCorrelacion: 92,
    publicaciones72hAntes: 54,
    publicaciones24hDespues: 31,
    zonaTag: "Periférico sur",
    grupoMencionado: "Grupo del Bajío Metropolitano (ficticio)",
    narrativaCoincidente: "amenaza_directa",
  },
  {
    id: "h2",
    tipo: "enfrentamiento",
    estado: "Michoacán",
    municipio: "Apatzingán",
    fecha: "2026-05-13T16:40:00.000Z",
    descripcion:
      "Reporte de enfrentamiento armado en zona rural; autoridades confirman operativo en la región.",
    indiceCorrelacion: 88,
    publicaciones72hAntes: 41,
    publicaciones24hDespues: 22,
    zonaTag: "Tierra Caliente",
    grupoMencionado: "Célula Sierra Herida (ficticio)",
    narrativaCoincidente: "poder_armado",
  },
  {
    id: "h3",
    tipo: "extorsion",
    estado: "Guanajuato",
    municipio: "León",
    fecha: "2026-05-12T11:05:00.000Z",
    descripcion:
      "Denuncias ciudadanas sobre cobro de piso a comercios en colonias periféricas.",
    indiceCorrelacion: 76,
    publicaciones72hAntes: 28,
    publicaciones24hDespues: 14,
    zonaTag: "Zona industrial",
    grupoMencionado: "Grupo del Bajío Metropolitano (ficticio)",
    narrativaCoincidente: "control_territorial",
  },
  {
    id: "h4",
    tipo: "desplazamiento_forzado",
    estado: "Tamaulipas",
    municipio: "Nuevo Laredo",
    fecha: "2026-05-11T09:20:00.000Z",
    descripcion:
      "Desplazamiento de familias tras bloqueos intermitentes y mensajes intimidatorios en redes.",
    indiceCorrelacion: 84,
    publicaciones72hAntes: 36,
    publicaciones24hDespues: 19,
    zonaTag: "Corredor comercial",
    grupoMencionado: "Facción Frontera Norte (ficticio)",
    narrativaCoincidente: "amenaza_directa",
  },
  {
    id: "h5",
    tipo: "bloqueo_carretero",
    estado: "Sinaloa",
    municipio: "Culiacán",
    fecha: "2026-05-10T19:55:00.000Z",
    descripcion:
      "Bloqueos en avenidas principales con quema de unidades; cobertura en medios estatales.",
    indiceCorrelacion: 71,
    publicaciones72hAntes: 25,
    publicaciones24hDespues: 11,
    zonaTag: "Centro urbano",
    grupoMencionado: "Organización del Pacífico (ficticio)",
    narrativaCoincidente: "propaganda",
  },
  {
    id: "h6",
    tipo: "enfrentamiento",
    estado: "Jalisco",
    municipio: "Zapopan",
    fecha: "2026-05-09T13:15:00.000Z",
    descripcion:
      "Operativo coordinado tras reportes de convoyes armados en zona metropolitana.",
    indiceCorrelacion: 63,
    publicaciones72hAntes: 19,
    publicaciones24hDespues: 9,
    zonaTag: "ZMG",
    grupoMencionado: "Grupo del Bajío Metropolitano (ficticio)",
    narrativaCoincidente: "poder_armado",
  },
  {
    id: "h7",
    tipo: "extorsion",
    estado: "Michoacán",
    municipio: "Uruapan",
    fecha: "2026-05-08T08:30:00.000Z",
    descripcion:
      "Extorsión documentada a transportistas en tramos carreteros con mensajes en canales abiertos.",
    indiceCorrelacion: 55,
    publicaciones72hAntes: 14,
    publicaciones24hDespues: 7,
    zonaTag: "Carretera Uruapan–Patzcuaro",
    grupoMencionado: "Célula Sierra Herida (ficticio)",
    narrativaCoincidente: "amenaza_directa",
  },
  {
    id: "h8",
    tipo: "desplazamiento_forzado",
    estado: "Guanajuato",
    municipio: "Irapuato",
    fecha: "2026-05-07T21:00:00.000Z",
    descripcion:
      "Salida de familias de comunidades rurales tras escalada de amenazas digitales previas.",
    indiceCorrelacion: 48,
    publicaciones72hAntes: 11,
    publicaciones24hDespues: 5,
    zonaTag: "Zona rural oriente",
    grupoMencionado: "Grupo del Bajío Metropolitano (ficticio)",
    narrativaCoincidente: "justificacion_criminal",
  },
];

export const publicaciones: Publicacion[] = [
  {
    id: "p1",
    autorId: "a1",
    plataforma: "twitter",
    textoResumido:
      "Mensaje intimidatorio que reivindica control sobre rutas y advierte a rivales con lenguaje explícito.",
    textoCompleto:
      "Mensaje intimidatorio que reivindica control sobre rutas y advierte a rivales con lenguaje explícito. Incluye referencias a 'limpieza' territorial y exhibición implícita de capacidad de respuesta.",
    url: "https://twitter.com/i/web/status/0000000000000000001",
    publicadoEn: "2026-05-15T18:42:00.000Z",
    engagement: { reacciones: 42_000, comentarios: 3_100, compartidos: 9_200 },
    reachEstimado: 620_000,
    categoria: "advertencia_publica",
    nivelApologia: 96,
    riesgo: "critico",
    narrativaPrincipal: "amenaza_directa",
    entidades: {
      grupos: ["Grupo del Bajío Metropolitano (ficticio)"],
      lugares: ["Jalisco", "ZMG"],
      alias: ["El Comandante del Sur (alias ficticio)"],
      instituciones: ["Guardia Nacional"],
      rivales: ["Célula rival Lago (ficticio)"],
      tipoAmenaza: "Intimidación directa",
    },
    justificacionIA:
      "El texto legitima violencia como herramienta de control y dirige amenazas explícitas a terceros.",
    correlacionHechoId: "h1",
  },
  {
    id: "p2",
    autorId: "a2",
    plataforma: "telegram",
    textoResumido:
      "Comunicado de estilo narcomanta digital con lista de prohibiciones para la población.",
    textoCompleto:
      "Comunicado de estilo narcomanta digital con lista de prohibiciones para la población. Se presenta al grupo como autoridad que 'impone orden' y castiga desobediencia.",
    url: "https://t.me/c/ficticio_canal/12001",
    publicadoEn: "2026-05-15T17:05:00.000Z",
    engagement: { reacciones: 18_000, comentarios: 4_800, compartidos: 6_100 },
    reachEstimado: 410_000,
    categoria: "narcomanta_digital",
    nivelApologia: 94,
    riesgo: "critico",
    narrativaPrincipal: "control_territorial",
    entidades: {
      grupos: ["Grupo del Bajío Metropolitano (ficticio)"],
      lugares: ["Guanajuato", "León"],
      alias: [],
      instituciones: [],
      rivales: [],
      tipoAmenaza: "Restricción de movilidad",
    },
    justificacionIA:
      "Formato clásico de narcomanta: mandatos, castigos y advertencia a civiles y rivales.",
    correlacionHechoId: "h3",
  },
  {
    id: "p3",
    autorId: "a3",
    plataforma: "tiktok",
    textoResumido:
      "Video corto con exhibición de armamento y mensajes de exaltación al grupo armado ficticio.",
    textoCompleto:
      "Video corto con exhibición de armamento y mensajes de exaltación al grupo armado ficticio. Se normaliza el uso de fuerza como espectáculo.",
    url: "https://www.tiktok.com/@tiktok_rumores_calle/video/0000000000000000003",
    publicadoEn: "2026-05-15T15:20:00.000Z",
    engagement: { reacciones: 120_000, comentarios: 14_000, compartidos: 22_000 },
    reachEstimado: 890_000,
    categoria: "demostracion_armamento",
    nivelApologia: 91,
    riesgo: "critico",
    narrativaPrincipal: "poder_armado",
    entidades: {
      grupos: ["Célula Sierra Herida (ficticio)"],
      lugares: ["Michoacán"],
      alias: [],
      instituciones: [],
      rivales: ["Grupo del Bajío Metropolitano (ficticio)"],
      tipoAmenaza: "Exhibición de fuerza",
    },
    justificacionIA:
      "Glorificación de capacidad armada y presentación del grupo como actor legítimo de violencia.",
    correlacionHechoId: "h2",
  },
  {
    id: "p4",
    autorId: "a1",
    plataforma: "twitter",
    textoResumido:
      "Hilo que justifica acciones violentas como 'justicia' frente a abusos de autoridades locales.",
    textoCompleto:
      "Hilo que justifica acciones violentas como 'justicia' frente a abusos de autoridades locales. Minimiza daño colateral y exalta liderazgo del grupo ficticio.",
    url: "https://twitter.com/i/web/status/0000000000000000004",
    publicadoEn: "2026-05-15T14:10:00.000Z",
    engagement: { reacciones: 28_000, comentarios: 2_400, compartidos: 5_600 },
    reachEstimado: 380_000,
    categoria: "propaganda_grupo",
    nivelApologia: 87,
    riesgo: "alto",
    narrativaPrincipal: "justificacion_criminal",
    entidades: {
      grupos: ["Grupo del Bajío Metropolitano (ficticio)"],
      lugares: ["Jalisco"],
      alias: [],
      instituciones: ["Ayuntamiento (genérico)"],
      rivales: [],
      tipoAmenaza: "Deslegitimar autoridad",
    },
    justificacionIA:
      "Se presenta la violencia del grupo como respuesta moral, típico de apología indirecta elevada.",
  },
  {
    id: "p5",
    autorId: "a4",
    plataforma: "twitter",
    textoResumido:
      "Publicación que mezcla noticia local con comentarios que simpatizan con mensajes de control territorial.",
    textoCompleto:
      "Publicación que mezcla noticia local con comentarios que simpatizan con mensajes de control territorial. Tono ambiguo pero claramente favorable al discurso del grupo ficticio.",
    url: "https://twitter.com/i/web/status/0000000000000000005",
    publicadoEn: "2026-05-15T12:33:00.000Z",
    engagement: { reacciones: 6_200, comentarios: 890, compartidos: 1_100 },
    reachEstimado: 95_000,
    categoria: "comunicado_territorial",
    nivelApologia: 68,
    riesgo: "medio",
    narrativaPrincipal: "control_territorial",
    entidades: {
      grupos: ["Facción Frontera Norte (ficticio)"],
      lugares: ["Tamaulipas", "Nuevo Laredo"],
      alias: [],
      instituciones: [],
      rivales: [],
    },
    justificacionIA:
      "Lenguaje mixto: aparente informativo con marcos que normalizan la presencia armada como 'orden'.",
    correlacionHechoId: "h4",
  },
  {
    id: "p6",
    autorId: "a5",
    plataforma: "telegram",
    textoResumido:
      "Cadena de mensajes con advertencias a transportistas y referencias a 'cuotas' en carretera.",
    textoCompleto:
      "Cadena de mensajes con advertencias a transportistas y referencias a 'cuotas' en carretera. Se evita nombrar directamente al grupo pero se reconocen señas distintivas.",
    url: "https://t.me/c/ficticio_canal/12002",
    publicadoEn: "2026-05-15T11:02:00.000Z",
    engagement: { reacciones: 4_100, comentarios: 2_200, compartidos: 980 },
    reachEstimado: 72_000,
    categoria: "advertencia_publica",
    nivelApologia: 62,
    riesgo: "medio",
    narrativaPrincipal: "amenaza_directa",
    entidades: {
      grupos: ["Organización del Pacífico (ficticio)"],
      lugares: ["Sinaloa", "Culiacán"],
      alias: [],
      instituciones: [],
      rivales: [],
      tipoAmenaza: "Extorsión velada",
    },
    justificacionIA:
      "Mensajes de coerción económica con tono intimidatorio pero sin consigna explícita de ataque inmediato.",
    correlacionHechoId: "h5",
  },
  {
    id: "p7",
    autorId: "a6",
    plataforma: "twitter",
    textoResumido:
      "Hilo con fotografías de supuestos comunicados adheridos a puentes; comentarios celebran 'autoridad'.",
    textoCompleto:
      "Hilo con fotografías de supuestos comunicados adheridos a puentes; comentarios celebran 'autoridad'. Mezcla humor y admiración hacia el grupo ficticio.",
    url: "https://twitter.com/i/web/status/0000000000000000007",
    publicadoEn: "2026-05-15T09:18:00.000Z",
    engagement: { reacciones: 9_800, comentarios: 1_400, compartidos: 2_600 },
    reachEstimado: 118_000,
    categoria: "narcomanta_digital",
    nivelApologia: 58,
    riesgo: "medio",
    narrativaPrincipal: "propaganda",
    entidades: {
      grupos: ["Célula Sierra Herida (ficticio)"],
      lugares: ["Michoacán", "Uruapan"],
      alias: [],
      instituciones: [],
      rivales: [],
    },
    justificacionIA:
      "Apología indirecta vía comentarios y reacciones que glorifican presencia del grupo en el territorio.",
    correlacionHechoId: "h7",
  },
  {
    id: "p8",
    autorId: "a7",
    plataforma: "telegram",
    textoResumido:
      "Mensaje que presenta al grupo ficticio como 'protector' de la población frente a robos.",
    textoCompleto:
      "Mensaje que presenta al grupo ficticio como 'protector' de la población frente a robos. Narrativa de protección social con fines de reclutamiento simbólico.",
    url: "https://t.me/c/ficticio_canal/12003",
    publicadoEn: "2026-05-15T07:44:00.000Z",
    engagement: { reacciones: 2_900, comentarios: 1_100, compartidos: 640 },
    reachEstimado: 48_000,
    categoria: "propaganda_grupo",
    nivelApologia: 54,
    riesgo: "medio",
    narrativaPrincipal: "proteccion_social",
    entidades: {
      grupos: ["Grupo del Bajío Metropolitano (ficticio)"],
      lugares: ["Guanajuato"],
      alias: [],
      instituciones: [],
      rivales: ["Delincuencia común (genérico)"],
    },
    justificacionIA:
      "Justificación moral del grupo como autoridad paralela; simpatía explícita moderada.",
  },
  {
    id: "p9",
    autorId: "a8",
    plataforma: "tiktok",
    textoResumido:
      "Clip con música viral y texto ambiguo sobre 'respetar a quien manda en la zona'.",
    textoCompleto:
      "Clip con música viral y texto ambiguo sobre 'respetar a quien manda en la zona'. Sin armas visibles pero con iconografía asociada a narrativas criminales.",
    url: "https://www.tiktok.com/@tiktok_callejero_mty/video/0000000000000000009",
    publicadoEn: "2026-05-15T05:12:00.000Z",
    engagement: { reacciones: 52_000, comentarios: 6_200, compartidos: 8_900 },
    reachEstimado: 210_000,
    categoria: "otro",
    nivelApologia: 42,
    riesgo: "bajo",
    narrativaPrincipal: "reclutamiento",
    entidades: {
      grupos: [],
      lugares: ["Tamaulipas"],
      alias: [],
      instituciones: [],
      rivales: [],
    },
    justificacionIA:
      "Discurso ambiguo con posible doble sentido; sin elementos concluyentes de apología directa.",
  },
  {
    id: "p10",
    autorId: "a9",
    plataforma: "twitter",
    textoResumido:
      "Resumen de bloqueo carretero con enlaces a medios; tono mayormente descriptivo.",
    textoCompleto:
      "Resumen de bloqueo carretero con enlaces a medios; tono mayormente descriptivo. Incluye advertencias genéricas de precaución sin legitimar actores armados.",
    url: "https://twitter.com/i/web/status/0000000000000000010",
    publicadoEn: "2026-05-15T03:50:00.000Z",
    engagement: { reacciones: 1_200, comentarios: 210, compartidos: 340 },
    reachEstimado: 22_000,
    categoria: "noticia_neutral",
    nivelApologia: 26,
    riesgo: "bajo",
    narrativaPrincipal: "amenaza_directa",
    entidades: {
      grupos: [],
      lugares: ["Jalisco"],
      alias: [],
      instituciones: ["Protección Civil (genérico)"],
      rivales: [],
    },
    justificacionIA:
      "Enfoque informativo con menciones de riesgo sin exaltación de grupos armados.",
  },
  {
    id: "p11",
    autorId: "a10",
    plataforma: "telegram",
    textoResumido:
      "Canal comunitario: lista de refugios temporales y números de emergencia municipales.",
    textoCompleto:
      "Canal comunitario: lista de refugios temporales y números de emergencia municipales. Sin referencias a grupos delictivos.",
    url: "https://t.me/c/ficticio_canal/12004",
    publicadoEn: "2026-05-15T02:15:00.000Z",
    engagement: { reacciones: 420, comentarios: 88, compartidos: 120 },
    reachEstimado: 9_500,
    categoria: "noticia_neutral",
    nivelApologia: 18,
    riesgo: "neutral",
    narrativaPrincipal: "proteccion_social",
    entidades: {
      grupos: [],
      lugares: ["Sinaloa", "Culiacán"],
      alias: [],
      instituciones: ["Cruz Roja (genérico)"],
      rivales: [],
    },
    justificacionIA:
      "Contenido orientado a asistencia civil; sin elementos de apología.",
  },
  {
    id: "p12",
    autorId: "a4",
    plataforma: "twitter",
    textoResumido:
      "Cobertura de tráfico y rutas alternas durante operativo; sin juicios de valor sobre actores.",
    textoCompleto:
      "Cobertura de tráfico y rutas alternas durante operativo; sin juicios de valor sobre actores. Menciona presencia policial únicamente.",
    url: "https://twitter.com/i/web/status/0000000000000000012",
    publicadoEn: "2026-05-15T01:05:00.000Z",
    engagement: { reacciones: 2_400, comentarios: 310, compartidos: 510 },
    reachEstimado: 34_000,
    categoria: "noticia_neutral",
    nivelApologia: 14,
    riesgo: "neutral",
    narrativaPrincipal: "control_territorial",
    entidades: {
      grupos: [],
      lugares: ["Guanajuato", "Irapuato"],
      alias: [],
      instituciones: ["Secretaría de Seguridad (genérico)"],
      rivales: [],
    },
    justificacionIA:
      "Mención neutra de eventos de orden público sin legitimar a grupos armados.",
    correlacionHechoId: "h8",
  },
];

export const alertas: Alerta[] = [
  {
    id: "al1",
    tipo: "correlacion",
    severidad: "critica",
    titulo: "Correlación alta: advertencias y bloqueo en Jalisco",
    descripcion:
      "Incremento atípico de narrativa de advertencia pública en ventana de 72 h previa a un bloqueo reportado.",
    creadaEn: "2026-05-15T19:10:00.000Z",
    estado: "Nueva",
  },
  {
    id: "al2",
    tipo: "pico_actividad",
    severidad: "critica",
    titulo: "Pico nocturno en Telegram (+180% vs promedio)",
    descripcion:
      "Entre 21:00 y 23:00 se concentró actividad propagandística en canales regionales del Bajío.",
    creadaEn: "2026-05-15T20:05:00.000Z",
    estado: "Nueva",
  },
  {
    id: "al3",
    tipo: "autor",
    severidad: "alta",
    titulo: "Autor reincidente: @centinela_norte_mx",
    descripcion:
      "Sostenimiento de alto score de apología en múltiples publicaciones en menos de 24 horas.",
    creadaEn: "2026-05-15T16:40:00.000Z",
    estado: "Nueva",
  },
  {
    id: "al4",
    tipo: "narrativa",
    severidad: "alta",
    titulo: "Aumento de narrativa 'poder armado' en TikTok",
    descripcion:
      "Videos con exhibición implícita de fuerza ganan participación relativa frente a otras categorías.",
    creadaEn: "2026-05-15T14:22:00.000Z",
  },
  {
    id: "al5",
    tipo: "correlacion",
    severidad: "media",
    titulo: "Coincidencia territorial en Michoacán",
    descripcion:
      "Publicaciones mencionan la misma subregión que un enfrentamiento reportado 36 h después.",
    creadaEn: "2026-05-15T10:15:00.000Z",
  },
];

function horaLabel(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

/** Serie horaria de referencia (últimas 24h agregadas por hora del día). Picos madrugada y noche. */
export const correlacionPorHora: PuntoCorrelacionHora[] = Array.from(
  { length: 24 },
  (_, h) => {
    const isWeekendContext = true;
    const nightPeak = h >= 21 && h <= 23;
    const dawnPeak = h >= 1 && h <= 3;
    const base = 12 + (isWeekendContext ? 8 : 0);
    const wave =
      nightPeak ? 95 + h * 3 : dawnPeak ? 72 + (4 - Math.abs(h - 2)) * 10 : base;
    const publicaciones = Math.round(
      wave + Math.sin(h / 2) * 6 + (h >= 18 ? 18 : 0),
    );
    const criticas = Math.round(publicaciones * (nightPeak ? 0.42 : dawnPeak ? 0.35 : 0.18));
    const hechos =
      h === 2 || h === 9 || h === 14 || h === 21 || h === 22 ? (h === 22 ? 2 : 1) : 0;
    const indiceApologiaPromedio = Math.min(
      98,
      Math.round(52 + criticas * 0.45 + (nightPeak ? 14 : 0)),
    );
    return {
      hora: horaLabel(h),
      publicaciones,
      publicacionesCriticas: criticas,
      hechos,
      indiceApologiaPromedio,
    };
  },
);

/** Índices de hora (0-23) con mayor volumen para ReferenceLine. */
export const horasPicoDetectadas: number[] = [22, 2, 23];

export const narrativasRadar: NarrativaRadarDato[] = [
  {
    id: "control_territorial",
    label: "Control territorial",
    valor: 88,
    variacionSemanalPct: 12,
    descripcion: "Mensajes de control de zona o disputa explícita.",
  },
  {
    id: "amenaza_directa",
    label: "Amenaza directa",
    valor: 82,
    variacionSemanalPct: 9,
    descripcion: "Advertencias a población, rivales o autoridades.",
  },
  {
    id: "poder_armado",
    label: "Poder armado",
    valor: 74,
    variacionSemanalPct: 6,
    descripcion: "Exhibición de fuerza o armamento.",
  },
  {
    id: "propaganda",
    label: "Propaganda",
    valor: 74,
    variacionSemanalPct: 4,
    descripcion: "Exaltación o normalización del grupo.",
  },
  {
    id: "justificacion_criminal",
    label: "Justificación criminal",
    valor: 57,
    variacionSemanalPct: -3,
    descripcion: "Marcos morales que legitiman castigos violentos.",
  },
  {
    id: "reclutamiento",
    label: "Reclutamiento",
    valor: 45,
    variacionSemanalPct: 2,
    descripcion: "Búsqueda de simpatía o aceptación social.",
  },
  {
    id: "proteccion_social",
    label: "Protección social",
    valor: 38,
    variacionSemanalPct: -1,
    descripcion: "Relato de 'cuidado al pueblo' con fines de propaganda.",
  },
];

export const categoriaDistribucion: CategoriaDistribucion[] = [
  {
    categoria: "propaganda_grupo",
    label: "Propaganda de grupo",
    pct: 28,
    ejemplo: "«Aquí manda quien protege a la gente honrada…» (paráfrasis)",
  },
  {
    categoria: "advertencia_publica",
    label: "Advertencia pública",
    pct: 24,
    ejemplo: "Avisos de restricciones y consecuencias para civiles o rivales.",
  },
  {
    categoria: "narcomanta_digital",
    label: "Narcomanta digital",
    pct: 18,
    ejemplo: "Imágenes tipo manta con listas de prohibiciones.",
  },
  {
    categoria: "demostracion_armamento",
    label: "Demostración de armamento",
    pct: 16,
    ejemplo: "Clips con armas largas y convoyes en carretera.",
  },
  {
    categoria: "comunicado_territorial",
    label: "Comunicado territorial",
    pct: 14,
    ejemplo: "Mensajes de control de accesos o 'tax' informal a rutas.",
  },
];

export const engagementPorCategoria: EngagementPorCategoria[] =
  categoriaDistribucion.map((c) => {
    const engagement = Math.round(c.pct * 14_500);
    return {
      categoria: c.categoria,
      label: c.label,
      engagement,
      pctDelTotal: Math.round((engagement / 1_200_000) * 1000) / 10,
    };
  });

export function getAutorById(id: string): Autor | undefined {
  return autores.find((a) => a.id === id);
}

export function getPublicacionesByAutorId(autorId: string): Publicacion[] {
  return publicaciones.filter((p) => p.autorId === autorId);
}
