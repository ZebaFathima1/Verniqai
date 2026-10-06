import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeLevel } from "@/lib/levels";

const requestSchema = z.object({
  level: z.enum(["basic", "intermediate", "pro"]),
  completedSkills: z.array(z.string()).max(100).default([]),
  completedProjects: z.array(z.string()).max(50).default([]),
  assessmentScore: z.number().min(0).max(100).optional(),
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

  const { level, completedSkills, completedProjects, assessmentScore } = parsed.data;
  const uniqueSkills = new Set(
    completedSkills.map((skill) => skill.includes(":") ? skill.split(":").pop() ?? skill : skill),
  ).size;
  const canAdvance =
    level === "basic"
      ? uniqueSkills >= 5 && (assessmentScore ?? 0) >= 70
      : level === "intermediate"
        ? completedProjects.length >= 2 && (assessmentScore ?? 0) >= 70
        : false;
  const recommendedLevel = canAdvance
    ? normalizeLevel(level === "basic" ? "intermediate" : "pro")
    : null;

  return NextResponse.json({
    currentLevel: level,
    recommendedLevel,
    progress: level === "basic"
      ? Math.min(100, Math.round((uniqueSkills / 5) * 100))
      : level === "intermediate"
        ? Math.min(100, Math.round((completedProjects.length / 2) * 100))
        : 100,
    message: recommendedLevel
      ? `You have made strong progress. Explore ${recommendedLevel} when you feel ready.`
      : level === "pro"
        ? "You are at the highest learning level. Keep building evidence and preparing for roles."
        : "Keep learning and practicing. Your next level will be suggested when you meet the progress milestones.",
    isOptional: true,
  });
}
