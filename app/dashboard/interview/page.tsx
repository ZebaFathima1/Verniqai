"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Mic, MessageSquareText } from "lucide-react";
import { FormEvent, useState } from "react";
import { interviewMetrics } from "@/lib/demo-data";

const questions = [
  "Walk me through a project where you designed a model end-to-end.",
  "How would you optimize an ML pipeline for cost and latency?",
  "Describe a tradeoff you made between model accuracy and deployment simplicity.",
  "How do you prioritize experiments when requirements are ambiguous?",
];

export default function InterviewPage() {
  const [role, setRole] = useState("AI / ML Engineer");
  const [question, setQuestion] = useState(questions[0]);
  const [guidance, setGuidance] = useState<{ guidance: string[]; scoreHint: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function getGuidance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setGuidance(null);
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, question }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Interview guidance could not be generated.");
      setGuidance(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Interview guidance could not be generated.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Interview prep</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Mock interview readiness</h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-[#111113]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {interviewMetrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                <Mic className="h-4 w-4 text-[#635bff]" />
              </div>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-3xl font-semibold tracking-[-0.06em]">{metric.score}%</span>
              </div>
              <div className="mt-4 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full rounded-full bg-[#635bff]" style={{ width: `${metric.score}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <div className="flex items-center gap-3">
              <MessageSquareText className="h-5 w-5 text-[#635bff]" />
              <h2 className="text-xl font-semibold tracking-[-0.04em]">Recommended practice questions</h2>
            </div>

            <div className="mt-6 space-y-4">
              {questions.map((question, index) => (
                <div key={question} className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/70">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#635bff]/10 text-sm font-medium text-[#635bff]">
                    {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuestion(question);
                      setGuidance(null);
                    }}
                    className="text-left text-sm text-slate-700 hover:text-[#635bff] dark:text-slate-200"
                  >
                    {question}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <h3 className="text-xl font-semibold tracking-[-0.04em]">Practice cadence</h3>
            <div className="mt-6 space-y-4">
              {[
                "Daily: 20-minute answer drill on one system design question",
                "3x weekly: answer an ML product case study in STAR format",
                "Weekly: review interviewer feedback to tighten delivery and structure",
              ].map((item) => (
                <div key={item} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-950/70 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/mentor"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#635bff] px-4 py-2 text-sm font-medium text-white"
            >
              Talk to mentor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
          <h2 className="text-xl font-semibold tracking-[-0.04em]">Get AI coaching for a question</h2>
          <form onSubmit={getGuidance} className="mt-5 space-y-4">
            <label className="block text-sm font-medium">
              Target role
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                maxLength={200}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <label className="block text-sm font-medium">
              Interview question
              <textarea
                value={question}
                onChange={(event) => {
                  setQuestion(event.target.value);
                  setGuidance(null);
                }}
                minLength={10}
                maxLength={2000}
                rows={3}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-[#635bff] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {isLoading ? "Getting coaching..." : "Get answer guidance"}
            </button>
          </form>
          {guidance && (
            <div aria-live="polite" className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/70">
              <p className="font-medium">Coaching tips · readiness hint: {guidance.scoreHint}%</p>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700 dark:text-slate-200">
                {guidance.guidance.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
