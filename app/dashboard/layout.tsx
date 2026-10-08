"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { useLocalSession } from "@/lib/client-state";
import { levelDetails, levelNavigation, type VerniqLevel } from "@/lib/levels";

const proOnlyPaths = [
  "/dashboard/resume",
  "/dashboard/jobs",
  "/dashboard/interview",
  "/dashboard/portfolio",
  "/dashboard/career-report",
];

const intermediateOnlyPaths = [
  "/dashboard/github",
  "/dashboard/skill-gaps",
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === "/dashboard/login";
  const isOnboardingRoute = pathname === "/dashboard/onboarding";
  const isPublicRoute = isLoginRoute || isOnboardingRoute;
  const session = useLocalSession();
  const level: VerniqLevel | null = session ? (
    session.level === "basic" || session.level === "intermediate" || session.level === "pro"
      ? session.level
      : "pro"
  ) : null;

  useEffect(() => {
    if (session && isLoginRoute) {
      router.replace("/dashboard");
    } else if (!session && !isPublicRoute) {
      router.replace("/dashboard/login");
    }
  }, [isLoginRoute, isPublicRoute, pathname, router, session]);

  if (isPublicRoute) return <>{children}</>;
  if (!level) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading your VERNIQ workspace…
      </div>
    );
  }

  const requiredLevel = proOnlyPaths.some((path) => pathname.startsWith(path))
    ? "pro"
    : intermediateOnlyPaths.some((path) => pathname.startsWith(path))
      ? "intermediate"
      : null;
  const isFeatureLocked =
    (requiredLevel === "pro" && level !== "pro") ||
    (requiredLevel === "intermediate" && level === "basic");

  return (
    <>
      {pathname !== "/dashboard" && (
        <header className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[#111113]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <Link href="/dashboard" className="flex items-center">
              <BrandLogo compact className="text-slate-900 dark:text-slate-50" variant="dark" />
            </Link>
            <span className="rounded-full bg-[#635bff]/10 px-3 py-1 text-xs font-semibold tracking-[0.1em] text-[#635bff]">
              {levelDetails[level].name}
            </span>
          </div>
          <nav aria-label="Main dashboard navigation" className="mx-auto mt-3 flex max-w-7xl gap-2 overflow-x-auto pb-1">
            {levelNavigation[level].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium ${
                  pathname === item.href
                    ? "bg-[#635bff] text-white"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/dashboard/levels" className="shrink-0 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium dark:bg-slate-800">
              Compare levels
            </Link>
          </nav>
        </header>
      )}
      {isFeatureLocked && requiredLevel ? (
        <main className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-4 py-12">
          <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[#111113]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#635bff]">
              {requiredLevel === "pro" ? "PRO FEATURE" : "INTERMEDIATE FEATURE"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {pathname.startsWith("/dashboard/resume")
                ? "Resume Intelligence is available in Pro."
                : pathname.startsWith("/dashboard/jobs")
                  ? "Job matching is available in Pro."
                  : pathname.startsWith("/dashboard/interview")
                    ? "Interview Studio is available in Pro."
                    : pathname.startsWith("/dashboard/github")
                      ? "GitHub Intelligence is available in Intermediate."
                      : pathname.startsWith("/dashboard/skill-gaps")
                        ? "Skill gap analysis is available in Intermediate."
                        : "Career readiness tools are available in Pro."}
            </h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Your current level stays fully useful. Explore the next level whenever you feel ready—there is no forced upgrade.
            </p>
            <Link
              href="/dashboard/levels"
              className="mt-6 inline-flex rounded-full bg-[#635bff] px-5 py-3 text-sm font-medium text-white"
            >
              Explore levels
            </Link>
          </section>
        </main>
      ) : children}
    </>
  );
}
