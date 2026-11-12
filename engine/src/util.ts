import { staticFile } from "remotion";

export const projectFile = (project: string, rel: string) =>
  staticFile(`projects/${project}/${rel}`);
