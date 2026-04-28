"use client";

import type { Habit } from "@/types/habit";
import { calculateCurrentStreak } from "@/lib/streaks";
import { getHabitSlug } from "@/lib/slug";

type HabitCardProps = {
  habit: Habit;
  today: string;
  onToggleComplete: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onRequestDelete: (habit: Habit) => void;
};

export function HabitCard({
  habit,
  today,
  onToggleComplete,
  onEdit,
  onRequestDelete,
}: HabitCardProps) {
  const slug = getHabitSlug(habit.name);
  const completedToday = habit.completions.includes(today);
  const streak = calculateCurrentStreak(habit.completions, today);

  return (
    <article
      data-testid={`habit-card-${slug}`}
      className={`rounded-2xl border p-5 shadow-lg transition-colors ${
        completedToday
          ? "border-emerald-400/35 bg-[rgba(16,185,129,0.14)] backdrop-blur-xl"
          : "dash-glass border-[color:rgba(255,255,255,0.11)]"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-[color:var(--dash-text,#f1f5f9)]">
            {habit.name}
          </h2>
          {habit.description ? (
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--dash-text-muted,#94a3b8)]">
              {habit.description}
            </p>
          ) : null}
          <p
            className="mt-3 text-sm font-semibold tabular-nums text-[#6ee7b7]"
            data-testid={`habit-streak-${slug}`}
          >
            Streak: {streak} {streak === 1 ? "day" : "days"}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            data-testid={`habit-complete-${slug}`}
            onClick={() => onToggleComplete(habit)}
            className="rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] px-3.5 py-2 text-sm font-semibold text-[color:var(--dash-text,#f1f5f9)] backdrop-blur-sm outline-none transition hover:bg-[rgba(255,255,255,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34d399]"
          >
            {completedToday ? "Undo today" : "Mark today"}
          </button>
          <button
            type="button"
            data-testid={`habit-edit-${slug}`}
            onClick={() => onEdit(habit)}
            className="rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] px-3.5 py-2 text-sm font-semibold text-[color:var(--dash-text,#f1f5f9)] backdrop-blur-sm outline-none transition hover:bg-[rgba(255,255,255,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34d399]"
          >
            Edit
          </button>
          <button
            type="button"
            data-testid={`habit-delete-${slug}`}
            onClick={() => onRequestDelete(habit)}
            className="rounded-xl border border-red-700/60 bg-[rgba(185,28,28,0.25)] px-3.5 py-2 text-sm font-semibold text-[#fecaca] outline-none backdrop-blur-sm transition hover:bg-[rgba(185,28,28,0.38)] hover:text-[#fef2f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f87171]"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
