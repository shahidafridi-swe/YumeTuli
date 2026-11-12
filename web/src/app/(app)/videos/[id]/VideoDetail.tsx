"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, Download, Pencil, Play, RotateCcw, Square, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, ApiError } from "@/lib/api";
import { useRuns, useVideo, useVideoAction } from "@/lib/queries";
import { useVideoLive } from "@/lib/useVideoLive";
import type { Run, Version, Video, VideoStatus } from "@/lib/types";
import { elapsed, formatBytes, formatDate, formatDuration } from "@/lib/format";
import { useI18n, useT, type MessageKey } from "@/i18n";
import { Alert, Button, Card, cx, LinkButton, PageHeader, Spinner, Textarea } from "@/components/ui";
import { RunStatusText, StatusBadge } from "@/components/StatusBadge";
import { RunLog } from "@/components/RunLog";

const RUNNING: VideoStatus[] = ["queued", "planning", "building"];

export function VideoDetail() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const id = Number(useParams<{ id: string }>().id);
  const { data: video, isLoading, error } = useVideo(id);
  const runs = useRuns(id);
  useVideoLive(id);

  if (isLoading) return <Spinner />;
  if (!video) return <Alert title={error instanceof ApiError && error.status === 404 ? t("common.notFound") : t("common.unexpectedError")} />;

  const running = RUNNING.includes(video.status);
  const lastRun = runs.data?.[0];

  const remove = async () => {
    if (!window.confirm(t("video.confirmDelete", { title: video.title }))) return;
    await api(`videos/${video.id}`, { method: "DELETE" });
    router.push("/videos");
  };

  return (
    <>
      <PageHeader
        title={video.title}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusBadge status={video.status} />
            <span>{video.series?.name}</span>
            <span aria-hidden>·</span>
            <span>{t(`languages.${video.language}`)}</span>
            <span aria-hidden>·</span>
            <span className="font-mono text-xs">{video.slug}</span>
          </span>
        }
        actions={
          <>
            {video.status === "draft" ? (
              <LinkButton href={`/videos/${video.id}/edit`} variant="ghost">
                <Pencil className="size-4" aria-hidden />
                {t("common.edit")}
              </LinkButton>
            ) : null}
            {!running ? (
              <Button variant="ghost" onClick={remove}>
                <Trash2 className="size-4" aria-hidden />
                {t("common.delete")}
              </Button>
            ) : null}
          </>
        }
      />

      <Steps status={video.status} lastKind={lastRun?.kind} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-6">
          <StagePanel video={video} lastRun={lastRun} />
          {video.versions && video.versions.length > 0 ? <VersionsPanel video={video} /> : null}
          {video.plan && video.status !== "awaiting_approval" ? (
            <details className="rounded-lg border border-border">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">{t("video.plan")}</summary>
              <div className="prose-mono border-t border-border p-4 text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{video.plan}</ReactMarkdown>
              </div>
            </details>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-6">
          <Card title={t("video.liveLog")} actions={lastRun ? <RunStatusText status={lastRun.status} /> : null}>
            {lastRun ? <RunLog runId={lastRun.id} live={lastRun.status === "running" || lastRun.status === "queued"} /> : <p className="text-sm text-muted">{t("log.noRuns")}</p>}
          </Card>
          <RunHistory runs={runs.data ?? []} locale={locale} />
          <InputsPanel video={video} />
        </aside>
      </div>
    </>
  );
}

/** Draft → Plan → Approve → Build → Review → Ready */
function Steps({ status, lastKind }: { status: VideoStatus; lastKind?: Run["kind"] }) {
  const t = useT();
  const steps: { key: string; label: MessageKey }[] = [
    { key: "draft", label: "steps.draft" },
    { key: "plan", label: "steps.plan" },
    { key: "approve", label: "steps.approve" },
    { key: "build", label: "steps.build" },
    { key: "review", label: "steps.review" },
    { key: "ready", label: "steps.ready" },
  ];
  const failedAt = lastKind === "plan" ? 1 : 3;
  const index: Record<VideoStatus, number> = {
    draft: 0,
    queued: lastKind === "plan" || !lastKind ? 1 : 3,
    planning: 1,
    awaiting_approval: 2,
    building: 3,
    review: 4,
    ready: 5,
    failed: failedAt,
    cancelled: 0,
  };
  const current = index[status];

  return (
    <ol className="grid grid-cols-6 gap-1" aria-label={t("steps.label")}>
      {steps.map((s, i) => (
        <li key={s.key} aria-current={i === current ? "step" : undefined} className="min-w-0">
          <div className={cx("h-1.5 rounded-full", i < current ? "bg-foreground" : i === current ? (status === "failed" ? "bg-[repeating-linear-gradient(45deg,var(--foreground)_0_4px,transparent_4px_8px)]" : "bg-foreground") : "bg-border")} />
          <p className={cx("mt-1.5 truncate text-xs", i === current ? "font-semibold" : "text-muted")}>
            {i === current && status === "failed" ? "✕ " : i < current ? "✓ " : ""}
            {t(s.label)}
          </p>
        </li>
      ))}
    </ol>
  );
}

function useNow(active: boolean) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
}

/** What the owner can do right now. */
function StagePanel({ video, lastRun }: { video: Video; lastRun?: Run }) {
  const t = useT();
  const action = useVideoAction(video.id);
  const [feedback, setFeedback] = useState("");
  const running = RUNNING.includes(video.status);
  useNow(running);

  const run = (name: Parameters<typeof action.mutate>[0]["action"], body?: unknown) =>
    action.mutate({ action: name, body }, { onSuccess: () => name === "feedback" && setFeedback("") });

  const errorBox = action.error ? <Alert title={t("video.actionFailed")}>{action.error.message}</Alert> : null;

  if (video.status === "draft") {
    return (
      <Card title={t("stage.draftTitle")}>
        <p className="mb-4 text-sm text-muted">{t("stage.draftBody")}</p>
        {errorBox}
        <Button variant="primary" loading={action.isPending} onClick={() => run("plan")}>
          <Play className="size-4" aria-hidden />
          {t("stage.makePlan")}
        </Button>
      </Card>
    );
  }

  if (running) {
    const active = video.active_run ?? lastRun;
    return (
      <Card title={t(`stage.running.${video.status as "queued" | "planning" | "building"}`)}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Spinner className="size-6" />
            <div>
              <p className="font-medium">{active?.current_step ?? t("stage.waitingForWorker")}</p>
              <p className="text-sm text-muted">
                {active?.started_at ? t("stage.elapsed", { time: elapsed(active.started_at) }) : t("stage.inQueue")}
              </p>
            </div>
          </div>
          <Button loading={action.isPending} disabled={active?.cancel_requested} onClick={() => run("cancel")}>
            <Square className="size-4" aria-hidden />
            {active?.cancel_requested ? t("stage.stopping") : t("stage.cancel")}
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted">{t("stage.runningHint")}</p>
      </Card>
    );
  }

  if (video.status === "awaiting_approval") return <PlanPanel video={video} />;

  if (video.status === "failed") {
    return (
      <Card title={t("stage.failedTitle")}>
        <Alert title={t("stage.failedReason")}>{lastRun?.error ?? t("common.unexpectedError")}</Alert>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="primary" loading={action.isPending} onClick={() => run("retry")}>
            <RotateCcw className="size-4" aria-hidden />
            {t("stage.retry")}
          </Button>
          {lastRun?.kind !== "plan" ? null : (
            <LinkButton href={`/videos/${video.id}/edit`} variant="secondary">
              <Pencil className="size-4" aria-hidden />
              {t("common.edit")}
            </LinkButton>
          )}
        </div>
        {errorBox}
      </Card>
    );
  }

  // review / ready
  return (
    <Card title={video.status === "ready" ? t("stage.readyTitle") : t("stage.reviewTitle")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (feedback.trim()) run("feedback", { feedback });
        }}
        className="space-y-3"
      >
        <label htmlFor="feedback" className="block text-sm text-muted">
          {video.status === "ready" ? t("stage.readyBody") : t("stage.reviewBody")}
        </label>
        <Textarea id="feedback" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={t("stage.feedbackPlaceholder")} maxLength={5000} />
        {errorBox}
        <div className="flex flex-wrap justify-end gap-2">
          {video.status === "review" ? (
            <Button type="button" onClick={() => run("ready")} disabled={action.isPending}>
              <Check className="size-4" aria-hidden />
              {t("stage.markReady")}
            </Button>
          ) : null}
          <Button type="submit" variant="primary" loading={action.isPending && action.variables?.action === "feedback"} disabled={!feedback.trim()}>
            {t("stage.sendFeedback")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PlanPanel({ video }: { video: Video }) {
  const t = useT();
  const action = useVideoAction(video.id);
  const [editing, setEditing] = useState(false);
  const [plan, setPlan] = useState(video.plan ?? "");

  return (
    <Card
      title={t("stage.planTitle")}
      actions={
        <Button variant="ghost" onClick={() => setEditing((e) => !e)}>
          <Pencil className="size-4" aria-hidden />
          {editing ? t("stage.preview") : t("stage.editPlan")}
        </Button>
      }
    >
      <p className="mb-4 text-sm text-muted">{t("stage.planBody")}</p>
      {editing ? (
        <Textarea rows={24} value={plan} onChange={(e) => setPlan(e.target.value)} className="font-mono text-[13px]" aria-label={t("video.plan")} />
      ) : (
        <div className="prose-mono max-h-[36rem] overflow-y-auto rounded-md border border-border p-4 text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
        </div>
      )}
      {action.error ? <div className="mt-4"><Alert title={t("video.actionFailed")}>{action.error.message}</Alert></div> : null}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button onClick={() => action.mutate({ action: "plan" })} disabled={action.isPending}>
          <RotateCcw className="size-4" aria-hidden />
          {t("stage.replan")}
        </Button>
        <Button
          variant="primary"
          loading={action.isPending && action.variables?.action === "approve"}
          onClick={() => action.mutate({ action: "approve", body: plan !== video.plan ? { plan } : undefined })}
        >
          <Check className="size-4" aria-hidden />
          {plan !== video.plan ? t("stage.approveEdited") : t("stage.approve")}
        </Button>
      </div>
    </Card>
  );
}

function VersionsPanel({ video }: { video: Video }) {
  const { t, locale } = useI18n();
  const versions = video.versions ?? [];
  const [selected, setSelected] = useState<number | null>(null);
  const version: Version | undefined = versions.find((v) => v.id === selected) ?? versions.find((v) => v.id === video.current_version?.id) ?? versions[0];
  if (!version) return null;
  const asset = (kind: string) => version.assets?.find((a) => a.kind === kind);
  const mp4 = asset("mp4");

  return (
    <Card
      title={t("versions.title")}
      actions={
        versions.length > 1 ? (
          <div role="tablist" className="flex flex-wrap gap-1">
            {versions.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={v.id === version.id}
                onClick={() => setSelected(v.id)}
                className={cx("rounded px-2 py-0.5 text-xs", v.id === version.id ? "bg-foreground text-background" : "border border-border hover:bg-surface")}
              >
                v{v.number}
              </button>
            ))}
          </div>
        ) : null
      }
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,16rem)_1fr]">
        {mp4 ? (
          <video key={mp4.url} src={mp4.url} poster={asset("thumb")?.url} controls preload="metadata" className="aspect-[9/16] w-full rounded-md border border-border bg-black" />
        ) : (
          <div className="flex aspect-[9/16] items-center justify-center rounded-md border border-dashed border-strong text-sm text-muted">{t("versions.noVideo")}</div>
        )}
        <div className="space-y-4 text-sm">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="text-muted">{t("versions.version")}</dt>
            <dd>
              v{version.number}
              {version.id === video.current_version?.id ? ` · ${t("versions.current")}` : ""}
            </dd>
            <dt className="text-muted">{t("versions.length")}</dt>
            <dd className="tabular-nums">{formatDuration(version.duration_sec)}</dd>
            <dt className="text-muted">{t("versions.created")}</dt>
            <dd>{formatDate(version.created_at, locale)}</dd>
            {version.feedback ? (
              <>
                <dt className="text-muted">{t("versions.feedback")}</dt>
                <dd className="whitespace-pre-wrap">{version.feedback}</dd>
              </>
            ) : null}
          </dl>
          <div className="flex flex-col gap-2">
            {(["mp4", "zip", "thumb"] as const).map((kind) => {
              const a = asset(kind);
              return a ? (
                <a key={kind} href={a.url} download={a.original_name ?? undefined} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 hover:bg-surface">
                  <Download className="size-4 shrink-0" aria-hidden />
                  <span className="flex-1">{t(`versions.download.${kind}`)}</span>
                  <span className="text-xs text-muted">{formatBytes(a.size)}</span>
                </a>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

function RunHistory({ runs, locale }: { runs: Run[]; locale: string }) {
  const t = useT();
  if (runs.length === 0) return null;
  return (
    <Card title={t("runs.title")}>
      <ul className="divide-y divide-border text-sm">
        {runs.slice(0, 10).map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2 py-2">
            <span className="min-w-0">
              <span className="font-medium">{t(`runs.kind.${r.kind}`)}</span>
              <span className="block truncate text-xs text-muted">
                {formatDate(r.created_at, locale)}
                {r.started_at ? ` · ${elapsed(r.started_at, r.finished_at)}` : ""}
                {r.num_turns ? ` · ${t("runs.turns", { count: r.num_turns })}` : ""}
              </span>
            </span>
            <RunStatusText status={r.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function InputsPanel({ video }: { video: Video }) {
  const t = useT();
  return (
    <Card title={t("video.inputs")}>
      <div className="space-y-4 text-sm">
        {video.voice ? (
          <div>
            <p className="mb-1.5 text-muted">{t("video.voice")}</p>
            <audio controls src={video.voice.url} preload="none" className="w-full" />
            <p className="mt-1 truncate text-xs text-muted">
              {video.voice.original_name} · {formatBytes(video.voice.size)}
            </p>
          </div>
        ) : null}
        <details>
          <summary className="cursor-pointer text-muted">{t("video.script")}</summary>
          <pre className="mt-2 max-h-80 overflow-y-auto rounded-md border border-border bg-surface p-3 font-sans text-[13px] whitespace-pre-wrap">{video.script}</pre>
        </details>
        {video.context ? (
          <details>
            <summary className="cursor-pointer text-muted">{t("video.context")}</summary>
            <p className="mt-2 whitespace-pre-wrap">{video.context}</p>
          </details>
        ) : null}
        <p className="text-xs text-muted">
          {video.target_seconds ? t("video.target", { seconds: video.target_seconds }) : t("video.noTarget")} ·{" "}
          <Link href={`/videos?series_id=${video.series?.id}`} className="underline">
            {video.series?.name}
          </Link>
        </p>
      </div>
    </Card>
  );
}
