"use client";

import type { FormEvent } from "react";
import type { Habit } from "@/types/habit";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getLocalDateString } from "./date";
import { ROUTES } from "@/lib/constants";
import { clearSession, getSession } from "@/lib/auth";
import { toggleHabitCompletion } from "@/lib/habits";
import { validateHabitName } from "@/lib/validators";
import { getHabits, saveHabits } from "@/lib/storage";
import { HabitForm } from "@/components/habits/HabitForm";
import { HabitList } from "@/components/habits/HabitList";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

function getTodayCompletionPercent(
  completedCount: number,
  totalCount: number,
): number {
  if (totalCount <= 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

function getDayMotivation(
  completionPercent: number,
  totalHabits: number,
): { title: string; subtitle: string } {
  if (totalHabits === 0) {
    return {
      title: "Your day at a glance",
      subtitle:
        "When you add habits, we'll cheer you on as you rack up completions.",
    };
  }

  if (completionPercent === 100) {
    return {
      title: "Today is complete",
      subtitle:
        "Every habit is checked off for today, slow down and feel good about it.",
    };
  }

  if (completionPercent >= 70 && completionPercent <= 99) {
    return {
      title: "Nearly there",
      subtitle:
        "Just a few habits left for today, you're in the closing stretch.",
    };
  }

  if (completionPercent >= 50 && completionPercent <= 69) {
    return {
      title: "You've passed the midpoint",
      subtitle:
        "More done than left to go, that's grounded progress for the day.",
    };
  }

  if (completionPercent >= 31 && completionPercent <= 49) {
    return {
      title: "Momentum is kicking in",
      subtitle:
        "You're stringing completions together, stay with what's realistic.",
    };
  }

  return {
    title: "The day is wide open",
    subtitle:
      "One tap starts the streak. Whenever you're ready, your habits are waiting.",
  };
}

export default function DashboardRoutePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

export function DashboardContent() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const today = useMemo(() => getLocalDateString(), []);

  const refreshHabits = useCallback((uid: string) => {
    setHabits(getHabits().filter((h) => h.userId === uid));
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace(ROUTES.login);
      return;
    }
    setUserId(session.userId);
    refreshHabits(session.userId);
    setReady(true);
  }, [router, refreshHabits]);

  function openCreateForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setNameError(null);
    setShowForm(true);
  }

  function openEditForm(habit: Habit) {
    setEditingId(habit.id);
    setName(habit.name);
    setDescription(habit.description);
    setNameError(null);
    setShowForm(true);
    setPendingDeleteId(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setNameError(null);
  }

  function handleSaveHabit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;

    const validation = validateHabitName(name);
    if (!validation.valid) {
      setNameError(validation.error ?? "Habit name is required");
      return;
    }

    setNameError(null);
    const normalizedName = validation.value;
    const all = getHabits();

    if (editingId) {
      const next = all.map((h) =>
        h.id === editingId
          ? {
              ...h,
              name: normalizedName,
              description: description.trim(),
              frequency: "daily" as const,
            }
          : h,
      );
      saveHabits(next);
    } else {
      const habit: Habit = {
        id: crypto.randomUUID(),
        userId,
        name: normalizedName,
        description: description.trim(),
        frequency: "daily",
        createdAt: new Date().toISOString(),
        completions: [],
      };
      saveHabits([...all, habit]);
    }

    refreshHabits(userId);
    closeForm();
  }

  function handleToggleComplete(habit: Habit) {
    if (!userId) return;
    const stored = getHabits();
    const next = stored.map((h) =>
      h.id === habit.id ? toggleHabitCompletion(h, today) : h,
    );
    saveHabits(next);
    refreshHabits(userId);
  }

  function handleLogout() {
    clearSession();
    router.replace(ROUTES.login);
    router.refresh();
  }

  function handleConfirmDelete() {
    if (!userId || !pendingDeleteId) return;
    const next = getHabits().filter((h) => h.id !== pendingDeleteId);
    saveHabits(next);
    setPendingDeleteId(null);
    refreshHabits(userId);
    if (editingId === pendingDeleteId) closeForm();
  }

  const userHabits = habits;
  const completedToday = userHabits.filter((h) =>
    h.completions.includes(today),
  ).length;
  const totalHabits = userHabits.length;
  const completionRate = getTodayCompletionPercent(
    completedToday,
    totalHabits,
  );

  const motivation = useMemo(
    () => getDayMotivation(completionRate, totalHabits),
    [completionRate, totalHabits],
  );

  if (!ready || !userId) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#0c1222] px-6">
        <div className="dash-glass relative z-10 flex flex-col items-center gap-4 rounded-2xl px-10 py-8">
          <div
            className="h-8 w-8 rounded-full border-2 border-[#34d399] border-t-transparent animate-spin motion-reduce:animate-none"
            aria-hidden
          />
          <p className="text-sm font-medium text-[color:var(--dash-text-muted)]">
            Loading your habits…
          </p>
        </div>
      </div>
    );
  }

  const pendingHabit = pendingDeleteId
    ? userHabits.find((h) => h.id === pendingDeleteId)
    : undefined;

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const showFullBleedMotivationAccent =
    totalHabits > 0 && completionRate === 100;

  return (
    <div
      data-testid="dashboard-page"
      className="relative min-h-screen text-[color:var(--dash-text,#f1f5f9)] bg-[color:var(--dash-bg,#0c1222)]"
    >
      <header className="sticky top-0 z-50 border-b border-[color:var(--dash-border)] bg-[color:color-mix(in_srgb,var(--dash-surface-glass)_94%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:var(--dash-border)] bg-[color:rgba(255,255,255,0.06)] backdrop-blur-md"
              aria-hidden
            >
              <span className="font-[family-name:var(--font-dm-mono)] text-lg text-[#34d399]">
                ✓
              </span>
            </span>
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--dash-text-subtle,#64748b)]">
                Habit Tracker
              </p>
              <p className="truncate text-lg font-semibold tracking-tight text-[color:var(--dash-text)]">
                Dashboard
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="auth-logout-button"
            onClick={handleLogout}
            className="shrink-0 rounded-xl border border-[color:var(--dash-border)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-sm font-medium text-[color:var(--dash-text-muted)] outline-none backdrop-blur-sm transition hover:border-[rgba(255,255,255,0.22)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[color:var(--dash-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34d399]"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6">
        <div className="dash-glass rounded-3xl px-5 py-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--dash-text-subtle)]">
            Today
          </p>
          <p className="mt-2 text-[15px] text-[color:var(--dash-text-muted)] sm:text-base">
            {todayFormatted}
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--dash-text)] sm:text-[1.75rem]">
            {motivation.title}
          </h1>
          <p
            className={`mt-2 text-sm font-medium leading-relaxed ${
              showFullBleedMotivationAccent
                ? "text-[#6ee7b7]"
                : "text-[color:var(--dash-text-muted,#94a3b8)]"
            }`}
          >
            {motivation.subtitle}
          </p>
        </div>

        {totalHabits > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="dash-glass rounded-2xl px-5 py-5 transition hover:border-[rgba(255,255,255,0.16)]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--dash-text-subtle)]">
                Completed
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[color:var(--dash-text)]">
                {completedToday}
                <span className="text-lg font-medium text-[color:var(--dash-text-muted)]">
                  /{totalHabits}
                </span>
              </p>
            </div>
            <div className="dash-glass rounded-2xl px-5 py-5 transition hover:border-[rgba(255,255,255,0.16)]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--dash-text-subtle)]">
                Today&apos;s rate
              </p>
              <p
                className={`mt-2 text-3xl font-semibold tabular-nums ${
                  completionRate === 100
                    ? "text-[#6ee7b7]"
                    : "text-[color:var(--dash-text)]"
                }`}
              >
                {completionRate}%
              </p>
            </div>
            <div className="dash-glass rounded-2xl px-5 py-5 transition hover:border-[rgba(255,255,255,0.16)] sm:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--dash-text-subtle)]">
                Total habits
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[color:var(--dash-text)]">
                {totalHabits}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--dash-text-subtle)]">
              Habits
            </p>
            <p className="mt-1 text-sm text-[color:var(--dash-text-muted)]">
              Tap to mark today, edit names and notes, or remove a habit.
            </p>
          </div>
          <button
            type="button"
            data-testid="create-habit-button"
            onClick={openCreateForm}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#059669] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/35 outline-none transition hover:bg-[#047857] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34d399] active:scale-[0.98]"
          >
            <span aria-hidden className="text-lg leading-none">
              +
            </span>
            New habit
          </button>
        </div>

        <HabitForm
          open={showForm}
          editingId={editingId}
          name={name}
          description={description}
          nameError={nameError}
          onSubmit={handleSaveHabit}
          onCancel={closeForm}
          onNameChange={setName}
          onDescriptionChange={setDescription}
        />

        <HabitList
          habits={userHabits}
          today={today}
          pendingHabit={pendingHabit}
          onToggleComplete={handleToggleComplete}
          onEdit={openEditForm}
          onRequestDelete={(h) => {
            setPendingDeleteId(h.id);
            setShowForm(false);
          }}
          onConfirmDelete={handleConfirmDelete}
          onCancelDelete={() => setPendingDeleteId(null)}
        />

        {totalHabits > 0 ? (
          <p className="mt-12 text-center text-xs text-[color:var(--dash-text-subtle)]">
            Progress stays on this device
          </p>
        ) : null}
      </main>
    </div>
  );
}
