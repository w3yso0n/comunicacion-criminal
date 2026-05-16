import type { InteligenciaIAPayload } from "@/lib/inteligencia-schema";

/** Payload demo alineado al contrato de `/api/inteligencia/analyze` (sin llamar a la API). */
export const mockInteligenciaPayload: InteligenciaIAPayload = {
  generadoEn: "2026-05-15T20:00:00.000Z",
  modelo: "mock-estático",
  narrativasPorGrupo: [
    {
      grupoId: "g1",
      grupoNombre: "Grupo del Bajío Metropolitano (ficticio)",
      estado: "Jalisco",
      resumenNarrativa:
        "Discurso de control territorial y “orden” paralelo al Estado; se mezclan advertencias veladas con relato de protección a la población.",
      vectoresNarrativos: [
        "Control de mensajes en horario nocturno",
        "Exaltación de castigos a rivales",
        "Minimización de daño colateral",
      ],
      actualizadoEn: "2026-05-15T19:40:00.000Z",
      confianzaPct: 86,
      fuenteModelo: "mock",
    },
    {
      grupoId: "g2",
      grupoNombre: "Célula Sierra Herida (ficticio)",
      estado: "Michoacán",
      resumenNarrativa:
        "Narrativa de exhibición de fuerza y disputa por rutas; aumento de lenguaje intimidatorio en canales abiertos.",
      vectoresNarrativos: [
        "Poder armado como espectáculo",
        "Amenazas indirectas a rivales",
        "Reclutamiento simbólico de simpatía",
      ],
      actualizadoEn: "2026-05-15T18:55:00.000Z",
      confianzaPct: 81,
      fuenteModelo: "mock",
    },
    {
      grupoId: "g3",
      grupoNombre: "Facción Frontera Norte (ficticio)",
      estado: "Tamaulipas",
      resumenNarrativa:
        "Mensajes de advertencia a transportistas y control de narrativa sobre bloqueos; alta densidad en Telegram.",
      vectoresNarrativos: [
        "Advertencia económica / extorsión velada",
        "Señales de coordinación horaria",
        "Territorialidad en corredores",
      ],
      actualizadoEn: "2026-05-15T17:20:00.000Z",
      confianzaPct: 78,
      fuenteModelo: "mock",
    },
  ],
  senalesEscalada: [
    {
      id: "s1",
      titulo: "Ráfaga coordinada en Jalisco (21h–23h)",
      descripcion:
        "Picos simultáneos en volumen y en índice de apología en ventana de 3 h; patrón atípico vs. baseline semanal.",
      confianzaPct: 91,
      severidad: "alta",
      grupoId: "g1",
      zona: "ZMG",
      periodoEtiqueta: "Últimas 24 h",
    },
    {
      id: "s2",
      titulo: "Migración de narrativa hacia “justicia criminal”",
      descripcion:
        "En Michoacán, aumento de textos que legitiman castigos; posible escalada discursiva previa a operativos.",
      confianzaPct: 74,
      severidad: "media",
      grupoId: "g2",
      zona: "Tierra Caliente",
      periodoEtiqueta: "Últimos 7 días",
    },
    {
      id: "s3",
      titulo: "Sincronía mensajes–reportes de bloqueo",
      descripcion:
        "Coincidencia temporal entre oleadas en redes y reportes de bloqueos en carretera en el mismo estado (demo).",
      confianzaPct: 68,
      severidad: "media",
      grupoId: "g3",
      zona: "Nuevo Laredo",
      periodoEtiqueta: "Últimos 72 h",
    },
  ],
  correlaciones: [
    {
      id: "c1",
      resumen:
        "Subida de publicaciones de advertencia en Jalisco en las 72 h previas a reportes de bloqueo en medios.",
      indiceConfianza: 88,
      publicacionesEnVentana: 54,
      hechoTipo: "Bloqueo carretero",
      zona: "Jalisco · ZMG",
      ventanaHoras: 72,
    },
    {
      id: "c2",
      resumen:
        "Pico de exhibición de fuerza en Michoacán seguido de cobertura de enfrentamiento en la misma subregión.",
      indiceConfianza: 76,
      publicacionesEnVentana: 41,
      hechoTipo: "Enfrentamiento",
      zona: "Michoacán · Apatzingán",
      ventanaHoras: 48,
    },
    {
      id: "c3",
      resumen:
        "Mensajes de coerción en canales de Sinaloa alineados temporalmente con reportes de extorsión a transporte.",
      indiceConfianza: 62,
      publicacionesEnVentana: 28,
      hechoTipo: "Extorsión",
      zona: "Sinaloa · Culiacán",
      ventanaHoras: 96,
    },
  ],
  zonasTension: [
    { estado: "Jalisco", intensidad0_100: 88, tendencia: "sube", notaCorta: "ZMG + carreteras" },
    { estado: "Michoacán", intensidad0_100: 82, tendencia: "sube", notaCorta: "Tierra Caliente" },
    { estado: "Tamaulipas", intensidad0_100: 79, tendencia: "estable", notaCorta: "Corredor norte" },
    { estado: "Sinaloa", intensidad0_100: 71, tendencia: "baja", notaCorta: "Centro urbano" },
    { estado: "Guanajuato", intensidad0_100: 64, tendencia: "estable", notaCorta: "Bajío industrial" },
  ],
  tendenciasEjeTemporal: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  tendenciasPorGrupo: [
    { id: "tg1", etiqueta: "Bajío Metropolitano", valores: [42, 48, 55, 61, 58, 72, 88] },
    { id: "tg2", etiqueta: "Sierra Herida", valores: [38, 40, 44, 52, 49, 58, 70] },
    { id: "tg3", etiqueta: "Frontera Norte", valores: [55, 52, 54, 56, 60, 63, 68] },
  ],
  tendenciasPorZona: [
    { id: "tz1", etiqueta: "ZMG", valores: [50, 52, 58, 64, 62, 75, 90] },
    { id: "tz2", etiqueta: "Tierra Caliente", valores: [44, 46, 50, 55, 53, 60, 72] },
    { id: "tz3", etiqueta: "Frontera", valores: [58, 56, 57, 59, 61, 64, 66] },
  ],
};
