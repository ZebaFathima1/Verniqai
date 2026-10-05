import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestXaiJson } from "@/lib/ai";

const requestSchema = z.object({
  role: z.string().trim().min(2).max(200),
  skills: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
});

const responseSchema = z.object({
  role: z.string(),
  matchScore: z.number().int().min(0).max(100),
  strengths: z.array(z.string()).max(8),
  gaps: z.array(z.string()).max(8),
  nextSteps: z.array(z.string()).min(1).max(5),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid job payload" },
      { status: 400 },
    );
  }

  try {
    const result = await requestXaiJson(
      "You are a career coach. Assess skill alignment honestly and avoid guaranteeing hiring outcomes. Return JSON with role (string), matchScore (integer 0-100), strengths (array of strings), gaps (array of strings), and nextSteps (1-5 actionable strings).",
      `Target role: ${parsed.data.role}\nCandidate skills: ${parsed.data.skills.join(", ") || "Not provided"}`,
      responseSchema,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Job match analysis failed." }, { status: 500 });
  }
}
