"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError, json } from "@/lib/api";
import type { Project } from "@/lib/types";
import { useT } from "@/i18n";
import { Alert, Button, Card, Field, Input, PageHeader } from "@/components/ui";

export function NewProject() {
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    setErrors({});
    setMessage(null);
    try {
      const { data } = await api<{ data: Project }>("projects", { method: "POST", ...json({ name: f.get("name"), slug }) });
      qc.invalidateQueries({ queryKey: ["projects"] });
      router.push(`/projects/${data.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors);
        setMessage(error.message);
      }
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <PageHeader title={t("projects.new")} subtitle={t("projects.newSubtitle")} />
      <form onSubmit={submit} className="space-y-6" noValidate>
        {message ? <Alert title={t("projects.couldNotSave")}>{message}</Alert> : null}
        <Card>
          <div className="space-y-4">
            <Field label={t("projects.name")} htmlFor="name" error={errors.name?.[0]}>
              <Input
                id="name"
                name="name"
                required
                placeholder="My Channel"
                onChange={(e) => {
                  if (!slugTouched) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }}
              />
            </Field>
            <Field label={t("seriesForm.slug")} htmlFor="slug" error={errors.slug?.[0]} hint={t("seriesForm.slugHint")}>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                required
              />
            </Field>
          </div>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            {t("projects.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}
