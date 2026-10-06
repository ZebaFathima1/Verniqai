"use client";

import Link from "next/link";
import { useLocalProgress, useLocalSession } from "@/lib/client-state";
import { normalizeLevel } from "@/lib/levels";

const sprint = [
  { week: "Days 1–7 · Focus", goal: "Choose one role-relevant skill gap and complete a focused learning path." },
  { week: "Days 8–14 · Build", goal: "Create a small project that demonstrates that skill and test the main workflow." },
  { week: "Days 15–21 · Publish", goal: "Deploy the project, improve its README, and capture screenshots or a short demo." },
  { week: "Days 22–30 · Prepare", goal: "Update your resume, practice interview stories, and apply to a small set of suitable roles." },
];

export default function CareerReportPage() {
  const session = useLocalSession();
  const progress = useLocalProgress();
  const profile = {
    name: session?.name ?? "Learner",
    targetRole: session?.targetRole ?? "your target role",
    level: normalizeLevel(session?.level),
  };
  const days = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <main className="min-h-[80vh] bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <article className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635bff]">PRO · CAREER REPORT</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Your next 30 days</h1><p className="mt-2 text-sm text-slate-500">Prepared for {profile.name} · {days} · {profile.level.toUpperCase()}</p></div>
          <button type="button" onClick={() => window.print()} className="rounded-full bg-[#635bff] px-5 py-3 text-sm font-medium text-white print:hidden">Print / Save PDF</button>
        </header>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111113]">
          <h2 className="text-xl font-semibold">Career focus: {profile.targetRole}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">This report summarizes progress saved in this browser. It is a planning aid, not a verified employability score.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Learning milestones", progress.completedSkills.length], ["Practice missions", progress.completedMissions.length], ["Projects completed", progress.completedProjects.length], ["Portfolio checks", progress.completedPortfolioItems.length]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/70"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>)}
          </div>
          <p className="mt-5 text-sm"><strong>Suggested focus:</strong> finish one learning milestone, demonstrate it in a project, then explain the decisions clearly.</p>
        </section>
        <section className="mt-6">
          <h2 className="text-xl font-semibold">30-day career sprint</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">{sprint.map((item) => <article key={item.week} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111113]"><p className="text-xs font-semibold uppercase tracking-wide text-[#635bff]">{item.week}</p><p className="mt-3 text-sm">{item.goal}</p></article>)}</div>
        </section>
        <nav className="mt-6 flex flex-wrap gap-3 print:hidden">
          <Link className="rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-slate-700" href="/dashboard/learning">Learning</Link>
          <Link className="rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-slate-700" href="/dashboard/portfolio">Portfolio review</Link>
          <Link className="rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-slate-700" href="/dashboard/resume">Resume tools</Link>
        </nav>
      </article>
    </main>
  );
}
