// Clerk attaches itself to `window.Clerk` once loaded — this is the
// documented way to read the current session token from plain (non-React)
// code such as a fetch wrapper, where the `useAuth()` hook isn't usable.
interface WindowWithClerk extends Window {
  Clerk?: { session?: { getToken(): Promise<string | null> } };
}

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const clerk = (window as WindowWithClerk).Clerk;
  if (!clerk?.session) return null;
  return clerk.session.getToken();
}
