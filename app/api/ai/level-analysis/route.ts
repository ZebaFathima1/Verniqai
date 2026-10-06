import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestXaiJson } from "@/lib/ai";

const requestSchema = z.object({
  level: z.enum(["basic", "intermediate", "pro"]),
  targetRole: z.string().trim().min(2).max(160),
  skills: z.array(z.object({ name: z.string().max(80), score: z.number().min(0).max(100) })).max(30),
  progress: z.string().trim().max(1000).default(""),
});

const responseSchema = z.object({
  strengths: z.array(z.string()).min(1).max(5),
  focusAreas: z.array(z.string()).min(1).max(5),
  nextAction: z.string(),
  levelReadiness: z.number().int().min(0).max(100),
  explanation: z.string(),
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid level analysis input." }, { status: 400 });
  }

  try {
    const result = await requestXaiJson(
      "You are a career learning analyst. Adapt your depth to the learner level (basic: simple foundations; intermediate: practical implementation; pro: industry evidence and role preparation). Return valid JSON with strengths, focusAreas, nextAction, levelReadiness (0-100), and explanation. Never claim verified credentials.",
      `Level: ${parsed.data.level}\nTarget role: ${parsed.data.targetRole}\nSkills: ${JSON.stringify(parsed.data.skills)}\nProgress: ${parsed.data.progress}`,
      responseSchema,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiServiceError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Level analysis failed." }, { status: 500 });
  }
}
