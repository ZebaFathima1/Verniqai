import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  resumeText: z.string().min(20),
  targetRole: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid resume payload" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      atsScore: 82,
      summary: `Your resume is strong for ${parsed.data.targetRole}, but it would benefit from stronger impact sentences and more role-aligned keywords.`,
      suggestions: [
        "Add measurable impact metrics to each role.",
        "Align your summary to target job keywords.",
        "Highlight deployment and project outcomes more explicitly.",
      ],
    });
  } catch {
    return NextResponse.json({ error: "Resume analysis failed." }, { status: 500 });
  }
}
