"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FolderKanban } from "lucide-react";
import { useLocalProgress } from "@/lib/client-state";
import { toggleProject } from "@/lib/local-progress";
import { projectCards } from "@/lib/demo-data";

export default function ProjectsPage() {
  const progress = useLocalProgress();
  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Portfolio</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Projects</h1>
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
          {projectCards.map((project) => (
            <article
              key={project.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#635bff]/10 text-[#635bff]">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {project.level}
                </span>
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-[-0.04em]">{project.title}</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{project.tags}</p>

              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Impact</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{project.impact}/100</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full rounded-full bg-[#635bff]" style={{ width: `${project.impact}%` }} />
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span>{project.duration}</span>
                <button type="button" aria-pressed={progress.completedProjects.includes(project.title)} onClick={() => toggleProject(project.title)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
                  {progress.completedProjects.includes(project.title) ? "Completed" : "Mark complete"}
                </button>
                <Link href="/dashboard/portfolio" className="inline-flex items-center gap-1 font-medium text-[#635bff]">
                  Review <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
