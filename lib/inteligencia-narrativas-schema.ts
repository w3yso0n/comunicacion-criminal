import { z } from "zod";

/** Solo texto narrativo; metadatos vienen de la BD. */
export const narrativasLlmSchema = z.object({
  narrativasPorGrupo: z.array(
    z.object({
      grupoId: z.string(),
      resumenNarrativa: z.string(),
      vectoresNarrativos: z.array(z.string()).max(5),
    }),
  ),
});

export type NarrativasLlmResponse = z.infer<typeof narrativasLlmSchema>;
