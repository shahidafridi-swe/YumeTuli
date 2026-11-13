"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useProjects } from "@/lib/queries";
import { useT } from "@/i18n";
import { EmptyState, LinkButton, PageHeader, Spinner } from "@/components/ui";
import { LogoPreview } from "@/components/LogoPreview";

export function ProjectList() {
  const t = useT();
  const { data, isLoading } = useProjects();

  return (
    <>
      <PageHeader
        title={t("projects.title")}
        subtitle={t("projects.subtitle")}
        actions={
          <LinkButton href="/projects/new" variant="primary">
            <Plus className="size-4" aria-hidden />
            {t("projects.new")}
          </LinkButton>
        }
      />
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState title={t("projects.empty")} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {data.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`} className="flex h-full gap-4 rounded-lg border border-border p-4 hover:border-foreground">
                <LogoPreview src={p.logo_url} alt={p.name} className="h-20 w-40 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {t("projects.seriesCount", { count: p.series_count ?? 0 })} · {t("series.videos", { count: p.videos_count ?? 0 })}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {t("projects.outro")}: {t(`outro.modes.${p.outro.mode}`)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
