import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui";
import { ProjectDetail } from "./ProjectDetail";

export const metadata: Metadata = { title: "Project" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <ProjectDetail />
    </Suspense>
  );
}
