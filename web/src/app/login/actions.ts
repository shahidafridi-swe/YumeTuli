"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiBase, cookieOptions, TOKEN_COOKIE } from "@/lib/session";

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");

  let res: Response;
  try {
    res = await fetch(`${apiBase()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { error: "api_unreachable", email };
  }

  if (res.status === 429) return { error: "too_many_attempts", email };
  if (!res.ok) return { error: "invalid_credentials", email };

  const { access_token } = (await res.json()) as { access_token: string };
  (await cookies()).set(TOKEN_COOKIE, access_token, cookieOptions);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;
  if (token) {
    await fetch(`${apiBase()}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    }).catch(() => undefined);
  }
  jar.delete(TOKEN_COOKIE);
  redirect("/login");
}
