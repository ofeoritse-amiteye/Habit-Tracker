import { expect, test } from "@playwright/test";

test.describe("Habit Tracker app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.removeItem("habit-tracker-users");
      localStorage.removeItem("habit-tracker-session");
      localStorage.removeItem("habit-tracker-habits");
    });
  });

  test("shows the splash screen and redirects unauthenticated users to /login", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("splash-screen")).toBeVisible();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test("redirects authenticated users from / to /dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      const user = {
        id: "seed-u",
        email: "seed@example.com",
        password: "pw",
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("habit-tracker-users", JSON.stringify([user]));
      localStorage.setItem(
        "habit-tracker-session",
        JSON.stringify({ userId: "seed-u", email: "seed@example.com" }),
      );
    });
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test("prevents unauthenticated access to /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("signs up a new user and lands on the dashboard", async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill(email);
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("logs in an existing user and loads only that user's habits", async ({
    page,
  }) => {
    const emailA = `user-a-${Date.now()}@example.com`;
    const emailB = `user-b-${Date.now()}@example.com`;

    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill(emailA);
    await page.getByTestId("auth-signup-password").fill("pw");
    await page.getByTestId("auth-signup-submit").click();
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("Alpha Habit");
    await page.getByTestId("habit-save-button").click();
    await expect(page.getByTestId("habit-card-alpha-habit")).toBeVisible();

    await page.getByTestId("auth-logout-button").click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill(emailB);
    await page.getByTestId("auth-signup-password").fill("pw");
    await page.getByTestId("auth-signup-submit").click();
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await expect(page.getByTestId("habit-card-alpha-habit")).toHaveCount(0);

    await page.getByTestId("auth-logout-button").click();
    await page.goto("/login");
    await page.getByTestId("auth-login-email").fill(emailA);
    await page.getByTestId("auth-login-password").fill("pw");
    await page.getByTestId("auth-login-submit").click();
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page.getByTestId("habit-card-alpha-habit")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("creates a habit from the dashboard", async ({ page }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill(`habit-${Date.now()}@x.com`);
    await page.getByTestId("auth-signup-password").fill("pw");
    await page.getByTestId("auth-signup-submit").click();
    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("Drink Water");
    await page.getByTestId("habit-description-input").fill("Two liters");
    await page.getByTestId("habit-save-button").click();
    await expect(page.getByTestId("habit-card-drink-water")).toBeVisible();
  });

  test("completes a habit for today and updates the streak", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill(`streak-${Date.now()}@x.com`);
    await page.getByTestId("auth-signup-password").fill("pw");
    await page.getByTestId("auth-signup-submit").click();
    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("Walk");
    await page.getByTestId("habit-save-button").click();
    await expect(page.getByTestId("habit-streak-walk")).toContainText("0");
    await page.getByTestId("habit-complete-walk").click();
    await expect(page.getByTestId("habit-streak-walk")).toContainText("1");
  });

  test("persists session and habits after page reload", async ({ page }) => {
    const email = `persist-${Date.now()}@x.com`;
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill(email);
    await page.getByTestId("auth-signup-password").fill("pw");
    await page.getByTestId("auth-signup-submit").click();
    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("Journal");
    await page.getByTestId("habit-save-button").click();
    await expect(page.getByTestId("habit-card-journal")).toBeVisible();

    await page.reload();
    await expect(page.getByTestId("dashboard-page")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("habit-card-journal")).toBeVisible();
  });

  test("logs out and redirects to /login", async ({ page }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill(`out-${Date.now()}@x.com`);
    await page.getByTestId("auth-signup-password").fill("pw");
    await page.getByTestId("auth-signup-submit").click();
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await page.getByTestId("auth-logout-button").click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("loads the cached app shell when offline after the app has been loaded once", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("splash-screen")).toBeVisible();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});

    await context.setOffline(true);
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});

    await expect(page.locator("body")).toBeVisible();
    expect(errors.filter((m) => m.includes("ChunkLoadError"))).toHaveLength(0);
    await context.setOffline(false);
  });
});
