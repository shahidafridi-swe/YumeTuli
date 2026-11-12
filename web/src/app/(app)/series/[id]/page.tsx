import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui";
import { EditSeries } from "./EditSeries";

export const metadata: Metadata = { title: "Series" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <EditSeries />
    </Suspense>
  );
}
