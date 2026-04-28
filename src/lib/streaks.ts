function parseYmd(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function calculateCurrentStreak(
  completions: string[],
  today?: string,
): number {
  const now = new Date();
  const todayStr =
    today ??
    formatYmd(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const uniqueSorted = [...new Set(completions)].sort();
  const completed = new Set(uniqueSorted);
  if (!completed.has(todayStr)) {
    return 0;
  }
  let streak = 0;
  const cursor = parseYmd(todayStr);
  while (completed.has(formatYmd(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
