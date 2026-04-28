"use client";

import type { Habit } from "@/types/habit";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { HabitCard } from "@/components/habits/HabitCard";

type HabitListProps = {
  habits: Habit[];
  today: string;
  pendingHabit?: Habit;
  onToggleComplete: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onRequestDelete: (habit: Habit) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
};

function DeleteConfirmationModal({
  habit,
  onConfirmDelete,
  onCancelDelete,
}: {
  habit: Habit;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onCancelDelete();
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onCancelDelete]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center p-4 sm:p-6"
    >
      <button
        type="button"
        className="absolute inset-0 min-h-[100dvh] w-full bg-black/80 backdrop-blur-sm"
        aria-label="Close delete dialog"
        onClick={onCancelDelete}
      />
      <div
        role="dialog"
        aria-labelledby="delete-habit-title"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-red-900/55 bg-[color:rgba(20,25,35,0.97)] px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/10 backdrop-blur-xl"
      >
        <h2
          id="delete-habit-title"
          className="text-lg font-semibold text-[#fecaca]"
        >
          Delete “{habit.name}”?
        </h2>
        <p className="mt-3 text-sm font-medium leading-relaxed text-[#fca5a5]">
          This cannot be undone.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            data-testid="confirm-delete-button"
            onClick={onConfirmDelete}
            className="rounded-xl bg-[#b91c1c] px-4 py-2.5 text-sm font-semibold text-white outline-none shadow-lg shadow-black/40 transition hover:bg-[#991b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f87171]"
          >
            Confirm delete
          </button>
          <button
            type="button"
            onClick={onCancelDelete}
            className="rounded-xl border border-[rgba(254,226,226,0.35)] bg-[rgba(254,226,226,0.1)] px-4 py-2.5 text-sm font-semibold text-[#fecaca] backdrop-blur-sm outline-none transition hover:bg-[rgba(254,226,226,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fca5a5]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function HabitList({
  habits,
  today,
  pendingHabit,
  onToggleComplete,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: HabitListProps) {
  return (
    <>
      {pendingHabit ? (
        <DeleteConfirmationModal
          habit={pendingHabit}
          onConfirmDelete={onConfirmDelete}
          onCancelDelete={onCancelDelete}
        />
      ) : null}

      <section className="mt-8 space-y-4" aria-label="Your habits">
        {habits.length === 0 ? (
          <div
            data-testid="empty-state"
            className="dash-glass rounded-2xl border border-dashed border-[rgba(255,255,255,0.22)] px-6 py-14 text-center"
          >
            <p className="text-[15px] font-semibold text-[color:var(--dash-text,#f1f5f9)]">
              No habits yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-relaxed text-[color:var(--dash-text-muted,#94a3b8)]">
              Create your first habit to start a streak, they'll show up here.
            </p>
          </div>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              today={today}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onRequestDelete={onRequestDelete}
            />
          ))
        )}
      </section>
    </>
  );
}
