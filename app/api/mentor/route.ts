import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestXaiJson } from "@/lib/ai";

const requestSchema = z.object({
  message: z.string().trim().min(2).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .max(10)
    .default([]),
});

const responseSchema = z.object({ reply: z.string().min(1).max(5000) });

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
      { error: parsed.error.issues[0]?.message ?? "Invalid mentor message" },
      { status: 400 },
    );
  }

  const transcript = parsed.data.history
    .map((entry) => `${entry.role === "user" ? "Student" : "VERNIQ"}: ${entry.content}`)
    .join("\n");

  try {
    const result = await requestXaiJson(
      "You are VERNIQ, a supportive and practical AI career mentor. Give specific, honest advice. Never claim to know private profile details that the user has not shared. Return JSON with a single string field named reply.",
      `${transcript ? `Recent conversation:\n${transcript}\n\n` : ""}Student: ${parsed.data.message}`,
      responseSchema,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "The mentor could not respond right now." }, { status: 500 });
  }
}
