"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError, json } from "@/lib/api";
import type { Series } from "@/lib/types";
import { useT } from "@/i18n";
import { Alert, Button, Card, Field, Input, Select, Textarea } from "@/components/ui";

export function SeriesForm({ series }: { series?: Series }) {
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const err = (name: string) => errors[name]?.[0];

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    let theme: unknown = null;
    const themeText = String(f.get("theme") ?? "").trim();
    if (themeText) {
      try {
        theme = JSON.parse(themeText);
      } catch {
        setErrors({ theme: [t("seriesForm.invalidJson")] });
        return;
      }
    }
    const body = {
      ...(series ? {} : { slug: f.get("slug") }),
      name: f.get("name"),
      folder: f.get("folder"),
      logo_path: f.get("logo_path") || null,
      outro: f.get("outro") || null,
      theme,
      rules: f.get("rules") || null,
    };
    setSaving(true);
    setErrors({});
    setMessage(null);
    try {
      await api(series ? `series/${series.id}` : "series", { method: series ? "PATCH" : "POST", ...json(body) });
      qc.invalidateQueries({ queryKey: ["series"] });
      router.push("/series");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors);
        setMessage(error.message);
      }
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!series || !window.confirm(t("seriesForm.confirmDelete", { name: series.name }))) return;
    try {
      await api(`series/${series.id}`, { method: "DELETE" });
      qc.invalidateQueries({ queryKey: ["series"] });
      router.push("/series");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("common.unexpectedError"));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {message ? <Alert title={t("seriesForm.couldNotSave")}>{message}</Alert> : null}
      <Card title={t("seriesForm.basics")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("seriesForm.name")} htmlFor="name" error={err("name")}>
            <Input id="name" name="name" required defaultValue={series?.name} />
          </Field>
          <Field label={t("seriesForm.slug")} htmlFor="slug" error={err("slug")} hint={series ? t("videoForm.fixedAfterCreate") : t("seriesForm.slugHint")}>
            <Input id="slug" name="slug" required disabled={!!series} defaultValue={series?.slug} pattern="[a-z0-9-]+" />
          </Field>
          <Field label={t("seriesForm.folder")} htmlFor="folder" error={err("folder")} hint={t("seriesForm.folderHint")}>
            <Input id="folder" name="folder" required defaultValue={series?.folder} pattern="[a-z0-9-]+" />
          </Field>
          <Field label={t("seriesForm.logo")} htmlFor="logo_path" error={err("logo_path")} hint={t("seriesForm.logoHint")}>
            <Input id="logo_path" name="logo_path" defaultValue={series?.logo_path ?? ""} placeholder="brand/…png" />
          </Field>
          <Field label={t("series.outroLabel")} htmlFor="outro" error={err("outro")}>
            <Select id="outro" name="outro" defaultValue={series?.outro ?? ""}>
              <option value="">{t("series.none")}</option>
              <option value="devdiary">Dev Diary</option>
              <option value="hizibizi">hizibizi</option>
            </Select>
          </Field>
        </div>
      </Card>
      <Card title={t("seriesForm.style")}>
        <div className="space-y-4">
          <Field label={t("seriesForm.theme")} htmlFor="theme" error={err("theme")} hint={t("seriesForm.themeHint")}>
            <Textarea id="theme" name="theme" rows={5} className="font-mono text-[13px]" defaultValue={series?.theme ? JSON.stringify(series.theme, null, 2) : ""} />
          </Field>
          <Field label={t("seriesForm.rules")} htmlFor="rules" error={err("rules")} hint={t("seriesForm.rulesHint")}>
            <Textarea id="rules" name="rules" rows={10} defaultValue={series?.rules ?? ""} />
          </Field>
        </div>
      </Card>
      <div className="flex flex-wrap justify-between gap-2">
        {series ? (
          <Button type="button" variant="ghost" onClick={remove}>
            <Trash2 className="size-4" aria-hidden />
            {t("common.delete")}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            {t("common.save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
