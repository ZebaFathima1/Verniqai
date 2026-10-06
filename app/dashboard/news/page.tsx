"use client";

import { useEffect, useState } from "react";
import { toggleBriefingRead } from "@/lib/local-progress";
import { useLocalProgress, useLocalSession } from "@/lib/client-state";
import { normalizeLevel, type VerniqLevel } from "@/lib/levels";

type Briefing = {
  id: string;
  category: string;
  title: string;
  summary: string;
  publishedAt: string;
  sourceName: string;
  sourceUrl: string;
  action: string;
  matchedSkills: string[];
  personalized: boolean;
  whyItMattersToYou: string;
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
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Could not load briefings.");
        setItems(Array.isArray(data.items) ? data.items : []);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setNotice(data.freshness ?? "");
      } catch (caught) {
        if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Could not load briefings.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [category, career, level, progress.completedSkills]);

  return (
    <main className="min-h-[80vh] bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635bff]">AI NEWS · {level.toUpperCase()}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">The latest signals for your career</h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">Current reporting and announcements, researched and tailored to your target role.</p>
          </div>
          <label className="text-sm">
            <span className="mb-1 block text-slate-500">Topic</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#111113]">
              <option>All</option>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </header>
        {notice && <p className="mt-5 rounded-xl bg-sky-50 p-3 text-sm text-sky-900 dark:bg-sky-950/30 dark:text-sky-100">{notice}</p>}
        {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
        <section className="mt-6 grid gap-5 md:grid-cols-2">
          {items.map((item) => {
            const isRead = progress.viewedBriefings.includes(item.id);
            return (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#635bff]">{item.category}</span>
                  {item.personalized && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">Role relevant</span>}
                </div>
                <h2 className="mt-3 text-xl font-semibold">{item.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{item.publishedAt}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.summary}</p>
                <p className="mt-4 text-sm font-medium">{item.whyItMattersToYou}</p>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950/70">
                  <span className="font-semibold">Try this: </span>{item.action}
                </div>
                <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-medium text-[#5148e5] hover:underline">
                  Source: {item.sourceName} <span aria-hidden="true" className="ml-1">↗</span>
                </a>
                <button type="button" onClick={() => toggleBriefingRead(item.id)} className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium dark:border-slate-700">
                  {isRead ? "Mark unread" : "Mark as read"}
                </button>
              </article>
            );
          })}
        </section>
        {isLoading && items.length === 0 && <p className="mt-8 text-sm text-slate-500" role="status">Searching current sources for career news…</p>}
        {!isLoading && !error && items.length === 0 && <p className="mt-8 text-sm text-slate-500">No cited briefings were found for that topic. Try another topic.</p>}
      </div>
    </main>
  );
}
