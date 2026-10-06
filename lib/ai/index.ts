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

export async function requestXaiJson<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new AiServiceError(
      "AI is not configured. Add XAI_API_KEY to the server environment and redeploy.",
      503,
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || "grok-4.7",
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
    throw new AiServiceError("Could not connect to the AI service. Please try again.", 502);
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AiServiceError("The configured xAI key was rejected. Check XAI_API_KEY.", 502);
    }
    if (response.status === 429) {
      throw new AiServiceError("The AI service is busy or the account has reached its limit. Try again later.", 429);
    }
    throw new AiServiceError("The AI service could not complete this request. Try again later.", 502);
  }

  const completion = completionSchema.safeParse(await response.json());
  const content = completion.success ? completion.data.choices[0]?.message.content : null;
  if (!content) {
    throw new AiServiceError("The AI service returned an empty or invalid response.", 502);
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(content);
  } catch {
    throw new AiServiceError("The AI service returned an unreadable response. Please try again.", 502);
  }

  const parsed = schema.safeParse(decoded);
  if (!parsed.success) {
    throw new AiServiceError("The AI service returned an unexpected response. Please try again.", 502);
  }

  return parsed.data;
}

function collectOutputText(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(collectOutputText);

  const record = value as Record<string, unknown>;
  const current = record.type === "output_text" && typeof record.text === "string"
    ? [record.text]
    : [];
  return current.concat(
    Object.values(record)
      .filter((entry) => typeof entry === "object" && entry !== null)
      .flatMap(collectOutputText),
  );
}

function parseJsonContent(content: string): unknown {
  const unwrapped = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(unwrapped);
  } catch {
    const start = unwrapped.indexOf("{");
    const end = unwrapped.lastIndexOf("}");
    if (start < 0 || end <= start) {
      throw new AiServiceError("The web-search service returned unreadable content.", 502);
    }
    try {
      return JSON.parse(unwrapped.slice(start, end + 1));
    } catch {
      throw new AiServiceError("The web-search service returned invalid structured content.", 502);
    }
  }
}

export async function requestXaiWebJson<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
): Promise<{ data: T; citations: string[] }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new AiServiceError(
      "Live web search is not configured. Add XAI_API_KEY to the server environment and redeploy.",
      503,
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `******`,
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || "grok-4.7",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{ type: "web_search" }],
        max_output_tokens: 2200,
      }),
      signal: AbortSignal.timeout(45_000),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new AiServiceError("Live search timed out. Please try again.", 504);
    }
    throw new AiServiceError("Could not connect to xAI live search. Please try again.", 502);
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AiServiceError("The configured xAI key was rejected. Check XAI_API_KEY.", 502);
    }
    if (response.status === 429) {
      throw new AiServiceError("The AI service is busy or the account has reached its limit. Try again later.", 429);
    }
    throw new AiServiceError("xAI live search could not complete this request.", 502);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AiServiceError("xAI live search returned an invalid response.", 502);
  }

  if (!payload || typeof payload !== "object") {
    throw new AiServiceError("xAI live search returned an unexpected response.", 502);
  }
  const responseRecord = payload as Record<string, unknown>;
  const content = collectOutputText(responseRecord.output).join("\n").trim();
  if (!content) {
    throw new AiServiceError("xAI live search returned no results. Please try again.", 502);
  }

  const parsed = schema.safeParse(parseJsonContent(content));
  if (!parsed.success) {
    throw new AiServiceError("xAI live search returned results in an unexpected format.", 502);
  }

  const citations = Array.isArray(responseRecord.citations)
    ? responseRecord.citations.filter((url): url is string => typeof url === "string" && isWebUrl(url))
    : [];
  return { data: parsed.data, citations: [...new Set(citations)].slice(0, 20) };
}

function isWebUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
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
  return requestXaiJson(
    "You are VERNIQ AI, a practical career coach. Return a JSON object with summary (string), recommendations (array of 1-5 concise strings), and confidence (number from 0 to 1).",
    `Career goal: ${input.goal}\nCurrent profile: ${input.profile}\nFocus area: ${input.focus}`,
    careerGuidanceSchema,
  );
}
