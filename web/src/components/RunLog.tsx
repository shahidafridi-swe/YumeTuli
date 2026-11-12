"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronRight, CircleCheck, FileText, MessageSquare, Terminal, XCircle } from "lucide-react";
import { useRunEvents } from "@/lib/queries";
import type { RunEvent } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { useI18n } from "@/i18n";
import { cx, Spinner } from "@/components/ui";

const COMPACT = new Set(["status", "tool", "error", "denied", "result"]);

function Icon({ type }: { type: string }) {
  const cls = "mt-0.5 size-3.5 shrink-0";
  switch (type) {
    case "tool":
      return <Terminal className={cls} aria-hidden />;
    case "text":
      return <MessageSquare className={cls} aria-hidden />;
    case "result":
      return <CircleCheck className={cls} aria-hidden />;
    case "error":
    case "tool_error":
      return <XCircle className={cls} aria-hidden />;
    case "denied":
    case "stderr":
      return <AlertTriangle className={cls} aria-hidden />;
    case "tool_result":
      return <ChevronRight className={cls} aria-hidden />;
    default:
      return <FileText className={cls} aria-hidden />;
  }
}

/** Live log of one run. Compact view shows steps and commands; details adds Claude's text and command output. */
export function RunLog({ runId, live }: { runId: number; live: boolean }) {
  const { t, locale } = useI18n();
  const { data: events, isLoading } = useRunEvents(runId);
  const [details, setDetails] = useState(false);
  const box = useRef<HTMLOListElement>(null);
  const stick = useRef(true);

  const shown = (events ?? []).filter((e) => details || COMPACT.has(e.type));

  useEffect(() => {
    if (stick.current && box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [shown.length]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span>{t("log.lines", { count: shown.length })}</span>
        <label className="inline-flex cursor-pointer items-center gap-1.5">
          <input type="checkbox" checked={details} onChange={(e) => setDetails(e.target.checked)} className="accent-current" />
          {t("log.details")}
        </label>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <ol
          ref={box}
          onScroll={(e) => {
            const el = e.currentTarget;
            stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
          }}
          className="max-h-[28rem] space-y-1 overflow-y-auto rounded-md border border-border bg-surface p-2 font-mono text-xs"
          aria-live={live ? "polite" : "off"}
        >
          {shown.length === 0 ? <li className="p-2 text-muted">{t("log.empty")}</li> : null}
          {shown.map((e: RunEvent) => (
            <li key={e.id} className={cx("flex gap-2 rounded px-1.5 py-1", (e.type === "error" || e.type === "result") && "bg-background font-semibold")}>
              <Icon type={e.type} />
              <span className="shrink-0 text-muted tabular-nums">{formatTime(e.created_at, locale)}</span>
              <span className="min-w-0 flex-1 break-words whitespace-pre-wrap">
                {e.step && e.type === "tool" ? <span className="mr-1.5 rounded border border-strong px-1 font-sans">{e.step}</span> : null}
                {(e.message ?? "").slice(0, details ? 4000 : 300)}
              </span>
            </li>
          ))}
          {live ? (
            <li className="flex items-center gap-2 px-1.5 py-1 text-muted">
              <Spinner className="size-3.5" /> {t("log.waiting")}
            </li>
          ) : null}
        </ol>
      )}
    </div>
  );
}
