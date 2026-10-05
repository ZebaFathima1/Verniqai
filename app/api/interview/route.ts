import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestXaiJson } from "@/lib/ai";

const requestSchema = z.object({
  role: z.string().trim().min(2).max(200),
  question: z.string().trim().min(10).max(2000),
});

const responseSchema = z.object({
  question: z.string(),
  role: z.string(),
  guidance: z.array(z.string()).min(1).max(6),
  scoreHint: z.number().int().min(0).max(100),
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
      { error: parsed.error.issues[0]?.message ?? "Invalid interview payload" },
      { status: 400 },
    );
  }

  try {
    const result = await requestXaiJson(
      "You are an interview coach. Give specific guidance for answering the question; do not write a fabricated personal story for the candidate. Return JSON with question (string), role (string), guidance (1-6 concise strings), and scoreHint (integer 0-100 describing answer difficulty/readiness, not a prediction of hiring).",
      `Target role: ${parsed.data.role}\nInterview question: ${parsed.data.question}`,
      responseSchema,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Interview guidance could not be generated." },
      { status: 500 },
    );
  }
}
