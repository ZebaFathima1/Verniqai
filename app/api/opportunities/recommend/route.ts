import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestXaiWebJson } from "@/lib/ai";

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
    organization: z.string().min(2).max(120),
    type: z.enum(["Course", "Workshop", "Open Source", "Project Program", "Internship", "Jobs"]),
    duration: z.string().max(100),
    summary: z.string().min(20).max(400),
    skills: z.array(z.string().max(80)).max(8),
    href: z.string().url(),
  })).max(8),
});

function normalizedUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return "";
  }
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
    const result = await requestXaiWebJson(
      "You are VERNIQ AI's career opportunity researcher. Search the web for current opportunities relevant to the requested role and learner level. Include real courses, workshops, open-source programs, project programs, internships, or jobs. Prioritize official provider pages and open listings. Never invent an opportunity, availability, duration, or eligibility. Return only valid JSON with recommendations. Every href must be an exact URL present in the web-search citations. Return up to 8 relevant results, or an empty array when none can be verified.",
      `Find opportunities that are currently open or available.\nLearner level: ${parsed.data.level}\nTarget role: ${parsed.data.targetRole || "technology career"}\nSkills to build: ${parsed.data.skills.join(", ") || "foundational career skills"}\nRequested type: ${parsed.data.type || "all types"}\nFor each result return title, organization, type (Course, Workshop, Open Source, Project Program, Internship, or Jobs), duration (or 'Varies'), a short factual summary, skills, and a source link that is present in web-search citations.`,
      opportunitySchema,
    );

    const citationByIdentity = new Map(result.citations.map((url) => [normalizedUrl(url), url]));
    const recommendations = result.data.recommendations.flatMap((item) => {
      const href = citationByIdentity.get(normalizedUrl(item.href));
      if (!href || (parsed.data.type && item.type.toLowerCase() !== parsed.data.type.toLowerCase())) return [];
      const organization = new URL(href).hostname.replace(/^www\./, "");
      return [{
        ...item,
        id: normalizedUrl(href).replace(/[^a-z0-9]+/g, "-"),
        organization,
        href,
        level: parsed.data.level,
        relevance: 1,
      }];
    });

    return NextResponse.json({
      recommendations,
      personalizedTo: parsed.data.targetRole,
      source: "live-web-search",
      searchedAt: new Date().toISOString(),
      notice: "Availability and eligibility can change. Confirm details with the linked provider.",
    });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not search current opportunities." }, { status: 500 });
  }
}
