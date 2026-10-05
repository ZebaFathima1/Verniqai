# VERNIQ AI

VERNIQ AI is a premium AI career intelligence platform for students and institutions. It combines skill assessment, roadmap generation, project guidance, resume analysis, job match intelligence, and interview preparation into one cohesive experience.

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
- Optional xAI Grok via server-side API calls

## Local setup

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

For local AI features, create `.env.local` from `.env.example` and add your own xAI API key. Never commit `.env.local` or expose the key through a `NEXT_PUBLIC_` variable.

## Vercel-ready setup

This version is designed to deploy on Vercel without any external database. The app keeps profile and onboarding state in browser localStorage for a polished prototype that can run immediately in production.
Creating an account, signing in, and signing out work locally in the current browser; locally created accounts do not sync to another browser or device. Passwords are salted and hashed before local storage, but client-side demo authentication is not suitable for real accounts.

## Environment variables

```bash
XAI_API_KEY=
XAI_MODEL=grok-4.7
NEXT_PUBLIC_APP_URL=
```

xAI powers the AI mentor chat, resume analysis, job-fit analysis, interview coaching, and career guidance API. Add `XAI_API_KEY` in Vercel Project Settings → Environment Variables, then redeploy. `XAI_MODEL` is optional. AI endpoints return a configuration error until a valid key is set; the key is only used by server-side API routes and is never sent to the browser.

The login/profile flow is a browser-local prototype, not production authentication. Do not use it for real accounts or private user data. AI routes are publicly callable in this demo; protect them with real server-side authentication and usage limits before opening the app to the public.

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
