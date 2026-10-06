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
