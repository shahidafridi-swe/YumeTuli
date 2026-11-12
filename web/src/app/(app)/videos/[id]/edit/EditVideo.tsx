"use client";

import { useParams } from "next/navigation";
import { useVideo } from "@/lib/queries";
import { useT } from "@/i18n";
import { Alert, PageHeader, Spinner } from "@/components/ui";
import { VideoForm } from "@/components/VideoForm";

export function EditVideo() {
  const t = useT();
  const id = Number(useParams<{ id: string }>().id);
  const { data: video, isLoading } = useVideo(id);

  if (isLoading) return <Spinner />;
  if (!video) return <Alert title={t("common.notFound")} />;

  return (
    <div className="max-w-3xl">
      <PageHeader title={t("videoForm.editTitle")} subtitle={video.title} />
      {video.status === "draft" ? <VideoForm video={video} /> : <Alert title={t("videoForm.onlyDrafts")} />}
    </div>
  );
}
