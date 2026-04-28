import { describe, expect, it } from "vitest";
import { validateHabitName } from "@/lib/validators";

describe("validateHabitName", () => {
  it("returns an error when habit name is empty", () => {
    const result = validateHabitName("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Habit name is required");
  });

  it("returns an error when habit name exceeds 60 characters", () => {
    const result = validateHabitName("a".repeat(61));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Habit name must be 60 characters or fewer");
  });

  it("returns a trimmed value when habit name is valid", () => {
    const result = validateHabitName("  Meditate  ");
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.value).toBe("Meditate");
  });
});
