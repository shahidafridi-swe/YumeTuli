import { connection } from "next/server";
import { Suspense } from "react";

type Health = {
  app: string;
  laravel: string;
  php: string;
  database: string;
  time: string;
};

async function ApiStatus() {
  await connection();
  const base = process.env.API_INTERNAL_URL ?? "http://localhost:8000";
  let health: Health | null = null;
  try {
    const res = await fetch(`${base}/api/v1/health`, { cache: "no-store" });
    health = (await res.json()) as Health;
  } catch {
    health = null;
  }

  const rows: [string, string][] = health
    ? [
        ["API", "ok"],
        ["Database", health.database],
        ["Laravel", health.laravel],
        ["PHP", health.php],
      ]
    : [["API", "down"]];

  return (
    <dl className="divide-y divide-border border-y border-border">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between py-3 text-sm">
          <dt className="text-muted">{label}</dt>
          <dd className="font-mono">
            {value === "ok" ? "● ok" : value === "down" ? "○ down" : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">YumeTuli</h1>
        <p className="text-muted">Personal studio for vertical shorts.</p>
      </header>
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted">System status</h2>
        <Suspense fallback={<p className="py-3 text-sm text-muted">Checking…</p>}>
          <ApiStatus />
        </Suspense>
      </section>
    </main>
  );
}
