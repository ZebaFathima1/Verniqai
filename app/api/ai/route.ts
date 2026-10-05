import { NextResponse } from "next/server";
import { z } from "zod";
import { getCareerGuidance } from "@/lib/ai";

const requestSchema = z.object({
  goal: z.string().min(2),
  profile: z.string().min(2),
  focus: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    const result = await getCareerGuidance(parsed.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to generate guidance." }, { status: 500 });
  }
}
