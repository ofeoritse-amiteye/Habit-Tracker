import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import type { User } from "@/types/auth";

const { authRouter } = vi.hoisted(() => ({
  authRouter: {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => authRouter,
}));

vi.mock("next/link", () => ({
  default({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return <a href={href}>{children}</a>;
  },
}));

describe("auth flow", () => {
  beforeEach(() => {
    localStorage.clear();
    authRouter.push.mockClear();
    authRouter.replace.mockClear();
    authRouter.refresh.mockClear();
  });

  it("submits the signup form and creates a session", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByTestId("auth-signup-email"), "new@example.com");
    await user.type(screen.getByTestId("auth-signup-password"), "secret12");
    await user.click(screen.getByTestId("auth-signup-submit"));

    await waitFor(() => {
      expect(localStorage.getItem("habit-tracker-session")).toBeTruthy();
    });
    const users = JSON.parse(
      localStorage.getItem("habit-tracker-users") ?? "[]",
    ) as User[];
    expect(users).toHaveLength(1);
    expect(authRouter.push).toHaveBeenCalledWith("/dashboard");
  });

  it("shows an error for duplicate signup email", async () => {
    const existing: User = {
      id: "existing",
      email: "taken@example.com",
      password: "x",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("habit-tracker-users", JSON.stringify([existing]));

    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(
      screen.getByTestId("auth-signup-email"),
      "taken@example.com",
    );
    await user.type(screen.getByTestId("auth-signup-password"), "secret12");
    await user.click(screen.getByTestId("auth-signup-submit"));

    expect(await screen.findByText("User already exists")).toBeInTheDocument();
    expect(authRouter.push).not.toHaveBeenCalled();
  });

  it("submits the login form and stores the active session", async () => {
    const stored: User = {
      id: "u-login",
      email: "login@example.com",
      password: "correct",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("habit-tracker-users", JSON.stringify([stored]));

    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByTestId("auth-login-email"), "login@example.com");
    await user.type(screen.getByTestId("auth-login-password"), "correct");
    await user.click(screen.getByTestId("auth-login-submit"));

    await waitFor(() => {
      const raw = localStorage.getItem("habit-tracker-session");
      expect(raw).toBeTruthy();
      const session = JSON.parse(raw!);
      expect(session.userId).toBe("u-login");
    });
    expect(authRouter.push).toHaveBeenCalledWith("/dashboard");
  });

  it("shows an error for invalid login credentials", async () => {
    const stored: User = {
      id: "u-login",
      email: "login@example.com",
      password: "correct",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("habit-tracker-users", JSON.stringify([stored]));

    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByTestId("auth-login-email"), "login@example.com");
    await user.type(screen.getByTestId("auth-login-password"), "wrong");
    await user.click(screen.getByTestId("auth-login-submit"));

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
    expect(localStorage.getItem("habit-tracker-session")).toBeNull();
  });
});
