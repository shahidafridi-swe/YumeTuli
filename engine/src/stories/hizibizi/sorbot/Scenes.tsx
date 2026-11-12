// hizibizi · Why Is That? — পর্ব ২: শরবত লাল, কিন্তু গ্লাসের বাইরের ফোঁটা স্বচ্ছ কেন?
// Beat times (seconds from scene start) come from the aligned captions in
// public/projects/hizibizi/sorbot-bn/scenes.json.
import { interpolate } from "remotion";
import type { IllustrationProps } from "../../../illustrations/registry";
import { useT } from "../../../tech/anim";
import { FONT, Label, NAVY, SeriesBadge, StagePage, fade, kf, rnd } from "../common";

const CREAM = "#FFF4E2";
const PEACH = "#E9B797";
const RED = "#C92D48";
const ICE = "#D9F5F2";
const DROP_EDGE = "#7d96ad";
const VAPOR = "#2bb5a8";
const SKIN = "#F2B98C";

// ---------- pieces ----------

// Transparent water drop: no fill colour of its own, thin cool-grey edge + small white highlight
export const Drop: React.FC<{ x: number; y: number; r: number; opacity?: number }> = ({ x, y, r, opacity = 1 }) =>
  r <= 0.5 ? null : (
    <g opacity={opacity}>
      <ellipse cx={x} cy={y} rx={r} ry={r * 1.08} fill="rgba(255,255,255,0.10)" stroke={DROP_EDGE} strokeWidth={Math.max(1.6, r * 0.12)} />
      <ellipse cx={x - r * 0.35} cy={y - r * 0.4} rx={r * 0.22} ry={r * 0.16} fill="#ffffff" opacity={0.95} />
    </g>
  );

export const Room: React.FC<{ tableY: number; window?: boolean }> = ({ tableY, window = true }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <rect x={0} y={-400} width={1080} height={2800} fill={CREAM} />
    {window ? (
      <g>
        <rect x={690} y={290} width={290} height={300} rx={22} fill="#ffe2a8" stroke={NAVY} strokeWidth={6} />
        <line x1={835} y1={290} x2={835} y2={590} stroke={NAVY} strokeWidth={5} />
        <line x1={690} y1={440} x2={980} y2={440} stroke={NAVY} strokeWidth={5} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={712 + i * 58} y1={290} x2={712 + i * 58} y2={590} stroke={NAVY} strokeWidth={2} opacity={0.35} />
        ))}
        <polygon points="690,590 980,590 1040,700 640,700" fill="rgba(255,214,140,0.25)" />
      </g>
    ) : null}
    <rect x={0} y={tableY} width={1080} height={2400 - tableY} fill={PEACH} />
    <line x1={0} y1={tableY} x2={1080} y2={tableY} stroke={NAVY} strokeWidth={6} />
    <rect x={0} y={tableY + 26} width={1080} height={10} fill="#d99c78" />
  </svg>
);

type GlassProps = {
  cx: number;
  bottom: number;
  w: number;
  h: number;
  level?: number; // 0..1 sorbot level
  ice?: number[]; // per-cube 0..1 drop-in progress
  drops?: number; // 0..1 condensation time-lapse
  dropMask?: (y: number) => boolean; // false = wiped
  hideDrop?: number; // index of a drop that was picked up
  seed?: number;
};

const N_DROPS = 34;
const dropsFor = (g: GlassProps) => {
  const top = g.bottom - g.h;
  const liquidTop = g.bottom - 24 - (g.level ?? 0) * (g.h - 70);
  return Array.from({ length: N_DROPS }, (_, i) => {
    const s = g.seed ?? 1;
    const y = liquidTop + 20 + rnd(i, s) * (g.bottom - 40 - liquidTop - 20);
    const k = (y - top) / g.h;
    const half = (g.w / 2) * (1 - 0.18 * k);
    const x = g.cx + (rnd(i, s + 2) - 0.5) * 2 * half * 0.86;
    const r = (g.w / 300) * (6 + 12 * rnd(i, s + 3));
    const at = rnd(i, s + 4) * 0.8;
    return { x, y, r, at };
  });
};

export const Glass: React.FC<GlassProps> = (g) => {
  const { cx, bottom, w, h, level = 0, ice = [], drops = 0, dropMask, hideDrop } = g;
  const top = bottom - h;
  const bw = w * 0.82;
  const glassPath = `M ${cx - w / 2} ${top} L ${cx - bw / 2} ${bottom - 26} Q ${cx - bw / 2 + 4} ${bottom} ${cx - bw / 2 + 30} ${bottom} L ${cx + bw / 2 - 30} ${bottom} Q ${cx + bw / 2 - 4} ${bottom} ${cx + bw / 2} ${bottom - 26} L ${cx + w / 2} ${top}`;
  const lt = bottom - 24 - level * (h - 70);
  const halfAt = (y: number) => (w / 2) * (1 - 0.18 * ((y - top) / h)) - 9;
  const liquid = `M ${cx - halfAt(lt)} ${lt} L ${cx - halfAt(bottom - 30)} ${bottom - 30} Q ${cx - halfAt(bottom - 30)} ${bottom - 14} ${cx - halfAt(bottom - 30) + 22} ${bottom - 14} L ${cx + halfAt(bottom - 30) - 22} ${bottom - 14} Q ${cx + halfAt(bottom - 30)} ${bottom - 14} ${cx + halfAt(bottom - 30)} ${bottom - 30} L ${cx + halfAt(lt)} ${lt} Z`;
  const cube = w * 0.24;
  const ds = dropsFor(g);
  return (
    <g>
      <ellipse cx={cx} cy={bottom + 6} rx={w * 0.55} ry={16} fill="rgba(32,50,71,0.18)" />
      {level > 0.01 ? (
        <g>
          <path d={liquid} fill={RED} />
          <ellipse cx={cx} cy={lt} rx={halfAt(lt)} ry={10} fill="#e0566f" />
        </g>
      ) : null}
      {ice.map((p, i) => {
        if (p <= 0) return null;
        const tx = cx + (i - (ice.length - 1) / 2) * cube * 0.95;
        const ty = interpolate(p, [0, 1], [top - 160, lt - cube * 0.35 + (i % 2) * 12]);
        return (
          <g key={i} transform={`rotate(${(i % 2 ? 12 : -10) * p} ${tx} ${ty})`}>
            <rect x={tx - cube / 2} y={ty - cube / 2} width={cube} height={cube} rx={cube * 0.22} fill={ICE} stroke={NAVY} strokeWidth={4} opacity={0.95} />
            <rect x={tx - cube / 2 + 8} y={ty - cube / 2 + 8} width={cube * 0.3} height={cube * 0.14} rx={4} fill="#fff" />
          </g>
        );
      })}
      <path d={`${glassPath} Z`} fill="rgba(255,255,255,0.18)" />
      <path d={glassPath} fill="none" stroke={NAVY} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={cx} cy={top} rx={w / 2} ry={12} fill="none" stroke={NAVY} strokeWidth={3} />
      <line x1={cx - w / 2 + 26} y1={top + 40} x2={cx - bw / 2 + 24} y2={bottom - 60} stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
      {ds.map((d, i) =>
        i === hideDrop || (dropMask && !dropMask(d.y)) ? null : (
          <Drop key={i} x={d.x} y={d.y} r={d.r * Math.max(0, Math.min(1, (drops - d.at) * 5))} />
        ),
      )}
    </g>
  );
};

// Index finger pointing left, tip at (tx, ty), with an optional drop on the tip
export const Finger: React.FC<{ tx: number; ty: number; drop?: number }> = ({ tx, ty, drop = 0 }) => (
  <g>
    <rect x={tx} y={ty - 44} width={1200} height={88} rx={44} fill={SKIN} stroke={NAVY} strokeWidth={5} />
    <path d={`M ${tx + 14} ${ty - 30} Q ${tx + 8} ${ty} ${tx + 14} ${ty + 30} L ${tx + 62} ${ty + 30} Q ${tx + 70} ${ty} ${tx + 62} ${ty - 30} Z`} fill="#f9d9c2" stroke={NAVY} strokeWidth={3} />
    <path d={`M ${tx + 170} ${ty - 22} q 8 22 0 44`} fill="none" stroke={NAVY} strokeWidth={3} opacity={0.5} />
    <path d={`M ${tx + 186} ${ty - 22} q 8 22 0 44`} fill="none" stroke={NAVY} strokeWidth={3} opacity={0.5} />
    {drop > 0 ? <Drop x={tx + 52} y={ty - 44 - 28 * drop} r={34 * drop} /> : null}
  </g>
);

const VaporDots: React.FC<{ t: number; x0: number; x1: number; y0: number; y1: number; n: number; appear: number; cold?: { x: number; amt: number } }> = ({
  t,
  x0,
  x1,
  y0,
  y1,
  n,
  appear,
  cold,
}) => (
  <g opacity={appear}>
    {Array.from({ length: n }, (_, i) => {
      const bx = x0 + rnd(i, 21) * (x1 - x0);
      const by = y0 + rnd(i, 22) * (y1 - y0);
      const slow = cold && bx < cold.x ? 1 - 0.75 * cold.amt : 1;
      const x = bx + Math.sin(t * (0.9 + rnd(i, 23)) + i) * 22 * slow;
      const y = by + Math.cos(t * (0.7 + rnd(i, 24)) + i * 2) * 26 * slow;
      return <circle key={i} cx={x} cy={y} r={7} fill={VAPOR} opacity={0.85} />;
    })}
  </g>
);

const Clock: React.FC<{ x: number; y: number; t: number; appear: number }> = ({ x, y, t, appear }) =>
  appear <= 0 ? null : (
    <g opacity={appear}>
      <circle cx={x} cy={y} r={44} fill="#ffffff" stroke={NAVY} strokeWidth={6} />
      <line x1={x} y1={y} x2={x + Math.cos(t * 9) * 30} y2={y + Math.sin(t * 9) * 30} stroke={NAVY} strokeWidth={6} strokeLinecap="round" />
      <line x1={x} y1={y} x2={x + Math.cos(t * 0.8) * 20} y2={y + Math.sin(t * 0.8) * 20} stroke={RED} strokeWidth={6} strokeLinecap="round" />
      <text x={x} y={y + 80} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill={NAVY}>
        time-lapse
      </text>
    </g>
  );

// ---------- scenes ----------

// Hook geometry (shared with the ending)
export const H = { cx: 380, bottom: 1290, w: 400, h: 900, level: 0.8, seed: 3 };
export const PICK = 7; // index of the drop the finger picks up
const pickDrop = dropsFor(H)[PICK];
export const FINGER_REST = { x: 760, y: 820 }; // in front of the cream wall

// 1 — Wipe the cold glass, drops come back, pick one up: it's clear. Where did it come from?
const Hook: React.FC<IllustrationProps> = () => {
  const t = useT();
  const clothY = interpolate(t, [0.3, 3.0], [330, 1330], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wiping = t < 3.0;
  const regrow = interpolate(t, [3.6, 5.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drops = wiping ? 1 : regrow;
  const mask = wiping ? (y: number) => y > clothY + 90 : undefined;
  // finger: in from the right, touch the drop, lift it in front of the cream wall, hold still
  const tx = kf(t, [
    [6.3, 1120],
    [7.0, pickDrop.x + 6],
    [7.35, pickDrop.x + 6],
    [8.4, FINGER_REST.x],
  ]);
  const ty = kf(t, [
    [6.3, pickDrop.y + 60],
    [7.0, pickDrop.y + 66],
    [7.35, pickDrop.y + 66],
    [8.4, FINGER_REST.y],
  ]);
  const picked = t >= 7.1;
  const p = fade(t, 9.38, 0.3);
  return (
    <StagePage
      bg={CREAM}
      card={CREAM}
      overlay={
        <>
          <Label x={FINGER_REST.x + 50} y={FINGER_REST.y - 170} text="একদম স্বচ্ছ!" appear={p} color="#ffffff" to={{ x: FINGER_REST.x + 52, y: FINGER_REST.y - 80 }} size={38} />
          <Label x={380} y={300} text="লাল শরবত" appear={fade(t, 11.38)} color="#ffd1da" to={{ x: 380, y: 760 }} size={36} />
          <Label x={790} y={1080} text="পানিটা কোথা থেকে?" appear={fade(t, 12.45)} color="#fde047" size={36} />
          <SeriesBadge />
        </>
      }
    >
      <Room tableY={1250} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <Glass {...H} ice={[1, 1, 1]} drops={drops} dropMask={mask} hideDrop={picked ? PICK : undefined} />
        <Clock x={830} y={1000} t={t} appear={fade(t, 3.4) * (1 - fade(t, 6.0, 0.3))} />
        {/* cloth */}
        {t < 3.4 ? (
          <g opacity={1 - fade(t, 3.0, 0.3)} transform={`rotate(${Math.sin(t * 7) * 4} 380 ${clothY})`}>
            <rect x={200} y={clothY - 120} width={360} height={190} rx={34} fill="#8fc1d4" stroke={NAVY} strokeWidth={5} />
            {[0, 1, 2].map((i) => (
              <line key={i} x1={210} y1={clothY - 80 + i * 50} x2={550} y2={clothY - 80 + i * 50} stroke="#ffffff" strokeWidth={8} opacity={0.6} />
            ))}
          </g>
        ) : null}
        {t >= 6.3 ? <Finger tx={tx} ty={ty} drop={picked ? 1 : 0} /> : null}
        {/* steady beat sparkle */}
        {t > 9.3 && t < 10.3 ? (
          <g opacity={1 - Math.abs(t - 9.8) * 2}>
            <path d={`M ${FINGER_REST.x + 100} ${FINGER_REST.y - 120} l 8 -22 l 8 22 l 22 8 l -22 8 l -8 22 l -8 -22 l -22 -8 Z`} fill="#ffffff" stroke={NAVY} strokeWidth={3} />
          </g>
        ) : null}
        {/* the big question mark */}
        <text x={900} y={1210} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={150} fill={RED} stroke={NAVY} strokeWidth={6} opacity={fade(t, 13.7)}>
          ?
        </text>
      </svg>
    </StagePage>
  );
};

// 2 — Two identical dry glasses, same red sorbot; ice only in the left. Only the cold one sweats.
const ICE_AT = [6.9, 7.12, 7.34];
const Test: React.FC<IllustrationProps> = () => {
  const t = useT();
  const inn = fade(t, 2.41, 0.5);
  const level = interpolate(t, [4.7, 6.1], [0, 0.72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ice = ICE_AT.map((a) => interpolate(t, [a, a + 0.32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const drops = interpolate(t, [10.4, 12.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const L = { cx: 300, bottom: 1215, w: 300, h: 640, seed: 5 };
  const R = { cx: 780, bottom: 1215, w: 300, h: 640, seed: 9 };
  return (
    <StagePage
      bg={CREAM}
      card={CREAM}
      overlay={
        <>
          <Label x={300} y={1320} text="বরফসহ" appear={fade(t, 7.02)} color={ICE} size={38} />
          <Label x={780} y={1320} text="ঘরের তাপমাত্রায়" appear={fade(t, 8.82)} color="#ffe2a8" size={34} />
          <Label x={780} y={470} text="শুকনো" appear={fade(t, 12.85)} color="#ffffff" size={34} />
          <Label x={300} y={470} text="ফোঁটা জমেছে!" appear={fade(t, 12.39)} color="#ffffff" size={34} />
          <SeriesBadge />
        </>
      }
    >
      <Room tableY={1180} window={false} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <g opacity={inn} transform={`translate(0 ${(1 - inn) * 60})`}>
          <Glass {...L} level={level} ice={ice} drops={drops} />
          <Glass {...R} level={level} />
        </g>
        {/* pour streams */}
        {t > 4.6 && t < 6.15 ? (
          <g>
            <rect x={292} y={300} width={16} height={1215 - 40 - level * 570 - 300} fill={RED} rx={8} />
            <rect x={772} y={300} width={16} height={1215 - 40 - level * 570 - 300} fill={RED} rx={8} />
          </g>
        ) : null}
        <Clock x={540} y={420} t={t} appear={fade(t, 10.06) * (1 - fade(t, 12.2, 0.3))} />
        {drops > 0.6 ? <ellipse cx={300} cy={900} rx={190} ry={330} fill="none" stroke="#ffffff" strokeWidth={8} strokeDasharray="16 14" opacity={fade(t, 11.99) * 0.9} /> : null}
      </svg>
    </StagePage>
  );
};

// Magnified side view: sorbot | thin glass wall | outside air (page coords)
const WALL_X0 = 430;
const WALL_X1 = 500;
const MagView: React.FC<{ t: number; scroll?: number; labels?: number }> = ({ t, scroll = 0, labels = 1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <rect x={0} y={-400} width={WALL_X0} height={2800} fill={RED} />
    {/* sorbot bubbles drifting up */}
    {Array.from({ length: 10 }, (_, i) => (
      <circle key={i} cx={80 + rnd(i, 31) * 320} cy={((1500 - ((t * 60 + rnd(i, 32) * 1300 + scroll) % 1300)) as number)} r={6 + 6 * rnd(i, 33)} fill="#e0566f" />
    ))}
    <rect x={WALL_X0} y={-400} width={WALL_X1 - WALL_X0} height={2800} fill="#e9f6fb" />
    {Array.from({ length: 8 }, (_, i) => {
      const y = ((i * 260 - scroll) % 2080) + 140;
      return <line key={i} x1={WALL_X0 + 14} y1={y} x2={WALL_X1 - 14} y2={y + 70} stroke="#ffffff" strokeWidth={8} opacity={0.9} />;
    })}
    <line x1={WALL_X0} y1={-400} x2={WALL_X0} y2={2400} stroke={NAVY} strokeWidth={5} />
    <line x1={WALL_X1} y1={-400} x2={WALL_X1} y2={2400} stroke={NAVY} strokeWidth={5} />
    <rect x={WALL_X1} y={-400} width={1080 - WALL_X1} height={2800} fill="#fffaf1" />
    <g opacity={labels}>
      <rect x={90} y={268} width={250} height={58} rx={29} fill="#ffffff" stroke={NAVY} strokeWidth={4} />
      <text x={215} y={308} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={32} fill={NAVY}>
        ভেতরে শরবত
      </text>
      <rect x={WALL_X0 - 18} y={268} width={WALL_X1 - WALL_X0 + 36} height={58} rx={29} fill="#ffffff" stroke={NAVY} strokeWidth={4} />
      <text x={(WALL_X0 + WALL_X1) / 2} y={308} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={32} fill={NAVY}>
        কাচ
      </text>
      <rect x={640} y={268} width={300} height={58} rx={29} fill="#ffffff" stroke={NAVY} strokeWidth={4} />
      <text x={790} y={308} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={32} fill={NAVY}>
        বাইরের বাতাস
      </text>
    </g>
  </svg>
);

// 3 — Zoom to the outside of the cold glass: vapour in the air cools and condenses on the glass
const DROP1 = { y: 860, r: 46 };
const DROP2 = { y: 1060, r: 38 };
const MOVERS = 7;
const Zoom: React.FC<IllustrationProps> = () => {
  const t = useT();
  const zoom = kf(t, [
    [0, 1],
    [1.5, 7],
  ]);
  const mag = fade(t, 1.1, 0.5);
  const vapor = fade(t, 3.32, 0.6);
  const cold = fade(t, 7.26, 0.8);
  // condensing dots travel to the wall and build the drops
  const movers = (target: { y: number; r: number }, salt: number, start: number, end: number) =>
    Array.from({ length: MOVERS }, (_, i) => {
      const at = start + (i / MOVERS) * (end - start);
      const k = interpolate(t, [at, at + 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const sx = 620 + rnd(i, salt) * 300;
      const sy = target.y - 220 + rnd(i, salt + 1) * 440;
      const tx = WALL_X1 + target.r * 0.5;
      return { x: sx + (tx - sx) * k, y: sy + (target.y - sy) * k, k, done: k >= 1 };
    });
  const m1 = movers(DROP1, 41, 10.3, 12.9);
  const m2 = movers(DROP2, 51, 11.4, 13.8);
  const r1 = DROP1.r * Math.sqrt(m1.filter((m) => m.done).length / MOVERS);
  const r2 = DROP2.r * Math.sqrt(m2.filter((m) => m.done).length / MOVERS);
  return (
    <StagePage
      bg={CREAM}
      card={CREAM}
      overlay={
        <>
          <Label x={790} y={470} text="জলীয় বাষ্প" appear={fade(t, 4.73) * mag} color="#c9f1ec" size={36} to={{ x: 760, y: 560 }} />
          <Label x={790} y={1370} text="(আসলে চোখে দেখা যায় না)" appear={fade(t, 6.05) * (1 - fade(t, 9.5, 0.3))} color="#ffffff" size={28} />
          <Label x={760} y={1230} text="ঠান্ডা বাতাস" appear={fade(t, 9.11)} color="#cfe8ff" size={32} to={{ x: 570, y: 1170 }} />
          <Label x={820} y={DROP1.y - 10} text="ঘনীভবন" appear={fade(t, 15.63)} color="#fde047" size={32} to={{ x: WALL_X1 + DROP1.r + 6, y: DROP1.y }} />
          <SeriesBadge />
        </>
      }
    >
      {/* zoom from the cold glass into its outer wall */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - mag, transform: `scale(${zoom})`, transformOrigin: `${300 + 150 * 0.86}px 900px` }}>
        <Room tableY={1180} window={false} />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <Glass cx={300} bottom={1215} w={300} h={640} level={0.72} ice={[1, 1, 1]} drops={1} seed={5} />
          <Glass cx={780} bottom={1215} w={300} h={640} level={0.72} seed={9} />
        </svg>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: mag }}>
        <MagView t={t} />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {/* cold layer next to the glass */}
          <defs>
            <linearGradient id="coldL" x1="0" x2="1">
              <stop offset="0" stopColor="#9fd0ff" stopOpacity={0.55} />
              <stop offset="1" stopColor="#9fd0ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <rect x={WALL_X1} y={-400} width={190} height={2800} fill="url(#coldL)" opacity={cold} />
          <VaporDots t={t} x0={540} x1={1010} y0={360} y1={1400} n={44} appear={vapor} cold={{ x: 690, amt: cold }} />
          {[...m1, ...m2].map((m, i) => (m.k > 0 && !m.done ? <circle key={i} cx={m.x} cy={m.y} r={7} fill={VAPOR} /> : null))}
          <Drop x={WALL_X1 + r1 * 0.55} y={DROP1.y} r={r1} />
          <Drop x={WALL_X1 + r2 * 0.55} y={DROP2.y} r={r2} />
        </svg>
      </div>
    </StagePage>
  );
};

// 4 — Macro: two drops merge into one bigger drop, which rolls down; camera follows
const Merge: React.FC<IllustrationProps> = () => {
  const t = useT();
  const meet = interpolate(t, [2.41, 3.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const merged = t >= 3.3;
  const y1 = DROP1.y + (960 - DROP1.y) * meet;
  const y2 = DROP2.y + (960 - DROP2.y) * meet;
  const big = Math.sqrt(DROP1.r ** 2 + DROP2.r ** 2);
  const wobble = merged ? 1 + 0.08 * Math.sin((t - 3.3) * 20) * Math.exp(-(t - 3.3) * 3) : 1;
  // roll: drop moves down, then the camera follows (background scrolls up)
  const fall = interpolate(t, [4.57, 6.7], [0, 900], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dropY = 960 + Math.min(fall, 220);
  const scroll = Math.max(0, fall - 220);
  return (
    <StagePage
      bg={CREAM}
      card={CREAM}
      overlay={
        <>
          <Label x={820} y={DROP1.y - 120} text="দুটো ছোট্ট ফোঁটা" appear={fade(t, 0.86) * (1 - fade(t, 3.2, 0.3))} color="#ffffff" size={34} />
          <Label x={820} y={760} text="একটা বড় ফোঁটা!" appear={fade(t, 3.62) * (1 - fade(t, 5.2, 0.3))} color="#fde047" size={36} />
          <Label x={820} y={760} text="গড়িয়ে পড়ছে ↓" appear={fade(t, 5.24)} color="#ffffff" size={36} />
          <SeriesBadge />
        </>
      }
    >
      <MagView t={t} scroll={scroll} labels={1 - fade(t, 0.3, 0.4)} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <VaporDots t={t} x0={620} x1={1010} y0={360} y1={1400} n={18} appear={0.6} />
        {/* wet trail */}
        {fall > 0 ? <rect x={WALL_X1} y={960 - scroll} width={16} height={dropY - 960 + scroll} fill="rgba(142,164,184,0.35)" rx={8} /> : null}
        {/* tiny far drops scroll with the glass */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Drop key={i} x={WALL_X1 + 10} y={((420 + i * 300 - scroll) % 1300) + 300} r={10 + 4 * rnd(i, 61)} />
        ))}
        {merged ? (
          <Drop x={WALL_X1 + big * 0.55} y={dropY} r={big * wobble} />
        ) : (
          <g>
            <Drop x={WALL_X1 + DROP1.r * 0.55} y={y1} r={DROP1.r} />
            <Drop x={WALL_X1 + DROP2.r * 0.55} y={y2} r={DROP2.r} />
            {t > 0.36 && t < 2.4 ? (
              <g opacity={0.9}>
                <circle cx={WALL_X1 + DROP1.r * 0.55} cy={DROP1.y} r={DROP1.r + 16} fill="none" stroke="#fde047" strokeWidth={6} strokeDasharray="10 8" />
                <circle cx={WALL_X1 + DROP2.r * 0.55} cy={DROP2.y} r={DROP2.r + 16} fill="none" stroke="#fde047" strokeWidth={6} strokeDasharray="10 8" />
              </g>
            ) : null}
          </g>
        )}
      </svg>
    </StagePage>
  );
};

// 5 — Back to the finger: focus on the clear drop, then the red sorbot behind, then back
const End: React.FC<IllustrationProps> = () => {
  const t = useT();
  const toGlass = fade(t, 1.93, 0.6) * (1 - fade(t, 5.36, 0.6));
  const glassBlur = 9 * (1 - toGlass);
  const fingerBlur = 7 * toGlass;
  const air = fade(t, 8.9, 0.8);
  return (
    <StagePage
      bg={CREAM}
      card={CREAM}
      overlay={
        <>
          <Label x={380} y={300} text="লাল রং থাকে ভেতরে" appear={fade(t, 2.7) * (1 - fade(t, 5.3, 0.3))} color="#ffd1da" to={{ x: 380, y: 760 }} size={36} />
          <Label x={FINGER_REST.x + 50} y={FINGER_REST.y - 170} text="পানি এসেছে বাতাস থেকে" appear={fade(t, 9.26)} color="#c9f1ec" to={{ x: FINGER_REST.x + 52, y: FINGER_REST.y - 80 }} size={32} />
          <SeriesBadge />
        </>
      }
    >
      <Room tableY={1250} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, filter: `blur(${glassBlur}px)` }}>
        <Glass {...H} ice={[1, 1, 1]} drops={1} hideDrop={PICK} />
      </svg>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, filter: `blur(${fingerBlur}px)` }}>
        <Finger tx={FINGER_REST.x} ty={FINGER_REST.y} drop={1} />
      </svg>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <VaporDots t={t} x0={560} x1={1020} y0={300} y1={1200} n={22} appear={air * 0.7} />
      </svg>
    </StagePage>
  );
};

export const SORBOT = {
  "sorbot/hook": Hook,
  "sorbot/test": Test,
  "sorbot/zoom": Zoom,
  "sorbot/merge": Merge,
  "sorbot/end": End,
};
