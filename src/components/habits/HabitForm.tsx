"use client";

import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const glassFieldClass =
  "w-full rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(0,0,0,0.25)] px-3.5 py-2.5 text-sm font-medium text-[color:var(--dash-text,#f1f5f9)] outline-none backdrop-blur-sm transition placeholder:text-[color:var(--dash-text-subtle)] focus:border-[#34d399]/80 focus:ring-2 focus:ring-[#34d399]/35";

const primaryButtonClass =
  "rounded-xl bg-[#059669] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 outline-none transition hover:bg-[#047857] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34d399] active:scale-[0.98]";

type HabitFormProps = {
  open: boolean;
  editingId: string | null;
  name: string;
  description: string;
  nameError: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export function HabitForm({
  open,
  editingId,
  name,
  description,
  nameError,
  onSubmit,
  onCancel,
  onNameChange,
  onDescriptionChange,
}: HabitFormProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, onCancel]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center p-4 sm:p-6"
    >
      <button
        type="button"
        className="absolute inset-0 min-h-[100dvh] w-full bg-black/80 backdrop-blur-sm"
        aria-label="Close habit form"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-form-heading"
        className="relative z-10 w-full max-w-md overflow-visible rounded-2xl border border-[color:var(--dash-border,rgba(255,255,255,0.11))] bg-[color:rgba(20,25,35,0.97)] shadow-[0_24px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/10 backdrop-blur-xl"
      >
        <form
          data-testid="habit-form"
          onSubmit={onSubmit}
          className="max-h-[min(88dvh,760px)] overflow-y-auto overflow-x-visible overscroll-contain px-6 py-6 sm:px-7 sm:py-7"
        >
          <h2
            id="habit-form-heading"
            className="text-lg font-semibold text-[color:var(--dash-text,#f1f5f9)]"
          >
            {editingId ? "Edit habit" : "Create habit"}
          </h2>

          <div className="mt-5 space-y-5">
            {nameError ? (
              <p
                role="alert"
                className="rounded-xl border border-red-700/50 bg-[rgba(127,29,29,0.35)] px-3.5 py-2.5 text-sm font-medium text-[#fecaca]"
              >
                {nameError}
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="habit-name-input"
                className="text-sm font-semibold text-[color:var(--dash-text,#f1f5f9)]"
              >
                Name
              </label>
              <input
                id="habit-name-input"
                data-testid="habit-name-input"
                value={name}
                onChange={(ev) => onNameChange(ev.target.value)}
                className={glassFieldClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="habit-description-input"
                className="text-sm font-semibold text-[color:var(--dash-text,#f1f5f9)]"
              >
                Description{" "}
                <span className="font-normal text-[color:var(--dash-text-muted)]">
                  (optional)
                </span>
              </label>
              <textarea
                id="habit-description-input"
                data-testid="habit-description-input"
                value={description}
                onChange={(ev) => onDescriptionChange(ev.target.value)}
                rows={3}
                className={`${glassFieldClass} min-h-[5rem] resize-y`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="habit-frequency-select"
                className="text-sm font-semibold text-[color:var(--dash-text,#f1f5f9)]"
              >
                Frequency
              </label>
              <select
                id="habit-frequency-select"
                data-testid="habit-frequency-select"
                value="daily"
                disabled
                className={`${glassFieldClass} cursor-not-allowed opacity-90`}
              >
                <option value="daily">Daily</option>
              </select>
            </div>

            <p className="text-xs font-medium leading-relaxed text-[color:var(--dash-text-subtle,#64748b)]">
              Habits repeat every calendar day, you mark completion once per day to
              keep your streak.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3 border-t border-[rgba(255,255,255,0.08)] pt-6">
            <button
              type="submit"
              data-testid="habit-save-button"
              className={`${primaryButtonClass} px-5 py-2.5`}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] px-5 py-2.5 text-sm font-semibold text-[color:var(--dash-text,#f1f5f9)] backdrop-blur-sm outline-none transition hover:bg-[rgba(255,255,255,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34d399]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
