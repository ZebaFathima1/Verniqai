import { careerDNA, careerSkills, dashboardInsights, demoProfile, interviewMetrics, jobMatch, nextAction, projectCards, roadmapItems, resumeMetrics, techRadar, weeklyMomentum } from "@/lib/demo-data";

const PROFILE_STORAGE_KEY = "verniq-profile";
const SESSION_STORAGE_KEY = "verniq-session";

export type ProfileSnapshot = {
  profile: typeof demoProfile;
  careerDNA: typeof careerDNA;
  careerSkills: typeof careerSkills;
  roadmap: typeof roadmapItems;
  projectCards: typeof projectCards;
  nextAction: typeof nextAction;
  resumeMetrics: typeof resumeMetrics;
  interviewMetrics: typeof interviewMetrics;
  jobMatch: typeof jobMatch;
  techRadar: typeof techRadar;
  weeklyMomentum: typeof weeklyMomentum;
  dashboardInsights: typeof dashboardInsights;
};

export type ProfileForm = {
  name: string;
  email: string;
  targetRole?: string;
  fieldOfStudy?: string;
  learningTrack?: string;
  focusArea?: string;
};

export function getDemoProfileSnapshot(): ProfileSnapshot {
  return {
    profile: demoProfile,
    careerDNA,
    careerSkills,
    roadmap: roadmapItems,
    projectCards,
    nextAction,
    resumeMetrics,
    interviewMetrics,
    jobMatch,
    techRadar,
    weeklyMomentum,
    dashboardInsights,
  };
}

function readStoredProfile(email: string): Partial<ProfileForm> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const key = `${PROFILE_STORAGE_KEY}:${email.trim().toLowerCase()}`;
    const raw = window.localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as Partial<ProfileForm>;
    }

    const legacy = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!legacy) return null;
    const profile = JSON.parse(legacy) as Partial<ProfileForm>;
    return profile.email?.toLowerCase() === email.toLowerCase() ? profile : null;
  } catch {
    return null;
  }
}

export function saveProfile(input: ProfileForm) {
  const profile = {
    name: input.name,
    email: input.email,
    targetRole: input.targetRole ?? "AI / ML Engineer",
    fieldOfStudy: input.fieldOfStudy ?? "Computer Science",
    learningTrack: input.learningTrack ?? "Project-led learning",
    focusArea: input.focusArea ?? "AI products and deployment",
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      `${PROFILE_STORAGE_KEY}:${profile.email.trim().toLowerCase()}`,
      JSON.stringify(profile),
    );
  }

  return { ok: true, demo: true, profile };
}

export async function getDashboardData() {
  const snapshot = getDemoProfileSnapshot();
  let sessionEmail = "";
  if (typeof window !== "undefined") {
    try {
      const session = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (session) {
        sessionEmail = (JSON.parse(session) as { email?: string }).email ?? "";
      }
    } catch {
      sessionEmail = "";
    }
  }
  const stored = sessionEmail ? readStoredProfile(sessionEmail) : null;

  if (!stored) {
    return { ok: true, demo: true, data: snapshot };
  }

  const firstName = stored.name?.split(" ")?.[0] ?? snapshot.profile.name.split(" ")[0];

  return {
    ok: true,
    demo: true,
    data: {
      ...snapshot,
      profile: {
        ...snapshot.profile,
        name: stored.name ?? snapshot.profile.name,
        targetRole: stored.targetRole ?? snapshot.profile.targetRole,
        headline: `Good morning, ${firstName}.`,
        subheadline: "Here's where your career stands today.",
        readiness: 76,
        readinessChange: 8,
      },
    },
  };
}
