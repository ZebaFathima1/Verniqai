import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  role: z.string().min(2),
  question: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid interview payload" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      question: parsed.data.question,
      role: parsed.data.role,
      guidance: [
        "Start with a brief problem restatement.",
        "Explain the trade-offs before choosing an implementation.",
        "Connect your answer to real-world constraints and outcomes.",
      ],
      scoreHint: 82,
    });
  } catch {
    return NextResponse.json({ error: "Interview guidance could not be generated." }, { status: 500 });
  }
}
