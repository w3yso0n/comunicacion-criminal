import type { InteligenciaIAPayload } from "@/lib/inteligencia-schema";

export function emptyInteligenciaPayload(): InteligenciaIAPayload {
  return {
    generadoEn: new Date().toISOString(),
    modelo: "—",
    narrativasPorGrupo: [],
    senalesEscalada: [],
    correlaciones: [],
    zonasTension: [],
    tendenciasEjeTemporal: ["—", "—", "—", "—", "—", "—", "—"],
    tendenciasPorGrupo: [],
    tendenciasPorZona: [],
  };
}
