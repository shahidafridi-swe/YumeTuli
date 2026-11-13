import type { Metadata } from "next";
import { Suspense } from "react";
import { NewSeries } from "./NewSeries";

export const metadata: Metadata = { title: "New series" };

export default function Page() {
  return (
    <Suspense>
      <NewSeries />
    </Suspense>
  );
}
