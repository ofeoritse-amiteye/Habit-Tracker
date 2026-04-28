import { describe, expect, it } from "vitest";
import { toggleHabitCompletion } from "@/lib/habits";
import type { Habit } from "@/types/habit";

const baseHabit: Habit = {
  id: "h1",
  userId: "u1",
  name: "Run",
  description: "",
  frequency: "daily",
  createdAt: "2026-01-01T00:00:00.000Z",
  completions: ["2026-04-25"],
};

describe("toggleHabitCompletion", () => {
  it("adds a completion date when the date is not present", () => {
    const next = toggleHabitCompletion(baseHabit, "2026-04-26");
    expect(next.completions).toContain("2026-04-26");
    expect(next.completions).toContain("2026-04-25");
  });

  it("removes a completion date when the date already exists", () => {
    const next = toggleHabitCompletion(baseHabit, "2026-04-25");
    expect(next.completions).not.toContain("2026-04-25");
  });

  it("does not mutate the original habit object", () => {
    const copy = { ...baseHabit, completions: [...baseHabit.completions] };
    toggleHabitCompletion(copy, "2026-04-26");
    expect(copy.completions).toEqual(baseHabit.completions);
  });

  it("does not return duplicate completion dates", () => {
    const dup: Habit = {
      ...baseHabit,
      completions: ["2026-04-26", "2026-04-26", "2026-04-25"],
    };
    const toggled = toggleHabitCompletion(dup, "2026-04-26");
    expect(toggled.completions.filter((d) => d === "2026-04-26").length).toBe(
      0,
    );
    const toggledAgain = toggleHabitCompletion(
      { ...dup, completions: ["2026-04-26", "2026-04-26"] },
      "2026-04-26",
    );
    expect(new Set(toggledAgain.completions).size).toBe(
      toggledAgain.completions.length,
    );
  });
});
