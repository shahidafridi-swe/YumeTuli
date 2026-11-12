// Browser-side API client. Calls go through the Next.js BFF (/api/*), which adds the JWT.
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`/api/${path.replace(/^\//, "")}`, { ...init, headers });

  if (res.status === 401) {
    const next = window.location.pathname + window.location.search;
    // Full reload on purpose: drops all cached data from the expired session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
    throw new ApiError(401, "Unauthenticated");
  }
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message ?? res.statusText, data.errors ?? {});
  return data as T;
}

export const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });
