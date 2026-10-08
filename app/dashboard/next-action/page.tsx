import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { nextAction } from "@/lib/demo-data";

const tasks = [
  "Finish the Docker crash course and rebuild your latest ML project in a container",
  "Document 3 end-to-end projects with architecture diagrams and measurable outcomes",
  "Practice one system design answer every day with a structured framework",
  "Review mock interview feedback and tighten your communication pattern",
];

export default function NextActionPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Action plan</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Next best action</h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-[#111113]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#635bff]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#635bff]">
              <Sparkles className="h-3.5 w-3.5" />
              Highest impact
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.06em]">{nextAction.title}</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{nextAction.reason}</p>
            <p className="mt-4 text-base text-slate-700 dark:text-slate-200">{nextAction.description}</p>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/70">
              <div className="rounded-full bg-[#635bff]/10 p-2 text-[#635bff]">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Estimated effort</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{nextAction.duration}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <h3 className="text-xl font-semibold tracking-[-0.04em]">This week</h3>
            <div className="mt-6 space-y-4">
              {tasks.map((task) => (
                <div key={task} className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/70">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#635bff] text-white">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{task}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-[#635bff] to-[#4f46e5] p-6 text-white shadow-lg shadow-[#635bff]/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-indigo-100">Action status</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Strong momentum</h3>
            </div>
            <Link
              href="/dashboard/roadmap"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#635bff]"
            >
              View roadmap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
