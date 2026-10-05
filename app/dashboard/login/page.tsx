"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentSession, signInWithEmail } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("rahul@verniq.ai");
  const [password, setPassword] = useState("demo1234");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (getCurrentSession()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const result = await signInWithEmail({ email, password });

    setIsSubmitting(false);

    if (!result.ok) {
      setStatus({ type: "error", message: result.error ?? "Unable to sign in." });
      return;
    }

    setStatus({
      type: "success",
      message: result.message ?? "Welcome back. Redirecting to your dashboard...",
    });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#09090b] dark:text-slate-50 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635bff] text-sm font-semibold text-white">
              V
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">VERNIQ AI</p>
            </div>
          </Link>

          <Link
            href="/dashboard/onboarding"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-[#111113]"
          >
            Create profile
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#635bff]/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[#635bff]">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome back
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.07em]">Sign in to your AI career dashboard</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Review your readiness, roadmap, job fit, and next-best learning actions in one place.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Career readiness dashboard",
                "AI-powered roadmap and feedback",
                "Resume, jobs, and interview prep",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#635bff] to-[#4f46e5] p-5 text-white shadow-lg shadow-[#635bff]/20">
              <p className="text-sm uppercase tracking-[0.18em] text-indigo-100">Demo account</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <LockKeyhole className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium">rahul@verniq.ai</p>
                  <p className="text-sm text-indigo-100">demo1234</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Access</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Login</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#635bff] dark:border-slate-700 dark:bg-slate-950"
                  placeholder="rahul@verniq.ai"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#635bff] dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Enter your password"
                  required
                />
              </label>

              {status && (
                <div
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    status.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#635bff] px-5 py-3 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              Need a profile? <Link href="/dashboard/onboarding" className="font-medium text-[#635bff]">Create one</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
