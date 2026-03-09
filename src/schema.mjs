import { z } from "zod";

export const BriefSchema = z.object({
  intent: z.enum(["push_fabric", "trend_consulting"]).default("push_fabric"),
  theme: z.string().default("未命名面料方向"),
  audience: z.string().default("未指定"),
  useCases: z.array(z.string()).default([]),
  materialDirection: z.array(z.string()).default([]),
  colorPalette: z.array(z.string()).default([]),
  textureAndFinish: z.array(z.string()).default([]),
  performance: z.array(z.string()).default([]),
  styleKeywords: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  budget: z.string().default("未指定"),
  sourceType: z.enum(["text", "pdf"]).default("text"),
  summary: z.string().default(""),
  ambiguities: z.array(z.string()).default([]),
  missingInfo: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.6)
});

export const ClarificationSchema = z.object({
  id: z.string(),
  question: z.string(),
  reason: z.string(),
  field: z.string()
});

export const CandidateSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  prompt: z.string(),
  sellingPoints: z.array(z.string()).default([]),
  imagePath: z.string(),
  mimeType: z.string().default("image/svg+xml"),
  provider: z.string().default("placeholder")
});

export const SessionSchema = z.object({
  sessionId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sourceType: z.enum(["text", "pdf"]),
  inputText: z.string().default(""),
  pdfPath: z.string().default(""),
  extractedText: z.string().default(""),
  brief: BriefSchema,
  clarifications: z.array(ClarificationSchema).default([]),
  clarificationHistory: z
    .array(
      z.object({
        at: z.string(),
        message: z.string()
      })
    )
    .default([]),
  candidates: z.array(CandidateSchema).default([]),
  selectedIds: z.array(z.string()).default([]),
  pptPath: z.string().default(""),
  status: z
    .enum([
      "clarification_needed",
      "ready_for_generation",
      "candidates_ready",
      "selection_saved",
      "ppt_generated"
    ])
    .default("clarification_needed")
});

export function parseBrief(value) {
  return BriefSchema.parse(value);
}

export function parseSession(value) {
  return SessionSchema.parse(value);
}
