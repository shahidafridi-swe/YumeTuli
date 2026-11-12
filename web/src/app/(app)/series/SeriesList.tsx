"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useSeriesList } from "@/lib/queries";
import { useT } from "@/i18n";
import { EmptyState, LinkButton, PageHeader, Spinner } from "@/components/ui";

export function SeriesList() {
  const t = useT();
  const { data, isLoading } = useSeriesList();

  return (
    <>
      <PageHeader
        title={t("series.title")}
        subtitle={t("series.subtitle")}
        actions={
          <LinkButton href="/series/new" variant="primary">
            <Plus className="size-4" aria-hidden />
            {t("series.new")}
          </LinkButton>
        }
      />
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState title={t("series.empty")} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {data.map((s) => (
            <li key={s.id}>
              <Link href={`/series/${s.id}`} className="block h-full rounded-lg border border-border p-5 hover:border-foreground">
                <p className="font-semibold">{s.name}</p>
                <p className="mt-1 font-mono text-xs text-muted">
                  {s.slug} · {s.folder}/
                </p>
                <p className="mt-3 text-sm text-muted">
                  {t("series.videos", { count: s.videos_count ?? 0 })} · {t("series.outroLabel")}: {s.outro ?? t("series.none")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
