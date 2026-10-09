"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  FileWarning,
  FileX2,
  Lightbulb,
  LoaderCircle,
  ShieldCheck,
  Target,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { useLocalSession } from "@/lib/client-state";
import {
  getResumeFileKind,
  MAX_RESUME_FILE_BYTES,
  RESUME_FILE_ACCEPT,
  resumeAnalysisSchema,
  type ResumeAnalysis,
  type ResumeFileKind,
} from "@/lib/resume-analysis";

const scoreLabels = [
  ["atsReadability", "ATS readability"],
  ["roleAlignment", "Role alignment"],
  ["skillsEvidence", "Skills evidence"],
  ["measurableImpact", "Measurable impact"],
  ["clarity", "Clarity"],
] as const;

const formatFileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

function formatFileKind(kind: ResumeFileKind) {
  return kind.toUpperCase();
}

export default function ResumePage() {
  const session = useLocalSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [targetRoleOverride, setTargetRoleOverride] = useState<string | null>(null);
  const targetRole = targetRoleOverride ?? session?.targetRole ?? "AI / ML Engineer";
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<{ message: string; phase: "file" | "analysis" } | null>(null);

  function selectFile(nextFile: File | undefined) {
    if (!nextFile) return;
    setAnalysis(null);
    setError(null);
    const kind = getResumeFileKind(nextFile.name, nextFile.type);
    if (!kind) {
      setFile(null);
      setError({ message: "Choose a PDF, DOCX, or TXT file.", phase: "file" });
      return;
    }
    if (nextFile.size === 0) {
      setFile(null);
      setError({ message: "That file is empty. Choose a different resume.", phase: "file" });
      return;
    }
    if (nextFile.size > MAX_RESUME_FILE_BYTES) {
      setFile(null);
      setError({ message: "The resume must be 4 MB or smaller.", phase: "file" });
      return;
    }
    setFile(nextFile);
  }

  function clearFile() {
    setFile(null);
    setAnalysis(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  async function analyzeResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError({ message: "Choose a resume file before starting the analysis.", phase: "file" });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    const formData = new FormData();
    formData.set("targetRole", targetRole.trim());
    formData.set("resumeFile", file);

    try {
      const response = await fetch("/api/resume", { method: "POST", body: formData });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data && typeof data.error === "string"
            ? data.error
            : "Resume analysis failed. Please try again.";
        const phase =
          data && typeof data === "object" && "phase" in data && data.phase === "file"
            ? "file"
            : "analysis";
        throw Object.assign(new Error(message), { phase });
      }
      const parsed = resumeAnalysisSchema.safeParse(data);
      if (!parsed.success) throw Object.assign(new Error("The analysis response was incomplete. Please try again."), { phase: "analysis" });
      setAnalysis(parsed.data);
    } catch (caught) {
      const phase =
        caught && typeof caught === "object" && "phase" in caught && caught.phase === "file"
          ? "file"
          : "analysis";
      setError({
        message: caught instanceof Error ? caught.message : "Resume analysis failed. Please try again.",
        phase,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-[80vh] bg-[#fafafa] px-4 py-6 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">Resume Intelligence</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              Review your resume against a target role, using only evidence in the document.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] dark:border-slate-800 dark:bg-[#111113] dark:hover:bg-slate-900"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Dashboard
          </Link>
        </header>

        <form onSubmit={analyzeResume} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-[#111113]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
            <label className="block text-sm font-medium">
              Target role
              <input
                value={targetRole}
                onChange={(event) => {
                  setTargetRoleOverride(event.target.value);
                  setAnalysis(null);
                  setError(null);
                }}
                maxLength={200}
                minLength={2}
                required
                disabled={isAnalyzing}
                autoComplete="organization-title"
                placeholder="e.g. AI / ML Engineer"
                aria-describedby="target-role-help"
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base font-normal outline-none transition focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/20 dark:border-slate-700 dark:bg-slate-950"
              />
              <span id="target-role-help" className="mt-2 block text-xs font-normal text-slate-500">We’ll compare the resume with this role.</span>
            </label>

            <div>
              <p className="mb-2 text-sm font-medium">Resume file</p>
              <input
                ref={inputRef}
                id="resume-file"
                type="file"
                accept={RESUME_FILE_ACCEPT}
                tabIndex={-1}
                onChange={(event) => {
                  selectFile(event.currentTarget.files?.[0]);
                  event.currentTarget.value = "";
                }}
                aria-label="Choose a PDF, DOCX, or TXT resume"
                className="sr-only"
              />
              {file ? (
                <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/70 sm:p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#635bff]/10 text-[#635bff]">
                    <FileText aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-all text-sm font-medium">{file.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatFileKind(getResumeFileKind(file.name, file.type) ?? "txt")} · {formatFileSize(file.size)}</p>
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (inputRef.current) inputRef.current.value = "";
                        inputRef.current?.click();
                      }}
                      disabled={isAnalyzing}
                      className="min-h-11 flex-1 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] disabled:opacity-50 sm:flex-none dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                      Replace file
                    </button>
                    <button
                      type="button"
                      onClick={clearFile}
                      disabled={isAnalyzing}
                      aria-label="Remove selected resume"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  aria-label="Resume upload area"
                  aria-describedby="resume-file-help"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-center transition ${
                    isDragging
                      ? "border-[#635bff] bg-[#635bff]/5"
                      : "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/70"
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635bff]/10 text-[#635bff]">
                    <Upload aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="mt-3 min-h-11 rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] disabled:opacity-50"
                  >
                    Browse files
                  </button>
                  <span className="mt-1 text-xs text-slate-500">Or drop a resume here · PDF, DOCX, or TXT · up to 4 MB</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <p id="resume-file-help" className="flex items-start gap-2 text-xs leading-relaxed text-slate-500 sm:max-w-xl">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              Extracted text is sent to the AI provider for this analysis. Verniq does not save the uploaded file or analysis.
            </p>
            <button
              type="submit"
              disabled={isAnalyzing || !file || targetRole.trim().length < 2}
              className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#635bff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5148e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
            >
              {isAnalyzing ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Target aria-hidden="true" className="h-4 w-4" />}
              {isAnalyzing ? "Reading and analyzing…" : "Analyze resume"}
            </button>
          </div>

          {isAnalyzing && (
            <p role="status" aria-live="polite" className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              Uploading the document, extracting its text, and generating role-specific feedback. This can take a moment.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
              {error.phase === "file" ? <FileWarning aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> : <FileX2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
              <span><strong className="font-semibold">{error.phase === "file" ? "We couldn’t read this file." : "AI analysis didn’t complete."}</strong> {error.message}</span>
            </p>
          )}
        </form>

        {analysis && file && (
          <section aria-labelledby="analysis-heading" className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="min-w-0">
                <h2 id="analysis-heading" className="text-2xl font-semibold tracking-[-0.05em]">Resume analysis</h2>
                <p className="mt-2 break-all text-sm text-slate-500">{file.name} <span aria-hidden="true">·</span> {targetRole}</p>
              </div>
              <span className="rounded-full bg-[#635bff]/10 px-3 py-1.5 text-xs font-medium text-[#5148e5] dark:text-violet-200">Estimate based on extracted text</span>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
              <div className="min-w-0">
                <section className="border-b border-slate-200 pb-6 dark:border-slate-800">
                  <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Estimated resume fit</p>
                      <p className="mt-1 text-5xl font-semibold tracking-[-0.08em]">{analysis.overallFitScore}<span className="text-2xl text-slate-400">/100</span></p>
                    </div>
                    <p className="max-w-xl pb-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{analysis.summary}</p>
                  </div>
                </section>

                <section className="border-b border-slate-200 py-6 dark:border-slate-800">
                  <h3 className="text-xl font-semibold tracking-[-0.04em]">What works</h3>
                  <ul className="mt-4 space-y-4">
                    {analysis.strengths.map((strength, index) => (
                      <li key={`${strength.finding}-${index}`} className="flex gap-3">
                        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{strength.finding}</p>
                          {strength.evidence && <blockquote className="mt-1 border-l-2 border-slate-200 pl-3 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">“{strength.evidence}”</blockquote>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="border-b border-slate-200 py-6 dark:border-slate-800">
                  <h3 className="text-xl font-semibold tracking-[-0.04em]">What needs evidence</h3>
                  <ul className="mt-4 space-y-4">
                    {analysis.evidenceGaps.map((gap, index) => (
                      <li key={`${gap.issue}-${index}`} className="grid gap-1 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] sm:gap-5">
                        <p className="text-sm font-medium">{gap.issue}</p>
                        <div>
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{gap.evidence}</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">Why it matters: {gap.impact}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="py-6">
                  <h3 className="text-xl font-semibold tracking-[-0.04em]">Changes to make first</h3>
                  <ol className="mt-4 space-y-5">
                    {analysis.priorityEdits.map((edit, index) => (
                      <li key={`${edit.section}-${index}`} className="grid gap-2 sm:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)] sm:gap-5">
                        <div>
                          <p className="text-sm font-semibold">{edit.section}</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{edit.observedIssue}</p>
                        </div>
                        <div>
                          <p className="text-sm leading-relaxed">{edit.suggestedEdit}</p>
                          {edit.missingDetails.length > 0 && <p className="mt-2 text-xs leading-relaxed text-slate-500">Add only if accurate: {edit.missingDetails.join(" · ")}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              <aside className="min-w-0 lg:border-l lg:border-slate-200 lg:pl-6 dark:lg:border-slate-800">
                <section aria-labelledby="score-breakdown-heading">
                  <h3 id="score-breakdown-heading" className="text-lg font-semibold">Score breakdown</h3>
                  <ul className="mt-4 space-y-5">
                    {scoreLabels.map(([key, label]) => {
                      const dimension = analysis.scoreBreakdown[key];
                      return (
                        <li key={key}>
                          <div className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="font-medium">{label}</span>
                            <span className="tabular-nums text-slate-600 dark:text-slate-300">{dimension.score}/100</span>
                          </div>
                          <div
                            role="meter"
                            aria-label={`${label} score`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={dimension.score}
                            className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                          >
                            <div className="h-full rounded-full bg-[#635bff]" style={{ width: `${dimension.score}%` }} />
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{dimension.reason}</p>
                          {dimension.evidence && <p className="mt-1 text-xs leading-relaxed text-slate-500">Evidence: “{dimension.evidence}”</p>}
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
                  <h3 className="flex items-center gap-2 text-lg font-semibold"><FileText aria-hidden="true" className="h-4 w-4 text-[#635bff]" />Keywords found</h3>
                  <p className="mt-1 text-xs text-slate-500">Found in the uploaded resume.</p>
                  {analysis.keywordsFound.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {analysis.keywordsFound.map((keyword) => <li key={keyword} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs dark:bg-slate-800">{keyword}</li>)}
                    </ul>
                  ) : <p className="mt-3 text-sm text-slate-500">No matching terms were identified.</p>}
                </section>

                <section className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
                  <h3 className="flex items-center gap-2 text-lg font-semibold"><Lightbulb aria-hidden="true" className="h-4 w-4 text-[#635bff]" />Keywords to consider</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Use these only if they accurately describe your experience.</p>
                  {analysis.keywordsToConsider.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {analysis.keywordsToConsider.map((keyword) => <li key={keyword} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700">{keyword}</li>)}
                    </ul>
                  ) : <p className="mt-3 text-sm text-slate-500">No additional role terms to consider.</p>}
                </section>

                <div className="mt-8 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <p className="text-xs leading-relaxed text-slate-500">This is an AI-generated estimate, not an ATS score or hiring decision. Confirm every suggestion against your actual experience.</p>
                  <Link href="/dashboard/jobs" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] dark:border-slate-700 dark:hover:bg-slate-900">
                    Check job fit <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </aside>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
