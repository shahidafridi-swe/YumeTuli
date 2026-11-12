// hizibizi · Why Is That? — পর্ব ১: ব্যাগের চেইন এক টানে বন্ধ হয় কীভাবে?
// Beat times (seconds from scene start) come from the aligned captions in
// public/projects/zipper-bn/scenes.json. Slider positions are continuous across scenes.
import { AbsoluteFill, Easing, interpolate } from "remotion";
import type { IllustrationProps } from "../../../illustrations/registry";
import { useT } from "../../../tech/anim";
import { SHIFT } from "../common";
import { BASE, BLUE, type Cam, HEAD, P, SL, S_TOP, YELLOW, ZipperWorld, sepAt, toScreen } from "./Zipper";

const BG = "#fdf1dc";
const INK = "#1f2937";
const FONT = `"Hind Siliguri", sans-serif`;
const BLUE_Y = -200; // the blue tooth we follow (world y)

// keyframes: [[time, value], ...] with smooth in/out between them
const kf = (t: number, frames: [number, number][]) =>
  interpolate(
    t,
    frames.map((f) => f[0]),
    frames.map((f) => f[1]),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) },
  );
const fade = (t: number, at: number, dur = 0.35) =>
  interpolate(t, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
const camAt = (t: number, frames: [number, Cam][]): Cam => ({
  cx: kf(t, frames.map(([ft, c]) => [ft, c.cx])),
  cy: kf(t, frames.map(([ft, c]) => [ft, c.cy])),
  s: kf(t, frames.map(([ft, c]) => [ft, c.s])),
});

const BAG: Cam = { cx: 0, cy: -110, s: 0.41 }; // whole bag (handle → bottom) fits the stage card
const CLOSE: Cam = { cx: 0, cy: BLUE_Y, s: 2.6 };

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(228,87,46,0.10) 3px, transparent 3px)", backgroundSize: "48px 48px" }} />
    {/* whole block (badge + stage + labels) shifted so space above logo = space below captions */}
    <AbsoluteFill style={{ transform: `translateY(${SHIFT}px)` }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

// Pill label at a screen point, with an optional pointer line to another screen point
const Label: React.FC<{ x: number; y: number; text: string; appear: number; color?: string; to?: { x: number; y: number }; size?: number; dark?: boolean }> = ({
  x,
  y,
  text,
  appear,
  color = "#ffffff",
  to,
  size = 40,
  dark = true,
}) =>
  appear <= 0 ? null : (
    <>
      {to ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: appear }}>
          <line x1={x} y1={y} x2={to.x} y2={to.y} stroke={INK} strokeWidth={5} strokeDasharray="4 10" strokeLinecap="round" />
          <circle cx={to.x} cy={to.y} r={9} fill={INK} />
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * appear})`,
          opacity: appear,
          background: color,
          color: dark ? INK : "#fff",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: size,
          padding: "6px 24px",
          borderRadius: 999,
          border: `4px solid ${INK}`,
          whiteSpace: "nowrap",
          boxShadow: "0 8px 0 rgba(31,41,55,0.25)",
        }}
      >
        {text}
      </div>
    </>
  );

// World-space arrow (drawn inside the zipper camera)
const WArrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; amt: number; color?: string; w?: number }> = ({ x1, y1, x2, y2, amt, color = "#ffffff", w = 7 }) => {
  if (amt <= 0) return null;
  const ex = x1 + (x2 - x1) * amt;
  const ey = y1 + (y2 - y1) * amt;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 16;
  return (
    <g opacity={Math.min(1, amt * 2)}>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={INK} strokeWidth={w + 5} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon
        points={`${ex + Math.cos(a) * h},${ey + Math.sin(a) * h} ${ex + Math.cos(a + 2.4) * h},${ey + Math.sin(a + 2.4) * h} ${ex + Math.cos(a - 2.4) * h},${ey + Math.sin(a - 2.4) * h}`}
        fill={color}
        stroke={INK}
        strokeWidth={3}
      />
    </g>
  );
};

// Small burst ring at a world point
const Burst: React.FC<{ x: number; y: number; t: number; at: number }> = ({ x, y, t, at }) => {
  const k = (t - at) / 0.6;
  if (k < 0 || k > 1) return null;
  return <circle cx={x} cy={y} r={10 + 40 * k} fill="none" stroke="#ffffff" strokeWidth={6 * (1 - k)} opacity={1 - k} />;
};

const SeriesBadge: React.FC<{ appear: number }> = ({ appear }) => (
  <div
    style={{
      position: "absolute",
      left: 48,
      top: 60,
      padding: "8px 20px",
      borderRadius: 16,
      background: INK,
      color: "#fff",
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 30,
      opacity: appear,
    }}
  >
    hizibizi <span style={{ color: "#fde047" }}>|</span> Why Is That?
  </div>
);

// 1 — Bag zipper closes, freezes half-way: open teeth above, joined teeth below
const Open: React.FC<IllustrationProps> = () => {
  const t = useT();
  const sliderY = kf(t, [
    [0, 900],
    [2.6, 0],
  ]);
  const cam = camAt(t, [
    [0, BAG],
    [3.0, BAG],
    [4.6, { cx: 0, cy: 0, s: 0.72 }],
  ]);
  const freeze = fade(t, 2.65, 0.2);
  const flash = t > 2.6 && t < 2.95 ? 1 - (t - 2.6) / 0.35 : 0;
  const above = toScreen(cam, 0, -300);
  const below = toScreen(cam, 0, 300);
  const sl = toScreen(cam, 0, 0);
  return (
    <Stage>
      <ZipperWorld cam={cam} sliderY={sliderY} />
      <AbsoluteFill style={{ background: "#fff", opacity: 0.5 * flash }} />
      <Label x={820} y={300} text="⏸ অর্ধেকে থামলো" appear={freeze * (1 - fade(t, 9.9, 0.3))} color="#fde047" size={34} />
      <Label x={250} y={above.y} text="খোলা দাঁত" appear={fade(t, 6.04)} to={{ x: above.x - 60, y: above.y }} />
      <Label x={250} y={below.y} text="জোড়া দাঁত" appear={fade(t, 7.32)} color="#a7f3d0" to={{ x: below.x - 40, y: below.y }} />
      <Label x={830} y={sl.y} text="টান এক জায়গায়" appear={fade(t, 5.06)} color="#fde047" to={{ x: sl.x + 70, y: sl.y }} size={34} />
      <SeriesBadge appear={1} />
    </Stage>
  );
};

// 2 — Pull tab highlight, zoom into the slider, body becomes see-through
const Slider: React.FC<IllustrationProps> = () => {
  const t = useT();
  const cam = camAt(t, [
    [0, { cx: 0, cy: 0, s: 0.72 }],
    [4.8, { cx: 0, cy: 0, s: 0.72 }],
    [6.6, { cx: 0, cy: 10, s: 2.5 }],
  ]);
  const tabGlow = fade(t, 2.56, 0.3) * (0.7 + 0.3 * Math.sin(t * 8)) * (1 - fade(t, 4.8, 0.4));
  const see = fade(t, 7.95, 1.0);
  const tab = toScreen(cam, 26, 120);
  const body = toScreen(cam, 0, 0);
  return (
    <Stage>
      <ZipperWorld cam={cam} sliderY={0} tabGlow={tabGlow} bodyOpacity={1 - 0.88 * see} tabOpacity={1 - see} />
      <Label x={820} y={tab.y + 40} text="হাতল" appear={fade(t, 3.26) * (1 - fade(t, 4.8, 0.3))} color="#fde047" to={{ x: tab.x, y: tab.y }} />
      <Label x={540} y={body.y - 380} text="স্লাইডার" appear={fade(t, 7.12)} color="#ffffff" size={48} />
      <Label x={540} y={body.y + 360} text="ভেতরটা দেখি 🔍" appear={fade(t, 8.4)} color="#a7f3d0" size={34} />
    </Stage>
  );
};

// 3 — Top view: Y-shaped channel. Two roads at the wide mouth merge into one narrow path.
const Channel: React.FC<IllustrationProps> = () => {
  const t = useT();
  const cam: Cam = { cx: 0, cy: 10, s: 2.5 };
  const top = -SL / 2;
  const bot = SL / 2;
  const armX = S_TOP / 2 + BASE / 2;
  const yGlow = fade(t, 1.74, 0.5) * (1 - fade(t, 3.6, 0.4));
  const blueRow = toScreen(cam, -S_TOP / 2 - 30, -230);
  const yellowRow = toScreen(cam, S_TOP / 2 + 30, -230);
  return (
    <Stage>
      <ZipperWorld
        cam={cam}
        sliderY={0}
        bodyOpacity={0.12}
        tabOpacity={0}
        dividerGlow={yGlow}
        overlay={
          <g>
            {/* the two roads */}
            <WArrow x1={-armX - 20} y1={top - 70} x2={-BASE / 2 - 6} y2={top + 0.62 * SL} amt={fade(t, 3.68, 0.9)} color={BLUE} />
            <WArrow x1={armX + 20} y1={top - 70} x2={BASE / 2 + 6} y2={top + 0.62 * SL} amt={fade(t, 4.4, 0.9)} color={YELLOW} />
            {/* merged narrow path */}
            <WArrow x1={0} y1={top + 0.68 * SL} x2={0} y2={bot + 80} amt={fade(t, 7.98, 0.9)} color="#a7f3d0" w={10} />
          </g>
        }
      />
      {/* ghost Y */}
      <div
        style={{
          position: "absolute",
          left: 820,
          top: 470,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 240,
          color: "#ffffff",
          WebkitTextStroke: `8px ${INK}`,
          opacity: fade(t, 2.59),
          transform: `scale(${0.6 + 0.4 * fade(t, 2.59)})`,
        }}
      >
        Y
      </div>
      <Label x={blueRow.x - 40} y={300} text="নীল সারি" appear={fade(t, 0.5)} color="#bfdbfe" size={32} />
      <Label x={yellowRow.x + 40} y={300} text="হলুদ সারি" appear={fade(t, 0.8)} color="#fef08a" size={32} />
      <Label x={220} y={toScreen(cam, 0, top).y + 30} text="চওড়া মুখ" appear={fade(t, 3.68)} size={34} />
      <Label x={540} y={toScreen(cam, 0, top - 110).y - 20} text="২টা রাস্তা" appear={fade(t, 4.88)} color="#fde047" size={34} />
      <Label x={830} y={toScreen(cam, 0, bot + 40).y} text="সরু পথ" appear={fade(t, 8.96)} color="#a7f3d0" size={36} to={toScreen(cam, 12, bot + 40)} />
    </Stage>
  );
};

// slider path for the slow-motion follow (scene 4 → 5)
const S4_END = -150;

// 4 — Follow one blue tooth; it faces a gap between two yellow teeth
const Follow: React.FC<IllustrationProps> = () => {
  const t = useT();
  const cam = camAt(t, [
    [0, { cx: 0, cy: 10, s: 2.5 }],
    [1.2, CLOSE],
  ]);
  const sliderY = interpolate(t, [3.03, 10.98], [0, S4_END], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hl = fade(t, 1.28, 0.3);
  const gap = fade(t, 7.14, 0.4);
  const s0 = sepAt(BLUE_Y, sliderY);
  const tooth = toScreen(cam, -s0 / 2 + HEAD - 10, BLUE_Y);
  const gapPt = toScreen(cam, s0 / 2, BLUE_Y);
  return (
    <Stage>
      <ZipperWorld
        cam={cam}
        sliderY={sliderY}
        bodyOpacity={0.12}
        tabOpacity={0}
        highlightBlue={BLUE_Y}
        highlightAmt={hl}
        gapAmt={gap}
        overlay={<WArrow x1={-s0 / 2 + HEAD + 4} y1={BLUE_Y} x2={s0 / 2 - HEAD + 8} y2={BLUE_Y} amt={fade(t, 6.28, 0.6)} color="#ffffff" w={4} />}
      />
      <Label x={190} y={tooth.y - 170} text="নীল দাঁত" appear={hl} color="#bfdbfe" to={{ x: tooth.x - 30, y: tooth.y }} />
      <Label x={880} y={gapPt.y - 170} text="ফাঁক" appear={gap} color="#ffffff" to={{ x: gapPt.x + 10, y: gapPt.y }} />
      <Label x={880} y={gapPt.y + 190} text="দুই হলুদ দাঁত" appear={fade(t, 9.2)} color="#fef08a" size={32} to={{ x: gapPt.x + 40, y: gapPt.y + 40 }} />
      <Label x={540} y={360} text="🐢 slow motion" appear={fade(t, 3.62) * (1 - fade(t, 6.2, 0.3))} color="#a7f3d0" size={32} />
    </Stage>
  );
};

// 5 — Walls squeeze the rows; the blue tooth drops into the gap and locks; more teeth follow
const LOCK_AT = 5.9;
const Lock: React.FC<IllustrationProps> = () => {
  const t = useT();
  const sliderY = kf(t, [
    [0, S4_END],
    [4.02, -232],
    [LOCK_AT, -268],
    [7.13, -276],
    [9.76, -330],
    [10.41, -330],
    [12.4, -480],
  ]);
  const cam = camAt(t, [
    [0, CLOSE],
    [10.41, CLOSE],
    [12.4, { cx: 0, cy: -300, s: 1.35 }],
  ]);
  const push = fade(t, 0.9, 0.5) * (1 - fade(t, 3.8, 0.4));
  const wy = sliderY + 0.15 * SL;
  const wx = S_TOP / 2 + BASE + 60;
  const locked = fade(t, LOCK_AT, 0.25);
  const tooth = toScreen(cam, 0, BLUE_Y);
  return (
    <Stage>
      <ZipperWorld
        cam={cam}
        sliderY={sliderY}
        bodyOpacity={0.12}
        tabOpacity={0}
        highlightBlue={BLUE_Y}
        highlightAmt={1 - 0.5 * fade(t, 10.4, 0.6)}
        gapAmt={1 - fade(t, LOCK_AT + 0.4, 0.4)}
        overlay={
          <g>
            <WArrow x1={-wx - 40} y1={wy} x2={-wx + 20} y2={wy} amt={push} color="#fde047" />
            <WArrow x1={wx + 40} y1={wy} x2={wx - 20} y2={wy} amt={push} color="#fde047" />
            <Burst x={0} y={BLUE_Y} t={t} at={LOCK_AT} />
            <Burst x={0} y={BLUE_Y - P} t={t} at={8.95} />
            <Burst x={0} y={BLUE_Y - P / 2} t={t} at={8.5} />
          </g>
        }
      />
      <Label x={540} y={360} text="পথ সরু → সারি কাছে" appear={push} color="#fde047" size={34} />
      <Label x={830} y={tooth.y + 170} text="আটকে গেলো! ✓" appear={locked * (1 - fade(t, 7.1, 0.3))} color="#a7f3d0" to={{ x: tooth.x + 30, y: tooth.y }} size={38} />
      <Label x={830} y={tooth.y - 250} text="পরের দাঁতও ✓" appear={fade(t, 9.12) * (1 - fade(t, 10.4, 0.3))} color="#a7f3d0" size={34} />
      <Label x={540} y={360} text="এভাবেই পুরো চেইন বন্ধ" appear={fade(t, 10.41)} color="#ffffff" size={36} />
    </Stage>
  );
};

// 6 — Same camera, slider reversed: joined teeth enter the narrow end, the divider splits them
const UNLOCK_AT = 11.48;
const Reverse: React.FC<IllustrationProps> = () => {
  const t = useT();
  const sliderY = kf(t, [
    [0, -480],
    [1.58, -380],
    [7.0, -300],
    [9.6, -264],
    [UNLOCK_AT, -175],
    [12.2, -160],
    [14.9, 620],
  ]);
  const cam = camAt(t, [
    [0, { cx: 0, cy: -300, s: 1.35 }],
    [1.4, { cx: 0, cy: -240, s: 2.6 }],
    [12.2, { cx: 0, cy: -240, s: 2.6 }],
    [14.4, BAG],
  ]);
  const div = fade(t, 4.4, 0.4) * (1 - fade(t, 7.6, 0.4));
  const bot = sliderY + SL / 2;
  const s0 = sepAt(BLUE_Y, sliderY);
  const tooth = toScreen(cam, -s0 / 2, BLUE_Y);
  const zoomOut = fade(t, 12.2, 1.6);
  const dy = sliderY - SL / 2 + 0.25 * SL;
  return (
    <Stage>
      <ZipperWorld
        cam={cam}
        sliderY={sliderY}
        bodyOpacity={0.12 + 0.88 * zoomOut}
        tabOpacity={zoomOut}
        dividerGlow={div}
        highlightBlue={BLUE_Y}
        highlightAmt={fade(t, 8.6, 0.3) * (1 - zoomOut)}
        overlay={
          <g>
            <WArrow x1={0} y1={bot + 110} x2={0} y2={bot + 10} amt={fade(t, 1.96, 0.6) * (1 - fade(t, 4.4, 0.3))} color="#a7f3d0" w={9} />
            <WArrow x1={-12} y1={dy} x2={-70} y2={dy} amt={div} color="#fde047" />
            <WArrow x1={12} y1={dy} x2={70} y2={dy} amt={div} color="#fde047" />
            <Burst x={-s0 / 2} y={BLUE_Y} t={t} at={UNLOCK_AT} />
          </g>
        }
      />
      <Label x={540} y={360} text="⟲ উল্টো দিকে" appear={fade(t, 0.3) * (1 - fade(t, 2.4, 0.3))} color="#fde047" size={36} />
      <Label x={830} y={toScreen(cam, 0, bot + 60).y} text="সরু মুখ" appear={fade(t, 2.8) * (1 - fade(t, 4.4, 0.3))} color="#a7f3d0" to={toScreen(cam, 14, bot + 60)} size={34} />
      <Label x={540} y={360} text="মাঝখানের ভাগ ↔" appear={div} color="#ffffff" size={36} />
      <Label x={200} y={tooth.y + 190} text="সেই নীল দাঁত" appear={fade(t, 8.6) * (1 - fade(t, 11.3, 0.3))} color="#bfdbfe" to={{ x: tooth.x - 30, y: tooth.y }} size={34} />
      <Label x={200} y={tooth.y + 190} text="আলাদা! ✓" appear={fade(t, UNLOCK_AT) * (1 - zoomOut)} color="#a7f3d0" to={{ x: tooth.x - 30, y: tooth.y }} size={38} />
      <SeriesBadge appear={fade(t, 13.4, 0.5)} />
    </Stage>
  );
};

export const ZIPPER = {
  "zip/open": Open,
  "zip/slider": Slider,
  "zip/channel": Channel,
  "zip/follow": Follow,
  "zip/lock": Lock,
  "zip/reverse": Reverse,
};

