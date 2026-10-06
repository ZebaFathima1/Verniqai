import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestGroqWebJson } from "@/lib/ai";

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
    const result = await requestGroqWebJson(
      "You are VERNIQ AI's career opportunity researcher. Use only the live search results supplied in the user message to identify relevant learning or career opportunities. Never invent an opportunity, availability, duration, eligibility, or source. Return only valid JSON with recommendations. Every href must exactly match one of the supplied search-result URLs. Return only items supported by the result title and content; availability must not be assumed.",
      `Find current search results that may contain relevant learning or career opportunities.\nLearner level: ${parsed.data.level}\nTarget role: ${parsed.data.targetRole || "technology career"}\nSkills to build: ${parsed.data.skills.join(", ") || "foundational career skills"}\nRequested type: ${parsed.data.type || "all types"}\nFor each result return title, organization, type (Course, Workshop, Open Source, Project Program, Internship, or Jobs), duration (or 'Varies'), a short factual summary based only on the headline/source, skills, and a source link that exactly matches one of the supplied search results. Do not claim an opportunity is open or available unless the search result itself says so.`,
      opportunitySchema,
      `${parsed.data.targetRole || "technology"} ${parsed.data.skills.join(" ")} ${parsed.data.type || "courses internships jobs open source programs"} after:${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}`,
      { topic: "general", timeRange: "month" },
    );

    const citationByIdentity = new Map(result.citations.map((url) => [normalizedUrl(url), url]));
    const sourceNameByIdentity = new Map(
      result.sources.map((source) => [normalizedUrl(source.url), source.source || new URL(source.url).hostname]),
    );
    const recommendations = result.data.recommendations.flatMap((item) => {
      const href = citationByIdentity.get(normalizedUrl(item.href));
      if (!href || (parsed.data.type && item.type.toLowerCase() !== parsed.data.type.toLowerCase())) return [];
      const organization = sourceNameByIdentity.get(normalizedUrl(href)) ?? new URL(href).hostname.replace(/^www\./, "");
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
      source: "live-news-search",
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
