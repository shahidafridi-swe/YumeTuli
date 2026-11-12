import { NextResponse, type NextRequest } from "next/server";
import { cookieOptions, refreshToken, secondsLeft, TOKEN_COOKIE } from "@/lib/session";

/**
 * Optimistic auth gate + token refresh before it expires.
 * Laravel still checks every request; this only keeps the session fresh and redirects guests.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/login";
  const isApi = pathname.startsWith("/api/");
  let token = request.cookies.get(TOKEN_COOKIE)?.value;
  let refreshed: string | null = null;

  if (token && secondsLeft(token) < 60) {
    refreshed = await refreshToken(token);
    token = refreshed ?? undefined;
  }

  if (!token && !isLogin && !isApi) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + request.nextUrl.search);
    const res = NextResponse.redirect(url);
    res.cookies.delete(TOKEN_COOKIE);
    return res;
  }
  if (token && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (refreshed) {
    // Let this request (route handlers, pages) use the new token, and store it in the browser.
    request.cookies.set(TOKEN_COOKIE, refreshed);
    const res = NextResponse.next({ request: { headers: request.headers } });
    res.cookies.set(TOKEN_COOKIE, refreshed, cookieOptions);
    return res;
  }
  if (request.cookies.has(TOKEN_COOKIE) && !token) {
    const res = NextResponse.next();
    res.cookies.delete(TOKEN_COOKIE);
    return res;
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|webp)$).*)"],
};
