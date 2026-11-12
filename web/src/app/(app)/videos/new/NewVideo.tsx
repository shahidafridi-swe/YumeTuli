"use client";

import { useT } from "@/i18n";
import { PageHeader } from "@/components/ui";
import { VideoForm } from "@/components/VideoForm";

export function NewVideo() {
  const t = useT();
  return (
    <div className="max-w-3xl">
      <PageHeader title={t("videos.new")} subtitle={t("videoForm.newSubtitle")} />
      <VideoForm />
    </div>
  );
}
