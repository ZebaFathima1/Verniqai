"use client";

import { useState } from "react";
import { useLocalSession } from "@/lib/client-state";
import { normalizeLevel, type VerniqLevel } from "@/lib/levels";
import { markMissionComplete, savePracticeScore } from "@/lib/local-progress";

const questions = [
  { level: "basic", question: "Which Python type stores an ordered sequence that can be changed?", options: ["tuple", "list", "str"], answer: "list", skill: "Lists" },
  { level: "basic", question: "What does a function help you do?", options: ["Reuse a named block of code", "Install Python", "Create a folder"], answer: "Reuse a named block of code", skill: "Functions" },
  { level: "basic", question: "Which HTTP method is conventionally used to retrieve a resource?", options: ["GET", "DELETE", "PATCH"], answer: "GET", skill: "Web basics" },
  { level: "basic", question: "What does version control help you track?", options: ["Changes to files over time", "Internet speed", "Screen size"], answer: "Changes to files over time", skill: "Git" },
  { level: "intermediate", question: "What is the main purpose of an automated unit test?", options: ["Check a small unit of behavior repeatedly", "Deploy an app to production", "Replace code review"], answer: "Check a small unit of behavior repeatedly", skill: "Testing" },
  { level: "intermediate", question: "Which HTTP method is commonly used to create a resource?", options: ["GET", "POST", "HEAD"], answer: "POST", skill: "REST APIs" },
  { level: "intermediate", question: "Why create a Git branch for a feature?", options: ["Isolate changes before integrating them", "Encrypt the repository", "Make commits unnecessary"], answer: "Isolate changes before integrating them", skill: "Git workflows" },
  { level: "intermediate", question: "What should an API return for invalid request data?", options: ["A clear client error response", "A successful empty result", "An unrelated server stack trace"], answer: "A clear client error response", skill: "API validation" },
];

export default function PracticePage() {
  const level: VerniqLevel = normalizeLevel(useLocalSession()?.level);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const levelQuestions = questions.filter((item) => item.level === (level === "pro" ? "intermediate" : level));

  function submitQuiz() {
    const correct = levelQuestions.filter((item, index) => answers[index] === item.answer).length;
    const percentage = Math.round((correct / levelQuestions.length) * 100);
    setScore(percentage);
    savePracticeScore(percentage);
    markMissionComplete(`foundation-quiz-${new Date().toISOString().slice(0, 10)}`);
  }

  return (
    <main className="min-h-[80vh] bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635bff]">{level.toUpperCase()} · PRACTICE</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{level === "basic" ? "Foundation check-in" : "Practical skills check-in"}</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">A short self-check across programming and web foundations. Try it again anytime.</p>
        <section className="mt-8 space-y-5">
          {levelQuestions.map((item, index) => (
            <fieldset key={item.question} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111113]">
              <legend className="font-semibold">{index + 1}. {item.question}</legend>
              <div className="mt-4 grid gap-2">
                {item.options.map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950/70">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      checked={answers[index] === option}
                      onChange={() => {
                        setAnswers((current) => ({ ...current, [index]: option }));
                        setScore(null);
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </section>
        <button
          type="button"
          disabled={Object.keys(answers).length !== questions.length}
          onClick={submitQuiz}
          className="mt-6 rounded-full bg-[#635bff] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          Check my answers
        </button>
        {score !== null && (
          <section aria-live="polite" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111113]">
            <h2 className="text-xl font-semibold">Your score: {score}%</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Strong: {levelQuestions.filter((item, index) => answers[index] === item.answer).map((item) => item.skill).join(", ") || "Review the answers below"}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Needs practice: {levelQuestions.filter((item, index) => answers[index] !== item.answer).map((item) => item.skill).join(", ") || "Keep reinforcing your foundations"}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {levelQuestions.map((item, index) => <li key={item.question} className={answers[index] === item.answer ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}>
                {answers[index] === item.answer ? "Correct" : `Review: the answer is ${item.answer}`} — {item.skill}
              </li>)}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
