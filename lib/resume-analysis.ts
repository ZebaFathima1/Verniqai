import { z } from "zod";

export const MAX_RESUME_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_RESUME_TEXT_CHARACTERS = 25_000;
export const RESUME_FILE_ACCEPT = ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

export const resumeScoreDetailsSchema = z.object({
  score: z.number().int().min(0).max(100),
  reason: z.string().trim().min(12).max(400),
  evidence: z.string().trim().max(400),
});

export const resumeAnalysisSchema = z.object({
  overallFitScore: z.number().int().min(0).max(100),
  summary: z.string().trim().min(20).max(800),
  scoreBreakdown: z.object({
    atsReadability: resumeScoreDetailsSchema,
    roleAlignment: resumeScoreDetailsSchema,
    skillsEvidence: resumeScoreDetailsSchema,
    measurableImpact: resumeScoreDetailsSchema,
    clarity: resumeScoreDetailsSchema,
  }),
  strengths: z.array(z.object({
    finding: z.string().trim().min(8).max(240),
    evidence: z.string().trim().max(500),
  })).min(1).max(5),
  evidenceGaps: z.array(z.object({
    issue: z.string().trim().min(8).max(240),
    evidence: z.string().trim().max(500),
    impact: z.string().trim().min(10).max(320),
  })).min(1).max(5),
  priorityEdits: z.array(z.object({
    section: z.string().trim().min(2).max(100),
    observedIssue: z.string().trim().min(8).max(240),
    suggestedEdit: z.string().trim().min(12).max(420),
    missingDetails: z.array(z.string().trim().min(2).max(100)).max(5),
  })).min(1).max(5),
  keywordsFound: z.array(z.string().trim().min(1).max(80)).max(12),
  keywordsToConsider: z.array(z.string().trim().min(1).max(80)).max(12),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;

export type ResumeFileKind = "pdf" | "docx" | "txt";

const resumeFileTypes: Record<ResumeFileKind, { extensions: string[]; mimeTypes: string[] }> = {
  pdf: { extensions: [".pdf"], mimeTypes: ["application/pdf"] },
  docx: {
    extensions: [".docx"],
    mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  },
  txt: { extensions: [".txt"], mimeTypes: ["text/plain"] },
};

export function getResumeFileKind(fileName: string, mimeType = ""): ResumeFileKind | null {
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  const kind = (Object.keys(resumeFileTypes) as ResumeFileKind[]).find((candidate) =>
    resumeFileTypes[candidate].extensions.includes(extension),
  );

  if (!kind) return null;
  const normalizedMime = mimeType.trim().toLowerCase();
  if (
    normalizedMime &&
    normalizedMime !== "application/octet-stream" &&
    !resumeFileTypes[kind].mimeTypes.includes(normalizedMime)
  ) {
    return null;
  }

  return kind;
}
