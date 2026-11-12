"use client";

import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, json } from "@/lib/api";
import { useMe } from "@/lib/queries";
import type { Health } from "@/lib/types";
import { LOCALES, useT } from "@/i18n";
import { Alert, Button, Card, Field, Input, PageHeader, Select, Spinner } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";

const TIMEZONES = ["Asia/Dhaka", "Asia/Kolkata", "Asia/Dubai", "Asia/Tokyo", "Europe/London", "America/New_York", "UTC"];

export function Settings() {
  const t = useT();
  const qc = useQueryClient();
  const me = useMe();
  const health = useQuery({ queryKey: ["health"], queryFn: () => api<Health>("health"), refetchInterval: 30_000 });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await api("me", { method: "PATCH", ...json({ name: f.get("name"), locale: f.get("locale"), timezone: f.get("timezone") }) });
      qc.invalidateQueries({ queryKey: ["me"] });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.unexpectedError"));
    } finally {
      setSaving(false);
    }
  };

  if (me.isLoading) return <Spinner />;
  const user = me.data;
  const zones = user && !TIMEZONES.includes(user.timezone) ? [user.timezone, ...TIMEZONES] : TIMEZONES;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={t("settings.title")} />
      <Card title={t("settings.profile")}>
        <form onSubmit={submit} className="space-y-4">
          {error ? <Alert title={t("settings.couldNotSave")}>{error}</Alert> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("settings.name")} htmlFor="name">
              <Input id="name" name="name" defaultValue={user?.name} required />
            </Field>
            <Field label={t("settings.email")} htmlFor="email" hint={t("settings.emailHint")}>
              <Input id="email" value={user?.email ?? ""} disabled />
            </Field>
            <Field label={t("settings.language")} htmlFor="locale" hint={t("settings.languageHint")}>
              <Select id="locale" name="locale" defaultValue={user?.locale}>
                {LOCALES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("settings.timezone")} htmlFor="timezone">
              <Select id="timezone" name="timezone" defaultValue={user?.timezone}>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex items-center justify-end gap-3">
            {saved ? <span className="text-sm text-muted">✓ {t("settings.saved")}</span> : null}
            <Button type="submit" variant="primary" loading={saving}>
              {t("common.save")}
            </Button>
          </div>
        </form>
      </Card>

      <Card title={t("settings.appearance")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">{t("settings.themeHint")}</p>
          <ThemeToggle />
        </div>
      </Card>

      <Card title={t("settings.system")}>
        {health.isLoading ? (
          <Spinner />
        ) : (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted">API</dt>
            <dd>{health.data ? "● ok" : "○ down"}</dd>
            <dt className="text-muted">{t("settings.database")}</dt>
            <dd>{health.data?.database === "ok" ? "● ok" : "○ down"}</dd>
            <dt className="text-muted">Laravel</dt>
            <dd className="font-mono">{health.data?.laravel ?? "—"}</dd>
            <dt className="text-muted">PHP</dt>
            <dd className="font-mono">{health.data?.php ?? "—"}</dd>
          </dl>
        )}
      </Card>
    </div>
  );
}
