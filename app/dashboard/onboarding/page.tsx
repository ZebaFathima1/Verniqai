"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import { signUpWithEmail } from "@/lib/auth";
import { saveProfile } from "@/lib/profile-data";

const initialForm = {
  name: "Rahul Sharma",
  email: "rahul@verniq.ai",
  password: "demo1234",
  targetRole: "AI / ML Engineer",
  fieldOfStudy: "Computer Science",
  focus: "AI products and deployment",
  track: "Project-led learning",
};

export default function OnboardingPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const result = await signUpWithEmail({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    if (result.ok) {
      await saveProfile({
        name: form.name,
        email: form.email,
        targetRole: form.targetRole,
        fieldOfStudy: form.fieldOfStudy,
        learningTrack: form.track,
        focusArea: form.focus,
      });
    }

    setIsSubmitting(false);

    if (!result.ok) {
      setStatus({ type: "error", message: result.error ?? "Unable to create your profile right now." });
      return;
    }

    setStatus({
      type: "success",
      message:
        result.message ??
        "Your profile is ready. We have created your learning and career plan.",
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Profile setup</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">
              Create your VERNIQ career profile
            </h1>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-[#111113]"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#635bff]/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[#635bff]">
              <Sparkles className="h-3.5 w-3.5" />
              Your AI blueprint
            </div>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-sm text-slate-500 dark:text-slate-400">Target role</p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.05em]">{form.targetRole}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-sm text-slate-500 dark:text-slate-400">Focus</p>
                <p className="mt-2 text-base text-slate-700 dark:text-slate-200">{form.focus}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-sm text-slate-500 dark:text-slate-400">Learning mode</p>
                <p className="mt-2 text-base text-slate-700 dark:text-slate-200">{form.track}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#635bff] to-[#4f46e5] p-5 text-white shadow-lg shadow-[#635bff]/20">
              <p className="text-sm uppercase tracking-[0.18em] text-indigo-100">Career readiness</p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-4xl font-semibold tracking-[-0.07em]">76%</span>
                <span className="mb-1 text-sm text-indigo-100">+8% this month</span>
              </div>
              <p className="mt-4 text-sm text-indigo-100">
                Your AI roadmap is already tuned around deployment, ML projects, and interview readiness.
              </p>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Full name</span>
                <input
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-[#635bff] dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Your full name"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-[#635bff] dark:border-slate-700 dark:bg-slate-950"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-[#635bff] dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Create a secure password"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Target role</span>
                <input
                  value={form.targetRole}
                  onChange={(event) => handleChange("targetRole", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-[#635bff] dark:border-slate-700 dark:bg-slate-950"
                  placeholder="AI / ML Engineer"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Field of study</span>
                <input
                  value={form.fieldOfStudy}
                  onChange={(event) => handleChange("fieldOfStudy", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-[#635bff] dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Computer Science"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Preferred learning track</span>
                <input
                  value={form.track}
                  onChange={(event) => handleChange("track", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-[#635bff] dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Project-led learning"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Career focus</span>
              <textarea
                value={form.focus}
                onChange={(event) => handleChange("focus", event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#635bff] dark:border-slate-700 dark:bg-slate-950"
                placeholder="Describe what kind of work you want to build towards"
              />
            </label>

            {status && (
              <div
                className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200"
                }`}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
                <span>{status.message}</span>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We’ll shape your roadmap based on your current profile and target role.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-[#635bff] px-5 py-3 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating profile..." : "Create my profile"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
