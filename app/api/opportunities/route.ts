import { NextResponse } from "next/server";
import { POST as searchOpportunities } from "./recommend/route";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const response = await searchOpportunities(new Request(request.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      level: params.get("level") ?? "basic",
      targetRole: params.get("career") ?? "",
      skills: params.get("skill") ? [params.get("skill")] : [],
      type: params.get("type") || undefined,
    }),
  }));

  if (!response.ok) return response;
  const result = await response.json();
  return NextResponse.json({
    opportunities: result.recommendations,
    source: result.source,
    searchedAt: result.searchedAt,
    notice: result.notice,
  });
}
