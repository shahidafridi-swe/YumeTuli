"use client";

import { useT } from "@/i18n";
import { PageHeader } from "@/components/ui";
import { SeriesForm } from "@/components/SeriesForm";

export function NewSeries() {
  const t = useT();
  return (
    <div className="max-w-3xl">
      <PageHeader title={t("series.new")} />
      <SeriesForm />
    </div>
  );
}
