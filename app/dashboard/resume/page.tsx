import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { resumeMetrics } from "@/lib/demo-data";

const improvements = [
  "Add measurable outcomes to each bullet point",
  "Lead with action verbs and AI-specific keywords",
  "Show cross-functional project ownership",
  "Reframe coursework as applied problem-solving evidence",
];

export default function ResumePage() {
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
