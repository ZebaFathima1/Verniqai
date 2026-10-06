import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestGroqJson } from "@/lib/ai";

const requestSchema = z.object({
  resumeText: z.string().trim().min(20).max(12_000),
  targetRole: z.string().trim().min(2).max(200),
});

const responseSchema = z.object({
  atsScore: z.number().int().min(0).max(100),
  summary: z.string(),
  suggestions: z.array(z.string()).min(1).max(6),
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
      { error: parsed.error.issues[0]?.message ?? "Invalid resume payload" },
      { status: 400 },
    );
  }

  try {
    const result = await requestGroqJson(
      "You are a resume coach. Analyze only the resume text supplied; do not invent experience or credentials. Return JSON with atsScore (integer 0-100), summary (string), and suggestions (1-6 actionable strings).",
      `Target role: ${parsed.data.targetRole}\n\nResume:\n${parsed.data.resumeText}`,
      responseSchema,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Resume analysis failed." }, { status: 500 });
  }
}
