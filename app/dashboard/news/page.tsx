"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { toggleBriefingRead } from "@/lib/local-progress";
import { useLocalProgress, useLocalSession } from "@/lib/client-state";
import { normalizeLevel, type VerniqLevel } from "@/lib/levels";

type Briefing = {
  id: string;
  category: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  action: string;
  matchedSkills: string[];
  personalized: boolean;
  whyItMattersToYou: string;
  sourceKind: "ai" | "curated";
};

type NewsResponse = {
  items?: Briefing[];
  categories?: string[];
  freshness?: string;
  aiError?: string;
  error?: string;
};

export default function NewsPage() {
  const [items, setItems] = useState<Briefing[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("All");
  const session = useLocalSession();
  const progress = useLocalProgress();
  const level: VerniqLevel = normalizeLevel(session?.level);
  const career = session?.targetRole ?? "";
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setError("");
      setIsLoading(true);
      try {
        const skills = progress.completedSkills.map((item) => item.split(":").pop() ?? item).join(",");
        const params = new URLSearchParams({ level, career, category, skills });
        const response = await fetch(`/api/ai/news?${params}`, { signal: controller.signal });
        const data = await response.json() as NewsResponse;
        if (!response.ok) throw new Error(data.error ?? "Could not load research topics.");
        setItems(Array.isArray(data.items) ? data.items : []);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setNotice(data.freshness ?? "");
        setError(data.aiError ?? "");
      } catch (caught) {
        if (!controller.signal.aborted) {
          setItems([]);
          setError(caught instanceof Error ? caught.message : "Could not load research topics.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [category, career, level, progress.completedSkills]);

  return (
    <main className="min-h-[80vh] bg-[#fafafa] px-4 py-6 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Topics worth exploring</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Role-aware research ideas, paired with links to check current reporting.
            </p>
          </div>
          <label className="text-sm">
            <span className="mb-1 block text-slate-500">Topic</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#111113]"
            >
              <option>All</option>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </header>

        {notice && <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notice}</p>}
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            {error}{items.length > 0 ? " Showing curated research prompts below." : ""}
          </p>
        )}

        <section aria-label="Career research topics" aria-busy={isLoading} className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
          {items.map((item) => {
            const isRead = progress.viewedBriefings.includes(item.id);
            return (
              <article key={item.id} className={`py-6 ${isRead ? "opacity-70" : ""}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="font-semibold uppercase tracking-wide text-[#5148e5] dark:text-violet-300">{item.category}</span>
                  <span className="text-slate-400" aria-hidden="true">·</span>
                  <span className="text-slate-500">{item.sourceKind === "ai" ? "AI-generated research topic" : "Curated research prompt"}</span>
                  {item.personalized && <span className="text-emerald-700 dark:text-emerald-300">Relevant to your role</span>}
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">{item.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.summary}</p>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed">{item.whyItMattersToYou}</p>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-800 dark:text-slate-100">Try this: </span>{item.action}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-[#5148e5] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] dark:text-violet-300"
                  >
                    {item.sourceName}<ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    aria-pressed={isRead}
                    onClick={() => toggleBriefingRead(item.id)}
                    className="min-h-10 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] dark:border-slate-700 dark:hover:bg-slate-900"
                  >
                    {isRead ? "Mark unread" : "Mark as read"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {isLoading && items.length === 0 && <p className="mt-8 text-sm text-slate-500" role="status" aria-live="polite">Generating career research topics…</p>}
        {!isLoading && !error && items.length === 0 && <p className="mt-8 text-sm text-slate-500">No topics are available for this filter. Try another topic.</p>}
      </div>
    </main>
  );
}
