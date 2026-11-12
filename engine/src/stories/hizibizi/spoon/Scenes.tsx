// hizibizi · Why Is That? — পর্ব ৩: চামচের ভেতরের পিঠে নিজের মুখ উল্টো দেখো কেন?
// FULL-SCREEN episode: no card/box/border. Important content stays inside y≈300–1500 so the
// logo/badge (top) and captions (bottom, shadow style) keep equal margins and never cover it.
// Ray diagrams use real concave-mirror reflection (circle arc, reflect about the normal).
import { createContext, useContext } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type { IllustrationProps } from "../../../illustrations/registry";
import { useT } from "../../../tech/anim";
import { FONT, NAVY, PaperTexture, fade, kf } from "../common";

// Layout knobs so later episodes can reuse these scenes inside StagePage. Defaults = episode 3 as rendered.
// shift: px the content block moves down; badgeTop: series pill top; overscan: backgrounds extend below 1920;
// paper: draw this file's own grain (off when StagePage already adds it); legendPlate: cream plate behind the
// scene-5 legend so the outgoing ray doesn't cross its text.
export type SpoonLayout = { shift: number; badgeTop: number; overscan: boolean; paper: boolean; legendPlate?: boolean };
export const SpoonLayoutContext = createContext<SpoonLayout>({ shift: 120, badgeTop: 120, overscan: false, paper: true });

const CREAM = "#FFF4E2";
const PEACH = "#E9B797";
const TEAL = "#267D78";
const SILVER = "#C5CED6";
const AMBER = "#C47A00";
const BLUE = "#2878C8";
const SKIN = "#C98B5E";
const HAIR = "#1b1b1f";

// ---------- shared pieces ----------

const Badge: React.FC = () => (
  <div style={{ position: "absolute", left: 44, top: useContext(SpoonLayoutContext).badgeTop, padding: "6px 18px", borderRadius: 14, background: "rgba(32,50,71,0.88)", color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 28 }}>
    hizibizi <span style={{ color: "#fde047" }}>|</span> Why Is That?
  </div>
);

// Full-screen content is shifted down so the focus sits at the frame centre (equal space above
// the logo/badge and below the captions). Background colour = wall colour, so no gap shows.
const Shift: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ transform: `translateY(${useContext(SpoonLayoutContext).shift}px)` }}>{children}</AbsoluteFill>
);
// extra height below the 1920 frame so shifted backgrounds never show a gap
const useOver = () => (useContext(SpoonLayoutContext).overscan ? 500 : 0);

const Paper: React.FC = () => (useContext(SpoonLayoutContext).paper ? <PaperGrain /> : null);
const PaperGrain: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <div style={{ position: "relative", width: 1080, height: 1920 }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "multiply", opacity: 0.06 }}>
        <filter id="paperS">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={8} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paperS)" />
      </svg>
    </div>
  </div>
);
void PaperTexture;

const Tag: React.FC<{ x: number; y: number; text: string; appear: number; color?: string; size?: number; to?: { x: number; y: number } }> = ({ x, y, text, appear, color = "#fff", size = 38, to }) =>
  appear <= 0 ? null : (
    <>
      {to ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: appear }}>
          <line x1={x} y1={y} x2={to.x} y2={to.y} stroke={NAVY} strokeWidth={5} strokeDasharray="4 10" strokeLinecap="round" />
          <circle cx={to.x} cy={to.y} r={9} fill={NAVY} />
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * appear})`,
          opacity: appear,
          background: color,
          color: NAVY,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: size,
          padding: "6px 22px",
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

// Front face (used inside the spoon). Centre (0,0), roughly 300 wide. Curl on the forehead.
export const FaceFront: React.FC = () => (
  <g stroke={NAVY} strokeWidth={5} strokeLinejoin="round">
    <path d="M -170 260 Q -150 150 0 150 Q 150 150 170 260 Z" fill={TEAL} />
    <rect x={-40} y={95} width={80} height={70} fill={SKIN} />
    <ellipse cx={-118} cy={10} rx={22} ry={34} fill={SKIN} />
    <ellipse cx={118} cy={10} rx={22} ry={34} fill={SKIN} />
    <ellipse cx={0} cy={0} rx={118} ry={140} fill={SKIN} />
    <path d="M -120 -20 Q -128 -150 0 -150 Q 128 -150 120 -20 Q 100 -95 0 -98 Q -100 -95 -120 -20 Z" fill={HAIR} />
    {/* the forehead curl */}
    <path d="M 4 -96 C 30 -96 34 -62 12 -56 C -6 -51 -10 -72 6 -74" fill="none" stroke={HAIR} strokeWidth={11} strokeLinecap="round" />
    <path d="M -60 -38 q 22 -12 44 0" fill="none" strokeWidth={7} strokeLinecap="round" />
    <path d="M 16 -38 q 22 -12 44 0" fill="none" strokeWidth={7} strokeLinecap="round" />
    <ellipse cx={-38} cy={-8} rx={14} ry={18} fill={NAVY} stroke="none" />
    <ellipse cx={38} cy={-8} rx={14} ry={18} fill={NAVY} stroke="none" />
    <circle cx={-34} cy={-13} r={5} fill="#fff" stroke="none" />
    <circle cx={42} cy={-13} r={5} fill="#fff" stroke="none" />
    <path d="M 0 10 q -10 28 4 34" fill="none" strokeWidth={5} strokeLinecap="round" />
    <path d="M -36 70 Q 0 100 36 70" fill="none" strokeWidth={6} strokeLinecap="round" />
  </g>
);

// Big close eye with the curl above it (what you see with the spoon very close)
const EyeClose: React.FC = () => (
  <g stroke={NAVY} strokeWidth={6}>
    <rect x={-400} y={-400} width={800} height={800} fill={SKIN} stroke="none" />
    <path d="M -400 -400 L 400 -400 L 400 -150 Q 0 -230 -400 -150 Z" fill={HAIR} stroke="none" />
    <path d="M 10 -160 C 80 -160 92 -70 34 -54 C -14 -40 -24 -96 18 -102" fill="none" stroke={HAIR} strokeWidth={26} strokeLinecap="round" />
    <path d="M -170 -10 q 110 -60 220 0" fill="none" strokeWidth={14} strokeLinecap="round" />
    <path d="M -190 90 Q -60 0 70 90 Q -60 170 -190 90 Z" fill="#fff" />
    <circle cx={-60} cy={90} r={52} fill="#5a3a22" />
    <circle cx={-60} cy={90} r={26} fill={NAVY} stroke="none" />
    <circle cx={-44} cy={74} r={12} fill="#fff" stroke="none" />
  </g>
);

// Spoon seen from the front (bowl up, handle down). (cx,cy) = bowl centre, rx/ry = bowl radii.
// mode: "inverted" small upside-down face | "upright" big eye | blend 0..1 (0 = inverted, 1 = upright), blur during the flip
export const SpoonFront: React.FC<{ cx: number; cy: number; rx: number; ry: number; flip: number; id: string }> = ({ cx, cy, rx, ry, flip, id }) => {
  const mid = 1 - Math.abs(flip - 0.5) * 2; // 1 at the flip moment
  const blur = 10 * mid;
  return (
    <g>
      <defs>
        <clipPath id={`bowl-${id}`}>
          <ellipse cx={cx} cy={cy} rx={rx - 8} ry={ry - 8} />
        </clipPath>
        <radialGradient id={`silver-${id}`} cx="0.42" cy="0.38" r="0.75">
          <stop offset="0" stopColor="#eef2f5" />
          <stop offset="0.6" stopColor={SILVER} />
          <stop offset="1" stopColor="#8e99a4" />
        </radialGradient>
      </defs>
      {/* handle */}
      <path d={`M ${cx - rx * 0.16} ${cy + ry * 0.9} L ${cx - rx * 0.1} ${cy + ry * 3.2} Q ${cx} ${cy + ry * 3.35} ${cx + rx * 0.1} ${cy + ry * 3.2} L ${cx + rx * 0.16} ${cy + ry * 0.9} Z`} fill={SILVER} stroke="#4b5563" strokeWidth={4} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#silver-${id})`} stroke="#4b5563" strokeWidth={5} />
      <g clipPath={`url(#bowl-${id})`}>
        <g style={{ filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
          {/* inverted small face (far) */}
          <g opacity={1 - flip} transform={`translate(${cx} ${cy}) scale(${rx / 330} ${-ry / 380})`}>
            <FaceFront />
          </g>
          {/* upright big eye (close) */}
          <g opacity={flip} transform={`translate(${cx} ${cy}) scale(${rx / 360} ${ry / 380})`}>
            <EyeClose />
          </g>
        </g>
        {/* curved-mirror sheen on top */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#silver-${id})`} opacity={0.35} />
        <ellipse cx={cx} cy={cy} rx={rx - 8} ry={ry - 8} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={rx * 0.12} />
      </g>
      {/* white highlight on one side + thin dark rim */}
      <path d={`M ${cx - rx * 0.72} ${cy - ry * 0.45} Q ${cx - rx * 0.82} ${cy + ry * 0.05} ${cx - rx * 0.62} ${cy + ry * 0.5}`} fill="none" stroke="#ffffff" strokeWidth={rx * 0.07} strokeLinecap="round" opacity={0.9} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#3f4752" strokeWidth={4} />
    </g>
  );
};

// Dining room background with soft side light
export const Room: React.FC<{ tableY?: number }> = ({ tableY = 1380 }) => {
  const over = useOver();
  return (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: over ? "visible" : undefined }}>
    <defs>
      <linearGradient id="sun" x1="0" x2="1">
        <stop offset="0" stopColor="#ffd98a" stopOpacity={0.55} />
        <stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
      </linearGradient>
    </defs>
    <rect y={-over} width={1080} height={1920 + 2 * over} fill={CREAM} />
    <polygon points="0,220 0,1000 760,1380 420,1380" fill="url(#sun)" opacity={0.6} />
    <g>
      <rect x={-30} y={250} width={230} height={560} rx={20} fill="#ffe7b0" stroke={NAVY} strokeWidth={6} />
      <line x1={85} y1={250} x2={85} y2={810} stroke={NAVY} strokeWidth={5} />
      <line x1={-30} y1={530} x2={200} y2={530} stroke={NAVY} strokeWidth={5} />
    </g>
    <rect x={0} y={tableY} width={1080} height={1920 + over - tableY} fill={PEACH} />
    <line x1={0} y1={tableY} x2={1080} y2={tableY} stroke={NAVY} strokeWidth={6} />
    <rect x={0} y={tableY + 28} width={1080} height={12} fill="#d99c78" />
  </svg>
  );
};

// Kid in side profile facing right, head centre (hx,hy), scale s. Optional arm holding a spoon (side view) at (sx,sy).
const PROFILE = { forehead: [92, -78] as const, chin: [64, 112] as const };
export const Profile: React.FC<{ hx: number; hy: number; s: number; body?: boolean; ghost?: boolean }> = ({ hx, hy, s, body = false, ghost = false }) => (
  <g transform={`translate(${hx} ${hy}) scale(${s})`} stroke={NAVY} strokeWidth={5 / s} strokeLinejoin="round" opacity={ghost ? 0.4 : 1}>
    {body ? <path d="M -170 420 Q -160 190 -30 170 Q 90 170 110 420 Z" fill={TEAL} /> : null}
    <path d="M -40 100 L -36 190 L 40 190 L 36 100 Z" fill={SKIN} />
    <path d="M -110 -10 Q -120 -140 0 -142 Q 100 -142 104 -60 L 112 -10 Q 132 6 112 22 L 104 40 Q 104 70 92 88 Q 80 120 40 122 Q -40 124 -90 80 Q -116 40 -110 -10 Z" fill={SKIN} />
    <path d="M -118 0 Q -132 -150 0 -152 Q 92 -152 104 -86 Q 40 -110 -20 -96 Q -60 -60 -70 10 Q -100 20 -118 0 Z" fill={HAIR} />
    <ellipse cx={-40} cy={10} rx={18} ry={26} fill={SKIN} />
    <path d="M 98 -100 C 130 -102 132 -66 108 -62 C 90 -59 88 -80 102 -82" fill="none" stroke={HAIR} strokeWidth={10 / s} strokeLinecap="round" />
    <ellipse cx={62} cy={-22} rx={9} ry={13} fill={NAVY} stroke="none" />
    <path d="M 50 -48 q 16 -10 32 -2" fill="none" strokeWidth={6 / s} strokeLinecap="round" />
    <path d="M 70 70 q 18 8 30 -2" fill="none" strokeWidth={5 / s} strokeLinecap="round" />
  </g>
);

// Side-view spoon held by a hand: bowl cup facing left (toward the face) at (x,y)
const SpoonSide: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -90 Q 50 0 0 90" fill="none" stroke={SILVER} strokeWidth={26} strokeLinecap="round" />
    <path d="M 0 -90 Q 50 0 0 90" fill="none" stroke="#3f4752" strokeWidth={4} />
    <path d="M 8 -60 Q 30 0 8 50" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.9} />
    <path d="M 4 90 L 14 300" stroke={SILVER} strokeWidth={18} strokeLinecap="round" />
    <path d="M 4 90 L 14 300" stroke="#3f4752" strokeWidth={3} />
    <ellipse cx={14} cy={230} rx={34} ry={44} fill={SKIN} stroke={NAVY} strokeWidth={5} />
  </g>
);

// ---------- concave mirror geometry (side view) ----------
type V2 = [number, number];
type Mirror = { vx: number; cy: number; R: number; ap: number };
const arcX = (m: Mirror, y: number) => m.vx - m.R + Math.sqrt(m.R * m.R - (y - m.cy) ** 2);
const reflect = (m: Mirror, p: V2, hitY: number) => {
  const M: V2 = [arcX(m, hitY), hitY];
  const C: V2 = [m.vx - m.R, m.cy];
  const nl = Math.hypot(M[0] - C[0], M[1] - C[1]);
  const n: V2 = [(M[0] - C[0]) / nl, (M[1] - C[1]) / nl];
  const dl = Math.hypot(M[0] - p[0], M[1] - p[1]);
  const d: V2 = [(M[0] - p[0]) / dl, (M[1] - p[1]) / dl];
  const k = d[0] * n[0] + d[1] * n[1];
  const r: V2 = [d[0] - 2 * k * n[0], d[1] - 2 * k * n[1]];
  return { M, r };
};
const meet = (a: V2, da: V2, b: V2, db: V2): V2 => {
  const den = da[0] * db[1] - da[1] * db[0];
  const t = ((b[0] - a[0]) * db[1] - (b[1] - a[1]) * db[0]) / den;
  return [a[0] + t * da[0], a[1] + t * da[1]];
};

const MirrorArc: React.FC<{ m: Mirror; glow?: number }> = ({ m, glow = 0 }) => {
  const pts: string[] = [];
  for (let y = m.cy - m.ap; y <= m.cy + m.ap; y += 6) pts.push(`${arcX(m, y)},${y}`);
  const d = `M ${pts.join(" L ")}`;
  return (
    <g style={glow > 0 ? { filter: `drop-shadow(0 0 ${18 * glow}px #ffffff)` } : undefined}>
      <path d={d} fill="none" stroke={SILVER} strokeWidth={30} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#3f4752" strokeWidth={4} transform="translate(-14 0)" />
      <path d={d} fill="none" stroke="#3f4752" strokeWidth={4} transform="translate(14 0)" />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={6} transform="translate(-6 0)" opacity={0.85} />
    </g>
  );
};

// Segment drawn progressively with a mid arrow
const Ray: React.FC<{ a: V2; b: V2; amt: number; color: string; dotted?: boolean; w?: number }> = ({ a, b, amt, color, dotted, w = 6 }) => {
  if (amt <= 0) return null;
  const e: V2 = [a[0] + (b[0] - a[0]) * amt, a[1] + (b[1] - a[1]) * amt];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const mx = a[0] + (b[0] - a[0]) * Math.min(amt, 0.55);
  const my = a[1] + (b[1] - a[1]) * Math.min(amt, 0.55);
  const h = 16;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={e[0]} y2={e[1]} stroke={color} strokeWidth={dotted ? 4 : w} strokeDasharray={dotted ? "3 12" : undefined} strokeLinecap="round" />
      {!dotted && amt > 0.5 ? (
        <polygon
          points={`${mx + Math.cos(ang) * h},${my + Math.sin(ang) * h} ${mx + Math.cos(ang + 2.5) * h},${my + Math.sin(ang + 2.5) * h} ${mx + Math.cos(ang - 2.5) * h},${my + Math.sin(ang - 2.5) * h}`}
          fill={color}
        />
      ) : null}
    </g>
  );
};

const Dot: React.FC<{ p: V2; color: string; appear: number; r?: number }> = ({ p, color, appear, r = 13 }) =>
  appear <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={r * (0.6 + 0.4 * appear)} fill={color} stroke="#fff" strokeWidth={4} opacity={appear} />;

const DiagramBG: React.FC<{ axis?: number; m?: Mirror }> = ({ axis = 0, m }) => {
  const over = useOver();
  return (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: over ? "visible" : undefined }}>
    <rect y={-over} width={1080} height={1920 + 2 * over} fill={CREAM} />
    {m && axis > 0 ? (
      <g opacity={axis}>
        <line x1={20} y1={m.cy} x2={1060} y2={m.cy} stroke={NAVY} strokeWidth={3} strokeDasharray="14 12" opacity={0.55} />
      </g>
    ) : null}
  </svg>
  );
};

// ---------- scenes ----------
const CYD = 880; // diagram axis (screen centre of the content block)

// 1 — First frame: spoon close-up with the upside-down face; hold on chin/curl; pull back: spoon held upright
const Hook: React.FC<IllustrationProps> = () => {
  const t = useT();
  const pull = fade(t, 9.3, 1.3);
  const sc = interpolate(pull, [0, 1], [1, 0.32]);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Shift>
      <Room />
      {/* close-up spoon (POV) shrinks into the wide shot */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - fade(t, 10.0, 0.6), transform: `scale(${sc})`, transformOrigin: "760px 700px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <SpoonFront cx={540} cy={780} rx={330} ry={430} flip={0} id="h" />
        </svg>
      </div>
      {/* wide shot: kid holds the spoon straight at arm's length */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: fade(t, 9.8, 0.6) }}>
        <Profile hx={320} hy={820} s={1.5} body />
        <path d="M 360 1095 Q 560 1110 760 1030" fill="none" stroke={TEAL} strokeWidth={60} strokeLinecap="round" />
        <SpoonSide x={760} y={720} s={1.3} />
      </svg>
      <Tag x={820} y={470} text="থুতনি উপরে" appear={fade(t, 7.0) * (1 - fade(t, 9.3, 0.3))} color="#cfe3ff" to={{ x: 560, y: 600 }} size={36} />
      <Tag x={260} y={1180} text="চুল নিচে" appear={fade(t, 8.3) * (1 - fade(t, 9.3, 0.3))} color="#ffe2a8" to={{ x: 530, y: 1000 }} size={36} />
      <Tag x={760} y={420} text="চামচ তো সোজা!" appear={fade(t, 9.95)} color="#ffffff" size={36} to={{ x: 770, y: 600 }} />
      <Tag x={540} y={1280} text="তাহলে উল্টো কেন?" appear={fade(t, 11.04)} color="#fde047" size={40} />
      </Shift>
      <Paper />
      <Badge />
    </AbsoluteFill>
  );
};

// 2 — Side angle: bring the spoon close without turning it; eye view: blur, then a big upright eye
const Close: React.FC<IllustrationProps> = () => {
  const t = useT();
  const sx = kf(t, [
    [0.8, 760],
    [4.4, 500],
  ]);
  const toEye = fade(t, 4.9, 0.4);
  const flip = interpolate(t, [5.0, 5.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const compare = fade(t, 8.8, 0.5);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Shift>
      <Room />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: 1 - toEye }}>
        <Profile hx={320} hy={820} s={1.5} body />
        <path d={`M 360 1095 Q ${(360 + sx) / 2 + 40} ${1110 - (760 - sx) * 0.2} ${sx} 1030`} fill="none" stroke={TEAL} strokeWidth={60} strokeLinecap="round" />
        <SpoonSide x={sx} y={720} s={1.3} />
        <line x1={455} y1={560} x2={sx - 10} y2={560} stroke={NAVY} strokeWidth={4} strokeDasharray="6 10" opacity={fade(t, 1.0)} />
      </svg>
      <Tag x={(455 + sx) / 2} y={510} text={sx < 560 ? "খুব কাছে" : "দূরত্ব কমছে"} appear={fade(t, 1.0) * (1 - toEye)} color="#ffffff" size={32} />
      <Tag x={760} y={1200} text="ঘোরানো নয় ✓" appear={fade(t, 0.88) * (1 - fade(t, 3.6, 0.3))} color="#c9f1ec" size={34} />
      {/* eye view of the spoon */}
      <div style={{ position: "absolute", inset: 0, opacity: toEye * (1 - compare) }}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <SpoonFront cx={540} cy={800} rx={380} ry={500} flip={flip} id="c" />
        </svg>
      </div>
      <Tag x={540} y={300} text="সোজা!" appear={fade(t, 6.22) * (1 - compare)} color="#c9f1ec" size={44} />
      <Tag x={860} y={1250} text="আর বড়!" appear={fade(t, 7.38) * (1 - compare)} color="#fde047" size={38} />
      {/* same spoon, two pictures — decided by distance */}
      <div style={{ position: "absolute", inset: 0, opacity: compare }}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <rect y={-300} width={1080} height={2600} fill={CREAM} />
          <SpoonFront cx={290} cy={760} rx={190} ry={250} flip={0} id="c1" />
          <SpoonFront cx={790} cy={760} rx={190} ry={250} flip={1} id="c2" />
        </svg>
        <Tag x={290} y={420} text="দূরে → উল্টো" appear={fade(t, 9.2)} color="#ffe2a8" size={34} />
        <Tag x={790} y={420} text="কাছে → সোজা" appear={fade(t, 9.62)} color="#c9f1ec" size={34} />
      </div>
      </Shift>
      <Paper />
      <Badge />
    </AbsoluteFill>
  );
};

// far-case mirror (object beyond the centre of curvature → real, inverted, smaller image)
const MF: Mirror = { vx: 930, cy: CYD, R: 520, ap: 270 };
const HF = { hx: 150, hy: CYD - 15, s: 1.3 };
const P_FORE: V2 = [HF.hx + PROFILE.forehead[0] * HF.s, HF.hy + PROFILE.forehead[1] * HF.s];
const P_CHIN: V2 = [HF.hx + PROFILE.chin[0] * HF.s, HF.hy + PROFILE.chin[1] * HF.s];

// 3 — Zoom to the spoon rim; the curve becomes the side-view diagram; where light lands decides where it goes
const Curve: React.FC<IllustrationProps> = () => {
  const t = useT();
  const zoom = kf(t, [
    [0, 1],
    [1.4, 5],
  ]);
  const toDia = fade(t, 1.0, 0.7);
  const P: V2 = [HF.hx + 100 * HF.s, HF.hy];
  const hits = [MF.cy - 210, MF.cy - 40, MF.cy + 170];
  const at = [3.72, 4.42, 4.96];
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Shift>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - toDia, transform: `scale(${zoom})`, transformOrigin: "900px 800px" }}>
        <Room />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <SpoonFront cx={540} cy={800} rx={380} ry={500} flip={1} id="z" />
        </svg>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: toDia }}>
        <DiagramBG />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <MirrorArc m={MF} glow={fade(t, 1.56, 0.3) * (1 - fade(t, 2.9, 0.4))} />
          <g opacity={fade(t, 3.0, 0.5)}>
            <Profile {...HF} />
          </g>
          {hits.map((hy, i) => {
            const { M, r } = reflect(MF, P, hy);
            const out: V2 = [M[0] + r[0] * 380, M[1] + r[1] * 380];
            return (
              <g key={i}>
                <Ray a={P} b={M} amt={interpolate(t, [at[i], at[i] + 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} color={NAVY} w={4} />
                <Ray a={M} b={out} amt={interpolate(t, [7.38 + i * 0.3, 8.0 + i * 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} color={NAVY} w={4} />
              </g>
            );
          })}
        </svg>
        <Tag x={930} y={500} text="বাটির মতো বাঁকা" appear={fade(t, 1.56)} color="#ffffff" size={36} />
        <Tag x={300} y={1290} text="মুখ" appear={fade(t, 3.14)} color="#ffffff" size={34} />
        <Tag x={560} y={1290} text="যেখানে পড়ে, সেই দিকে ফেরে" appear={fade(t, 6.68)} color="#fde047" size={32} />
      </div>
      </Shift>
      <Paper />
      <Badge />
    </AbsoluteFill>
  );
};

// 4 — Far: forehead rays (amber) meet below the axis, chin rays (blue) meet above → upside-down image
const Far: React.FC<IllustrationProps> = () => {
  const t = useT();
  const fHits = [MF.cy - 230, MF.cy + 150];
  const cHits = [MF.cy - 160, MF.cy + 230];
  const fr = fHits.map((h) => reflect(MF, P_FORE, h));
  const cr = cHits.map((h) => reflect(MF, P_CHIN, h));
  const imgF = meet(fr[0].M, fr[0].r, fr[1].M, fr[1].r);
  const imgC = meet(cr[0].M, cr[0].r, cr[1].M, cr[1].r);
  const ext = (o: { M: V2; r: V2 }, img: V2): V2 => {
    const dist = Math.hypot(img[0] - o.M[0], img[1] - o.M[1]) + 120;
    return [o.M[0] + o.r[0] * dist, o.M[1] + o.r[1] * dist];
  };
  const seg = (a: number, d = 0.7) => interpolate(t, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ghost = fade(t, 13.8, 1.0);
  const mag = (imgC[1] - imgF[1]) / (P_CHIN[1] - P_FORE[1]); // negative = inverted
  const gs = Math.abs(mag) * HF.s;
  const gcx = (imgF[0] + imgC[0]) / 2;
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Shift>
      <DiagramBG axis={fade(t, 0.3)} m={MF} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <MirrorArc m={MF} />
        <Profile {...HF} />
        {/* inverted image (ghost), placed so its forehead/chin sit on the meeting points */}
        <g opacity={ghost * 0.9} transform={`translate(${gcx - PROFILE.forehead[0] * gs * 0.8} ${imgF[1]}) scale(${gs} ${-gs}) translate(0 ${-PROFILE.forehead[1]})`}>
          <Profile hx={0} hy={0} s={1} ghost />
        </g>
        {fr.map((o, i) => (
          <g key={`f${i}`}>
            <Ray a={P_FORE} b={o.M} amt={seg(0.9 + i * 0.3, 0.9)} color={AMBER} />
            <Ray a={o.M} b={ext(o, imgF)} amt={seg(7.7 + i * 0.4, 1.4)} color={AMBER} />
          </g>
        ))}
        {cr.map((o, i) => (
          <g key={`c${i}`}>
            <Ray a={P_CHIN} b={o.M} amt={seg(3.86 + i * 0.3, 0.9)} color={BLUE} />
            <Ray a={o.M} b={ext(o, imgC)} amt={seg(11.45 + i * 0.3, 1.2)} color={BLUE} />
          </g>
        ))}
        <Dot p={P_FORE} color={AMBER} appear={fade(t, 0.88)} />
        <Dot p={P_CHIN} color={BLUE} appear={fade(t, 3.86)} />
        <Dot p={imgF} color={AMBER} appear={fade(t, 10.6)} r={16} />
        <Dot p={imgC} color={BLUE} appear={fade(t, 12.6)} r={16} />
      </svg>
      <Tag x={220} y={480} text="কপাল" appear={fade(t, 2.18)} color="#ffe2a8" size={32} to={{ x: P_FORE[0], y: P_FORE[1] - 20 }} />
      <Tag x={220} y={1260} text="থুতনি" appear={fade(t, 4.54)} color="#cfe3ff" size={32} to={{ x: P_CHIN[0], y: P_CHIN[1] + 20 }} />
      <Tag x={980} y={CYD - 40} text="মাঝের রেখা" appear={fade(t, 0.3) * (1 - fade(t, 6.0, 0.3))} color="#ffffff" size={26} />
      <Tag x={imgF[0]} y={imgF[1] + 330} text="কপাল নিচে ↓" appear={fade(t, 14.38)} color="#ffe2a8" size={32} to={{ x: imgF[0], y: imgF[1] + 20 }} />
      <Tag x={imgC[0]} y={imgC[1] - 330} text="থুতনি উপরে ↑" appear={fade(t, 15.62)} color="#cfe3ff" size={32} to={{ x: imgC[0], y: imgC[1] - 20 }} />
      </Shift>
      <Paper />
      <Badge />
    </AbsoluteFill>
  );
};

// near-case mirror (object inside the focus → reflected rays spread; virtual upright bigger image behind)
const MN: Mirror = { vx: 560, cy: CYD, R: 560, ap: 280 };
const HN = { hx: 330, hy: CYD - 15, s: 1.3 };

// 5 — Near: forehead rays spread after reflecting; dotted back-extensions meet behind the spoon
const Near: React.FC<IllustrationProps> = () => {
  const t = useT();
  const move = kf(t, [
    [0, 0],
    [1.6, 1],
  ]);
  const m: Mirror = { ...MN, vx: interpolate(move, [0, 1], [MF.vx, MN.vx]), R: interpolate(move, [0, 1], [MF.R, MN.R]), ap: interpolate(move, [0, 1], [MF.ap, MN.ap]) };
  const h = { ...HN, hx: interpolate(move, [0, 1], [HF.hx, HN.hx]) };
  const P: V2 = [h.hx + PROFILE.forehead[0] * h.s, h.hy + PROFILE.forehead[1] * h.s];
  const hits = [m.cy - 240, m.cy + 120];
  const rs = hits.map((y) => reflect(m, P, y));
  const virt = meet(rs[0].M, rs[0].r, rs[1].M, rs[1].r); // behind the mirror (x > vx)
  const seg = (a: number, d = 0.8) => interpolate(t, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const big = fade(t, 9.48, 1.0);
  const plate = useContext(SpoonLayoutContext).legendPlate
    ? { background: "rgba(255,244,226,0.94)", padding: "8px 18px", borderRadius: 18, left: 44 }
    : {};
  const mag = (virt[1] - m.cy) / (P[1] - m.cy);
  const gs = mag * h.s;
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Shift>
      <DiagramBG axis={1} m={m} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* big upright face where the light seems to come from (faint) */}
        <g opacity={big * 0.85}>
          <g transform={`translate(${virt[0] - PROFILE.forehead[0] * gs} ${virt[1] - PROFILE.forehead[1] * gs}) scale(${gs})`}>
            <Profile hx={0} hy={0} s={1} ghost />
          </g>
        </g>
        <MirrorArc m={m} />
        <Profile {...h} />
        {rs.map((o, i) => {
          const out: V2 = [o.M[0] + o.r[0] * 420, o.M[1] + o.r[1] * 420];
          return (
            <g key={i}>
              <Ray a={P} b={o.M} amt={seg(2.1 + i * 0.3)} color={AMBER} />
              <Ray a={o.M} b={out} amt={seg(4.2 + i * 0.3, 1.0)} color={AMBER} />
              <Ray a={o.M} b={virt} amt={seg(6.56 + i * 0.3, 1.0)} color={AMBER} dotted />
            </g>
          );
        })}
        <Dot p={P} color={AMBER} appear={fade(t, 2.1)} />
        <Dot p={virt} color={AMBER} appear={fade(t, 7.9)} r={16} />
        {/* eye at the left looking toward the spoon */}
        <g opacity={fade(t, 6.09)}>
          <path d="M 120 1180 Q 170 1140 220 1180 Q 170 1220 120 1180 Z" fill="#fff" stroke={NAVY} strokeWidth={5} />
          <circle cx={170} cy={1180} r={16} fill={NAVY} />
        </g>
      </svg>
      <Tag x={500} y={420} text="খুব কাছে" appear={fade(t, 0.84) * (1 - fade(t, 3.9, 0.3))} color="#ffffff" size={34} />
      <Tag x={300} y={420} text="ছড়িয়ে যায়" appear={fade(t, 5.14)} color="#ffe2a8" size={34} />
      <Tag x={800} y={330} text="চামচের পেছনে" appear={fade(t, 8.54)} color="#ffffff" size={30} />
      <Tag x={860} y={1380} text="বড়, সোজা মুখ" appear={fade(t, 10.0)} color="#c9f1ec" size={34} />
      {/* legend: solid = real path, dotted = where the eye thinks it comes from */}
      <div style={{ position: "absolute", left: 60, top: 1250, fontFamily: FONT, fontWeight: 700, fontSize: 28, color: NAVY, opacity: fade(t, 7.04), lineHeight: 1.6, ...plate }}>
        <div>
          <span style={{ display: "inline-block", width: 60, borderTop: `6px solid ${AMBER}`, verticalAlign: "middle", marginRight: 12 }} />
          আলোর আসল পথ
        </div>
        <div>
          <span style={{ display: "inline-block", width: 60, borderTop: `5px dotted ${AMBER}`, verticalAlign: "middle", marginRight: 12 }} />
          চোখে যেখানে মনে হয়
        </div>
      </div>
      </Shift>
      <Paper />
      <Badge />
    </AbsoluteFill>
  );
};

// 6 — Back to a real spoon in YOUR hand: it moves away, the picture flips; hold on the curl at the bottom
const End: React.FC<IllustrationProps> = () => {
  const t = useT();
  const fromDia = fade(t, 0, 0.8);
  const dist = kf(t, [
    [0.8, 0],
    [3.8, 1],
  ]);
  const s = interpolate(dist, [0, 1], [1.25, 0.72]);
  const flip = 1 - interpolate(t, [2.3, 3.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cy = interpolate(dist, [0, 1], [820, 760]);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Shift>
      <Room />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: fromDia }}>
        <g transform={`translate(540 ${cy}) scale(${s}) translate(-540 ${-cy})`}>
          <SpoonFront cx={540} cy={cy} rx={300} ry={390} flip={flip} id="e" />
          {/* your hand holding the handle */}
          <path d={`M 470 ${cy + 1180} Q 470 ${cy + 1000} 520 ${cy + 960} L 600 ${cy + 960} Q 640 ${cy + 1000} 630 ${cy + 1180} Z`} fill={SKIN} stroke={NAVY} strokeWidth={6} />
          <path d={`M 500 ${cy + 1010} h 110 M 498 ${cy + 1060} h 116`} stroke={NAVY} strokeWidth={4} opacity={0.5} />
        </g>
        {t > 3.64 ? (
          <circle cx={540} cy={cy + 56 * s} r={60 * s} fill="none" stroke="#fde047" strokeWidth={8} strokeDasharray="12 10" opacity={fade(t, 3.64)} />
        ) : null}
      </svg>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - fromDia }}>
        <DiagramBG />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <MirrorArc m={MN} />
        </svg>
      </div>
      <Tag x={540} y={330} text="দূরে সরাও…" appear={fade(t, 1.2) * (1 - fade(t, 3.5, 0.3))} color="#ffffff" size={36} />
      <Tag x={820} y={1260} text="চুল আবার নিচে!" appear={fade(t, 3.9)} color="#ffe2a8" size={34} />
      </Shift>
      <Paper />
      <Badge />
    </AbsoluteFill>
  );
};

export const SPOON = {
  "spoon/hook": Hook,
  "spoon/close": Close,
  "spoon/curve": Curve,
  "spoon/far": Far,
  "spoon/near": Near,
  "spoon/end": End,
};
