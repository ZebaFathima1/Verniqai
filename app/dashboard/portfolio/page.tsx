"use client";

import { togglePortfolioItem } from "@/lib/local-progress";
import { useLocalProgress } from "@/lib/client-state";

const checks = [
  { id: "portfolio:problem", title: "Explain the problem and who the project is for", hint: "Lead with the need, not only the technology." },
  { id: "portfolio:readme", title: "Write a complete README", hint: "Include setup steps, features, screenshots, and known limitations." },
  { id: "portfolio:demo", title: "Publish a working demo", hint: "Keep the live link current and avoid exposing secrets." },
  { id: "portfolio:tests", title: "Show quality checks", hint: "Add tests or explain how you validated the result." },
  { id: "portfolio:decisions", title: "Document design decisions", hint: "Describe trade-offs and what you would improve next." },
  { id: "portfolio:ownership", title: "Clarify your contribution", hint: "For team work, distinguish your work from the team's." },
];

export default function PortfolioPage() {
  const progress = useLocalProgress();
  const done = checks.filter((item) => progress.completedPortfolioItems.includes(item.id)).length;

  return (
    <main className="min-h-[80vh] bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635bff]">PRO · PORTFOLIO REVIEW</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Make your work easy to evaluate</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">A practical evidence checklist for your strongest project. Your checklist is saved locally in this browser.</p>
        <div className="mt-6 rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-950/30">
          <div className="flex items-center justify-between gap-4"><h2 className="font-semibold">Portfolio readiness checklist</h2><span className="text-sm font-semibold text-[#635bff]">{done}/{checks.length}</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70 dark:bg-slate-900"><div className="h-full rounded-full bg-[#635bff] transition-all" style={{ width: `${(done / checks.length) * 100}%` }} /></div>
        </div>
        <section className="mt-5 space-y-3">
          {checks.map((item) => {
            const checked = progress.completedPortfolioItems.includes(item.id);
            return <label key={item.id} className="flex cursor-pointer gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111113]">
              <input type="checkbox" checked={checked} onChange={() => togglePortfolioItem(item.id)} className="mt-1 accent-[#635bff]" />
              <span><span className={`font-medium ${checked ? "line-through text-slate-500" : ""}`}>{item.title}</span><span className="mt-1 block text-sm text-slate-500">{item.hint}</span></span>
            </label>;
          })}
        </section>
        <p className="mt-5 text-xs text-slate-500">This checklist is coaching, not a formal rating. VERNIQ does not inspect private repositories or verify project claims.</p>
      </div>
    </main>
  );
}
