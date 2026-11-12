// Brand outros (4 s, 1080×1920, 30 fps) — one house format for every video:
// dark charcoal background + cream logo. The main video fades to charcoal (see Short.tsx), then this fades in.
//   brand "devdiary": cursor types DEV → DIARY letter by letter, divider + BY AFRIDI drop in, bounce, line sweep, hold, fade.
//   brand "hizibizi": letters of "hizibizi" pop up one by one, bounce, line sweep, hold, fade.
// `transparent` drops the background (for overlay files).
import { AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const OUTRO_FRAMES = 120;
export const OUTRO_BG = "#141318";
export const CREAM = "#F3E9D7";
export const FADE_OUT_FRAMES = 18; // main video → charcoal before the outro
export type Brand = "devdiary" | "hizibizi";

const ease = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

const stepped = (t: number, start: number, beat: number, steps: number[]) => {
  if (t < start) return 0;
  const n = Math.floor((t - start) / beat) + 1;
  return steps[Math.min(steps.length, n) - 1];
};

// ---------- Dev Diary ----------
const DD = { src: "brand/dev-diary-logo-cream-hi.png", w: 1600, h: 987, devBottom: 518, diaryTop: 553, stripLeft: 1520 };
const DEV_STEPS = [493, 950, 1473];
const DIARY_STEPS = [346, 510, 880, 1200, 1473];

const DevDiaryMark: React.FC<{ t: number; frame: number; fps: number }> = ({ t, frame, fps }) => {
  const W = 860;
  const s = W / DD.w;
  const H = DD.h * s;
  const x0 = (1080 - W) / 2;
  const y0 = (1920 - H) / 2 - 40;
  const dev = stepped(t, 0.55, 0.16, DEV_STEPS);
  const diary = stepped(t, 1.05, 0.12, DIARY_STEPS);
  const strip = interpolate(t, [1.7, 2.2], [0, DD.h], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const bounce = spring({ frame: frame - Math.round(2.2 * fps), fps, config: { damping: 9, stiffness: 160 } });
  const scale = t < 2.2 ? 1 : 1 + 0.045 * Math.sin(bounce * Math.PI);
  const sweep = ease(t, 2.3, 2.8);
  const row = t < 1.05 ? 0 : 1;
  const edge = row === 0 ? dev : diary;
  const cy = row === 0 ? y0 : y0 + DD.diaryTop * s;
  const ch = row === 0 ? DD.devBottom * s : (DD.h - DD.diaryTop) * s;
  const blink = Math.floor(t * 4) % 2 === 0 ? 1 : 0.15;
  const cursor = t < 1.75 ? (t < 0.55 ? blink : 1) : 0;
  const clip = (x: number, y: number, w: number, h: number) => `inset(${y * s}px ${(DD.w - x - w) * s}px ${(DD.h - y - h) * s}px ${x * s}px)`;
  return (
    <>
      <div style={{ position: "absolute", left: x0, top: y0, width: W, height: H, transform: `scale(${scale})` }}>
        <Img src={staticFile(DD.src)} style={{ position: "absolute", inset: 0, width: W, height: H, clipPath: clip(0, 0, dev, DD.devBottom + 8) }} />
        <Img src={staticFile(DD.src)} style={{ position: "absolute", inset: 0, width: W, height: H, clipPath: clip(0, DD.diaryTop - 8, diary, DD.h - DD.diaryTop + 8) }} />
        <Img src={staticFile(DD.src)} style={{ position: "absolute", inset: 0, width: W, height: H, clipPath: clip(DD.stripLeft, 0, DD.w - DD.stripLeft, strip) }} />
      </div>
      <div style={{ position: "absolute", left: x0 + Math.max(edge, 0) * s + 10, top: cy, width: 18, height: ch, background: CREAM, opacity: cursor, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: x0, top: y0 + H + 46, height: 10, width: W * sweep, background: CREAM, borderRadius: 5 }} />
    </>
  );
};

// ---------- hizibizi ----------
const HZ = { src: "brand/hizibizi-logo-cream-hi.png", w: 1600, h: 415 };
const HZ_LETTERS: [number, number][] = [
  [0, 284],
  [284, 407],
  [407, 664],
  [664, 790],
  [790, 1102],
  [1102, 1227],
  [1227, 1489],
  [1489, 1600],
];

const HizibiziMark: React.FC<{ t: number; frame: number; fps: number }> = ({ t, frame, fps }) => {
  const W = 900;
  const s = W / HZ.w;
  const H = HZ.h * s;
  const x0 = (1080 - W) / 2;
  const y0 = (1920 - H) / 2 - 40;
  const start = 0.6;
  const beat = 0.14;
  const allIn = start + beat * HZ_LETTERS.length + 0.15;
  const bounce = spring({ frame: frame - Math.round(allIn * fps), fps, config: { damping: 9, stiffness: 160 } });
  const scale = t < allIn ? 1 : 1 + 0.05 * Math.sin(bounce * Math.PI);
  const sweep = ease(t, allIn + 0.1, allIn + 0.6);
  return (
    <>
      <div style={{ position: "absolute", left: x0, top: y0, width: W, height: H, transform: `scale(${scale})` }}>
        {HZ_LETTERS.map(([a, b], i) => {
          const p = spring({ frame: frame - Math.round((start + i * beat) * fps), fps, config: { damping: 10, stiffness: 180 } });
          return (
            <Img
              key={i}
              src={staticFile(HZ.src)}
              style={{
                position: "absolute",
                inset: 0,
                width: W,
                height: H,
                clipPath: `inset(0 ${(HZ.w - b) * s}px 0 ${a * s}px)`,
                opacity: Math.min(1, p * 1.5),
                transform: `translateY(${(1 - p) * 70}px)`,
                transformOrigin: `${((a + b) / 2) * s}px ${H}px`,
              }}
            />
          );
        })}
      </div>
      <div style={{ position: "absolute", left: x0, top: y0 + H + 56, height: 10, width: W * sweep, background: CREAM, borderRadius: 5 }} />
    </>
  );
};

export const BrandOutro: React.FC<{ brand?: Brand; transparent?: boolean; sound?: boolean }> = ({ brand = "devdiary", transparent = false, sound = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fadeIn = ease(t, 0, 0.5);
  const fadeOut = interpolate(t, [3.5, 4.0], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: transparent ? "transparent" : OUTRO_BG }}>
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
        {brand === "devdiary" ? <DevDiaryMark t={t} frame={frame} fps={fps} /> : <HizibiziMark t={t} frame={frame} fps={fps} />}
      </AbsoluteFill>
      {sound ? <Audio src={staticFile(brand === "devdiary" ? "brand/outro-sfx-devdiary.wav" : "brand/outro-sfx-hizibizi.wav")} /> : null}
    </AbsoluteFill>
  );
};
