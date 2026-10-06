"use client";

import { useState } from "react";
import { useLocalProgress, useLocalSession } from "@/lib/client-state";
import { normalizeLevel, type VerniqLevel } from "@/lib/levels";

const targetSkills = ["Programming fundamentals", "Web APIs", "Databases", "Testing", "Git & collaboration", "Deployment"];
type Analysis = { strengths: string[]; focusAreas: string[]; nextAction: string; levelReadiness: number; explanation: string };

export default function SkillGapsPage() {
  const session = useLocalSession();
  const progress = useLocalProgress();
  const level: VerniqLevel = normalizeLevel(session?.level);
  const [targetRoleOverride, setTargetRoleOverride] = useState<string | null>(null);
  const targetRole = targetRoleOverride ?? session?.targetRole ?? "Software Developer";
  const [scores, setScores] = useState<Record<string, number>>(() => Object.fromEntries(targetSkills.map((skill) => [skill, 40])));
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const response = await fetch("/api/ai/level-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          targetRole,
          skills: targetSkills.map((name) => ({ name, score: scores[name] })),
          progress: `Completed learning milestones: ${progress.completedSkills.join(", ") || "none"}; completed projects: ${progress.completedProjects.join(", ") || "none"}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Analysis failed.");
      setAnalysis(data as Analysis);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[80vh] bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635bff]">INTERMEDIATE · SKILL GAP ANALYSIS</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Choose your next skill to strengthen</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">Rate your confidence honestly. VERNIQ uses your input and locally saved progress to suggest a practical next step.</p>
        <label className="mt-6 block max-w-xl text-sm font-medium">Target role<input value={targetRole} onChange={(event) => setTargetRoleOverride(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-[#111113]" /></label>
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {targetSkills.map((skill) => (
            <label key={skill} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111113]">
              <span className="flex justify-between gap-3 text-sm font-medium"><span>{skill}</span><span className="text-[#635bff]">{scores[skill]}%</span></span>
              <input aria-label={`${skill} confidence`} type="range" min="0" max="100" step="5" value={scores[skill]} onChange={(event) => setScores((current) => ({ ...current, [skill]: Number(event.target.value) }))} className="mt-4 w-full accent-[#635bff]" />
            </label>
          ))}
        </section>
        <button type="button" disabled={loading || targetRole.trim().length < 2} onClick={() => void analyze()} className="mt-6 rounded-full bg-[#635bff] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">{loading ? "Analyzing…" : "Generate skill-gap analysis"}</button>
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
        {analysis && <section aria-live="polite" className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111113]">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Your role readiness signal</h2><span className="rounded-full bg-[#635bff]/10 px-3 py-1 text-sm font-semibold text-[#635bff]">{analysis.levelReadiness}%</span></div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{analysis.explanation}</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2"><div><h3 className="font-semibold">Current strengths</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{analysis.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3 className="font-semibold">Focus areas</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{analysis.focusAreas.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
          <p className="mt-5 rounded-xl bg-indigo-50 p-4 text-sm dark:bg-indigo-950/30"><strong>Suggested next action:</strong> {analysis.nextAction}</p>
          <p className="mt-3 text-xs text-slate-500">This is AI-generated coaching based on self-reported inputs, not a verified skills assessment.</p>
        </section>}
      </div>
    </main>
  );
}
