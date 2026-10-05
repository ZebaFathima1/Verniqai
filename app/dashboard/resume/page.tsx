"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { resumeMetrics } from "@/lib/demo-data";

const improvements = [
  "Add measurable outcomes to each bullet point",
  "Lead with action verbs and AI-specific keywords",
  "Show cross-functional project ownership",
  "Reframe coursework as applied problem-solving evidence",
];

export default function ResumePage() {
  const [targetRole, setTargetRole] = useState("AI / ML Engineer");
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<{
    atsScore: number;
    summary: string;
    suggestions: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  async function analyzeResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAnalyzing(true);
    setError("");
    setAnalysis(null);
    try {
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, targetRole }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Resume analysis failed.");
      setAnalysis(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Resume analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Resume strategy</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Resume intelligence</h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-[#111113]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resumeMetrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
              <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-3xl font-semibold tracking-[-0.06em]">{metric.score}%</span>
              </div>
              <div className="mt-4 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full rounded-full bg-[#635bff]" style={{ width: `${metric.score}%` }} />
              </div>
            </div>
          ))}
        </section>

        <form
          onSubmit={analyzeResume}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]"
        >
          <h2 className="text-xl font-semibold tracking-[-0.04em]">Analyze your resume with AI</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Paste resume text to get role-specific feedback. Avoid including sensitive personal information.
          </p>
          <div className="mt-5 grid gap-4">
            <label className="block text-sm font-medium">
              Target role
              <input
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                maxLength={200}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <label className="block text-sm font-medium">
              Resume text
              <textarea
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
                minLength={20}
                maxLength={12000}
                rows={7}
                required
                placeholder="Paste your resume content here..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-fit rounded-full bg-[#635bff] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze resume"}
            </button>
          </div>
          {analysis && (
            <div aria-live="polite" className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/70">
              <p className="text-lg font-semibold">ATS estimate: {analysis.atsScore}%</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{analysis.summary}</p>
              <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-slate-700 dark:text-slate-200">
                {analysis.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}
              </ul>
            </div>
          )}
        </form>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Suggested resume rewrite</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-700 dark:text-slate-200">
              <p>Built and deployed an AI-driven resume analyzer using Python, NLP, and FastAPI to improve keyword relevance and reduce recruiter screening friction.</p>
              <p>Reduced model evaluation latency by 32% by restructuring feature pipelines and tuning preprocessing stages for production-grade inference workflows.</p>
              <p>Collaborated across product and data workflows to translate user pain points into technical deliverables that improved experiment velocity and stakeholder clarity.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <h3 className="text-xl font-semibold tracking-[-0.04em]">What to improve</h3>
            <div className="mt-6 space-y-4">
              {improvements.map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/70">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <p className="text-sm text-slate-700 dark:text-slate-200">{item}</p>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#635bff] px-4 py-2 text-sm font-medium text-white"
            >
              Check job fit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
