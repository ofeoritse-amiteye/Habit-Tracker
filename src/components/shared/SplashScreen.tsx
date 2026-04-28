"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSession, isSessionValid } from "@/lib/auth";

const SPLASH_MIN_MS = 1800;

export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getSession();
      if (isSessionValid(session)) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }, SPLASH_MIN_MS);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c1222] px-6"
      data-testid="splash-screen"
    >
      <div className="dash-glass relative z-10 flex max-w-md flex-col items-center rounded-3xl px-10 py-12 text-center sm:px-14 sm:py-16">
        <span
          className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] backdrop-blur-md"
          aria-hidden
        >
          <span className="font-[family-name:var(--font-dm-mono)] text-2xl text-[#34d399]">
            ✓
          </span>
        </span>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.26em] text-[color:var(--dash-text-subtle,#64748b)]">
          Habit Tracker
        </p>
        <h1 className="mt-3 text-[1.65rem] font-semibold tracking-tight text-[color:var(--dash-text,#f1f5f9)] sm:text-3xl">
          Building better routines
        </h1>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed font-medium text-[color:var(--dash-text-muted,#94a3b8)]">
          Checking your session and getting things ready.
        </p>
        <div
          className="mt-8 h-1.5 w-28 overflow-hidden rounded-full bg-[rgba(255,255,255,0.12)]"
          aria-hidden
        >
          <div className="h-full w-2/3 rounded-full bg-[#34d399] motion-reduce:animate-none animate-pulse" />
        </div>
      </div>
    </div>
  );
}
