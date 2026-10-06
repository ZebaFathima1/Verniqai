import { NextResponse } from "next/server";
import { normalizeLevel, levelDetails } from "@/lib/levels";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const level = normalizeLevel(params.get("level"));
  const career = params.get("career")?.slice(0, 160) || "your target career";
  const dashboardByLevel = {
    basic: {
      focus: "Learn",
      primaryMetric: "Foundation progress",
      nextAction: "Complete the next lesson in your selected learning path.",
      weeklyMetrics: ["Lessons completed", "Practice questions", "Learning streak"],
    },
    intermediate: {
      focus: "Build",
      primaryMetric: "Project progress",
      nextAction: "Ship a small project that demonstrates a practical skill.",
      weeklyMetrics: ["Skills practiced", "Project milestones", "GitHub activity"],
    },
    pro: {
      focus: "Become career ready",
      primaryMetric: "Career readiness",
      nextAction: "Strengthen one gap between your current evidence and target role.",
      weeklyMetrics: ["Resume improvements", "Interview practice", "Applications"],
    },
  } as const;

  return NextResponse.json({
    level,
    levelName: levelDetails[level].name,
    career,
    ...dashboardByLevel[level],
    metrics: {
      readiness: 76,
      careerDna: { technical: 82, communication: 76, problemSolving: 61 },
      progressSource: "browser-local prototype",
    },
  });
}
