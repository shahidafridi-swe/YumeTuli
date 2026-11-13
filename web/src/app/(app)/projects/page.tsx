import type { Metadata } from "next";
import { ProjectList } from "./ProjectList";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectList />;
}
