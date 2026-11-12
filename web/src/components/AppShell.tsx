"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, LayoutDashboard, Layers, LogOut, Menu, Settings, X } from "lucide-react";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { logout } from "@/app/login/actions";
import { api } from "@/lib/api";
import { applyTheme, currentTheme } from "@/lib/theme";
import type { User } from "@/lib/types";
import { useT, type MessageKey } from "@/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cx } from "@/components/ui";

const NAV: { href: string; label: MessageKey; icon: typeof Layers }[] = [
  { href: "/", label: "nav.dashboard", icon: LayoutDashboard },
  { href: "/videos", label: "nav.videos", icon: Clapperboard },
  { href: "/series", label: "nav.series", icon: Layers },
  { href: "/settings", label: "nav.settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const me = useQuery({ queryKey: ["me"], queryFn: () => api<{ data: User }>("me").then((r) => r.data) });

  // First visit on a new browser: take the theme saved in the profile.
  useEffect(() => {
    if (me.data && !document.cookie.includes("yt_theme=") && me.data.theme !== currentTheme()) applyTheme(me.data.theme);
  }, [me.data]);

  const nav = (
    <Suspense fallback={<NavLinks pathname={null} onNavigate={() => setOpen(false)} />}>
      <CurrentNav onNavigate={() => setOpen(false)} />
    </Suspense>
  );

  const footer = (
    <div className="space-y-3 border-t border-border pt-4">
      <ThemeToggle />
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-muted" title={me.data?.email}>
          {me.data?.name ?? " "}
        </span>
        <form action={logout}>
          <button type="submit" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground">
            <LogOut className="size-3.5" aria-hidden />
            {t("nav.logout")}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-border bg-surface p-4 md:flex">
        <div className="space-y-6">
          <Link href="/" className="block px-3 text-lg font-semibold tracking-tight">
            YumeTuli
          </Link>
          {nav}
        </div>
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
          <Link href="/" className="font-semibold tracking-tight">
            YumeTuli
          </Link>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t("nav.menu")}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>
        {open ? (
          <div className="space-y-4 border-b border-border bg-surface p-4 md:hidden">
            {nav}
            {footer}
          </div>
        ) : null}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

function CurrentNav({ onNavigate }: { onNavigate: () => void }) {
  return <NavLinks pathname={usePathname()} onNavigate={onNavigate} />;
}

function NavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate: () => void }) {
  const t = useT();
  const active = (href: string) => pathname !== null && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <nav className="flex flex-col gap-0.5" aria-label={t("nav.main")}>
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? "page" : undefined}
          onClick={onNavigate}
          className={cx(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm",
            active(href) ? "bg-foreground font-medium text-background" : "text-muted hover:bg-surface hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
          {t(label)}
        </Link>
      ))}
    </nav>
  );
}
