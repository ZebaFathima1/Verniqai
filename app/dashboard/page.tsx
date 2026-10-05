"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Gauge, MessageSquareText, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentSession, signOut } from "@/lib/auth";
import { getDashboardData, getDemoProfileSnapshot } from "@/lib/profile-data";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: Gauge },
  { label: "Career DNA", href: "/dashboard/career-dna", icon: Gauge },
  { label: "Roadmap", href: "/dashboard/roadmap", icon: TrendingUp },
  { label: "Next Best Action", href: "/dashboard/next-action", icon: Target },
  { label: "Projects", href: "/dashboard/projects", icon: BriefcaseBusiness },
  { label: "Resume", href: "/dashboard/resume", icon: MessageSquareText },
  { label: "Job Match", href: "/dashboard/jobs", icon: BriefcaseBusiness },
  { label: "Interview", href: "/dashboard/interview", icon: MessageSquareText },
  { label: "Tech Radar", href: "/dashboard/tech-radar", icon: TrendingUp },
];

export default function DashboardPage() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(getDemoProfileSnapshot());

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

    void loadDashboardData();
  }, [router]);

  const { profile, careerDNA, dashboardInsights, nextAction, roadmap, weeklyMomentum } = snapshot;

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-slate-900 dark:bg-[#09090b] dark:text-slate-50">
      <aside className="hidden w-[240px] flex-col border-r border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-[#111113]/80 lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635bff] text-sm font-semibold text-white">
            V
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">VERNIQ AI</p>
          </div>
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

      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-[#111113]/80">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Overview</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Dashboard
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                <span>⌘K</span>
                <span>Search</span>
              </div>
              <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                🔔
              </button>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.replace("/dashboard/login");
                }}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#635bff] text-xs font-semibold text-white">
                  RS
                </span>
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.headline}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-900 dark:text-slate-50">
            {profile.subheadline}
            </h1>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Career Readiness</p>
                    <div className="mt-4 flex items-end gap-3">
                      <span className="text-5xl font-semibold tracking-[-0.07em]">
                        {profile.readiness}%
                      </span>
                      <span className="mb-2 text-sm text-emerald-600">
                        +{profile.readinessChange}% this month
                      </span>
                    </div>
                  </div>

                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-[#635bff] border-r-slate-200 bg-white text-center dark:bg-[#111113]">
                    <div>
                      <div className="text-2xl font-semibold">76%</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Ready</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/80">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Target</p>
                    <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
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
                  <p className="text-sm text-slate-500 dark:text-slate-400">Next Best Action</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-slate-50">
                    {nextAction.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {nextAction.reason}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {nextAction.description}
                  </p>
                  <Link
                    href="/dashboard/next-action"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#635bff]/10 px-3.5 py-2 text-sm font-medium text-[#635bff]"
                  >
                    Start Mission <ArrowRight className="h-4 w-4" />
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
                <p className="text-sm text-slate-500 dark:text-slate-400">AI Insights</p>
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
