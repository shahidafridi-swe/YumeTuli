"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useVideos } from "@/lib/queries";
import type { Video, VideoStatus } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/i18n";
import { Card, EmptyState, LinkButton, PageHeader, Spinner } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";

const RUNNING: VideoStatus[] = ["queued", "planning", "building"];
const NEEDS_YOU: VideoStatus[] = ["awaiting_approval", "review", "failed"];

export function Dashboard() {
  const { t, locale } = useI18n();
  const { data, isLoading } = useVideos(new URLSearchParams());
  const videos = data?.data ?? [];
  const running = videos.filter((v) => RUNNING.includes(v.status));
  const needsYou = videos.filter((v) => NEEDS_YOU.includes(v.status));

  const list = (items: Video[], empty: string) =>
    items.length === 0 ? (
      <p className="text-sm text-muted">{empty}</p>
    ) : (
      <ul className="divide-y divide-border">
        {items.map((v) => (
          <li key={v.id}>
            <Link href={`/videos/${v.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:underline">
              <span className="min-w-0 truncate">{v.title}</span>
              <StatusBadge status={v.status} />
            </Link>
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <PageHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
        actions={
          <LinkButton href="/videos/new" variant="primary">
            <Plus className="size-4" aria-hidden />
            {t("videos.new")}
          </LinkButton>
        }
      />
      {isLoading ? (
        <Spinner />
      ) : videos.length === 0 ? (
        <EmptyState title={t("dashboard.emptyTitle")}>{t("dashboard.emptyBody")}</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card title={t("dashboard.running")}>{list(running, t("dashboard.nothingRunning"))}</Card>
          <Card title={t("dashboard.needsYou")}>{list(needsYou, t("dashboard.nothingWaiting"))}</Card>
          <Card title={t("dashboard.recent")} className="md:col-span-2">
            <ul className="divide-y divide-border">
              {videos.slice(0, 8).map((v) => (
                <li key={v.id}>
                  <Link href={`/videos/${v.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 py-2.5 sm:grid-cols-[1fr_10rem_auto]">
                    <span className="min-w-0 truncate hover:underline">{v.title}</span>
                    <span className="hidden text-sm text-muted sm:block">{formatDate(v.updated_at, locale)}</span>
                    <StatusBadge status={v.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
