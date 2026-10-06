"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getCurrentSession, type StoredProfile } from "@/lib/auth";
import { readProgress, type ProgressState } from "@/lib/local-progress";

const EMPTY_PROGRESS: ProgressState = {
  completedSkills: [],
  completedMissions: [],
  completedProjects: [],
  completedPortfolioItems: [],
  bookmarkedOpportunities: [],
  viewedBriefings: [],
  githubUsername: "",
};
const EMPTY_PROGRESS_SNAPSHOT = JSON.stringify(EMPTY_PROGRESS);

function subscribeSession(callback: () => void) {
  window.addEventListener("verniq:profile", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("verniq:profile", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSessionSnapshot() {
  return window.localStorage.getItem("verniq-session");
}

export function useLocalSession(): StoredProfile | null {
  const snapshot = useSyncExternalStore(subscribeSession, getSessionSnapshot, () => null);
  return useMemo(() => snapshot === null ? null : getCurrentSession(), [snapshot]);
}

function subscribeProgress(callback: () => void) {
  window.addEventListener("verniq:progress", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("verniq:progress", callback);
    window.removeEventListener("storage", callback);
  };
}

function getProgressSnapshot() {
  return JSON.stringify(readProgress());
}

export function useLocalProgress(): ProgressState {
  const snapshot = useSyncExternalStore(subscribeProgress, getProgressSnapshot, () => EMPTY_PROGRESS_SNAPSHOT);
  return useMemo(() => JSON.parse(snapshot) as ProgressState, [snapshot]);
}
