import Link from "next/link";
import { ArrowLeft, ArrowRight, BrainCircuit, Sparkles } from "lucide-react";
import { careerDNA, demoProfile } from "@/lib/demo-data";

export default function CareerDNAPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Career intelligence</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Career DNA</h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-[#111113]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {careerDNA.map((item) => (
            <div
              key={item.category}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                <BrainCircuit className="h-4 w-4 text-[#635bff]" />
              </div>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-3xl font-semibold tracking-[-0.06em]">{item.score}%</span>
              </div>
              <div className="mt-4 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-[#635bff]"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#635bff]" />
              <h2 className="text-xl font-semibold tracking-[-0.04em]">Profile summary</h2>
            </div>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/70">
                <p className="text-sm text-slate-500 dark:text-slate-400">Current fit</p>
                <p className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                  {demoProfile.name} is strongest in technical execution and structured learning, with room to improve signal in system design and deployment fluency.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Strengths</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    <li>• AI/ML project depth</li>
                    <li>• Good Python fundamentals</li>
                    <li>• Clear learning momentum</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/40">
                  <p className="text-sm text-amber-700 dark:text-amber-300">Priority gaps</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    <li>• Docker and deployment</li>
                    <li>• System design thinking</li>
                    <li>• Structured interview answers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Recommended next moves</h2>
            <div className="mt-6 space-y-4">
              {[
                "Deploy a containerized ML project to a cloud environment",
                "Practice product-style system design explanations",
                "Refine your resume with measurable impact statements",
              ].map((item, index) => (
                <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/70">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#635bff]/10 text-sm font-medium text-[#635bff]">
                    {index + 1}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{item}</p>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/next-action"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#635bff] px-4 py-2 text-sm font-medium text-white"
            >
              See action plan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
