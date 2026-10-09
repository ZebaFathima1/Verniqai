import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, requestGroqJson } from "@/lib/ai";
import { normalizeLevel, newsBriefings } from "@/lib/levels";

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
    title: z.string().min(8).max(160),
    category: z.enum(categories),
    summary: z.string().min(20).max(320),
    whyItMatters: z.string().min(15).max(240),
    action: z.string().min(10).max(180),
    matchedSkills: z.array(z.string().max(80)).max(4),
  })).max(4),
});

type FeedItem = {
  id: string;
  category: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  action: string;
  matchedSkills: string[];
  personalized: boolean;
  whyItMattersToYou: string;
  sourceKind: "ai" | "curated";
};

function newsSearchUrl(title: string, targetRole: string): string {
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", `${title} ${targetRole}`.trim());
  url.searchParams.set("tbm", "nws");
  return url.toString();
}

function normalizeTitle(title: string): string {
  return title.trim().toLocaleLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function toCuratedItems(category: string, targetRole: string, skills: string[]): FeedItem[] {
  const roleTerms = `${targetRole} ${skills.join(" ")}`.toLocaleLowerCase().split(/[^a-z0-9+#.]+/).filter((term) => term.length > 2);
  return newsBriefings
    .filter((briefing) => category === "All" || briefing.category === category)
    .map((briefing) => {
      const searchable = `${briefing.title} ${briefing.summary} ${briefing.skills.join(" ")}`.toLocaleLowerCase();
      const relevance = roleTerms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0);
      return { briefing, relevance };
    })
    .sort((left, right) => right.relevance - left.relevance)
    .slice(0, 3)
    .map(({ briefing }) => ({
      id: `curated-${briefing.id}`,
      category: briefing.category,
      title: briefing.title,
      summary: briefing.summary,
      sourceName: "Search current reporting",
      sourceUrl: newsSearchUrl(briefing.title, targetRole),
      action: briefing.action,
      matchedSkills: [],
      personalized: false,
      whyItMattersToYou: briefing.whyItMatters,
      sourceKind: "curated" as const,
    }));
}

function toGeneratedItems(items: z.infer<typeof newsSchema>["items"], targetRole: string): FeedItem[] {
  return items.map((item) => ({
    ...item,
    id: `ai-${item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${normalizeTitle(item.title).slice(0, 60)}`,
    sourceName: "Search current reporting",
    sourceUrl: newsSearchUrl(item.title, targetRole),
    personalized: item.matchedSkills.length > 0,
    whyItMattersToYou: item.whyItMatters,
    sourceKind: "ai" as const,
  }));
}

function mergeFeedItems(generated: FeedItem[], curated: FeedItem[]): FeedItem[] {
  const seenTitles = new Set<string>();
  const uniqueGenerated = generated.filter((item) => {
    const key = normalizeTitle(item.title);
    if (!key || seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });
  const uniqueCurated = curated.filter((item) => {
    const key = normalizeTitle(item.title);
    if (!key || seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });
  return [...uniqueGenerated, ...uniqueCurated];
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
  const curatedItems = toCuratedItems(selectedCategory, targetRole, skills);
  const freshness = "These are evergreen research ideas, not verified live news. Use each search link to check current reporting.";

  try {
    const result = await requestGroqJson(
      "You are VERNIQ AI, a career coach creating evergreen career-topic briefings, not reporting live news. You have no web browsing. Never present an event, organization, date, statistic, or announcement as current or verified. Return exactly 3 concise research themes, not breaking news. Every summary must remind the reader to check current sources. Each item has title, category, summary, whyItMatters, action, and matchedSkills. Do not fabricate citations. Keep each field concise and within the supplied JSON schema.",
      `Suggest 3 distinct evergreen career themes worth researching.\nTarget role: ${targetRole || "technology careers"}\nLearner level: ${level}\nLearning skills: ${skills.join(", ") || "not supplied"}\nRequested topic: ${selectedCategory}\nAllowed topic labels: ${categories.join(", ")}\nAvoid current-event claims and fabricated dates or citations. Use concise titles phrased as research themes. Keep summaries, explanations, actions, and matched skills brief.`,
      newsSchema,
      { maxCompletionTokens: 2400 },
    );
    const generatedItems = toGeneratedItems(result.items, targetRole);

    return NextResponse.json({
      categories,
      items: mergeFeedItems(generatedItems, curatedItems),
      freshness,
      searchedAt: new Date().toISOString(),
    });
  } catch (error) {
    const aiError = error instanceof AiServiceError && error.status === 503
      ? error.message
      : "AI-generated topics are temporarily unavailable. Curated research prompts are shown instead.";
    console.error("Career news generation unavailable", {
      status: error instanceof AiServiceError ? error.status : 500,
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json({
      categories,
      items: curatedItems,
      freshness,
      aiError,
      searchedAt: new Date().toISOString(),
    });
  }
}
