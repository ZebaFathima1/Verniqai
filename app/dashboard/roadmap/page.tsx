import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, Rocket } from "lucide-react";
import { roadmapItems } from "@/lib/demo-data";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Growth roadmap</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Your 6-week progression</h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-[#111113]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </header>

        <section className="space-y-4">
          {roadmapItems.map((item, index) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#635bff]/10 text-sm font-medium text-[#635bff]">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-lg font-semibold tracking-[-0.04em]">{item.label}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.project}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {item.time}
                  </span>
                  {item.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : item.status === "active" ? (
                    <Clock3 className="h-5 w-5 text-[#635bff]" />
                  ) : (
                    <Rocket className="h-5 w-5 text-violet-500" />
                  )}
                </div>
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
      </div>
    </div>
  );
}
