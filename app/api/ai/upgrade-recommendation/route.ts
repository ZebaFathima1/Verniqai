import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestGroqJson } from "@/lib/ai";
import { normalizeLevel } from "@/lib/levels";

const requestSchema = z.object({
  level: z.enum(["basic", "intermediate", "pro"]),
  targetRole: z.string().trim().max(160).default(""),
  completedSkills: z.array(z.string().max(80)).max(100).default([]),
  completedProjects: z.array(z.string().max(120)).max(50).default([]),
  assessmentScore: z.number().min(0).max(100).optional(),
});

const responseSchema = z.object({
  recommendation: z.enum(["stay", "explore-next-level"]),
  nextLevel: z.enum(["basic", "intermediate", "pro"]).nullable(),
  reason: z.string(),
  suggestedMilestones: z.array(z.string()).max(4),
  optional: z.literal(true),
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid progress data." }, { status: 400 });
  }

  const current = parsed.data.level;
  const skillMilestones = new Set(
    parsed.data.completedSkills.map((skill) => skill.includes(":") ? skill.split(":").pop() ?? skill : skill),
  ).size;
  const eligible = current === "basic"
    ? skillMilestones >= 5 && (parsed.data.assessmentScore ?? 0) >= 70
    : current === "intermediate"
      ? parsed.data.completedProjects.length >= 2 && (parsed.data.assessmentScore ?? 0) >= 70
      : false;
  const nextLevel = eligible ? normalizeLevel(current === "basic" ? "intermediate" : "pro") : null;
  if (!eligible || !nextLevel) {
    return NextResponse.json({
      recommendation: "stay",
      nextLevel: null,
      reason: current === "pro"
        ? "You are at the highest learning level. Keep improving your career evidence at your own pace."
        : "Keep practicing your current level. Level changes are optional, and progress here still counts.",
      suggestedMilestones: current === "basic"
        ? ["Complete five foundation skills", "Score at least 70% on a practice assessment"]
        : ["Complete two project milestones", "Score at least 70% on a practical assessment"],
      optional: true,
    });
  }

  try {
    const advice = await requestGroqJson(
      "You are a supportive learning coach. Never pressure the learner to upgrade. Recommend the next level only if evidence supports readiness; return JSON with recommendation ('stay' or 'explore-next-level'), nextLevel ('basic', 'intermediate', 'pro', or null), reason, suggestedMilestones (up to four), optional (must be true).",
      `Current level: ${current}\nNext level: ${nextLevel}\nTarget role: ${parsed.data.targetRole}\nCompleted skills: ${parsed.data.completedSkills.join(", ")}\nCompleted projects: ${parsed.data.completedProjects.join(", ")}\nAssessment: ${parsed.data.assessmentScore ?? "not provided"}`,
      responseSchema,
    );
    return NextResponse.json(advice);
  } catch (error) {
    if (error instanceof AiServiceError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({
      recommendation: "explore-next-level",
      nextLevel,
      reason: "Your completed learning milestones and practice score meet the progress check. Explore the next level if it fits your goals.",
      suggestedMilestones: current === "basic"
        ? ["Build a small project using your completed skills", "Practice explaining your approach"]
        : ["Polish two project examples", "Use your project evidence to prepare career materials"],
      optional: true,
      aiExplanationAvailable: false,
    });
  }
}
