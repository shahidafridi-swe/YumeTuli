// Server-only helpers for the JWT session cookie (BFF pattern: the browser never sees the token).
export const TOKEN_COOKIE = "yt_token";
export const REFRESH_WINDOW_SECONDS = 14 * 24 * 60 * 60; // matches Laravel JWT_REFRESH_TTL (14 days)

export const apiBase = () => `${process.env.API_INTERNAL_URL ?? "http://localhost:8000"}/api/v1`;

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
  path: "/",
  maxAge: REFRESH_WINDOW_SECONDS,
};

/** Seconds until the JWT expires (negative when expired). No signature check: Laravel does that. */
export function secondsLeft(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return Number(payload.exp) - Math.floor(Date.now() / 1000);
  } catch {
    return -1;
  }
}

/** Exchanges a (possibly expired) token for a new one. Returns null if the session is over. */
export async function refreshToken(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${apiBase()}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}
