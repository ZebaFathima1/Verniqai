import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestGroqJson } from "@/lib/ai";

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
  context: z.object({
    level: z.enum(["basic", "intermediate", "pro"]).default("basic"),
    targetRole: z.string().max(160).default(""),
    skills: z.array(z.string().max(80)).max(30).default([]),
    completedSkills: z.array(z.string().max(100)).max(100).default([]),
    completedProjects: z.array(z.string().max(100)).max(50).default([]),
  }).default({ level: "basic", targetRole: "", skills: [], completedSkills: [], completedProjects: [] }),
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
  const coachingStyle = {
    basic: "Use plain language, friendly analogies, short steps, beginner examples, and gentle checks for understanding.",
    intermediate: "Explain technical concepts accurately, show practical implementation steps, trade-offs, and project ideas.",
    pro: "Use industry-level depth: architecture, production trade-offs, measurable evidence, interview and hiring context.",
  }[parsed.data.context.level];

  try {
    const result = await requestGroqJson(
      `You are VERNIQ, a supportive, practical career mentor. ${coachingStyle} Give honest specific advice. Never claim verified credentials or invent user details. Return JSON with a single string field named reply.`,
      `Learner context (provided by the browser and may be incomplete):\nLevel: ${parsed.data.context.level}\nTarget role: ${parsed.data.context.targetRole || "not provided"}\nSkills: ${parsed.data.context.skills.join(", ") || "not provided"}\nCompleted learning: ${parsed.data.context.completedSkills.join(", ") || "none recorded"}\nCompleted projects: ${parsed.data.context.completedProjects.join(", ") || "none recorded"}\n\n${transcript ? `Recent conversation:\n${transcript}\n\n` : ""}Student: ${parsed.data.message}`,
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
