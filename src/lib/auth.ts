import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

const COOKIE_NAME = "pf_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secretKey(): Uint8Array | null {
  const raw = process.env.AUTH_SECRET?.trim();
  if (raw) return new TextEncoder().encode(raw);

  // Never fall back to a known secret in production: that would let anyone
  // forge an admin session cookie. Local development keeps a throwaway key.
  if (process.env.NODE_ENV === "production") return null;
  return new TextEncoder().encode("phaseforge-dev-secret-change-me-in-production-0123456789");
}

/** True when session signing is safe to use in this environment. */
export function isAuthConfigured(): boolean {
  return secretKey() !== null;
}

export type AdminSession = { user: string };

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedPass) return false;

  const a = crypto.createHash("sha256").update(`${username}:${password}`).digest();
  const b = crypto.createHash("sha256").update(`${expectedUser}:${expectedPass}`).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function createSession(user: string): Promise<void> {
  const key = secretKey();
  if (!key) throw new Error("AUTH_SECRET must be set in production.");
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(key);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<AdminSession | null> {
  const key = secretKey();
  if (!key) return null;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return { user: String(payload.sub || "admin") };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
