import { NextResponse } from "next/server";
import { z } from "zod";
import { AiServiceError, getCareerGuidance } from "@/lib/ai";

const requestSchema = z.object({
  goal: z.string().trim().min(2).max(300),
  profile: z.string().trim().min(2).max(1500),
  focus: z.string().trim().min(2).max(300),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await getCareerGuidance(parsed.data));
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to generate guidance." }, { status: 500 });
  }
}
