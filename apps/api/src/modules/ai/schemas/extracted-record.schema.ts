import { z } from "zod";

// Validates untrusted structured JSON returned by the extraction model
// before it's persisted — unlike DTOs (client-submitted, validated by
// class-validator), this is model output and gets its own check.
export const ExtractedRecordSchema = z.object({
  documentType: z.string().nullable().optional(),
  providerName: z.string().nullable().optional(),
  datesOfService: z.array(z.string()).optional().default([]),
  diagnoses: z.array(z.string()).optional().default([]),
  summary: z.string().nullable().optional(),
});

export type ExtractedRecord = z.infer<typeof ExtractedRecordSchema>;
