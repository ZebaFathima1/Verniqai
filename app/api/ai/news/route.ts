import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestGroqWebJson } from "@/lib/ai";
import { normalizeLevel } from "@/lib/levels";

export const dynamic = "force-dynamic";

const categories = [
  "Artificial Intelligence",
  "Machine Learning",
  "Software Development",
  "Web Development",
  "Cybersecurity",
  "Cloud",
  "Data",
  "Startups",
  "Technology",
  "Jobs & Careers",
] as const;

const newsSchema = z.object({
  items: z.array(z.object({
    title: z.string().min(8).max(180),
    category: z.enum(categories),
    summary: z.string().min(20).max(500),
    publishedAt: z.string().max(80),
    sourceName: z.string().min(2).max(120),
    sourceUrl: z.string().url(),
    whyItMatters: z.string().min(15).max(400),
    action: z.string().min(10).max(300),
    matchedSkills: z.array(z.string().max(80)).max(6),
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

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const level = normalizeLevel(params.get("level"));
  const targetRole = params.get("career")?.trim().slice(0, 160) ?? "";
  const selectedCategory = params.get("category") ?? "All";
  if (selectedCategory !== "All" && !categories.includes(selectedCategory as (typeof categories)[number])) {
    return NextResponse.json({ error: "Choose a supported news topic." }, { status: 400 });
  }
  const skills = (params.get("skills") ?? "")
    .split(",")
    .map((skill) => skill.trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 10);

  try {
    const result = await requestGroqWebJson(
      "You are VERNIQ AI's career news researcher. Use only the live search results supplied in the user message. Do not invent dates, facts, organizations, or source links. Return only valid JSON with an items array. Each item must have title, category (one of the requested categories), concise factual summary, publishedAt (use the source's date or 'Date not stated'), sourceName, sourceUrl (an exact URL from the supplied search results), whyItMatters tailored to the learner level, action (one practical next step), and matchedSkills. Include only items from the last month when a publication date is available; otherwise omit them. Return up to 6 items and an empty array when none are verifiable.",
      `Find career-relevant news published in the last 30 days.\nTarget role: ${targetRole || "technology careers"}\nLearner level: ${level}\nLearning skills: ${skills.join(", ") || "not supplied"}\nRequested topic: ${selectedCategory}\nAllowed topic labels: ${categories.join(", ")}\nFor every result, cite a source URL that exactly matches one of the supplied search results.`,
      newsSchema,
      `${selectedCategory === "All" ? "technology AI careers" : selectedCategory} ${targetRole} ${skills.join(" ")} after:${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}`,
      { topic: "news", timeRange: "month" },
    );

    const citationByIdentity = new Map(result.citations.map((url) => [normalizedUrl(url), url]));
    const sourceNameByIdentity = new Map(
      result.sources.map((source) => [normalizedUrl(source.url), source.source || new URL(source.url).hostname]),
    );
    const items = result.data.items.flatMap((item) => {
      const sourceUrl = citationByIdentity.get(normalizedUrl(item.sourceUrl));
      if (!sourceUrl) return [];
      const sourceName = sourceNameByIdentity.get(normalizedUrl(sourceUrl)) ?? new URL(sourceUrl).hostname.replace(/^www\./, "");
      return [{
        ...item,
        id: `${item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${normalizedUrl(sourceUrl).replace(/[^a-z0-9]+/g, "-")}`,
        sourceName,
        sourceUrl,
        personalized: item.matchedSkills.length > 0,
        whyItMattersToYou: item.whyItMatters,
      }];
    });

    return NextResponse.json({
      categories,
      items,
      freshness: "Live news search · source links checked against current search results",
      searchedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not retrieve current news." }, { status: 500 });
  }
}
