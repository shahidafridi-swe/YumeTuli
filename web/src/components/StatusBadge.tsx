"use client";

import { Circle, CircleCheck, CircleDashed, CircleDot, CircleX, Eye, LoaderCircle, PauseCircle } from "lucide-react";
import type { RunStatus, VideoStatus } from "@/lib/types";
import { useT } from "@/i18n";
import { cx } from "@/components/ui";

// Monochrome: each status has its own icon and fill style instead of a colour.
const ICONS: Record<VideoStatus, { icon: typeof Circle; spin?: boolean; solid?: boolean }> = {
  draft: { icon: CircleDashed },
  queued: { icon: PauseCircle },
  planning: { icon: LoaderCircle, spin: true },
  awaiting_approval: { icon: CircleDot, solid: true },
  building: { icon: LoaderCircle, spin: true },
  review: { icon: Eye, solid: true },
  ready: { icon: CircleCheck },
  failed: { icon: CircleX, solid: true },
  cancelled: { icon: Circle },
};

export function StatusBadge({ status }: { status: VideoStatus }) {
  const t = useT();
  const { icon: Icon, spin, solid } = ICONS[status] ?? ICONS.draft;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        solid ? "border-foreground bg-foreground text-background" : "border-strong",
      )}
    >
      <Icon className={cx("size-3.5", spin && "animate-spin")} aria-hidden />
      {t(`status.${status}`)}
    </span>
  );
}

const RUN_ICONS: Record<RunStatus, { icon: typeof Circle; spin?: boolean }> = {
  queued: { icon: PauseCircle },
  running: { icon: LoaderCircle, spin: true },
  succeeded: { icon: CircleCheck },
  failed: { icon: CircleX },
  cancelled: { icon: Circle },
};

export function RunStatusText({ status }: { status: RunStatus }) {
  const t = useT();
  const { icon: Icon, spin } = RUN_ICONS[status];
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <Icon className={cx("size-3.5", spin && "animate-spin")} aria-hidden />
      {t(`runStatus.${status}`)}
    </span>
  );
}
