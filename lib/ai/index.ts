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

function groqErrorMessage(status: number, payload: unknown): string {
  const errorMessage = z.object({
    error: z.object({
      message: z.string().optional(),
      code: z.union([z.string(), z.number()]).optional(),
    }).optional(),
  }).safeParse(payload);
  const detail = errorMessage.success
    ? errorMessage.data.error?.message?.replace(/[\r\n\t]+/g, " ").slice(0, 240)
    : undefined;

  if (status === 400 || status === 404 || status === 422) {
    return detail
      ? `Groq rejected the request: ${detail}`
      : "Groq rejected the request. Check GROQ_MODEL and request settings.";
  }
  if (status >= 500) {
    return "Groq is temporarily unable to process this request. Try again later.";
  }
  return "Groq could not complete this request. Check the configured model and try again.";
}

async function requestGroqJsonOnce<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  maxCompletionTokens = 1200,
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
        max_completion_tokens: maxCompletionTokens,
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
    let providerError: unknown;
    try {
      providerError = await response.json();
    } catch {
      providerError = null;
    }
    console.error("Groq request failed", {
      status: response.status,
      code: z.object({
        error: z.object({ code: z.union([z.string(), z.number()]).optional() }).optional(),
      }).safeParse(providerError).data?.error?.code,
    });
    throw new AiServiceError(groqErrorMessage(response.status, providerError), 502);
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

export async function requestGroqJson<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  options: { maxCompletionTokens?: number } = {},
): Promise<T> {
  const maxCompletionTokens = Math.min(
    4000,
    Math.max(1200, Math.floor(options.maxCompletionTokens ?? 1200)),
  );
  const jsonSchema = JSON.stringify(z.toJSONSchema(schema));
  const schemaInstructions = `Return exactly one JSON object matching this JSON Schema. Use the exact field names, types, allowed enum values, and constraints. Do not include markdown or extra text.\n${jsonSchema}`;
  try {
    return await requestGroqJsonOnce(
      `${systemPrompt}\n${schemaInstructions}`,
      userPrompt,
      schema,
      maxCompletionTokens,
    );
  } catch (error) {
    if (!(error instanceof AiServiceError) || error.message !== "Groq returned an unexpected response. Please try again.") {
      throw error;
    }

    return requestGroqJsonOnce(
      `${systemPrompt}\n${schemaInstructions}\nValidate every value against the JSON Schema before answering. If a value does not fit an allowed enum or length constraint, rewrite it to a valid value.`,
      `${userPrompt}\n\nImportant: the prior attempt did not match the required response schema. Return a corrected response that strictly follows the schema.`,
      schema,
      maxCompletionTokens,
    );
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
  return requestGroqJson(
    "You are VERNIQ AI, a practical career coach. Return a JSON object with summary (string), recommendations (array of 1-5 concise strings), and confidence (number from 0 to 1).",
    `Career goal: ${input.goal}\nCurrent profile: ${input.profile}\nFocus area: ${input.focus}`,
    careerGuidanceSchema,
  );
}
