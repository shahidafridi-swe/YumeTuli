import { NextResponse, type NextRequest } from "next/server";
import { apiBase, cookieOptions, refreshToken, TOKEN_COOKIE } from "@/lib/session";

/**
 * BFF: the browser calls /api/<path>, this forwards to Laravel /api/v1/<path> with the JWT
 * from the httpOnly cookie. On 401 it refreshes the token once and retries.
 */
async function forward(request: NextRequest, ctx: RouteContext<"/api/[...path]">) {
  const { path } = await ctx.params;
  const url = `${apiBase()}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  let token = request.cookies.get(TOKEN_COOKIE)?.value;

  const send = (jwt?: string) => {
    const headers = new Headers({ Accept: "application/json" });
    const type = request.headers.get("content-type");
    if (type) headers.set("Content-Type", type);
    if (jwt) headers.set("Authorization", `Bearer ${jwt}`);
    return fetch(url, { method: request.method, headers, body, cache: "no-store", redirect: "manual" });
  };

  let upstream = await send(token);
  let newToken: string | null = null;
  if (upstream.status === 401 && token && !path.join("/").startsWith("auth/")) {
    newToken = await refreshToken(token);
    if (newToken) {
      token = newToken;
      upstream = await send(token);
    }
  }

  const res = new NextResponse(upstream.status === 204 ? null : upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
  if (newToken) res.cookies.set(TOKEN_COOKIE, newToken, cookieOptions);
  if (upstream.status === 401) res.cookies.delete(TOKEN_COOKIE);
  return res;
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
