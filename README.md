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
- Optional OpenAI via server-side API calls

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 to view the app.

## Vercel-ready setup

This version is designed to deploy on Vercel without any external database. The app keeps profile and onboarding state in browser localStorage for a polished prototype that can run immediately in production.

## Environment variables

```bash
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=
```

OpenAI is optional. If no key is set, the app uses a safe local fallback response.

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
