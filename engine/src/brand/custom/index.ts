// Custom outros made for a project (by Claude). Each entry is drawn inside the house outro frame:
// charcoal background, 4 s, fade in/out handled by BrandOutro. Register new ones here:
//   import { MyMark } from "./p-my-project";   →   "p-my-project": { Mark: MyMark, sound: "brand/custom/p-my-project-sfx.wav" }
// A Mark receives { t, frame, fps } and should use useFormat() so it works in vertical and landscape.
import type React from "react";

export type MarkProps = { t: number; frame: number; fps: number };
export type CustomOutro = { Mark: React.FC<MarkProps>; sound?: string };

export const CUSTOM_OUTROS: Record<string, CustomOutro> = {};
