import type { Metadata } from "next";
import { Suspense } from "react";
import { VideoList } from "./VideoList";

export const metadata: Metadata = { title: "Videos" };

export default function Page() {
  return (
    <Suspense>
      <VideoList />
    </Suspense>
  );
}
