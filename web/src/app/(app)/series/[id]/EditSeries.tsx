"use client";

import { useParams } from "next/navigation";
import { useSeriesList } from "@/lib/queries";
import { useT } from "@/i18n";
import { Alert, PageHeader, Spinner } from "@/components/ui";
import { SeriesForm } from "@/components/SeriesForm";

export function EditSeries() {
  const t = useT();
  const id = Number(useParams<{ id: string }>().id);
  const { data, isLoading } = useSeriesList();
  const series = data?.find((s) => s.id === id);

  if (isLoading) return <Spinner />;
  if (!series) return <Alert title={t("common.notFound")} />;
  return (
    <div className="max-w-3xl">
      <PageHeader title={series.name} subtitle={`${series.project?.name ?? ""} · ${t("series.videos", { count: series.videos_count ?? 0 })}`} />
      <SeriesForm series={series} />
    </div>
  );
}
