"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateCurrentLevel } from "@/lib/auth";
import { levelDetails, LEVELS, type VerniqLevel } from "@/lib/levels";

const levelFeatures: Record<VerniqLevel, string[]> = {
  basic: ["AI mentor", "AI dashboard and career DNA", "AI trend briefings", "Foundation learning paths", "Beginner practice and missions", "Starter projects", "Career exploration", "Training opportunities"],
  intermediate: ["Everything in Basic", "Advanced learning paths", "Practical assessments", "Project recommendations and milestones", "GitHub public profile insights", "Skill-gap analysis", "Hackathons and advanced training"],
  pro: ["Everything in Intermediate", "Resume intelligence", "Job-description matching", "Career gap analysis", "AI interview coaching", "Portfolio review checklist", "Career report and 30-day sprint", "Career opportunities"],
};

const badges: Record<VerniqLevel, string> = {
  basic: "Build Your Foundation",
  intermediate: "Build Skills. Build Projects.",
  pro: "Become Career Ready",
};

export default function LevelsPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  function chooseLevel(level: VerniqLevel) {
    try {
      updateCurrentLevel(level);
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update your level.");
    }
  }

  return (
    <main className="min-h-[80vh] bg-[#fafafa] px-4 py-10 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#635bff]">Learn → Build → Become career ready</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Choose your VERNIQ level</h1>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          One career-intelligence platform that grows with you. Change your level whenever you want; level suggestions are optional.
        </p>
        {error && <p className="mt-4 text-sm text-rose-600" role="alert">{error}</p>}
        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {LEVELS.map((level) => (
            <article key={level} className={`rounded-3xl border bg-white p-6 shadow-sm dark:bg-[#111113] ${level === "intermediate" ? "border-[#635bff] ring-1 ring-[#635bff]/30" : "border-slate-200 dark:border-slate-800"}`}>
              {level === "intermediate" && <span className="rounded-full bg-[#635bff]/10 px-3 py-1 text-xs font-semibold text-[#635bff]">MOST POPULAR</span>}
              <p className="mt-4 text-xs font-bold tracking-[0.16em] text-[#635bff]">{levelDetails[level].name}</p>
              <h2 className="mt-2 text-2xl font-semibold">{badges[level]}</h2>
              <ul className="mt-6 space-y-3">
                {levelFeatures[level].map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <span className="text-emerald-600">✓</span>{feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => chooseLevel(level)}
                className="mt-8 w-full rounded-full bg-[#635bff] px-5 py-3 text-sm font-medium text-white"
              >
                {level === "basic" ? "Start Basic" : level === "intermediate" ? "Choose Intermediate" : "Go Pro"}
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">Level selection is free in this prototype.</p>
            </article>
          ))}
        </section>
        <p className="mt-8 text-sm text-slate-500">
          Account levels and progress are stored in this browser only. There is no subscription billing or cross-device sync.
        </p>
      </div>
    </main>
  );
}
