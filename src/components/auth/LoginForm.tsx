"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setSession } from "@/lib/auth";
import { findUserByEmail } from "@/lib/storage";

const glassFieldClass =
  "w-full rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(0,0,0,0.25)] px-3.5 py-2.5 text-sm font-medium text-[color:var(--dash-text,#f1f5f9)] outline-none backdrop-blur-sm transition placeholder:text-[color:var(--dash-text-subtle)] focus:border-[#34d399]/80 focus:ring-2 focus:ring-[#34d399]/35";

const primaryButtonClass =
  "rounded-xl bg-[#059669] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 outline-none transition hover:bg-[#047857] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34d399] active:scale-[0.98]";

const textLinkClass =
  "font-semibold text-[#6ee7b7] underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34d399]";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      setError("Invalid email or password");
      return;
    }
    setSession({ userId: user.id, email: user.email });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="dash-glass relative z-10 mx-auto flex w-full max-w-sm flex-col gap-5 rounded-3xl px-6 py-8 sm:px-8 sm:py-9"
    >
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--dash-text,#f1f5f9)]">
          Log in
        </h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-[color:var(--dash-text-muted,#94a3b8)]">
          Welcome back. Use your email and password.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-800/50 bg-[rgba(127,29,29,0.35)] px-3.5 py-2.5 text-sm font-medium text-[#fecaca]"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="auth-login-email"
          className="text-sm font-semibold text-[color:var(--dash-text,#f1f5f9)]"
        >
          Email
        </label>
        <input
          id="auth-login-email"
          data-testid="auth-login-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className={glassFieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="auth-login-password"
          className="text-sm font-semibold text-[color:var(--dash-text,#f1f5f9)]"
        >
          Password
        </label>
        <input
          id="auth-login-password"
          data-testid="auth-login-password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          className={glassFieldClass}
        />
      </div>

      <button
        type="submit"
        data-testid="auth-login-submit"
        className={`${primaryButtonClass} mt-1 w-full`}
      >
        Log in
      </button>

      <p className="text-center text-sm font-medium text-[color:var(--dash-text-muted,#94a3b8)]">
        No account?{" "}
        <Link href="/signup" className={textLinkClass}>
          Sign up
        </Link>
      </p>
    </form>
  );
}
