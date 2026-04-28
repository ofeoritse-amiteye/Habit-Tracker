import type { Habit } from "@/types/habit";

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const normalized = [...new Set(habit.completions)].sort();
  const set = new Set(normalized);
  if (set.has(date)) {
    set.delete(date);
  } else {
    set.add(date);
  }
  return {
    ...habit,
    completions: [...set].sort(),
  };
}
