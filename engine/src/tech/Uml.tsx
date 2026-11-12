import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { TECH } from "./anim";

const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700"] });

// UML-style class box. (x, y) = top-center.
export const ClassBox: React.FC<{
  x: number;
  y: number;
  name: string;
  methods?: { text: string; color?: string; opacity?: number; strike?: number }[];
  width?: number;
  appear?: number; // 0..1
  border?: string;
  dashed?: boolean;
  stereo?: string; // e.g. "«interface»"
  glow?: number; // 0..1 highlight glow in border color
  nameSize?: number;
}> = ({ x, y, name, methods = [], width = 360, appear = 1, border = TECH.blue, dashed = false, stereo, glow = 0, nameSize = 36 }) => (
  <div
    style={{
      position: "absolute",
      left: x - width / 2,
      top: y,
      width,
      background: TECH.panel2,
      border: `3px ${dashed ? "dashed" : "solid"} ${border}`,
      borderRadius: 20,
      overflow: "hidden",
      fontFamily: MONO,
      opacity: appear,
      transform: `scale(${0.8 + 0.2 * appear})`,
      boxShadow: glow > 0 ? `0 0 ${40 * glow}px ${border}, 0 16px 40px rgba(0,0,0,0.35)` : "0 16px 40px rgba(0,0,0,0.35)",
    }}
  >
    <div style={{ padding: "12px 18px", textAlign: "center", fontSize: nameSize, fontWeight: 700, color: TECH.text, background: "rgba(56,189,248,0.12)" }}>
      {stereo ? <div style={{ fontSize: 24, fontWeight: 400, color: TECH.muted, marginBottom: 2 }}>{stereo}</div> : null}
      {name}
    </div>
    {methods.length ? (
      <div style={{ borderTop: `2px solid ${TECH.border}`, padding: "10px 20px" }}>
        {methods.map((m, i) => (
          <div key={i} style={{ position: "relative", fontSize: 28, color: m.color ?? TECH.muted, opacity: m.opacity ?? 1, lineHeight: 1.5, whiteSpace: "nowrap" }}>
            {m.text}
            {m.strike ? (
              <div style={{ position: "absolute", left: 0, top: "52%", height: 4, width: `${100 * m.strike}%`, background: TECH.orange, borderRadius: 2 }} />
            ) : null}
          </div>
        ))}
      </div>
    ) : null}
  </div>
);

// Inheritance arrow child → parent with a hollow triangle at the parent end.
export const ExtendsArrow: React.FC<{ from: [number, number]; to: [number, number]; progress?: number; color?: string }> = ({
  from,
  to,
  progress = 1,
  color = TECH.blue,
}) => {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const ex = x1 + (x2 - x1) * progress;
  const ey = y1 + (y2 - y1) * progress;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const L = 30;
  const W = 18;
  const bx = x2 - Math.cos(ang) * L;
  const by = y2 - Math.sin(ang) * L;
  const p1 = [bx + Math.sin(ang) * W, by - Math.cos(ang) * W];
  const p2 = [bx - Math.sin(ang) * W, by + Math.cos(ang) * W];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <line x1={x1} y1={y1} x2={progress >= 1 ? bx : ex} y2={progress >= 1 ? by : ey} stroke={color} strokeWidth={5} />
      {progress >= 1 ? <polygon points={`${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={TECH.navy} stroke={color} strokeWidth={5} strokeLinejoin="round" /> : null}
    </svg>
  );
};

// Rounded pill tag
export const Tag: React.FC<{ x: number; y: number; text: string; color: string; appear?: number; size?: number; dark?: boolean }> = ({
  x,
  y,
  text,
  color,
  appear = 1,
  size = 30,
  dark = true,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, 0) scale(${0.6 + 0.4 * appear})`,
      opacity: appear,
      background: color,
      color: dark ? "#0b1426" : "#fff",
      fontFamily: `"Hind Siliguri", ${MONO}, sans-serif`,
      fontWeight: 700,
      fontSize: size,
      padding: "4px 18px",
      borderRadius: 999,
      whiteSpace: "nowrap",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    }}
  >
    {text}
  </div>
);

// Generic UML arrow. head: "hollow" (extends/implements), "open" (association / has-a), "none".
export const Arrow: React.FC<{
  from: [number, number];
  to: [number, number];
  progress?: number;
  color?: string;
  dashed?: boolean;
  head?: "hollow" | "open" | "none";
  label?: string;
  labelAppear?: number;
}> = ({ from, to, progress = 1, color = TECH.blue, dashed = false, head = "open", label, labelAppear = 1 }) => {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const L = head === "hollow" ? 30 : 0;
  const W = 18;
  const ex = x1 + (x2 - x1) * progress;
  const ey = y1 + (y2 - y1) * progress;
  const done = progress >= 0.999;
  const bx = x2 - Math.cos(ang) * L;
  const by = y2 - Math.sin(ang) * L;
  const hb = [x2 - Math.cos(ang) * 30, y2 - Math.sin(ang) * 30];
  const p1 = [hb[0] + Math.sin(ang) * W, hb[1] - Math.cos(ang) * W];
  const p2 = [hb[0] - Math.sin(ang) * W, hb[1] + Math.cos(ang) * W];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", overflow: "visible" }}>
      {progress > 0 ? (
        <line x1={x1} y1={y1} x2={done ? bx : ex} y2={done ? by : ey} stroke={color} strokeWidth={5} strokeDasharray={dashed ? "14 10" : undefined} />
      ) : null}
      {done && head === "hollow" ? (
        <polygon points={`${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={TECH.navy} stroke={color} strokeWidth={5} strokeLinejoin="round" />
      ) : null}
      {done && head === "open" ? (
        <polyline points={`${p1[0]},${p1[1]} ${x2},${y2} ${p2[0]},${p2[1]}`} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      {label && labelAppear > 0 ? (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 18}
          textAnchor="middle"
          fill={color}
          opacity={labelAppear}
          style={{ fontFamily: `"Hind Siliguri", ${MONO}, sans-serif`, fontSize: 28, fontWeight: 700 }}
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
};
