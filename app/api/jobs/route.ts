import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  role: z.string().min(2),
  skills: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid job payload" },
        { status: 400 },
      );
    }

    const matchScore = Math.min(92, Math.max(68, 78 + parsed.data.skills.length * 2));

    return NextResponse.json({
      role: parsed.data.role,
      matchScore: Math.round(matchScore),
      strengths: ["Python", "Problem solving", "Project work"],
      gaps: ["System Design", "Cloud deployment", "MLOps"],
      nextSteps: [
        "Build one production-ready deployment project.",
        "Practice core system design interview questions.",
        "Optimize resume language for the role.",
      ],
    });
  } catch {
    return NextResponse.json({ error: "Job match analysis failed." }, { status: 500 });
  }
}
