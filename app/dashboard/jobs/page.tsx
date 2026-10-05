import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, X } from "lucide-react";
import { jobMatch } from "@/lib/demo-data";

export default function JobsPage() {
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

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Target role</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{jobMatch.role}</h2>
              </div>
              <div className="rounded-full bg-[#635bff]/10 px-3 py-1.5 text-sm font-medium text-[#635bff]">
                {jobMatch.match}% match
              </div>
            </div>

            <div className="mt-6 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-[#635bff]" style={{ width: `${jobMatch.match}%` }} />
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/70">
              <div className="flex items-center gap-3">
                <BriefcaseBusiness className="h-5 w-5 text-[#635bff]" />
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Company</p>
              </div>
              <p className="mt-3 text-xl font-semibold tracking-[-0.05em]">{jobMatch.company}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <h3 className="text-xl font-semibold tracking-[-0.04em]">Skill gaps vs target role</h3>
            <div className="mt-6 space-y-4">
              {jobMatch.strengths.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950/70">
                  <span className="text-sm text-slate-700 dark:text-slate-200">{skill.name}</span>
                  {skill.status ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <Check className="h-3.5 w-3.5" /> Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      <X className="h-3.5 w-3.5" /> Gap
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
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
