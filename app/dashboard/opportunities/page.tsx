"use client";

import { useEffect, useState } from "react";
import { toggleOpportunityBookmark } from "@/lib/local-progress";
import { useLocalProgress, useLocalSession } from "@/lib/client-state";
import { normalizeLevel, type VerniqLevel } from "@/lib/levels";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  type: string;
  level: VerniqLevel;
  duration: string;
  skills: string[];
  href: string;
  summary: string;
};

async function searchOpportunities(input: {
  level: VerniqLevel;
  targetRole: string;
  skills: string[];
  type: string;
}, signal?: AbortSignal) {
  const response = await fetch("/api/opportunities/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, type: input.type === "All" ? undefined : input.type }),
    signal,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Could not search current opportunities.");
  if (!Array.isArray(data.recommendations)) throw new Error("Opportunity search returned an unexpected response.");
  return data as { recommendations: Opportunity[]; personalizedTo: string; notice: string };
}

export default function OpportunitiesPage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const session = useLocalSession();
  const progress = useLocalProgress();
  const level: VerniqLevel = normalizeLevel(session?.level);
  const [type, setType] = useState("All");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setError("");
      setIsSearching(true);
      try {
        const data = await searchOpportunities({ level, targetRole: session?.targetRole ?? "", skills: [], type }, controller.signal);
        setItems(data.recommendations);
        setNotice(data.notice);
      } catch (caught) {
        if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Could not load opportunities.");
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [level, session?.targetRole, type]);

  async function recommend() {
    setIsSearching(true);
    setError("");
    try {
      const skills = progress.completedSkills.map((item) => item.split(":").pop() ?? item).slice(0, 30);
      const data = await searchOpportunities({ level, targetRole: session?.targetRole ?? "", skills, type });
      setItems(data.recommendations);
      setNotice(`${data.notice}${data.personalizedTo ? ` Search focused on ${data.personalizedTo}.` : ""}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not recommend resources.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <main className="min-h-[80vh] bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635bff]">OPPORTUNITIES · {level.toUpperCase()}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">A next step worth taking</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">Get AI-generated ideas for courses, projects, and career searches matched to your level.</p>
          </div>
          <label className="text-sm">
            <span className="mb-1 block text-slate-500">Type</span>
            <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#111113]">
              {["All", "Course", "Workshop", "Open Source", "Project Program", "Internship", "Jobs"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </header>
        <button type="button" disabled={isSearching} onClick={() => void recommend()} className="mt-5 rounded-full bg-[#635bff]/10 px-4 py-2 text-sm font-medium text-[#635bff] disabled:opacity-50">
          {isSearching ? "Generating ideas…" : "Refresh role matches"}
        </button>
        {notice && <p className="mt-5 rounded-xl bg-sky-50 p-3 text-sm text-sky-900 dark:bg-sky-950/30 dark:text-sky-100">{notice}</p>}
        {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
        {isSearching && items.length === 0 && <p className="mt-8 text-sm text-slate-500" role="status">Generating suggestions…</p>}
        <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#635bff]/10 px-3 py-1 text-xs font-medium text-[#635bff]">{item.type}</span>
                <button type="button" aria-pressed={progress.bookmarkedOpportunities.includes(item.id)} onClick={() => toggleOpportunityBookmark(item.id)} className="text-xs text-slate-500">
                {progress.bookmarkedOpportunities.includes(item.id) ? "★ Saved" : "☆ Save"}
                </button>
              </div>
              <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.organization} · {item.duration}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.summary}</p>
              <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">Skills</p>
              <div className="mt-2 flex flex-wrap gap-2">{item.skills.map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs dark:bg-slate-800">{skill}</span>)}</div>
              <a href={item.href} target="_blank" rel="noreferrer" className="mt-auto pt-6 text-sm font-semibold text-[#635bff]">Explore resource <span aria-hidden="true">↗</span></a>
            </article>
          ))}
        </section>
        {!isSearching && !error && items.length === 0 && <p className="mt-8 text-sm text-slate-500">No suggestions were generated for this filter. Try refreshing or choosing another type.</p>}
      </div>
    </main>
  );
}
