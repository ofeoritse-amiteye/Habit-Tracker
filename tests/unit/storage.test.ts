import { beforeEach, describe, expect, it } from "vitest";
import type { Habit } from "@/types/habit";
import type { User } from "@/types/auth";
import { isSessionValid } from "@/lib/auth";
import {
  findUserByEmail,
  getHabits,
  getSession,
  getUsers,
  saveHabits,
  saveUsers,
  setSession,
  userExists,
} from "@/lib/storage";

describe("local storage persistence helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and reads users", () => {
    const user: User = {
      id: "u1",
      email: "a@b.com",
      password: "secret",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    saveUsers([user]);
    expect(getUsers()).toEqual([user]);
    expect(findUserByEmail("A@B.COM")).toEqual(user);
    expect(userExists("u1")).toBe(true);
    expect(userExists("missing")).toBe(false);
  });

  it("stores session and validates against users", () => {
    const user: User = {
      id: "u1",
      email: "a@b.com",
      password: "secret",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    saveUsers([user]);
    setSession({ userId: "u1", email: "a@b.com" });
    expect(getSession()).toEqual({ userId: "u1", email: "a@b.com" });
    expect(isSessionValid(getSession())).toBe(true);
    setSession(null);
    expect(getSession()).toBeNull();
  });

  it("stores habits", () => {
    const habit: Habit = {
      id: "h1",
      userId: "u1",
      name: "Walk",
      description: "",
      frequency: "daily",
      createdAt: "2026-01-01T00:00:00.000Z",
      completions: [],
    };
    saveHabits([habit]);
    expect(getHabits()).toEqual([habit]);
  });
});
