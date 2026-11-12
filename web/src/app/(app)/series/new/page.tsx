import type { Metadata } from "next";
import { NewSeries } from "./NewSeries";

export const metadata: Metadata = { title: "New series" };

export default function Page() {
  return <NewSeries />;
}
