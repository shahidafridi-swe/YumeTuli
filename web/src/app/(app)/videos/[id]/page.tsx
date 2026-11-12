import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui";
import { VideoDetail } from "./VideoDetail";

export const metadata: Metadata = { title: "Video" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <VideoDetail />
    </Suspense>
  );
}
