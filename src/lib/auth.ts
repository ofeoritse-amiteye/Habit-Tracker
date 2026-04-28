import type { Session } from "@/types/auth";
export { getSession, setSession } from "./storage";
import { setSession as writeSession, userExists } from "./storage";

export function isSessionValid(session: Session | null): boolean {
  if (!session) return false;
  return userExists(session.userId);
}

export function clearSession(): void {
  writeSession(null);
}
