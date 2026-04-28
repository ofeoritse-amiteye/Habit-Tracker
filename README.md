# Habit Tracker

Mobile-first habit tracker built with the Next.js App Router. Authentication and data live entirely in the browser via `localStorage`: there is no remote database or external auth provider. The app can be installed as a basic PWA and registers a service worker so the shell can be served from cache after the first visit.

## Setup

Requirements: Node.js 20+ and npm.

```bash
npm install
```

For end-to-end tests, Playwright will download Chromium on first run (`npx playwright install chromium`).

## Run

Development server (default port 3000):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The splash route (`/`) checks for a session and sends you to `/login` or `/dashboard`.

Production build and server:

```bash
npm run build
npm start
```

## Test

```bash
npm run test:unit        # Vitest + v8 coverage (src/lib, ≥80% lines)
npm run test:integration # Vitest + React Testing Library
npm run test:e2e         # Playwright (builds and serves on port 3333)
npm test                 # All of the above
```

Coverage report: after `npm run test:unit`, see terminal summary and `coverage/index.html`.

**Note:** `test:e2e` runs `next build` and `next start` on port `3333` so client navigation and the service worker behave like production. If another process uses that port, change `playwright.config.ts` and the `webServer` command accordingly.

## Local persistence

Data is stored under three fixed keys:

| Key | Contents |
| --- | --- |
| `habit-tracker-users` | JSON array of `{ id, email, password, createdAt }` |
| `habit-tracker-session` | JSON `{ userId, email }` or absent when logged out |
| `habit-tracker-habits` | JSON array of habits with `completions` as unique `YYYY-MM-DD` strings |

Sessions are considered valid only if the `userId` exists in the users list. Habits are filtered by the logged-in user’s `userId`.

## PWA support

- **`public/manifest.json`** — name, `short_name`, `start_url`, `display`, colors, and 192/512 icons.
- **`public/sw.js`** — on `fetch`, tries the network first and caches successful same-origin GET responses; on failure, serves a cached response or a minimal offline fallback so navigation does not hard-crash.
- **Registration** — `RegisterServiceWorker` in the root layout (`src/app/register-service-worker.tsx`) calls `navigator.serviceWorker.register('/sw.js')` on the client.

Icons in `public/icons/` are minimal valid PNGs suitable for install prompts; replace them with branded artwork for production.

## Trade-offs and limitations

- **Security:** Passwords are stored in plain text in `localStorage`. This is intentional for a local-only learning/demo stack, not for real user data.
- **Multi-device:** There is no sync; data stays on one browser profile.
- **Offline:** After the first load, cached shell and assets may allow basic navigation; dynamic Next.js chunks may not all be cached, so some offline scenarios can still degrade gracefully rather than offer full functionality.
- **E2E vs dev:** Playwright uses a production server to avoid dev-only HMR/cross-origin quirks that can block client-side routing in automated browsers.

## Required test files and what they verify

| Test file | Behavior covered |
| --- | --- |
| `tests/unit/slug.test.ts` | `getHabitSlug` normalization rules |
| `tests/unit/validators.test.ts` | `validateHabitName` rules and messages |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` including gaps and duplicates |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` immutability and deduplication |
| `tests/unit/storage.test.ts` | (Supporting) `localStorage` read/write helpers for users, session, habits |
| `tests/integration/auth-flow.test.tsx` | Signup session creation, duplicate email, login, invalid credentials |
| `tests/integration/habit-form.test.tsx` | Habit validation, CRUD, confirmation delete, completion and streak UI |
| `tests/e2e/app.spec.ts` | Full flows: splash, auth gates, habits, persistence, logout, offline shell |

Exact `describe` names and test titles match the Stage 3 specification so reviewers can scan `npm test` output.
