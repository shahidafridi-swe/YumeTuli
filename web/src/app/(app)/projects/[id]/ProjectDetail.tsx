"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, ImageUp, Plus, RefreshCw, Sparkles, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError, json } from "@/lib/api";
import { keys, useProject } from "@/lib/queries";
import type { OutroMode, Project, VideoFormat } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import { useT } from "@/i18n";
import { Alert, Button, Card, cx, Input, LinkButton, PageHeader, Spinner, Textarea } from "@/components/ui";
import { LogoPreview } from "@/components/LogoPreview";
import { FormatIcon } from "@/components/FormatIcon";

const MODES: OutroMode[] = ["common", "custom", "video", "none"];

export function ProjectDetail() {
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const id = Number(useParams<{ id: string }>().id);
  const { data: project, isLoading } = useProject(id);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  if (isLoading) return <Spinner />;
  if (!project) return <Alert title={t("common.notFound")} />;

  /** Runs an API call, stores the returned project, shows errors. */
  const call = async (key: string, path: string, init: RequestInit) => {
    setBusy(key);
    setError(null);
    try {
      const { data } = await api<{ data: Project }>(path, init);
      qc.setQueryData(keys.project(id), data);
      qc.invalidateQueries({ queryKey: ["projects"] });
    } catch (e) {
      setError(e instanceof ApiError ? Object.values(e.errors)[0]?.[0] ?? e.message : t("common.unexpectedError"));
    } finally {
      setBusy(null);
    }
  };

  const upload = (key: string, path: string, field: string, file: File, extra: Record<string, string> = {}) => {
    const form = new FormData();
    form.set(field, file);
    Object.entries(extra).forEach(([k, v]) => form.set(k, v));
    return call(key, path, { method: "POST", body: form });
  };

  const remove = async () => {
    if (!window.confirm(t("projects.confirmDelete", { name: project.name }))) return;
    try {
      await api(`projects/${id}`, { method: "DELETE" });
      qc.invalidateQueries({ queryKey: ["projects"] });
      router.push("/projects");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("common.unexpectedError"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        subtitle={<span className="font-mono text-xs">{project.slug}</span>}
        actions={
          <Button variant="ghost" onClick={remove}>
            <Trash2 className="size-4" aria-hidden />
            {t("common.delete")}
          </Button>
        }
      />
      {error ? <Alert title={t("projects.couldNotSave")}>{error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <NameCard project={project} saving={busy === "name"} onSave={(name) => call("name", `projects/${id}`, { method: "PATCH", ...json({ name }) })} />
        <LogoCard project={project} busy={busy} onUpload={(variant, file) => upload(`logo-${variant}`, `projects/${id}/logo`, "logo", file, { variant })} />
      </div>

      <OutroCard
        project={project}
        busy={busy}
        onMode={(mode) => call("mode", `projects/${id}`, { method: "PATCH", ...json({ outro_mode: mode }) })}
        onUploadVideo={(file) => upload("outro-video", `projects/${id}/outro/video`, "video", file)}
        onGenerate={(brief) => call("generate", `projects/${id}/outro/custom`, { method: "POST", ...json({ brief }) })}
        onRerender={() => call("rerender", `projects/${id}/outro/preview`, { method: "POST" })}
      />

      <Card
        title={t("projects.series")}
        actions={
          <LinkButton href={`/series/new?project=${id}`} variant="secondary">
            <Plus className="size-4" aria-hidden />
            {t("series.new")}
          </LinkButton>
        }
      >
        {project.series?.length ? (
          <ul className="divide-y divide-border">
            {project.series.map((s) => (
              <li key={s.id}>
                <Link href={`/series/${s.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:underline">
                  <span>
                    <span className="font-medium">{s.name}</span>
                    <span className="ml-2 font-mono text-xs text-muted">{s.folder}/</span>
                  </span>
                  <span className="text-sm text-muted">{t("series.videos", { count: s.videos_count ?? 0 })}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("projects.noSeries")}</p>
        )}
      </Card>
    </div>
  );
}

function NameCard({ project, saving, onSave }: { project: Project; saving: boolean; onSave: (name: string) => void }) {
  const t = useT();
  const [name, setName] = useState(project.name);
  return (
    <Card title={t("projects.details")}>
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim() && name !== project.name) onSave(name.trim());
        }}
      >
        <label className="flex-1 space-y-1.5">
          <span className="block text-sm font-medium">{t("projects.name")}</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <Button type="submit" loading={saving} disabled={!name.trim() || name === project.name}>
          <Check className="size-4" aria-hidden />
          {t("common.save")}
        </Button>
      </form>
      <p className="mt-3 text-xs text-muted">{t("projects.detailsHint")}</p>
    </Card>
  );
}

function FilePick({ accept, label, loading, onPick, icon: Icon = Upload }: { accept: string; label: string; loading: boolean; onPick: (f: File) => void; icon?: typeof Upload }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
      <Button type="button" loading={loading} onClick={() => input.current?.click()}>
        <Icon className="size-4" aria-hidden />
        {label}
      </Button>
    </>
  );
}

function LogoCard({ project, busy, onUpload }: { project: Project; busy: string | null; onUpload: (variant: "main" | "alt", file: File) => void }) {
  const t = useT();
  return (
    <Card title={t("projects.logo")}>
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{t("projects.mainLogo")}</p>
            <FilePick accept=".png,.webp,.svg,image/png,image/webp,image/svg+xml" label={project.logo_url ? t("projects.replace") : t("projects.upload")} loading={busy === "logo-main"} onPick={(f) => onUpload("main", f)} icon={ImageUp} />
          </div>
          <LogoPreview src={project.logo_url} alt={t("projects.mainLogo")} className="h-28" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {t("projects.altLogo")} <span className="font-normal text-muted">· {t("projects.optional")}</span>
            </p>
            <FilePick accept=".png,.webp,.svg,image/png,image/webp,image/svg+xml" label={project.logo_alt_url ? t("projects.replace") : t("projects.upload")} loading={busy === "logo-alt"} onPick={(f) => onUpload("alt", f)} icon={ImageUp} />
          </div>
          <LogoPreview src={project.logo_alt_url} alt={t("projects.altLogo")} className="h-20" />
        </div>
        <p className="text-xs text-muted">{t("projects.logoHint")}</p>
      </div>
    </Card>
  );
}

function OutroCard({
  project,
  busy,
  onMode,
  onUploadVideo,
  onGenerate,
  onRerender,
}: {
  project: Project;
  busy: string | null;
  onMode: (m: OutroMode) => void;
  onUploadVideo: (f: File) => void;
  onGenerate: (brief: string) => void;
  onRerender: () => void;
}) {
  const t = useT();
  const { outro } = project;
  const [format, setFormat] = useState<VideoFormat>("vertical");
  const [brief, setBrief] = useState(outro.brief ?? "");
  const working = outro.status === "rendering" || outro.status === "generating";
  const preview = format === "vertical" ? outro.preview_vertical_url : outro.preview_landscape_url;

  return (
    <Card title={t("projects.outro")} actions={outro.mode !== "none" ? <Button variant="ghost" onClick={onRerender} disabled={working} loading={busy === "rerender"}><RefreshCw className="size-4" aria-hidden />{t("outro.rerender")}</Button> : null}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">{t("outro.type")}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={outro.mode === m}
                  disabled={working || busy === "mode"}
                  onClick={() => outro.mode !== m && onMode(m)}
                  className={cx("rounded-md border p-3 text-left disabled:opacity-60", outro.mode === m ? "border-foreground ring-1 ring-foreground" : "border-border hover:bg-surface")}
                >
                  <span className="block text-sm font-medium">{t(`outro.modes.${m}`)}</span>
                  <span className="block text-xs text-muted">{t(`outro.hints.${m}`)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2 rounded-md border border-border p-4">
            <p className="text-sm font-medium">{t("outro.customTitle")}</p>
            <p className="text-xs text-muted">{outro.key ? t("outro.customCurrent", { key: outro.key }) : t("outro.customNone")}</p>
            <Textarea rows={3} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder={t("outro.briefPlaceholder")} maxLength={2000} />
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => onGenerate(brief)} disabled={working || !project.logo_url} loading={busy === "generate"}>
                <Sparkles className="size-4" aria-hidden />
                {t("outro.generate")}
              </Button>
            </div>
          </div>

          <div className="space-y-2 rounded-md border border-border p-4">
            <p className="text-sm font-medium">{t("outro.uploadTitle")}</p>
            <p className="text-xs text-muted">
              {outro.video_url ? t("outro.uploadCurrent", { length: formatDuration(outro.duration_sec) }) : t("outro.uploadHint")}
            </p>
            <div className="flex justify-end">
              <FilePick accept=".mp4,.mov,.webm,video/*" label={outro.video_url ? t("projects.replace") : t("projects.upload")} loading={busy === "outro-video"} onPick={onUploadVideo} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{t("outro.preview")}</p>
            <div role="tablist" className="inline-flex rounded-md border border-border p-0.5">
              {(["vertical", "landscape"] as const).map((f) => (
                <button key={f} role="tab" aria-selected={format === f} title={t(`formats.${f}.name`)} onClick={() => setFormat(f)} className={cx("inline-flex size-7 items-center justify-center rounded", format === f ? "bg-foreground text-background" : "text-muted")}>
                  <FormatIcon format={f} className="size-4" />
                </button>
              ))}
            </div>
          </div>
          <div className={cx("relative mx-auto overflow-hidden rounded-md border border-border bg-[#141318]", format === "vertical" ? "aspect-[9/16] max-w-[14rem]" : "aspect-video w-full")}>
            {working ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-sm text-[#F3E9D7]">
                <Spinner className="size-6" />
                {outro.status === "generating" ? t("outro.generating") : t("outro.rendering")}
              </div>
            ) : preview ? (
              <video key={preview} src={preview} controls autoPlay muted loop playsInline className="h-full w-full object-contain" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-[#a3a3a3]">{outro.mode === "none" ? t("outro.noneHint") : t("outro.noPreview")}</div>
            )}
          </div>
          {outro.status === "failed" && outro.error ? <Alert title={t("outro.failed")}>{outro.error}</Alert> : null}
        </div>
      </div>
    </Card>
  );
}
