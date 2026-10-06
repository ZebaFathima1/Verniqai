# VERNIQ AI

VERNIQ AI is a career-intelligence prototype with BASIC, INTERMEDIATE, and PRO learning levels. Shared features include the dashboard, AI mentor, Career DNA, and career briefings; learning, project, and career-preparation tools expand with the selected level.

## Project overview

VERNIQ helps students understand where they are today, identify gaps against their target role, and get a personalized recommendation for what to do next. The product emphasizes career readiness over generic content consumption.

## Tech stack

- Next.js 15+
- TypeScript
- App Router
- Tailwind CSS
- Framer Motion
- Recharts
- Vercel-ready local prototype storage via browser localStorage
- Optional Groq-hosted models via server-side API calls
- Browser-local learning progress, check-ins, bookmarks, and portfolio checklist

## Local setup

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

For local AI features, create `.env.local` from `.env.example` and add a newly generated Groq API key. Never commit `.env.local`, put a key in source code, or expose it through a `NEXT_PUBLIC_` variable. If a key has been pasted into chat, a terminal transcript, or a public repository, revoke it and create a replacement before use.

## Vercel-ready setup

This version is designed to deploy on Vercel without any external database. The app keeps profile and onboarding state in browser localStorage for a polished prototype that can run immediately in production.
Creating an account, signing in, and signing out work locally in the current browser; locally created accounts do not sync to another browser or device. Passwords are salted and hashed before local storage, but client-side demo authentication is not suitable for real accounts.

## Environment variables

```bash
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
NEXT_PUBLIC_APP_URL=
```

Groq powers the AI mentor chat, resume analysis, job-fit analysis, interview coaching, and career guidance API. Add `GROQ_API_KEY` in Vercel Project Settings → Environment Variables, then redeploy. `GROQ_MODEL` is optional; the default is `openai/gpt-oss-120b`. AI endpoints return a configuration error until a valid key is set; the key is only used by server-side API routes and is never sent to the browser.

The AI News and Opportunities pages also use `GROQ_API_KEY`, but provide AI-generated research topics and opportunity ideas rather than live listings. They do not require a separate search-provider key. Links open a web search so users can verify current details. Groq chat models generate text and cannot guarantee real-time facts, listing availability, or citations.

### Configure a local key safely

1. Revoke any key that has been shared or exposed, then create a new key in your Groq account.
2. Copy `.env.example` to `.env.local` in the project root and set `GROQ_API_KEY` there. Keep the key only in this ignored local file; do not add it to Git, chat, screenshots, or frontend variables.
3. Restart the development server so Next.js loads the environment variable.

### Configure Vercel

In the Vercel project, open **Settings → Environment Variables**, add `GROQ_API_KEY` with the newly generated value for the environments you use, save it, then redeploy. Set `GROQ_MODEL` to override the default model if needed. Vercel environment values are not part of the source code and must be configured per project/environment.

The login/profile flow and level-specific progress are a browser-local prototype, not production authentication or billing. Data does not sync across browsers or devices. AI routes are publicly callable in this demo because the browser-local session cannot authenticate API requests; protect them with real server-side authentication and usage limits before opening the app to the public.

The AI News page generates career research topics with Groq; it does not report live news. Opportunity recommendations are AI-generated suggestions, not verified listings. Both provide search links so users can check current details and availability. GitHub Intelligence reads public profile and repository data from GitHub only. AI-generated skill-gap guidance is based on self-reported inputs and is not a verified assessment. Career readiness and hiring outcomes are not guaranteed.

## Learning levels

- **BASIC:** foundation learning paths, short practice check-ins, daily learning actions, and introductory opportunities.
- **INTERMEDIATE:** practical learning, projects, public GitHub profile insights, skill-gap coaching, and advanced resources.
- **PRO:** resume and job tools, interview practice, a portfolio evidence checklist, and a printable 30-day career report.

Users can change levels freely in this prototype. Learning progress and preferences are saved per email in the current browser only.

## Vercel deployment

```bash
git init
git add .
git commit -m "Initial VERNIQ AI commit"
# Import the repository into Vercel
# Set optional environment variables in Vercel dashboard
# Deploy
```

Deployment flow:

```text
GitHub
   ↓
Import repository into Vercel
   ↓
Add optional env vars
   ↓
Deploy
```

## Demo account

- Name: Rahul Sharma
- Target role: AI / ML Engineer
- Career readiness: 76%

## Architecture overview

- Landing page and marketing content: `app/page.tsx`
- Dashboard experience: `app/dashboard/page.tsx`
- Product routes: `app/dashboard/*`
- API handlers: `app/api/*`
- AI logic: `lib/ai/*`
- Shared demo data: `lib/demo-data.ts`

## Scripts

```bash
npm run dev
npm run build
npm run lint
```
