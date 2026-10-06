import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestGroqJson } from "@/lib/ai";
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
    whyItMatters: z.string().min(15).max(400),
    action: z.string().min(10).max(300),
    matchedSkills: z.array(z.string().max(80)).max(6),
  })).max(8),
});

function newsSearchUrl(title: string, targetRole: string): string {
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", `${title} ${targetRole}`.trim());
  url.searchParams.set("tbm", "nws");
  return url.toString();
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
    const result = await requestGroqJson(
      "You are VERNIQ AI, a career coach creating evergreen career-topic briefings, not reporting live news. You have no web browsing. Never present an event, organization, date, statistic, or announcement as current or verified. Return valid JSON with an items array of useful themes or questions to research, not purported breaking news. Every summary must clearly state that the reader should check current sources. Each item must have title, category, summary, whyItMatters, action, and matchedSkills. Return up to 6 items and do not fabricate citations.",
      `Suggest evergreen career topics worth researching.\nTarget role: ${targetRole || "technology careers"}\nLearner level: ${level}\nLearning skills: ${skills.join(", ") || "not supplied"}\nRequested topic: ${selectedCategory}\nAllowed topic labels: ${categories.join(", ")}\nAvoid claims about current events. Use titles phrased as themes to investigate, not headlines about events that may not have happened.`,
      newsSchema,
    );

    const items = result.items.map((item) => ({
        ...item,
        id: `${item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`,
        publishedAt: "AI-generated topic · not live news",
        sourceName: "Search latest reporting",
        sourceUrl: newsSearchUrl(item.title, targetRole),
        personalized: item.matchedSkills.length > 0,
        whyItMattersToYou: item.whyItMatters,
    }));

    return NextResponse.json({
      categories,
      items,
      freshness: "AI-generated career research ideas, not live news. Use the links to check current reporting.",
      searchedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not generate career research topics." }, { status: 500 });
  }
}
