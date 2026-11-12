// Shared bits for hizibizi episodes: centred stage card, series badge, labels, timing helpers.
// Layout rule (user): content stays centred — stage card in the middle, logo above, captions below.
import { AbsoluteFill, Easing, interpolate } from "remotion";

export const STAGE = { x: 40, y: 220, w: 1000, h: 1220, r: 56 };
// Whole block (badge + card + labels) is shifted down so the space above the badge/logo equals
// the space below the captions. Pair with theme.logo_top = 56 + SHIFT and theme.caption_bottom ≈ 145.
export const SHIFT = 85;
export const NAVY = "#203247";
export const FONT = `"Hind Siliguri", sans-serif`;

export const fade = (t: number, at: number, dur = 0.35) =>
  interpolate(t, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

export const kf = (t: number, frames: [number, number][]) =>
  interpolate(
    t,
    frames.map((f) => f[0]),
    frames.map((f) => f[1]),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) },
  );

// deterministic pseudo-random in [0,1)
export const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Page with the centred stage card. `children` render inside the card (clipped, card coords = page coords).
// Full-screen by default (hizibizi house style): children fill the whole frame, shifted by SHIFT so
// the focus sits at the centre — draw backgrounds that overscan (e.g. y −300 … 2300).
// `framed` brings back the old rounded card.
export const StagePage: React.FC<{ bg: string; card: string; children: React.ReactNode; overlay?: React.ReactNode; paper?: boolean; framed?: boolean }> = ({
  bg,
  card,
  children,
  overlay,
  paper = true,
  framed = false,
}) =>
  !framed ? (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateY(${SHIFT}px)` }}>
        {children}
        {overlay}
      </AbsoluteFill>
      {paper ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "multiply", opacity: 0.07 }}>
          <filter id="paperF">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#paperF)" />
        </svg>
      ) : null}
    </AbsoluteFill>
  ) : (
  <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
    <AbsoluteFill style={{ transform: `translateY(${SHIFT}px)` }}>
    <div
      style={{
        position: "absolute",
        left: STAGE.x,
        top: STAGE.y + 14,
        width: STAGE.w,
        height: STAGE.h,
        borderRadius: STAGE.r,
        background: "rgba(32,50,71,0.16)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: STAGE.x,
        top: STAGE.y,
        width: STAGE.w,
        height: STAGE.h,
        borderRadius: STAGE.r,
        overflow: "hidden",
        background: card,
      }}
    >
      <div style={{ position: "absolute", left: -STAGE.x, top: -STAGE.y, width: 1080, height: 1920 }}>{children}</div>
      {paper ? <PaperTexture /> : null}
    </div>
    <div
      style={{
        position: "absolute",
        left: STAGE.x,
        top: STAGE.y,
        width: STAGE.w,
        height: STAGE.h,
        borderRadius: STAGE.r,
        border: `8px solid ${NAVY}`,
        pointerEvents: "none",
      }}
    />
    {overlay}
    </AbsoluteFill>
  </AbsoluteFill>
);

// Soft paper grain over the card
export const PaperTexture: React.FC = () => (
  <svg width={STAGE.w} height={STAGE.h} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "multiply", opacity: 0.07 }}>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#paper)" />
  </svg>
);

export const SeriesBadge: React.FC<{ appear?: number }> = ({ appear = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 48,
      top: 66,
      padding: "6px 18px",
      borderRadius: 14,
      background: NAVY,
      color: "#fff",
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 28,
      opacity: appear,
    }}
  >
    hizibizi <span style={{ color: "#fde047" }}>|</span> Why Is That?
  </div>
);

// Pill label at a page point, optional dotted pointer to another page point
export const Label: React.FC<{ x: number; y: number; text: string; appear: number; color?: string; to?: { x: number; y: number }; size?: number }> = ({
  x,
  y,
  text,
  appear,
  color = "#ffffff",
  to,
  size = 40,
}) =>
  appear <= 0 ? null : (
    <>
      {to ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: appear }}>
          <line x1={x} y1={y} x2={to.x} y2={to.y} stroke={NAVY} strokeWidth={5} strokeDasharray="4 10" strokeLinecap="round" />
          <circle cx={to.x} cy={to.y} r={8} fill={NAVY} />
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
          color: NAVY,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: size,
          padding: "6px 24px",
          borderRadius: 999,
          border: `4px solid ${NAVY}`,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 0 rgba(32,50,71,0.22)",
        }}
      >
        {text}
      </div>
    </>
  );
