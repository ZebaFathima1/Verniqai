import { z } from "zod";
import { demoAccounts, normalizeLevel, type VerniqLevel } from "@/lib/levels";

const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  targetRole: z.string().trim().min(2).max(120).optional(),
  fieldOfStudy: z.string().trim().max(120).optional(),
  learningTrack: z.string().trim().max(120).optional(),
  focusArea: z.string().trim().max(500).optional(),
  level: z.enum(["basic", "intermediate", "pro"]).optional(),
});

const PROFILE_STORAGE_KEY = "verniq-profile";
const SESSION_STORAGE_KEY = "verniq-session";
const ACCOUNTS_STORAGE_KEY = "verniq-local-accounts";

export const DEMO_USER = {
  name: demoAccounts[2].name,
  email: demoAccounts[2].email,
  password: demoAccounts[2].password,
};

export type StoredProfile = {
  name: string;
  email: string;
  targetRole?: string;
  fieldOfStudy?: string;
  learningTrack?: string;
  focusArea?: string;
  level?: VerniqLevel;
};

type LocalAccount = {
  salt: string;
  passwordHash: string;
  profile: StoredProfile;
};

const storedProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  targetRole: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  learningTrack: z.string().optional(),
  focusArea: z.string().optional(),
  level: z.enum(["basic", "intermediate", "pro"]).optional(),
});

const localAccountSchema = z.record(
  z.string().email(),
  z.object({
    salt: z.string(),
    passwordHash: z.string(),
    profile: storedProfileSchema,
  }),
);

function profileStorageKey(email: string) {
  return `${PROFILE_STORAGE_KEY}:${email.trim().toLowerCase()}`;
}

export function getCurrentSession(): StoredProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = storedProfileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function readStoredProfile(email: string): StoredProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(profileStorageKey(email));
    if (raw) {
      const parsed = storedProfileSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    }

    const legacy = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!legacy) return null;
    const parsed = storedProfileSchema.safeParse(JSON.parse(legacy));
    return parsed.success && parsed.data.email.toLowerCase() === email.toLowerCase()
      ? parsed.data
      : null;
  } catch {
    return null;
  }
}

function readAccounts(): Record<string, LocalAccount> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = localAccountSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

function writeSession(profile: StoredProfile) {
  if (typeof window === "undefined") {
    throw new Error("Sign-in is only available in a browser.");
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent("verniq:profile"));
}

function createSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("verniq:profile"));
}

export function updateCurrentLevel(level: VerniqLevel) {
  const session = getCurrentSession();
  if (!session || typeof window === "undefined") {
    throw new Error("Sign in before changing your learning level.");
  }
  const updated = { ...session, level };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
  window.localStorage.setItem(profileStorageKey(session.email), JSON.stringify(updated));

  const accounts = readAccounts();
  const account = accounts[session.email.toLowerCase()];
  if (account) {
    account.profile = updated;
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }
  window.dispatchEvent(new CustomEvent("verniq:profile"));
}

export async function signInWithEmail(input: unknown) {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid credentials" };
  }

  const email = parsed.data.email.toLowerCase();
  const demoAccount = demoAccounts.find((demo) => demo.email === email);

  try {
    if (demoAccount) {
      if (parsed.data.password !== demoAccount.password) {
        return { ok: false as const, error: "Email or password is incorrect." };
      }
      const storedProfile = readStoredProfile(email);
      const demoProfile: StoredProfile = {
        name: storedProfile?.name ?? demoAccount.name,
        email,
        targetRole: storedProfile?.targetRole ?? demoAccount.targetRole,
        fieldOfStudy: storedProfile?.fieldOfStudy,
        learningTrack: storedProfile?.learningTrack,
        focusArea: storedProfile?.focusArea,
        level: storedProfile?.level ?? demoAccount.level,
      };
      writeSession(demoProfile);
      return {
        ok: true as const,
        demo: true,
        message: `Signed in to the ${demoAccount.level} demo account.`,
        profile: demoProfile,
      };
    }

    const account = readAccounts()[email];
    if (!account) {
      return {
        ok: false as const,
        error: "No local profile matches that email. Create a profile on this device first.",
      };
    }

    const suppliedHash = await hashPassword(parsed.data.password, account.salt);
    if (!safeEqual(suppliedHash, account.passwordHash)) {
      return { ok: false as const, error: "Email or password is incorrect." };
    }

    const profile = readStoredProfile(email) ?? account.profile;
    writeSession(profile);
    return {
      ok: true as const,
      demo: true,
      message: "Signed in to your local VERNIQ profile.",
      profile,
    };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? `Could not sign in: ${error.message}`
          : "Could not sign in on this browser.",
    };
  }
}

export async function signUpWithEmail(input: unknown) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid signup payload" };
  }
  if (typeof window === "undefined") {
    return { ok: false as const, error: "Profile creation is only available in a browser." };
  }

  const email = parsed.data.email.toLowerCase();
  if (demoAccounts.some((demo) => demo.email === email)) {
    return { ok: false as const, error: "That email is reserved for a VERNIQ demo account." };
  }

  try {
    const accounts = readAccounts();
    if (accounts[email]) {
      return {
        ok: false as const,
        error: "A profile with this email already exists on this device. Sign in instead.",
      };
    }

    const profile: StoredProfile = {
      name: parsed.data.name,
      email,
      targetRole: parsed.data.targetRole,
      fieldOfStudy: parsed.data.fieldOfStudy,
      learningTrack: parsed.data.learningTrack,
      focusArea: parsed.data.focusArea,
      level: normalizeLevel(parsed.data.level),
    };
    const salt = createSalt();
    const passwordHash = await hashPassword(parsed.data.password, salt);
    accounts[email] = { salt, passwordHash, profile };
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    window.localStorage.setItem(profileStorageKey(email), JSON.stringify(profile));
    writeSession(profile);

    return {
      ok: true as const,
      demo: true,
      message: "Your local profile is ready on this browser.",
      profile,
    };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? `Could not create your profile: ${error.message}`
          : "Could not create your profile on this browser.",
    };
  }
}
