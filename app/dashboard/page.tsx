"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Gauge, MessageSquareText, Sparkles, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { getCurrentSession, signOut } from "@/lib/auth";
import { getDashboardData, getDemoProfileSnapshot } from "@/lib/profile-data";
import { readProgress, type ProgressState } from "@/lib/local-progress";
import { levelDetails, levelNavigation } from "@/lib/levels";

export default function DashboardPage() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(getDemoProfileSnapshot());
  const [aiGuidance, setAiGuidance] = useState<{
    summary: string;
    recommendations: string[];
    confidence: number;
  } | null>(null);
  const [isGeneratingGuidance, setIsGeneratingGuidance] = useState(false);
  const [guidanceError, setGuidanceError] = useState("");
  const [levelRecommendation, setLevelRecommendation] = useState("");
  const [progress, setProgress] = useState<ProgressState>({
    completedSkills: [],
    completedMissions: [],
    completedProjects: [],
    completedPortfolioItems: [],
    bookmarkedOpportunities: [],
    viewedBriefings: [],
    githubUsername: "",
  });

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      router.replace("/dashboard/login");
      return;
    }

    async function loadDashboardData() {
      const result = await getDashboardData();
      if (result.ok && result.data) {
        setSnapshot(result.data);
      }
    }

    const syncProgress = () => setProgress(readProgress());
    syncProgress();
    window.addEventListener("verniq:progress", syncProgress);
    void loadDashboardData();
    return () => window.removeEventListener("verniq:progress", syncProgress);
  }, [router]);

  const { profile, careerDNA, dashboardInsights, nextAction, roadmap, weeklyMomentum } = snapshot;
  const navItems = levelNavigation[profile.level].map(({ label, href }) => ({
    label,
    href,
    icon: label.includes("Career DNA")
      ? Gauge
      : label.includes("Project") || label.includes("Job") || label.includes("Opportunity")
        ? BriefcaseBusiness
        : label.includes("Practice") || label.includes("Interview") || label.includes("Mentor")
          ? MessageSquareText
          : label.includes("Roadmap") || label.includes("Learning") || label.includes("News")
            ? TrendingUp
            : Target,
  }));
  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const levelAction = {
    basic: { title: "Learn your next foundation skill", href: "/dashboard/learning", label: "Continue learning" },
    intermediate: { title: "Build a project that demonstrates your skills", href: "/dashboard/projects", label: "Explore projects" },
    pro: { title: nextAction.title, href: "/dashboard/interview", label: "Prepare for interviews" },
  }[profile.level];

  async function recommendNextLevel() {
    setLevelRecommendation("");
    try {
      const response = await fetch("/api/user/level/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: profile.level,
          targetRole: profile.targetRole,
          completedSkills: progress.completedSkills,
          completedProjects: progress.completedProjects,
          assessmentScore: progress.practiceScore ?? undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not check level progress.");
      setLevelRecommendation(data.message ?? "Keep building useful evidence at your own pace.");
    } catch (error) {
      setLevelRecommendation(error instanceof Error ? error.message : "Could not check level progress.");
    }
  }

  async function generateGuidance() {
    setIsGeneratingGuidance(true);
    setGuidanceError("");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: profile.targetRole,
          profile: careerDNA.map(({ category, score }) => `${category}: ${score}/100`).join(", "),
          focus: `${profile.level} learner. Identify the highest-impact skill gap and recommend practical next steps using locally saved learning milestones: ${progress.completedSkills.join(", ") || "none"}.`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not generate career guidance.");
      if (typeof data.summary !== "string" || !Array.isArray(data.recommendations)) {
        throw new Error("Career guidance returned an unexpected response.");
      }
      setAiGuidance(data);
    } catch (error) {
      setGuidanceError(
        error instanceof Error ? error.message : "Could not generate career guidance.",
      );
    } finally {
      setIsGeneratingGuidance(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full min-w-0 bg-[#fafafa] text-slate-900 dark:bg-[#09090b] dark:text-slate-50">
      <aside className="hidden w-[240px] flex-col border-r border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-[#111113]/80 lg:flex">
        <div className="mb-8 flex flex-col items-start gap-2">
          <BrandLogo size="sidebar" />
          <span className="rounded-full bg-[#635bff]/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-[#635bff]">
            {levelDetails[profile.level].name}
          </span>
        </div>

        <div className="space-y-2">
          <p className="px-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Overview
          </p>
          <nav className="space-y-1">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  label === "Overview"
                    ? "bg-[#635bff]/10 text-[#635bff]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="min-w-0 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-[#111113]/80">
          <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4 lg:gap-3 lg:px-8">
            <Link href="/" aria-label="VERNIQ AI home" className="lg:hidden">
              <BrandLogo size="header" />
            </Link>
            <div className="order-3 basis-full min-w-0 lg:order-first lg:basis-auto">
              <p className="text-sm text-slate-500 dark:text-slate-400">Overview</p>
              <p className="break-words text-sm font-medium text-slate-900 dark:text-slate-100">
                {levelDetails[profile.level].subtitle}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:order-2">
              <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                <span>⌘K</span>
                <span>Search</span>
              </div>
              <button
                type="button"
                aria-label={`Sign out ${profile.name}`}
                onClick={() => {
                  signOut();
                  router.replace("/dashboard/login");
                }}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 sm:px-3"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#635bff] text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <div className="relative min-w-0 border-b border-slate-200 bg-white lg:hidden dark:border-slate-800 dark:bg-[#111113]">
          <nav
            aria-label="Dashboard navigation"
            className="flex gap-2 overflow-x-auto overscroll-x-contain px-3 py-3 pr-12 sm:px-4"
          >
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/dashboard/levels"
            className="shrink-0 rounded-full bg-[#635bff]/10 px-3 py-2 text-xs font-medium text-[#635bff]"
          >
            Change level
          </Link>
          </nav>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-[#111113]"
          />
        </div>

        <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-8">
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-[#111113]">
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.headline}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-900 dark:text-slate-50">
            {profile.subheadline}
            </h1>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:p-5">
                <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Saved progress activity</p>
                    <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                      <span className="text-5xl font-semibold tracking-[-0.07em]">
                        {progress.completedSkills.length + progress.completedMissions.length + progress.completedProjects.length}
                      </span>
                      <span className="mb-2 text-sm text-slate-500">
                        items saved on this device
                      </span>
                    </div>
                  </div>

                  <div className="flex h-24 w-24 shrink-0 self-center items-center justify-center rounded-full border-8 border-[#635bff] border-r-slate-200 bg-white text-center sm:h-32 sm:w-32 sm:self-auto sm:border-[10px] dark:bg-[#111113]">
                    <div className="min-w-0 px-1">
                      <div className="text-xl font-semibold sm:text-2xl">{progress.practiceScore ?? "—"}</div>
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-500 sm:text-[10px] sm:tracking-[0.2em]">Last practice %</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Target</p>
                    <p className="mt-1 break-words font-medium text-slate-900 dark:text-slate-100">
                      {profile.targetRole}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/next-action"
                    className="inline-flex items-center gap-2 rounded-full bg-[#635bff] px-4 py-2 text-sm font-medium text-white shadow-sm"
                  >
                    View report <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Career DNA</p>
                <div className="mt-5 space-y-4">
                  {careerDNA.slice(0, 5).map((skill) => (
                    <div key={skill.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-300">{skill.category}</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {skill.score}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-[#635bff]"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {profile.level === "basic" ? "Today's Learning Mission" : profile.level === "intermediate" ? "Project Mission" : "Career Mission"}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-slate-50">
                    {levelAction.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {profile.level === "basic"
                      ? "A short lesson, practice questions, and a small challenge help you build lasting foundations."
                      : profile.level === "intermediate"
                        ? "Build practical evidence with a focused project and milestones."
                        : nextAction.reason}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {profile.level === "pro"
                      ? nextAction.description
                      : "Your progress is saved locally in this browser."}
                  </p>
                  <Link
                    href={levelAction.href}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#635bff]/10 px-3.5 py-2 text-sm font-medium text-[#635bff]"
                  >
                    {levelAction.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Weekly Momentum</p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/80">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Learning</span>
                      <span className="font-medium">{weeklyMomentum.learning}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/80">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Projects</span>
                      <span className="font-medium">{weeklyMomentum.projects}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/80">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Problems</span>
                      <span className="font-medium">{weeklyMomentum.problems}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/80">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Interviews</span>
                      <span className="font-medium">{weeklyMomentum.interviews}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Roadmap</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em]">
                      Your next milestones
                    </h3>
                  </div>
                  <Link href="/dashboard/roadmap" className="text-sm font-medium text-[#635bff]">
                    View roadmap
                  </Link>
                </div>

                <div className="space-y-4">
                  {roadmap.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70"
                    >
                      <div
                        className={`h-3 w-3 rounded-full ${
                          item.status === "done"
                            ? "bg-emerald-500"
                            : item.status === "active"
                              ? "bg-[#635bff]"
                              : item.status === "target"
                                ? "bg-violet-500"
                                : "bg-slate-300"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {item.label}
                          </p>
                          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            {item.time}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {item.project}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your learning level</p>
                    <p className="mt-1 font-semibold">
                      {levelDetails[profile.level].name} · {levelDetails[profile.level].subtitle}
                    </p>
                  </div>
                  <Link href="/dashboard/levels" className="text-sm font-medium text-[#635bff]">
                    Compare
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                    {progress.completedSkills.length} skills completed
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                    {progress.completedProjects.length} projects completed
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                    {progress.completedMissions.length} missions completed
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void recommendNextLevel()}
                    className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium dark:border-slate-700"
                  >
                    Check my progress
                  </button>
                  {levelRecommendation && (
                    <p className="text-sm text-slate-600 dark:text-slate-300" role="status">
                      {levelRecommendation}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">AI Insights</p>
                  <button
                    type="button"
                    onClick={() => void generateGuidance()}
                    disabled={isGeneratingGuidance}
                    className="inline-flex items-center gap-2 rounded-full bg-[#635bff]/10 px-3 py-1.5 text-xs font-medium text-[#635bff] disabled:opacity-60"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isGeneratingGuidance ? "Thinking..." : "Ask AI"}
                  </button>
                </div>
                {guidanceError && (
                  <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-200" role="alert">
                    {guidanceError}
                  </p>
                )}
                {aiGuidance && (
                  <div aria-live="polite" className="mt-4 rounded-xl bg-[#635bff]/5 p-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {aiGuidance.summary}
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      {aiGuidance.recommendations.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <p className="mt-2 text-xs text-slate-500">
                      AI confidence estimate: {Math.round(aiGuidance.confidence * 100)}%
                    </p>
                  </div>
                )}
                <div className="mt-4 space-y-3">
                  {dashboardInsights.map((text) => (
                    <div
                      key={text}
                      className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#635bff]" />
                      <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
                <p className="text-sm text-slate-500 dark:text-slate-400">Career DNA</p>
                <div className="mt-5 space-y-4">
                  {careerDNA.map((skill) => (
                    <div key={skill.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                        <span>{skill.category}</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {skill.score}
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-[#635bff]"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
