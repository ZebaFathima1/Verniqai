import Link from "next/link";
import { ArrowRight } from "lucide-react";

const problemPoints = [
  {
    title: "Unclear direction",
    text: "Students accumulate content without a clear picture of their missing skills or target role.",
  },
  {
    title: "Weak signal",
    text: "Courses, projects, and resume claims rarely connect to real career readiness.",
  },
  {
    title: "No next step",
    text: "The biggest challenge is not learning more — it is knowing what to do next.",
  },
] as const;

const pricingTiers = [
  {
    name: "BASIC",
    price: "₹0",
    features: ["Foundation learning paths", "Practice check-ins", "AI mentor", "Career exploration"],
  },
  {
    name: "INTERMEDIATE",
    price: "Prototype access",
    features: ["Practical skill-building", "Project milestones", "Public GitHub insights", "Skill-gap coaching"],
  },
  {
    name: "PRO",
    price: "Prototype access",
    features: ["Resume and job tools", "Interview practice", "Portfolio checklist", "30-day career sprint"],
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 dark:bg-[#09090b] dark:text-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635bff] text-sm font-semibold text-white">
            V
          </div>
          <span className="text-lg font-semibold tracking-tight">VERNIQ AI</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex dark:text-slate-300">
          <Link href="#product">Product</Link>
          <Link href="#how-it-works">How it works</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/login"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-slate-900"
          >
            Login
          </Link>
          <Link
            href="/dashboard/onboarding"
            className="rounded-full bg-[#635bff] px-4 py-2 text-sm font-medium text-white shadow-sm"
          >
            Build My Career DNA
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#635bff]/15 bg-[#635bff]/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#635bff]">
              AI Career Intelligence
            </div>

            <h1 className="text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.09em] text-slate-900 dark:text-slate-50 md:text-6xl">
              Know Where You Are.
              <span className="mt-2 block text-slate-700 dark:text-slate-300">
                Discover Where You Can Go.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              VERNIQ AI understands your skills, identifies your career gaps, builds
              your roadmap, evaluates your projects, improves your resume, and prepares
              you for real interviews.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard/onboarding"
                className="inline-flex items-center gap-2 rounded-full bg-[#635bff] px-5 py-3 text-sm font-medium text-white shadow-sm"
              >
                Build My Career DNA <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#product"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium dark:border-slate-800 dark:bg-slate-900"
              >
                Explore VERNIQ
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[#111113]">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Sample learner snapshot
                </span>
                <span className="rounded-full bg-[#635bff]/10 px-2.5 py-1 text-xs font-medium text-[#5148e5]">
                  Illustrative preview
                </span>
              </div>

              <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border-[12px] border-[#635bff] border-r-slate-200 bg-slate-50 text-center dark:bg-slate-950">
                <div>
                  <div className="text-5xl font-semibold tracking-[-0.08em]">76%</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Example
                  </div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Readiness
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-3 text-sm text-slate-700 dark:text-slate-200">
                {[
                  ["Python", 82],
                  ["AI/ML", 74],
                  ["Projects", 78],
                  ["DSA", 61],
                  ["Cloud", 43],
                  ["Interview", 68],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/80"
                  >
                    <span>{label}</span>
                    <span className="font-medium">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
              The problem
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.07em]">
              Most students are learning, but not becoming career-ready.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {problemPoints.map((point, index) => (
              <div
                key={point.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#635bff]/10 text-[#635bff]">
                  0{index + 1}
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.04em]">{point.title}</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{point.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
              How VERNIQ works
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.07em]">
              Build a path from learning to career readiness.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-5">
            {[
              "Assess",
              "Understand",
              "Learn",
              "Build",
              "Apply",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-[#111113]"
              >
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  0{index + 1}
                </div>
                <p className="text-lg font-semibold tracking-[-0.04em]">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Pricing</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.07em]">
              Choose the support that fits your next step.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111113]"
              >
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{tier.name}</p>
                <div className="mt-4 text-4xl font-semibold tracking-[-0.07em]">{tier.price}</div>
                <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {tier.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-slate-500">
            All three levels are currently available free in this prototype. Subscription billing and institution accounts are not enabled.
          </p>
        </section>
      </main>
    </div>
  );
}
