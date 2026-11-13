"use client";

import { useRouter } from "next/navigation";
import { FileUp, Music } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { groupSeries, useSeriesList } from "@/lib/queries";
import type { Video, VideoFormat } from "@/lib/types";
import { formatBytes } from "@/lib/format";
import { useT } from "@/i18n";
import { FormatIcon } from "@/components/FormatIcon";
import { Alert, Button, Card, Field, Input, Select, Textarea } from "@/components/ui";

/** Create a video (series, script, voice) or edit a draft. */
export function VideoForm({ video }: { video?: Video }) {
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const series = useSeriesList();
  const editing = !!video;
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"draft" | "plan" | null>(null);
  const [script, setScript] = useState(video?.script ?? "");
  const [voice, setVoice] = useState<File | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<VideoFormat>(video?.format ?? "vertical");
  const scriptFile = useRef<HTMLInputElement>(null);

  const err = (name: string) => errors[name]?.[0];

  const pickVoice = (file: File | null) => {
    setVoice(file);
    if (voiceUrl) URL.revokeObjectURL(voiceUrl);
    setVoiceUrl(file ? URL.createObjectURL(file) : null);
  };

  const loadScript = async (file: File | undefined) => {
    if (file) setScript(await file.text());
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const intent = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value === "plan" ? "plan" : "draft";
    const form = new FormData(e.currentTarget);
    form.set("script", script);
    form.delete("voice");
    if (voice) form.set("voice", voice);
    if (!form.get("target_seconds")) form.delete("target_seconds");
    if (editing) form.set("_method", "PATCH");

    setSubmitting(intent);
    setErrors({});
    setMessage(null);
    try {
      const { data } = await api<{ data: Video }>(editing ? `videos/${video.id}` : "videos", { method: "POST", body: form });
      if (intent === "plan") await api(`videos/${data.id}/plan`, { method: "POST" });
      qc.invalidateQueries({ queryKey: ["videos"] });
      qc.invalidateQueries({ queryKey: ["video", data.id] });
      router.push(`/videos/${data.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors);
        setMessage(error.message);
      } else {
        setMessage(t("common.unexpectedError"));
      }
      setSubmitting(null);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {message ? <Alert title={t("videoForm.couldNotSave")}>{message}</Alert> : null}

      <Card title={t("videoForm.basics")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("videoForm.title")} htmlFor="title" error={err("title")}>
            <Input id="title" name="title" required maxLength={160} defaultValue={video?.title} placeholder={t("videoForm.titlePlaceholder")} />
          </Field>
          <Field label={t("videos.series")} htmlFor="series_id" error={err("series_id")} hint={editing ? t("videoForm.fixedAfterCreate") : undefined}>
            <Select id="series_id" name="series_id" required disabled={editing} defaultValue={video?.series?.id ?? ""}>
              <option value="" disabled>
                {t("videoForm.chooseSeries")}
              </option>
              {groupSeries(series.data).map(([project, items]) => (
                <optgroup key={project} label={project}>
                  {items.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </Field>
          <Field label={t("videos.language")} htmlFor="language" error={err("language")} hint={editing ? t("videoForm.fixedAfterCreate") : undefined}>
            <Select id="language" name="language" disabled={editing} defaultValue={video?.language ?? "bn"}>
              <option value="bn">{t("languages.bn")}</option>
              <option value="en">{t("languages.en")}</option>
            </Select>
          </Field>
          <Field label={t("videoForm.targetSeconds")} htmlFor="target_seconds" error={err("target_seconds")} hint={t("videoForm.targetHint")}>
            <Input id="target_seconds" name="target_seconds" type="number" min={10} max={600} defaultValue={video?.target_seconds ?? ""} />
          </Field>
          <Field label={t("videoForm.mode")} htmlFor="mode" error={err("mode")} hint={t("videoForm.modeHint")}>
            <Select id="mode" name="mode" defaultValue={video?.mode ?? "agent"}>
              <option value="agent">{t("videoForm.modeAgent")}</option>
              <option value="template" disabled>
                {t("videoForm.modeTemplate")}
              </option>
            </Select>
          </Field>
        </div>
      </Card>

      <Card title={t("videoForm.format")}>
        <fieldset>
          <legend className="sr-only">{t("videoForm.format")}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["vertical", "landscape"] as const).map((f) => (
              <label
                key={f}
                className={`flex cursor-pointer items-center gap-4 rounded-md border p-4 ${format === f ? "border-foreground ring-1 ring-foreground" : "border-border hover:bg-surface"}`}
              >
                <input type="radio" name="format" value={f} checked={format === f} onChange={() => setFormat(f)} className="sr-only" />
                <FormatIcon format={f} className="h-12 w-12 shrink-0" />
                <span>
                  <span className="block font-medium">{t(`formats.${f}.name`)}</span>
                  <span className="block text-sm text-muted">{t(`formats.${f}.hint`)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {err("format") ? <p className="mt-2 text-sm font-medium">✕ {err("format")}</p> : null}
      </Card>

      <Card title={t("videoForm.context")}>
        <Field label={t("videoForm.contextLabel")} htmlFor="context" error={err("context")} hint={t("videoForm.contextHint")}>
          <Textarea id="context" name="context" rows={4} maxLength={5000} defaultValue={video?.context ?? ""} />
        </Field>
      </Card>

      <Card
        title={t("videoForm.script")}
        actions={
          <>
            <input ref={scriptFile} type="file" accept=".md,.txt,text/plain,text/markdown" className="hidden" onChange={(e) => loadScript(e.target.files?.[0])} />
            <Button type="button" variant="ghost" onClick={() => scriptFile.current?.click()}>
              <FileUp className="size-4" aria-hidden />
              {t("videoForm.loadFile")}
            </Button>
          </>
        }
      >
        <Field label={t("videoForm.scriptLabel")} htmlFor="script" error={err("script")} hint={t("videoForm.scriptHint")}>
          <Textarea id="script" rows={14} value={script} onChange={(e) => setScript(e.target.value)} className="font-mono text-[13px]" required />
        </Field>
      </Card>

      <Card title={t("videoForm.voice")}>
        <Field
          label={editing ? t("videoForm.replaceVoice") : t("videoForm.voiceLabel")}
          htmlFor="voice"
          error={err("voice")}
          hint={t("videoForm.voiceHint")}
        >
          <label
            htmlFor="voice"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pickVoice(e.dataTransfer.files?.[0] ?? null);
            }}
            className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-strong px-4 py-5 hover:bg-surface"
          >
            <Music className="size-5 shrink-0" aria-hidden />
            <span className="min-w-0 text-sm">
              {voice ? (
                <>
                  <span className="block truncate font-medium">{voice.name}</span>
                  <span className="text-muted">{formatBytes(voice.size)}</span>
                </>
              ) : editing && video.voice ? (
                <>
                  <span className="block truncate font-medium">{video.voice.original_name}</span>
                  <span className="text-muted">{t("videoForm.currentVoice")}</span>
                </>
              ) : (
                <span className="text-muted">{t("videoForm.dropVoice")}</span>
              )}
            </span>
          </label>
          <input id="voice" type="file" accept=".mp3,.wav,.m4a,audio/*" className="sr-only" onChange={(e) => pickVoice(e.target.files?.[0] ?? null)} />
        </Field>
        {voiceUrl || (editing && video.voice) ? (
          <audio controls src={voiceUrl ?? video?.voice?.url} className="mt-3 w-full" preload="metadata" />
        ) : null}
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" value="draft" loading={submitting === "draft"} disabled={!!submitting}>
          {editing ? t("videoForm.saveChanges") : t("videoForm.saveDraft")}
        </Button>
        <Button type="submit" value="plan" variant="primary" loading={submitting === "plan"} disabled={!!submitting}>
          {t("videoForm.saveAndPlan")}
        </Button>
      </div>
    </form>
  );
}
