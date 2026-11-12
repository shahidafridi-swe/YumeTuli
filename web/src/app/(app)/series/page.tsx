import type { Metadata } from "next";
import { SeriesList } from "./SeriesList";

export const metadata: Metadata = { title: "Series" };

export default function Page() {
  return <SeriesList />;
}
