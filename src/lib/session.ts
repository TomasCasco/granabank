import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
const REMEMBER_SECONDS = 60 * 60 * 24 * 30;
// Without "Recordarme" the cookie dies with the browser; the token still expires so a stolen one isn't valid forever.
const SESSION_SECONDS = 60 * 60 * 12;

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function startSession(userId: string, remember: boolean) {
  const ttl = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  const token = await new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(secretKey());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember && { maxAge: ttl }),
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** User id from the session cookie, or null when missing/invalid/expired. */
export async function getSessionUserId(): Promise<string | null> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}
