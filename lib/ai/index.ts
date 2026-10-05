import { z } from "zod";

const aiResponseSchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type AiResponse = z.infer<typeof aiResponseSchema>;

export async function getCareerGuidance(input: {
  goal: string;
  profile: string;
  focus: string;
}): Promise<AiResponse> {
  const { goal, profile, focus } = input;

  const fallback = {
    summary: `You are progressing toward ${goal} with strong momentum. Focus on ${focus} to close the highest-impact gap in your current profile: ${profile}.`,
    recommendations: [
      "Prioritize the highest-impact skill gap before broadening your learning stack.",
      "Complete at least one project that demonstrates business value and deployment readiness.",
      "Practice structured responses for technical and behavioral interviews.",
    ],
    confidence: 0.91,
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallback;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are VERNIQ AI, a career coaching assistant for ambitious students. Return valid JSON with keys: summary, recommendations, confidence.",
          },
          {
            role: "user",
            content: `Goal: ${goal}. Profile: ${profile}. Focus: ${focus}`,
          },
        ],
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content ?? "";
    const parsed = aiResponseSchema.safeParse(JSON.parse(message));

    if (!parsed.success) {
      return fallback;
    }

    return parsed.data;
  } catch {
    return fallback;
  }
}
