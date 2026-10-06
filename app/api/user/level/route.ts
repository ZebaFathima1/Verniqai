import { NextResponse } from "next/server";
import { normalizeLevel } from "@/lib/levels";

export async function GET(request: Request) {
  const level = normalizeLevel(new URL(request.url).searchParams.get("level"));
  return NextResponse.json({
    level,
    persistence: "browser-local-prototype",
    authentication: "not-server-verifiable-without-an-auth-provider",
  });
}
