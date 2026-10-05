"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { jobMatch } from "@/lib/demo-data";

export default function JobsPage() {
  const [role, setRole] = useState(jobMatch.role);
  const [skills, setSkills] = useState(jobMatch.strengths.filter((skill) => skill.status).map((skill) => skill.name).join(", "));
  const [analysis, setAnalysis] = useState<{
    role: string;
    matchScore: number;
    strengths: string[];
    gaps: string[];
    nextSteps: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  async function analyzeFit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAnalyzing(true);
    setError("");
    setAnalysis(null);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Job match analysis failed.");
      setAnalysis(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Job match analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Role fit</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Job match</h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-[#111113]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness className="h-5 w-5 text-[#635bff]" />
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Analyze your fit for a role</h2>
          </div>
          <form onSubmit={analyzeFit} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium">
              Target role
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                maxLength={200}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <label className="block text-sm font-medium">
              Your skills (comma-separated)
              <input
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder="Python, SQL, model deployment"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <div className="md:col-span-2">
              {error && <p className="mb-3 text-sm text-rose-600" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={isAnalyzing}
                className="rounded-full bg-[#635bff] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze job fit"}
              </button>
            </div>
          </form>

          {analysis && (
            <div aria-live="polite" className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{analysis.role}</h3>
                <span className="rounded-full bg-[#635bff]/10 px-3 py-1.5 text-sm font-medium text-[#635bff]">
                  {analysis.matchScore}% skill alignment estimate
                </span>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {[
                  { title: "Strengths", items: analysis.strengths, Icon: Check },
                  { title: "Skills to build", items: analysis.gaps, Icon: X },
                ].map(({ title, items, Icon }) => (
                  <div key={title}>
                    <h4 className="mb-3 font-medium">{title}</h4>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                      {items.map((item) => <li key={item} className="flex gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#635bff]" />{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <h4 className="mt-5 font-medium">Recommended next steps</h4>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-200">
                {analysis.nextSteps.map((step) => <li key={step}>{step}</li>)}
              </ul>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
          <h3 className="text-xl font-semibold tracking-[-0.04em]">Application strategy</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              "Build one production-ready ML project with deployment evidence.",
              "Improve system design communication using a simple, repeatable framework.",
              "Tailor resume bullets to the exact role and team context.",
            ].map((tip) => (
              <div key={tip} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-950/70 dark:text-slate-200">
                {tip}
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/interview"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#635bff] px-4 py-2 text-sm font-medium text-white"
          >
            Prepare for interviews <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
