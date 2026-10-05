import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const PROFILE_STORAGE_KEY = "verniq-profile";
const SESSION_STORAGE_KEY = "verniq-session";

export const DEMO_USER = {
  name: "Rahul Sharma",
  email: "rahul@verniq.ai",
  password: "demo1234",
};

type StoredProfile = {
  name: string;
  email: string;
  targetRole?: string;
  fieldOfStudy?: string;
  learningTrack?: string;
  focusArea?: string;
};

export function getCurrentSession(): StoredProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

function readStoredProfile(): StoredProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

function writeStoredProfile(profile: StoredProfile) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function writeSession(profile: StoredProfile) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
}

export function signOut() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function signInWithEmail(input: unknown) {
  const parsed = signInSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid credentials" };
  }

  const storedProfile = readStoredProfile();
  const emailMatchesStored =
    storedProfile && storedProfile.email.toLowerCase() === parsed.data.email.toLowerCase();
  const isDemoLogin =
    parsed.data.email.toLowerCase() === DEMO_USER.email.toLowerCase() &&
    parsed.data.password === DEMO_USER.password;

  if (emailMatchesStored) {
    writeSession(storedProfile);
    return {
      ok: true,
      demo: true,
      message: "Demo mode enabled. Sign-in is simulated for the Vercel-ready prototype flow.",
      profile: storedProfile,
    };
  }

  if (isDemoLogin) {
    const demoProfile = {
      name: DEMO_USER.name,
      email: DEMO_USER.email,
    };

    writeStoredProfile(demoProfile);
    writeSession(demoProfile);

    return {
      ok: true,
      demo: true,
      message: "Demo mode enabled. You are signed in to the default VERNIQ demo account.",
      profile: demoProfile,
    };
  }

  return {
    ok: false,
    error: "No account matches those credentials. Try the demo account or create a profile first.",
  };
}

export async function signUpWithEmail(input: unknown) {
  const parsed = signUpSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid signup payload" };
  }

  const profile = {
    name: parsed.data.name,
    email: parsed.data.email,
  };

  writeStoredProfile(profile);
  writeSession(profile);

  return {
    ok: true,
    demo: true,
    message: "Demo mode enabled. Your profile has been created locally for the Vercel-ready prototype flow.",
    profile,
  };
}
