import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import type { Theme } from "../types";
import type {
  BulletsLayout,
  CodeLayout,
  CompareLayout,
  Layout,
  TableLayout,
  TerminalLayout,
  TreeLayout,
} from "./types";
import { tokenize } from "./highlight";

const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700"] });

const GOOD = "#3fb950";
const BAD = "#f85149";
const PANEL = "#161b22";
const BORDER = "#30363d";
const MUTED = "#8b949e";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Content area between title (top) and captions (bottom)
const Area: React.FC<{ children: React.ReactNode; justify?: React.CSSProperties["justifyContent"] }> = ({
  children,
  justify = "center",
}) => (
  <div
    style={{
      position: "absolute",
      top: 500,
      height: 1920 - 500 - 470,
      left: 56,
      right: 56,
      display: "flex",
      flexDirection: "column",
      justifyContent: justify,
      alignItems: "stretch",
    }}
  >
    {children}
  </div>
);

const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 140 } });
};

const Window: React.FC<{ title?: string; children: React.ReactNode; kind?: "editor" | "terminal" }> = ({
  title,
  children,
  kind = "editor",
}) => {
  const s = useEnter(2);
  return (
    <div
      style={{
        background: kind === "terminal" ? "#0b0f14" : PANEL,
        border: `2px solid ${BORDER}`,
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        transform: `translateY(${(1 - s) * 80}px) scale(${0.94 + s * 0.06})`,
        opacity: s,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 28px", background: "#0d1117", borderBottom: `2px solid ${BORDER}` }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c }} />
        ))}
        <div style={{ marginLeft: 18, color: MUTED, fontFamily: MONO, fontSize: 28 }}>{title}</div>
      </div>
      <div style={{ padding: "30px 32px" }}>{children}</div>
    </div>
  );
};

// ---------- code ----------
const Code: React.FC<{ l: CodeLayout; theme: Theme }> = ({ l, theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const lines = l.code.split("\n");
  const totalChars = l.code.length;
  const typeEnd = Math.min(durationInFrames * 0.55, 8 + totalChars * 1.2);
  const shown = l.typing === false ? totalChars : Math.floor(interpolate(frame, [8, typeEnd], [0, totalChars], clamp));
  const hl = interpolate(frame, [typeEnd, typeEnd + 10], [0, 1], clamp);
  let budget = shown;
  const longest = Math.max(...lines.map((x) => x.length));
  const fontSize = Math.round(Math.min(52, 820 / (Math.max(10, longest) * 0.62)));
  return (
    <Area>
      <Window title={l.title ?? `query.${l.language ?? "txt"}`}>
        <div style={{ fontFamily: MONO, fontSize, lineHeight: 1.55, fontVariantLigatures: "none" }}>
          {lines.map((line, i) => {
            const visible = line.slice(0, Math.max(0, budget));
            budget -= line.length + 1;
            const isHl = l.highlight?.includes(i + 1);
            const typingHere = budget < 0 && budget > -line.length - 2 && shown < totalChars;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  whiteSpace: "pre",
                  background: isHl ? `rgba(56, 139, 253, ${0.22 * hl})` : "transparent",
                  borderLeft: `6px solid ${isHl ? `rgba(88,166,255,${hl})` : "transparent"}`,
                  margin: "0 -32px",
                  padding: "0 26px",
                }}
              >
                <span style={{ color: "#484f58", width: fontSize * 1.4, flexShrink: 0 }}>{i + 1}</span>
                <span>
                  {tokenize(visible, l.language).map((t, k) => (
                    <span key={k} style={{ color: t.color }}>
                      {t.text}
                    </span>
                  ))}
                  {typingHere && frame % 16 < 9 ? <span style={{ color: theme.accent }}>▍</span> : null}
                </span>
              </div>
            );
          })}
        </div>
      </Window>
    </Area>
  );
};

// ---------- terminal ----------
const LINE_COLORS: Record<string, string> = { cmd: "#e6edf3", out: "#c9d1d9", ok: GOOD, err: BAD, info: "#79c0ff" };

const Terminal: React.FC<{ l: TerminalLayout }> = ({ l }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Commands type out; outputs pop in after the preceding command finishes.
  const schedule: { start: number; end: number }[] = [];
  let t = 8;
  for (const line of l.lines) {
    const dur = line.kind === "cmd" ? Math.min(60, line.text.length * 0.9) : 4;
    schedule.push({ start: t, end: t + dur });
    t += dur + (line.kind === "cmd" ? 14 : 6);
  }
  const scale = t > durationInFrames * 0.8 ? (durationInFrames * 0.8) / t : 1;
  return (
    <Area>
      <Window title={l.title ?? "terminal"} kind="terminal">
        <div style={{ fontFamily: MONO, fontSize: 36, lineHeight: 1.5, fontVariantLigatures: "none" }}>
          {l.lines.map((line, i) => {
            const { start, end } = schedule[i];
            const s0 = start * scale;
            const e0 = end * scale;
            if (frame < s0) return null;
            const n = line.kind === "cmd" ? Math.floor(interpolate(frame, [s0, e0], [0, line.text.length], clamp)) : line.text.length;
            const pop = line.kind === "cmd" ? 1 : interpolate(frame, [s0, s0 + 6], [0, 1], clamp);
            return (
              <div key={i} style={{ color: LINE_COLORS[line.kind], whiteSpace: "pre-wrap", wordBreak: "normal", overflowWrap: "anywhere", opacity: pop, fontWeight: line.kind === "ok" || line.kind === "err" ? 700 : 400, marginBottom: line.kind === "cmd" ? 10 : 0 }}>
                {line.kind === "cmd" ? <span style={{ color: GOOD }}>$ </span> : null}
                {line.kind === "cmd"
                  ? tokenize(line.text.slice(0, n), /select|insert|update|create|explain/i.test(line.text) ? "sql" : "bash").map((t, k) => (
                      <span key={k} style={{ color: t.color }}>
                        {t.text}
                      </span>
                    ))
                  : line.text.slice(0, n)}
                {line.kind === "cmd" && n < line.text.length && frame % 16 < 9 ? "▍" : null}
              </div>
            );
          })}
        </div>
      </Window>
    </Area>
  );
};

// ---------- table scan ----------
const Table: React.FC<{ l: TableLayout; theme: Theme }> = ({ l, theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const enter = useEnter(2);
  const scanEnd = durationInFrames * 0.7;
  const pos = l.scan === false ? l.target : interpolate(frame, [12, scanEnd], [0, l.target], { ...clamp, easing: Easing.in(Easing.quad) });
  const cur = Math.floor(pos);
  const found = pos >= l.target;
  return (
    <Area>
      <div style={{ opacity: enter, transform: `translateY(${(1 - enter) * 60}px)` }}>
        {l.label ? (
          <div style={{ fontFamily: MONO, color: found ? GOOD : BAD, fontSize: 36, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>
            {l.label} · {found ? "found ✓" : `checking row ${cur + 1}…`}
          </div>
        ) : null}
        <div style={{ background: PANEL, border: `2px solid ${BORDER}`, borderRadius: 24, overflow: "hidden", fontFamily: MONO, fontSize: 30 }}>
          <div style={{ display: "flex", background: "#0d1117", color: MUTED, borderBottom: `2px solid ${BORDER}` }}>
            {l.columns.map((c) => (
              <div key={c} style={{ flex: 1, padding: "16px 20px", fontWeight: 700 }}>
                {c}
              </div>
            ))}
          </div>
          {l.rows.map((row, i) => {
            const isCur = i === cur && !found;
            const isHit = found && i === l.target;
            const passed = i < cur || (found && i !== l.target);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  color: isHit ? "#0d1117" : passed ? "#6e7681" : "#e6edf3",
                  background: isHit ? GOOD : isCur ? "rgba(248,81,73,0.25)" : "transparent",
                  borderBottom: `1px solid ${BORDER}`,
                  transform: isHit ? `scale(${1 + 0.03 * Math.sin(frame / 3)})` : undefined,
                }}
              >
                {row.map((cell, k) => (
                  <div key={k} style={{ flex: 1, padding: "13px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {cell}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div style={{ height: 8, background: BORDER, borderRadius: 4, marginTop: 22, overflow: "hidden" }}>
          <div style={{ width: `${(pos / Math.max(1, l.target)) * 100}%`, height: "100%", background: found ? GOOD : theme.accent }} />
        </div>
      </div>
    </Area>
  );
};

// ---------- compare ----------
const Compare: React.FC<{ l: CompareLayout }> = ({ l }) => {
  const frame = useCurrentFrame();
  const panel = (p: CompareLayout["left"], delay: number) => {
    const s = useEnterAt(frame, delay);
    const color = p.tone === "good" ? GOOD : p.tone === "bad" ? BAD : "#79c0ff";
    return (
      <div
        style={{
          flex: 1,
          background: PANEL,
          border: `3px solid ${color}`,
          borderRadius: 28,
          padding: "34px 26px",
          opacity: s,
          transform: `translateY(${(1 - s) * 80}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <div style={{ fontSize: 84, textAlign: "center" }}>{p.icon ?? (p.tone === "good" ? "⚡" : "🐢")}</div>
        <div style={{ color, fontSize: 48, fontWeight: 800, textAlign: "center", lineHeight: 1.2 }}>{p.title}</div>
        {p.items.map((it, i) => (
          <div key={i} style={{ color: "#e6edf3", fontSize: 36, lineHeight: 1.35, opacity: useEnterAt(frame, delay + 10 + i * 8) }}>
            • {it}
          </div>
        ))}
      </div>
    );
  };
  return (
    <Area>
      <div style={{ display: "flex", gap: 28 }}>
        {panel(l.left, 4)}
        {panel(l.right, 22)}
      </div>
    </Area>
  );
};

// spring without hooks-in-loops concerns (pure function of frame)
const useEnterAt = (frame: number, delay: number) =>
  spring({ frame: frame - delay, fps: 30, config: { damping: 16, stiffness: 140 } });

// ---------- bullets ----------
const Bullets: React.FC<{ l: BulletsLayout }> = ({ l }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const gap = Math.min(30, (durationInFrames * 0.6) / Math.max(1, l.items.length));
  return (
    <Area>
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        {l.items.map((it, i) => {
          const s = useEnterAt(frame, 6 + i * gap);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                background: PANEL,
                border: `2px solid ${BORDER}`,
                borderRadius: 26,
                padding: "30px 34px",
                opacity: s,
                transform: `translateX(${(1 - s) * -120}px)`,
              }}
            >
              <div style={{ fontSize: 66 }}>{it.icon ?? "•"}</div>
              <div style={{ color: "#e6edf3", fontSize: 44, fontWeight: 700, lineHeight: 1.3 }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </Area>
  );
};

// ---------- tree (B-Tree search path) ----------
const Tree: React.FC<{ l: TreeLayout; theme: Theme }> = ({ l, theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const W = 968;
  const levelGap = 230;
  const pos = l.levels.map((nodes, d) =>
    nodes.map((_, i) => ({ x: ((i + 0.5) / nodes.length) * W, y: 60 + d * levelGap })),
  );
  const parentOf = (d: number, i: number) => Math.floor((i * l.levels[d - 1].length) / l.levels[d].length);
  const stepFrames = (durationInFrames * 0.6) / l.levels.length;
  const reached = (d: number) => frame >= 14 + d * stepFrames;
  const nodeIn = (d: number) => useEnterAt(frame, 2 + d * 6);
  const last = l.levels.length - 1;
  const leafShow = interpolate(frame, [14 + (last + 1) * stepFrames, 24 + (last + 1) * stepFrames], [0, 1], clamp);
  const height = 60 + last * levelGap + 200;
  return (
    <Area>
      {l.label ? (
        <div style={{ textAlign: "center", fontFamily: MONO, color: "#79c0ff", fontSize: 36, fontWeight: 700, marginBottom: 10 }}>{l.label}</div>
      ) : null}
      <div style={{ position: "relative", width: W, height }}>
        <svg width={W} height={height} style={{ position: "absolute", inset: 0 }}>
          {l.levels.slice(1).map((nodes, dd) => {
            const d = dd + 1;
            return nodes.map((_, i) => {
              const p = parentOf(d, i);
              const onPath = l.path[d] === i && l.path[d - 1] === p && reached(d);
              const a = pos[d - 1][p];
              const b = pos[d][i];
              return (
                <line
                  key={`${d}-${i}`}
                  x1={a.x}
                  y1={a.y + 40}
                  x2={b.x}
                  y2={b.y - 40}
                  stroke={onPath ? theme.accent : BORDER}
                  strokeWidth={onPath ? 8 : 4}
                  opacity={nodeIn(d)}
                />
              );
            });
          })}
        </svg>
        {l.levels.map((nodes, d) =>
          nodes.map((label, i) => {
            const onPath = l.path[d] === i && reached(d);
            const s = nodeIn(d);
            const w = Math.min(260, W / nodes.length - 16);
            return (
              <div
                key={`${d}-${i}`}
                style={{
                  position: "absolute",
                  left: pos[d][i].x - w / 2,
                  top: pos[d][i].y - 40,
                  width: w,
                  height: 80,
                  borderRadius: 20,
                  background: onPath ? theme.accent : PANEL,
                  border: `3px solid ${onPath ? theme.accent : BORDER}`,
                  color: onPath ? "#0d1117" : "#e6edf3",
                  fontFamily: MONO,
                  fontSize: nodes.length > 4 ? 26 : 32,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: s,
                  transform: `scale(${(0.7 + 0.3 * s) * (onPath ? 1.06 : 1)})`,
                  boxShadow: onPath ? `0 0 40px ${theme.accent}88` : "none",
                }}
              >
                {label}
              </div>
            );
          }),
        )}
        {l.leaf ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 60 + last * levelGap + 70,
              textAlign: "center",
              fontFamily: MONO,
              fontSize: 36,
              color: GOOD,
              fontWeight: 700,
              opacity: leafShow,
              transform: `translateY(${(1 - leafShow) * 20}px)`,
            }}
          >
            ↓ {l.leaf}
          </div>
        ) : null}
      </div>
    </Area>
  );
};

export const LayoutView: React.FC<{ layout: Layout; theme: Theme }> = ({ layout, theme }) => {
  switch (layout.type) {
    case "code":
      return <Code l={layout} theme={theme} />;
    case "terminal":
      return <Terminal l={layout} />;
    case "table":
      return <Table l={layout} theme={theme} />;
    case "compare":
      return <Compare l={layout} />;
    case "bullets":
      return <Bullets l={layout} />;
    case "tree":
      return <Tree l={layout} theme={theme} />;
  }
};
