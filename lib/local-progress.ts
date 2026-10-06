import { getCurrentSession } from "@/lib/auth";

export type ProgressState = {
  completedSkills: string[];
  completedMissions: string[];
  completedProjects: string[];
  completedPortfolioItems: string[];
  bookmarkedOpportunities: string[];
  viewedBriefings: string[];
  githubUsername: string;
  practiceScore?: number;
};

const EMPTY_STATE: ProgressState = {
  completedSkills: [],
  completedMissions: [],
  completedProjects: [],
  completedPortfolioItems: [],
  bookmarkedOpportunities: [],
  viewedBriefings: [],
  githubUsername: "",
};

function getStorageKey() {
  const email = getCurrentSession()?.email?.trim().toLowerCase();
  return email ? `verniq-progress:${email}` : null;
}

export function readProgress(): ProgressState {
  if (typeof window === "undefined") return EMPTY_STATE;
  const key = getStorageKey();
  if (!key) return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY_STATE;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return EMPTY_STATE;
    return { ...EMPTY_STATE, ...(value as Partial<ProgressState>) };
  } catch {
    return EMPTY_STATE;
  }
}

function updateProgress(mutator: (state: ProgressState) => ProgressState) {
  if (typeof window === "undefined") throw new Error("Progress is only available in a browser.");
  const key = getStorageKey();
  if (!key) throw new Error("Sign in before saving progress.");
  const next = mutator(readProgress());
  window.localStorage.setItem(key, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("verniq:progress"));
  return next;
}

function toggle(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function toggleSkill(skill: string) {
  return updateProgress((state) => ({
    ...state,
    completedSkills: toggle(state.completedSkills, skill),
  }));
}

export function toggleMission(missionId: string) {
  return updateProgress((state) => ({
    ...state,
    completedMissions: toggle(state.completedMissions, missionId),
  }));
}

export function markMissionComplete(missionId: string) {
  return updateProgress((state) => ({
    ...state,
    completedMissions: state.completedMissions.includes(missionId)
      ? state.completedMissions
      : [...state.completedMissions, missionId],
  }));
}

export function savePracticeScore(score: number) {
  return updateProgress((state) => ({ ...state, practiceScore: score }));
}

export function toggleProject(projectId: string) {
  return updateProgress((state) => ({
    ...state,
    completedProjects: toggle(state.completedProjects, projectId),
  }));
}

export function togglePortfolioItem(itemId: string) {
  return updateProgress((state) => ({
    ...state,
    completedPortfolioItems: toggle(state.completedPortfolioItems, itemId),
  }));
}

export function toggleOpportunityBookmark(opportunityId: string) {
  return updateProgress((state) => ({
    ...state,
    bookmarkedOpportunities: toggle(state.bookmarkedOpportunities, opportunityId),
  }));
}

export function toggleBriefingRead(briefingId: string) {
  return updateProgress((state) => ({
    ...state,
    viewedBriefings: toggle(state.viewedBriefings, briefingId),
  }));
}

export function saveGithubUsername(username: string) {
  return updateProgress((state) => ({ ...state, githubUsername: username.trim() }));
}
