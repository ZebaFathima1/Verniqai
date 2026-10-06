"use client";

import Link from "next/link";
import { toggleSkill } from "@/lib/local-progress";
import { useLocalProgress, useLocalSession } from "@/lib/client-state";
import { learningPaths, levelDetails, normalizeLevel } from "@/lib/levels";

export default function LearningPage() {
  const progress = useLocalProgress();
  const level = normalizeLevel(useLocalSession()?.level);

  const visiblePaths = learningPaths.filter((path) => path.levels.includes(level));

  return (
    <main className="min-h-[80vh] bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635bff]">{levelDetails[level].name} · LEARN</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Foundation learning paths</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Choose an area, work through short milestones, and track your progress on this device.</p>
        </header>
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {visiblePaths.map((path) => {
            const complete = path.skills.filter((skill) => progress.completedSkills.includes(`${path.id}:${skill}`)).length;
            return (
              <article key={path.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{complete}/{path.skills.length} milestones</p>
                    <h2 className="mt-2 text-xl font-semibold">{path.title}</h2>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">Learning path</span>
                </div>
                <div className="mt-5 space-y-2">
                  {path.skills.map((skill, index) => {
                    const id = `${path.id}:${skill}`;
                    const done = progress.completedSkills.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          toggleSkill(id);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3 text-left text-sm dark:bg-slate-950/70"
                      >
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${done ? "bg-emerald-500 text-white" : index === complete ? "bg-[#635bff] text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                          {done ? "✓" : index + 1}
                        </span>
                        <span className={done ? "text-slate-500 line-through" : ""}>{skill}</span>
                        <span className="ml-auto text-xs text-slate-500">{done ? "Complete" : "Mark done"}</span>
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>
        {level === "basic" && (
          <section className="mt-8 rounded-2xl bg-[#635bff] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-100">Today&apos;s mission · 20 minutes</p>
            <h2 className="mt-2 text-2xl font-semibold">Learn one concept, answer five questions, try one small challenge.</h2>
            <p className="mt-3 text-sm text-indigo-100">Start with the next unchecked milestone in your programming path. Use Ask VERNIQ for a simple explanation whenever you get stuck.</p>
            <Link href="/dashboard/mentor" className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-[#4f46e5]">Ask the AI mentor</Link>
          </section>
        )}
      </div>
    </main>
  );
}
