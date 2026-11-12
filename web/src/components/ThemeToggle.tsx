"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { api, json } from "@/lib/api";
import { applyTheme, currentTheme, type Theme } from "@/lib/theme";
import { useT } from "@/i18n";
import { cx } from "@/components/ui";

const OPTIONS: { value: Theme; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** Segmented light / dark / system switch. Saves to a cookie (instant) and the profile. */
export function ThemeToggle({ persist = true }: { persist?: boolean }) {
  const t = useT();
  // The theme lives on <html data-theme>; follow it so every toggle on the page stays in sync.
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "system" as Theme);

  const choose = (value: Theme) => {
    applyTheme(value);
    if (persist) api("me", { method: "PATCH", ...json({ theme: value }) }).catch(() => undefined);
  };

  return (
    <div role="radiogroup" aria-label={t("theme.label")} className="inline-flex rounded-md border border-border p-0.5">
      {OPTIONS.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          title={t(`theme.${value}`)}
          onClick={() => choose(value)}
          className={cx(
            "inline-flex size-7 items-center justify-center rounded",
            theme === value ? "bg-foreground text-background" : "text-muted hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
          <span className="sr-only">{t(`theme.${value}`)}</span>
        </button>
      ))}
    </div>
  );
}
