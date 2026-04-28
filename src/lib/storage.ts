import type { Habit } from "@/types/habit";
import type { Session, User } from "@/types/auth";
import { STORAGE_KEYS } from "@/lib/constants";

const USERS_KEY = STORAGE_KEYS.USERS;
const SESSION_KEY = STORAGE_KEYS.SESSION;
const HABITS_KEY = STORAGE_KEYS.HABITS;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers(): User[] {
  return readJson<User[]>(USERS_KEY, []);
}

export function saveUsers(users: User[]): void {
  writeJson(USERS_KEY, users);
}

export function getSession(): Session | null {
  return readJson<Session | null>(SESSION_KEY, null);
}

export function setSession(session: Session | null): void {
  if (!canUseStorage()) return;
  if (session === null) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  writeJson(SESSION_KEY, session);
}

/** Normalizes persisted habits to the Stage 3 contract (daily-only). */
export function getHabits(): Habit[] {
  const rows = readJson<Habit[]>(HABITS_KEY, []);
  return rows.map((h) => ({
    ...h,
    frequency: "daily",
  }));
}

export function saveHabits(habits: Habit[]): void {
  writeJson(HABITS_KEY, habits);
}

export function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  return getUsers().find((u) => u.email.toLowerCase() === normalized);
}

export function userExists(userId: string): boolean {
  return getUsers().some((u) => u.id === userId);
}
