import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui";
import { EditVideo } from "./EditVideo";

export const metadata: Metadata = { title: "Edit video" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <EditVideo />
    </Suspense>
  );
}
