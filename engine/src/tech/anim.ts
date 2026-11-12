import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";

// Seconds since scene start + helpers to start animations at voice-synced beats.
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

// 0 → 1 ease starting at `at` seconds over `dur` seconds
export const ease = (t: number, at: number, dur = 0.35) =>
  interpolate(t, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

// Springy pop starting at `at` seconds
export const usePop = (at: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(at * fps), fps, config: { damping: 13, stiffness: 150 } });
};

export const pop = (frame: number, fps: number, at: number) =>
  spring({ frame: frame - Math.round(at * fps), fps, config: { damping: 13, stiffness: 150 } });

export const TECH = {
  navy: "#0b1426",
  panel: "#0f1d36",
  panel2: "#13284a",
  border: "#24406b",
  teal: "#2dd4bf",
  blue: "#38bdf8",
  orange: "#fb923c",
  text: "#e6edf3",
  muted: "#8aa0bf",
};
