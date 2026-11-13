"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { groupSeries, useSeriesList, useVideos } from "@/lib/queries";
import type { VideoStatus } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/i18n";
import { Button, EmptyState, Input, LinkButton, PageHeader, Select, Spinner } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { FormatIcon } from "@/components/FormatIcon";

const STATUSES: VideoStatus[] = ["draft", "queued", "planning", "awaiting_approval", "building", "review", "ready", "failed"];

export function VideoList() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const series = useSeriesList();
  const { data, isLoading, isFetching } = useVideos(new URLSearchParams(params.toString()));
  const [q, setQ] = useState(params.get("q") ?? "");

  const setParam = (name: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    if (name !== "page") next.delete("page");
    router.replace(`${pathname}?${next}`);
  };

  // Debounced search box.
  useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) setParam("q", q);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const meta = data?.meta;
  const page = meta?.current_page ?? 1;

  return (
    <>
      <PageHeader
        title={t("videos.title")}
        subtitle={meta ? t("videos.count", { count: meta.total }) : undefined}
        actions={
          <LinkButton href="/videos/new" variant="primary">
            <Plus className="size-4" aria-hidden />
            {t("videos.new")}
          </LinkButton>
        }
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_12rem_8rem_9rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("videos.search")} aria-label={t("videos.search")} className="pl-9" />
        </div>
        <Select value={params.get("series_id") ?? ""} onChange={(e) => setParam("series_id", e.target.value)} aria-label={t("videos.series")}>
          <option value="">{t("videos.allSeries")}</option>
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
        <Select value={params.get("status") ?? ""} onChange={(e) => setParam("status", e.target.value)} aria-label={t("videos.status")}>
          <option value="">{t("videos.allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </Select>
        <Select value={params.get("language") ?? ""} onChange={(e) => setParam("language", e.target.value)} aria-label={t("videos.language")}>
          <option value="">{t("videos.allLanguages")}</option>
          <option value="bn">{t("languages.bn")}</option>
          <option value="en">{t("languages.en")}</option>
        </Select>
        <Select value={params.get("format") ?? ""} onChange={(e) => setParam("format", e.target.value)} aria-label={t("videoForm.format")}>
          <option value="">{t("videos.allFormats")}</option>
          <option value="vertical">{t("formats.vertical.name")}</option>
          <option value="landscape">{t("formats.landscape.name")}</option>
        </Select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data?.data.length ? (
        <EmptyState title={t("videos.emptyTitle")}>{t("videos.emptyBody")}</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">{t("videos.colTitle")}</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">{t("videos.series")}</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">{t("videos.language")}</th>
                <th className="px-4 py-2.5 font-medium">{t("videos.status")}</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">{t("videos.updated")}</th>
              </tr>
            </thead>
            <tbody className={isFetching ? "opacity-60" : ""}>
              {data.data.map((v) => (
                <tr key={v.id} className="border-t border-border hover:bg-surface">
                  <td className="max-w-0 px-4 py-3">
                    <Link href={`/videos/${v.id}`} className="block truncate font-medium hover:underline">
                      {v.title}
                    </Link>
                    <span className="block truncate font-mono text-xs text-muted">{v.slug}</span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="block">{v.series?.project?.name}</span>
                    <span className="block text-xs text-muted">{v.series?.name}</span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="inline-flex items-center gap-2">
                      <FormatIcon format={v.format} className="size-4" title={t(`formats.${v.format}.name`)} />
                      {t(`languages.${v.language}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-muted lg:table-cell">{formatDate(v.updated_at, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.last_page > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <Button disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}>
            {t("common.previous")}
          </Button>
          <span className="text-muted">{t("common.pageOf", { page, total: meta.last_page })}</span>
          <Button disabled={page >= meta.last_page} onClick={() => setParam("page", String(page + 1))}>
            {t("common.next")}
          </Button>
        </div>
      ) : null}
    </>
  );
}
