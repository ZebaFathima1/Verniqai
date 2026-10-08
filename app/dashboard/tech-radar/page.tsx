import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Radar } from "lucide-react";
import { techRadar } from "@/lib/demo-data";

export default function TechRadarPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Technology radar</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Skills to invest in</h1>
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
          {techRadar.map((item) => (
            <article key={item.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#635bff]/10 text-[#635bff]">
                  <Radar className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {item.trend}
                </span>
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-[-0.04em]">{item.name}</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>

              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Relevance</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{item.relevance}/5</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full rounded-full bg-[#635bff]" style={{ width: `${(item.relevance / 5) * 100}%` }} />
              </div>

              <div className="mt-5 flex items-center justify-end">
                <Link href="/dashboard/next-action" className="inline-flex items-center gap-1 text-sm font-medium text-[#635bff]">
                  Act on this <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
