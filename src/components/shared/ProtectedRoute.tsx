"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession, isSessionValid } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!isSessionValid(session)) {
      router.replace(ROUTES.login);
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#0c1222]">
        <div className="dash-glass relative z-10 rounded-2xl px-10 py-8 text-sm font-semibold text-[color:var(--dash-text-muted,#94a3b8)]">
          Loading…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
