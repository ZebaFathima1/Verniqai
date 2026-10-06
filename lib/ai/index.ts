import "server-only";

import { z } from "zod";

export class AiServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 502,
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

const completionSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({ content: z.string().nullable() }),
    }),
  ),
});

export async function requestGroqJson<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AiServiceError(
      "AI is not configured. Add GROQ_API_KEY to the server environment and redeploy.",
      503,
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1200,
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new AiServiceError("The AI request timed out. Please try again.", 504);
    }
    throw new AiServiceError("Could not connect to Groq. Please try again.", 502);
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AiServiceError("Groq rejected the configured key. Check GROQ_API_KEY.", 502);
    }
    if (response.status === 429) {
      throw new AiServiceError("The AI service is busy or the account has reached its limit. Try again later.", 429);
    }
    throw new AiServiceError("Groq could not complete this request. Check the configured model and try again.", 502);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AiServiceError("Groq returned an invalid response.", 502);
  }
  const completion = completionSchema.safeParse(payload);
  const content = completion.success ? completion.data.choices[0]?.message.content : null;
  if (!content) {
    throw new AiServiceError("Groq returned an empty or invalid response.", 502);
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(content);
  } catch {
    throw new AiServiceError("Groq returned an unreadable response. Please try again.", 502);
  }

  const parsed = schema.safeParse(decoded);
  if (!parsed.success) {
    throw new AiServiceError("Groq returned an unexpected response. Please try again.", 502);
  }

  return parsed.data;
}

type SearchResult = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  content: string;
};

function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function searchWeb(
  query: string,
  options: { topic: "general" | "news"; timeRange: "month" },
): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new AiServiceError(
      "Live search is not configured. Add TAVILY_API_KEY for news and opportunity search.",
      503,
    );
  }
  let response: Response;
  try {
    response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        topic: options.topic,
        time_range: options.timeRange,
        search_depth: "basic",
        max_results: 12,
        include_answer: false,
        include_raw_content: false,
        include_published_date: true,
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new AiServiceError("Live search timed out. Please try again.", 504);
    }
    throw new AiServiceError("Could not connect to the live search provider. Please try again.", 502);
  }

  if (response.status === 401 || response.status === 403) {
    throw new AiServiceError("The live search provider rejected TAVILY_API_KEY.", 502);
  }
  if (response.status === 429) {
    throw new AiServiceError("The live search account has reached its request limit. Try again later.", 429);
  }
  if (!response.ok) {
    throw new AiServiceError("The live search service is temporarily unavailable.", 502);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AiServiceError("The live search provider returned an invalid response.", 502);
  }
  const parsed = z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string().url(),
      content: z.string(),
      published_date: z.string().nullable().optional(),
    })),
  }).safeParse(payload);
  if (!parsed.success) {
    throw new AiServiceError("The live search provider returned results in an unexpected format.", 502);
  }

  return parsed.data.results
    .filter((item) => isWebUrl(item.url))
    .slice(0, 12)
    .map((item) => ({
      title: item.title.slice(0, 300),
      url: item.url,
      source: new URL(item.url).hostname.replace(/^www\./, ""),
      publishedAt: item.published_date ?? "",
      content: item.content.slice(0, 800),
    }));
}

function collectUrls(value: unknown): string[] {
  if (typeof value === "string") return isWebUrl(value) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(collectUrls);
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(collectUrls);
}

export async function requestGroqWebJson<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  searchQuery: string,
  options: { topic: "general" | "news"; timeRange: "month" },
): Promise<{ data: T; citations: string[]; sources: SearchResult[] }> {
  if (!searchQuery.trim()) {
    throw new AiServiceError("A search query is required.", 400);
  }

  if (!process.env.GROQ_API_KEY) {
    throw new AiServiceError(
      "AI is not configured. Add GROQ_API_KEY to the server environment and redeploy.",
      503,
    );
  }

  const results = await searchWeb(searchQuery, options);
  if (results.length === 0) {
    throw new AiServiceError("Live search found no matching sources. Try broadening your search.", 404);
  }

  const groundedPrompt = `${userPrompt}\n\nUse only the following live search results. Do not add facts, dates, names, or URLs that are not supported by these results. Every returned source URL must exactly match one of the URLs below. Search results:\n${JSON.stringify(results)}`;
  const data = await requestGroqJson(systemPrompt, groundedPrompt, schema);
  const allowedUrls = new Set(results.map((result) => result.url));
  const citations = [...new Set(collectUrls(data).filter((url) => allowedUrls.has(url)))];
  return { data, citations, sources: results };
}

const careerGuidanceSchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.string()).min(1).max(5),
  confidence: z.number().min(0).max(1),
});

export type AiResponse = z.infer<typeof careerGuidanceSchema>;

export async function getCareerGuidance(input: {
  goal: string;
  profile: string;
  focus: string;
}): Promise<AiResponse> {
  return requestGroqJson(
    "You are VERNIQ AI, a practical career coach. Return a JSON object with summary (string), recommendations (array of 1-5 concise strings), and confidence (number from 0 to 1).",
    `Career goal: ${input.goal}\nCurrent profile: ${input.profile}\nFocus area: ${input.focus}`,
    careerGuidanceSchema,
  );
}
