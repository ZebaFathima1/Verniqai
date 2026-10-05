import Link from "next/link";
import { ArrowLeft, Send, Sparkles } from "lucide-react";

const promptSuggestions = [
  "How should I structure my next AI project in a way that looks interview-ready?",
  "What should I learn next to close the gap between my current profile and ML engineer roles?",
  "How can I improve my resume language to sound more product and impact-focused?",
];

const conversation = [
  { role: "mentor", text: "Your strongest path is to combine one strong deployment project with sharper product storytelling." },
  { role: "student", text: "I want to improve my chances for AI / ML engineer roles without widening my scope too much." },
  { role: "mentor", text: "Focus on proving output: one polished end-to-end project, excellent communication, and one consistent interview system." },
];

export default function MentorPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">AI mentor</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Ask VERNIQ</h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-[#111113]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#635bff]" />
              <h2 className="text-xl font-semibold tracking-[-0.04em]">Mentor chat</h2>
            </div>

            <div className="mt-6 space-y-4">
              {conversation.map((entry) => (
                <div
                  key={`${entry.role}-${entry.text}`}
                  className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    entry.role === "mentor"
                      ? "bg-[#635bff] text-white"
                      : "ml-auto bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  {entry.text}
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
              <input
                value="What should I do this week to improve my chances?"
                readOnly
                className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-slate-200"
              />
              <button className="inline-flex items-center gap-2 rounded-full bg-[#635bff] px-3 py-2 text-sm font-medium text-white">
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <h3 className="text-xl font-semibold tracking-[-0.04em]">Suggested prompts</h3>
            <div className="mt-6 space-y-3">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  className="w-full rounded-xl bg-slate-50 p-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
