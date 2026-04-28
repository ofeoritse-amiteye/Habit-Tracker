import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardContent } from "@/app/dashboard/page";
import type { Habit } from "@/types/habit";
import type { User } from "@/types/auth";

const { stableRouter } = vi.hoisted(() => ({
  stableRouter: {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  },
}));

vi.mock("@/app/dashboard/date", () => ({
  getLocalDateString: () => "2026-04-26",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => stableRouter,
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

function seedUserAndSession() {
  const user: User = {
    id: "u-dash",
    email: "dash@example.com",
    password: "pw",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("habit-tracker-users", JSON.stringify([user]));
  localStorage.setItem(
    "habit-tracker-session",
    JSON.stringify({ userId: "u-dash", email: "dash@example.com" }),
  );
}

describe("habit form", () => {
  beforeEach(() => {
    localStorage.clear();
    seedUserAndSession();
  });

  it("shows a validation error when habit name is empty", async () => {
    const user = userEvent.setup();
    render(<DashboardContent />);
    await waitFor(() =>
      expect(screen.getByTestId("dashboard-page")).toBeInTheDocument(),
    );
    await user.click(screen.getByTestId("create-habit-button"));
    await user.click(screen.getByTestId("habit-save-button"));
    expect(
      await screen.findByText("Habit name is required"),
    ).toBeInTheDocument();
  });

  it("creates a new habit and renders it in the list", async () => {
    const user = userEvent.setup();
    render(<DashboardContent />);
    await waitFor(() =>
      expect(screen.getByTestId("dashboard-page")).toBeInTheDocument(),
    );
    await user.click(screen.getByTestId("create-habit-button"));
    await user.type(screen.getByTestId("habit-name-input"), "Drink Water");
    await user.type(
      screen.getByTestId("habit-description-input"),
      "Stay hydrated",
    );
    await user.click(screen.getByTestId("habit-save-button"));

    expect(
      await screen.findByTestId("habit-card-drink-water"),
    ).toBeInTheDocument();
  });

  it("edits an existing habit and preserves immutable fields", async () => {
    const habit: Habit = {
      id: "h1",
      userId: "u-dash",
      name: "Read Books",
      description: "Paper only",
      frequency: "daily",
      createdAt: "2026-01-02T03:04:05.000Z",
      completions: ["2026-04-26"],
    };
    localStorage.setItem("habit-tracker-habits", JSON.stringify([habit]));

    const user = userEvent.setup();
    render(<DashboardContent />);
    await waitFor(() =>
      expect(screen.getByTestId("habit-card-read-books")).toBeInTheDocument(),
    );
    await user.click(screen.getByTestId("habit-edit-read-books"));
    await user.clear(screen.getByTestId("habit-name-input"));
    await user.type(screen.getByTestId("habit-name-input"), "Read Novels");
    await user.clear(screen.getByTestId("habit-description-input"));
    await user.type(screen.getByTestId("habit-description-input"), "Fiction");
    await user.click(screen.getByTestId("habit-save-button"));

    await waitFor(() =>
      expect(screen.getByTestId("habit-card-read-novels")).toBeInTheDocument(),
    );

    const stored = JSON.parse(
      localStorage.getItem("habit-tracker-habits") ?? "[]",
    ) as Habit[];
    const updated = stored.find((h) => h.id === "h1");
    expect(updated?.name).toBe("Read Novels");
    expect(updated?.description).toBe("Fiction");
    expect(updated?.userId).toBe("u-dash");
    expect(updated?.createdAt).toBe("2026-01-02T03:04:05.000Z");
    expect(updated?.completions).toEqual(["2026-04-26"]);
  });

  it("deletes a habit only after explicit confirmation", async () => {
    const habit: Habit = {
      id: "h-del",
      userId: "u-dash",
      name: "Temp Habit",
      description: "",
      frequency: "daily",
      createdAt: new Date().toISOString(),
      completions: [],
    };
    localStorage.setItem("habit-tracker-habits", JSON.stringify([habit]));

    const user = userEvent.setup();
    render(<DashboardContent />);
    await waitFor(() =>
      expect(
        screen.getByTestId("habit-card-temp-habit"),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByTestId("habit-delete-temp-habit"));
    expect(screen.getByTestId("confirm-delete-button")).toBeInTheDocument();
    expect(screen.getByTestId("habit-card-temp-habit")).toBeInTheDocument();

    await user.click(screen.getByTestId("confirm-delete-button"));
    await waitFor(() =>
      expect(
        screen.queryByTestId("habit-card-temp-habit"),
      ).not.toBeInTheDocument(),
    );
  });

  it("toggles completion and updates the streak display", async () => {
    const habit: Habit = {
      id: "h-run",
      userId: "u-dash",
      name: "Morning Run",
      description: "",
      frequency: "daily",
      createdAt: new Date().toISOString(),
      completions: [],
    };
    localStorage.setItem("habit-tracker-habits", JSON.stringify([habit]));

    const user = userEvent.setup();
    render(<DashboardContent />);
    await waitFor(() =>
      expect(
        screen.getByTestId("habit-card-morning-run"),
      ).toBeInTheDocument(),
    );

    expect(screen.getByTestId("habit-streak-morning-run")).toHaveTextContent(
      "Streak: 0 days",
    );
    await user.click(screen.getByTestId("habit-complete-morning-run"));
    await waitFor(() =>
      expect(screen.getByTestId("habit-streak-morning-run")).toHaveTextContent(
        "Streak: 1 day",
      ),
    );
  });
});
