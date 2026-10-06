import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestGroqJson } from "@/lib/ai";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  level: z.enum(["basic", "intermediate", "pro"]),
  targetRole: z.string().trim().max(160).default(""),
  skills: z.array(z.string().trim().max(80)).max(30).default([]),
  type: z.string().trim().max(40).optional(),
});

const opportunitySchema = z.object({
  recommendations: z.array(z.object({
    title: z.string().min(5).max(180),
    type: z.enum(["Course", "Workshop", "Open Source", "Project Program", "Internship", "Jobs"]),
    summary: z.string().min(20).max(400),
    skills: z.array(z.string().max(80)).max(8),
  })).max(8),
});

function opportunitySearchUrl(title: string, targetRole: string): string {
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", `${title} ${targetRole}`.trim());
  return url.toString();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid recommendation input." }, { status: 400 });
  }

  try {
    const result = await requestGroqJson(
      "You are VERNIQ AI, a career coach creating suggested actions, not a live opportunity directory. You have no web browsing. Never invent a specific company, course, open position, program, availability, duration, eligibility, or source. Return valid JSON with recommendations: practical search suggestions or self-directed projects. A recommendation may be classified as Course, Workshop, Open Source, Project Program, Internship, or Jobs, but must not claim to be a specific real listing. Include only title, type, a concise explanation of what to look for or do, and relevant skills. Return up to 8 suggestions.",
      `Suggest practical next steps for this learner.\nLearner level: ${parsed.data.level}\nTarget role: ${parsed.data.targetRole || "technology career"}\nSkills to build: ${parsed.data.skills.join(", ") || "foundational career skills"}\nRequested type: ${parsed.data.type || "all types"}\nDo not invent named providers, specific jobs, programs, application deadlines, or availability. Use titles that clearly read as search ideas or self-directed activities.`,
      opportunitySchema,
    );

    const recommendations = result.recommendations
      .filter((item) => !parsed.data.type || item.type.toLowerCase() === parsed.data.type.toLowerCase())
      .map((item) => ({
        ...item,
        id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80),
        organization: "AI-generated suggestion",
        duration: "Varies — verify details",
        href: opportunitySearchUrl(item.title, parsed.data.targetRole),
        level: parsed.data.level,
      }));

    return NextResponse.json({
      recommendations,
      personalizedTo: parsed.data.targetRole,
      source: "groq-generated-suggestions",
      searchedAt: new Date().toISOString(),
      notice: "These are AI-generated suggestions, not verified listings. Search the web and confirm availability, eligibility, and details before applying.",
    });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not generate opportunity suggestions." }, { status: 500 });
  }
}
