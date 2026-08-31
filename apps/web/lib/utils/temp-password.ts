// Mirrors the backend's randomTempPassword() (apps/api users.service.ts) so
// every auto-generated password in the app — create, bulk upload, reset —
// comes from the same scheme: 12 chars, always satisfying Clerk's default
// complexity checks (upper/lower/digit present).
export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
