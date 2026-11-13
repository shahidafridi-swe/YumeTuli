"use client";

import { useSearchParams } from "next/navigation";
import { useT } from "@/i18n";
import { PageHeader } from "@/components/ui";
import { SeriesForm } from "@/components/SeriesForm";

export function NewSeries() {
  const t = useT();
  const project = Number(useSearchParams().get("project")) || undefined;
  return (
    <div className="max-w-3xl">
      <PageHeader title={t("series.new")} />
      <SeriesForm projectId={project} />
    </div>
  );
}
