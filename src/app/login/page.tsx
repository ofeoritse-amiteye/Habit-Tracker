import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-[#0c1222] px-4 py-12">
      <LoginForm />
      <p className="relative z-10 mx-auto mt-8 text-center text-xs font-medium text-[color:var(--dash-text-subtle,#64748b)]">
        <Link
          href="/"
          className="rounded text-[color:var(--dash-text-muted,#94a3b8)] underline-offset-4 outline-none hover:text-[#6ee7b7] hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34d399]"
        >
          Back to start
        </Link>
      </p>
    </div>
  );
}
