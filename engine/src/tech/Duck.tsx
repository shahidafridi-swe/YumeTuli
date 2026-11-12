import { useCurrentFrame } from "remotion";

// Original flat 2D duck (side view, facing right). Variants for the Strategy Pattern series.
export type DuckKind = "mallard" | "rubber" | "wooden" | "robot";

type Palette = { body: string; chest: string; head: string; beak: string; wing: string; accent?: string };
const PALETTES: Record<DuckKind, Palette> = {
  mallard: { body: "#9aa6b2", chest: "#8b4a2b", head: "#1f7a4d", beak: "#f2c94c", wing: "#6f7f90", accent: "#3b82f6" },
  rubber: { body: "#ffd23f", chest: "#ffd23f", head: "#ffd23f", beak: "#ff8a1f", wing: "#f2bd00" },
  wooden: { body: "#b07a46", chest: "#9a6538", head: "#b07a46", beak: "#7a4f28", wing: "#8e5f33" },
  robot: { body: "#9aa7b5", chest: "#7d8a99", head: "#c0cad5", beak: "#6b7785", wing: "#7d8a99", accent: "#2dd4bf" },
};

export type DuckProps = {
  kind: DuckKind;
  x: number; // center, px in 1080 frame
  y: number; // waterline / ground point
  size?: number; // body width in px
  fly?: number; // 0 = sitting, 1 = flying (lift + flapping)
  warn?: number; // 0..1 orange outline glow
  ok?: number; // 0..1 teal outline glow
  flip?: boolean;
};

export const Duck: React.FC<DuckProps> = ({ kind, x, y, size = 220, fly = 0, warn = 0, ok = 0, flip = false }) => {
  const frame = useCurrentFrame();
  const p = PALETTES[kind];
  const s = size / 220;
  const flap = fly > 0 ? Math.sin(frame / 2.4) * 38 * fly : 0;
  const bob = fly > 0 ? Math.sin(frame / 6) * 10 * fly : Math.sin(frame / 14) * 3;
  const lift = fly * 150;
  const glow = warn > 0 ? `drop-shadow(0 0 ${18 * warn}px rgba(251,146,60,${0.9 * warn}))` : ok > 0 ? `drop-shadow(0 0 ${18 * ok}px rgba(45,212,191,${0.9 * ok}))` : "none";
  const outline = warn > 0.05 ? "#fb923c" : ok > 0.05 ? "#2dd4bf" : "rgba(0,0,0,0.25)";
  const ow = 3 + 3 * Math.max(warn, ok);
  return (
    <svg
      width={300 * s}
      height={300 * s}
      viewBox="-150 -230 300 300"
      style={{ position: "absolute", left: x - 150 * s, top: y - 230 * s - lift + bob, overflow: "visible", filter: glow }}
    >
      <g transform={flip ? "scale(-1,1)" : undefined} stroke={outline} strokeWidth={ow} strokeLinejoin="round">
        {/* water ripple / shadow */}
        {fly < 0.5 ? (
          <g stroke="none">
            <ellipse cx={0} cy={8} rx={120} ry={14} fill="rgba(56,189,248,0.25)" />
            <path d="M -130 10 q 20 -10 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" stroke="rgba(56,189,248,0.6)" strokeWidth={4} fill="none" />
          </g>
        ) : (
          <g stroke="rgba(255,255,255,0.35)" strokeWidth={5} strokeLinecap="round" opacity={fly}>
            <line x1={-150} y1={-80} x2={-200} y2={-80} />
            <line x1={-140} y1={-50} x2={-210} y2={-50} />
          </g>
        )}
        {/* robot rocket flame */}
        {kind === "robot" && fly > 0.2 ? (
          <path d={`M -105 -40 L ${-170 - Math.sin(frame) * 15} -30 L -105 -20 Z`} fill="#fb923c" stroke="#fde047" strokeWidth={4} />
        ) : null}
        {/* tail */}
        <path d="M -95 -50 L -135 -85 L -110 -35 Z" fill={p.body} />
        {/* body */}
        <ellipse cx={-10} cy={-45} rx={100} ry={52} fill={p.body} />
        <ellipse cx={45} cy={-45} rx={45} ry={40} fill={p.chest} stroke="none" opacity={kind === "rubber" ? 0 : 1} />
        {/* wing (flaps when flying) */}
        <g transform={`rotate(${-flap}, -10, -60)`}>
          <ellipse cx={-25} cy={-55} rx={55} ry={28} fill={p.wing} />
          {p.accent && kind === "mallard" ? <rect x={-45} y={-52} width={30} height={10} rx={4} fill={p.accent} stroke="none" /> : null}
        </g>
        {/* neck + head */}
        <ellipse cx={55} cy={-95} rx={22} ry={30} fill={p.head} />
        {kind === "mallard" ? <rect x={36} y={-80} width={40} height={8} rx={4} fill="#ffffff" stroke="none" /> : null}
        <circle cx={65} cy={-130} r={42} fill={p.head} />
        {/* beak */}
        <path d="M 98 -128 Q 140 -128 145 -112 Q 128 -104 100 -110 Z" fill={p.beak} />
        {/* eye */}
        {kind === "robot" ? (
          <g stroke="none">
            <rect x={60} y={-150} width={26} height={16} rx={5} fill="#0b1426" />
            <rect x={64} y={-146} width={18} height={8} rx={3} fill={p.accent} />
            <line x1={60} y1={-172} x2={52} y2={-196} stroke="#c0cad5" strokeWidth={5} />
            <circle cx={50} cy={-200} r={8} fill={p.accent} />
          </g>
        ) : (
          <g stroke="none">
            <circle cx={78} cy={-140} r={11} fill="#0b1426" />
            <circle cx={82} cy={-144} r={4} fill="#ffffff" />
          </g>
        )}
        {/* details */}
        {kind === "rubber" ? <ellipse cx={-40} cy={-75} rx={30} ry={10} fill="rgba(255,255,255,0.45)" stroke="none" /> : null}
        {kind === "wooden" ? (
          <g stroke="#7a4f28" strokeWidth={3} fill="none" opacity={0.6}>
            <path d="M -90 -40 q 40 -12 80 0" />
            <path d="M -80 -20 q 40 -10 90 0" />
            <circle cx={40} cy={-130} r={10} />
          </g>
        ) : null}
        {kind === "robot" ? (
          <g stroke="#5b6675" strokeWidth={3} fill="#5b6675">
            <circle cx={-60} cy={-30} r={4} />
            <circle cx={-30} cy={-24} r={4} />
            <circle cx={0} cy={-22} r={4} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};
