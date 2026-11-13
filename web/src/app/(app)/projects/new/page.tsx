import type { Metadata } from "next";
import { NewProject } from "./NewProject";

export const metadata: Metadata = { title: "New project" };

export default function Page() {
  return <NewProject />;
}
