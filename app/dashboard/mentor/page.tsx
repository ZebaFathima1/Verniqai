"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { readProgress } from "@/lib/local-progress";
import { normalizeLevel } from "@/lib/levels";
import { careerSkills } from "@/lib/demo-data";

const promptSuggestions = [
  "How should I structure my next AI project to make it interview-ready?",
  "What should I learn next for machine learning engineer roles?",
  "How can I make my resume sound more focused on impact?",
];

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function MentorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I’m VERNIQ. Tell me about your career goal or ask what you should focus on next.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(suggestedMessage?: string) {
    const message = (suggestedMessage ?? input).trim();
    if (!message || isSending) return;

    const history = messages.slice(-10);
    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history,
          context: {
            level: normalizeLevel(getCurrentSession()?.level),
            targetRole: getCurrentSession()?.targetRole ?? "",
            skills: careerSkills.map((skill) => `${skill.name}: ${skill.score}/100`),
            completedSkills: readProgress().completedSkills,
            completedProjects: readProgress().completedProjects,
          },
        }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String(data.error)
            : "The mentor could not respond right now.";
        throw new Error(message);
      }
      if (
        typeof data !== "object" ||
        data === null ||
        !("reply" in data) ||
        typeof data.reply !== "string"
      ) {
        throw new Error("The mentor returned an invalid response. Please try again.");
      }
      const reply = data.reply;
      setMessages((current) => [...current, { role: "assistant", content: reply }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The mentor could not respond right now.");
    } finally {
      setIsSending(false);
    }
  }

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

            <div aria-live="polite" className="mt-6 max-h-[55vh] min-h-56 space-y-4 overflow-y-auto">
              {messages.map((entry, index) => (
                <div
                  key={`${entry.role}-${index}`}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-3 text-sm ${
                    entry.role === "assistant"
                      ? "bg-[#635bff] text-white"
                      : "ml-auto bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  {entry.content}
                </div>
              ))}
              {isSending && (
                <p className="text-sm text-slate-500" role="status">VERNIQ is thinking…</p>
              )}
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200" role="alert">
                {error}
              </p>
            )}

            <form
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                void sendMessage();
              }}
              className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70"
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={2000}
                rows={2}
                aria-label="Message VERNIQ"
                placeholder="Ask about your career plan..."
                className="max-h-32 w-full resize-y bg-transparent text-sm text-slate-700 outline-none dark:text-slate-200"
              />
              <button
                type="submit"
                disabled={isSending || input.trim().length < 2}
                className="inline-flex shrink-0 items-center gap-2 self-end rounded-full bg-[#635bff] px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <h3 className="text-xl font-semibold tracking-[-0.04em]">Suggested prompts</h3>
            <div className="mt-6 space-y-3">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isSending}
                  onClick={() => void sendMessage(prompt)}
                  className="w-full rounded-xl bg-slate-50 p-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:bg-slate-900"
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
