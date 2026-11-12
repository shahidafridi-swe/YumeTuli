import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { tokenize } from "../layouts/highlight";
import type { CodeLayout } from "../layouts/types";
import { ease, TECH, useT } from "./anim";

const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700"] });

export type CodeHighlight = {
  lines: number[]; // 1-based
  at: number; // seconds from scene start
  color?: "teal" | "orange";
  until?: number;
  label?: string; // small tag shown at the right of the first highlighted line
};

export type CodePanelProps = {
  lines: string[];
  language?: CodeLayout["language"];
  title?: string;
  top: number; // px from top of the 1080x1920 frame
  enterAt?: number;
  reveal?: Record<number, number>; // line → seconds when it slides in (diff-style insert)
  highlights?: CodeHighlight[];
  fontSize?: number;
  exitAt?: number; // fade out (to swap in another panel)
  side?: number; // left/right inset in px (default 70)
};

const LINE_H = 1.55;

// Code card with line-level reveal + voice-synced teal/orange highlights.
export const CodePanel: React.FC<CodePanelProps> = ({
  lines,
  language = "php",
  title = "Duck.php",
  top,
  enterAt = 0,
  reveal = {},
  highlights = [],
  fontSize = 36,
  exitAt,
  side = 70,
}) => {
  const t = useT();
  const enter = ease(t, enterAt, 0.45) * (exitAt == null ? 1 : 1 - ease(t, exitAt, 0.3));
  const lh = fontSize * LINE_H;
  const activeHl = highlights.filter((h) => h.label && t >= h.at && (h.until == null || t < h.until)).pop();
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: side,
        right: side,
        background: TECH.panel,
        border: `2px solid ${TECH.border}`,
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 60}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", background: "#0a1730", borderBottom: `2px solid ${TECH.border}` }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
        ))}
        <div style={{ marginLeft: 14, color: TECH.muted, fontFamily: MONO, fontSize: 26 }}>{title}</div>
        {activeHl ? (
          <div
            style={{
              marginLeft: "auto",
              fontFamily: `"Hind Siliguri", ${MONO}, sans-serif`,
              fontSize: 28,
              fontWeight: 700,
              color: "#0b1426",
              background: activeHl.color === "orange" ? TECH.orange : TECH.teal,
              borderRadius: 999,
              padding: "0 18px",
              opacity: ease(t, activeHl.at, 0.25),
              whiteSpace: "nowrap",
            }}
          >
            {`L${activeHl.lines[0]}${activeHl.lines.length > 1 ? "–" + activeHl.lines.at(-1) : ""} · ${activeHl.label}`}
          </div>
        ) : null}
      </div>
      <div style={{ padding: "18px 0", fontFamily: `${MONO}, "Hind Siliguri", sans-serif`, fontSize, fontVariantLigatures: "none" }}>
        {lines.map((line, i) => {
          const n = i + 1;
          const r = reveal[n] != null ? ease(t, reveal[n], 0.4) : 1;
          const isNew = reveal[n] != null && t >= reveal[n];
          const hl = highlights
            .filter((h) => h.lines.includes(n) && t >= h.at && (h.until == null || t < h.until))
            .pop();
          const hlAmt = hl ? ease(t, hl.at, 0.25) : 0;
          const color = hl?.color === "orange" ? TECH.orange : TECH.teal;
          const rgb = hl?.color === "orange" ? "251,146,60" : "45,212,191";
          return (
            <div
              key={i}
              style={{
                height: lh * r,
                opacity: r,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                whiteSpace: "pre",
                background: hl ? `rgba(${rgb}, ${0.2 * hlAmt})` : isNew && r < 1 ? "rgba(45,212,191,0.12)" : "transparent",
                borderLeft: `6px solid ${hl ? color : "transparent"}`,
                paddingLeft: 18,
                paddingRight: 18,
                position: "relative",
              }}
            >
              <span style={{ color: "#3b5378", width: fontSize * 1.2, flexShrink: 0 }}>{n}</span>
              <span>
                {tokenize(line, language).map((tok, k) => (
                  <span key={k} style={{ color: tok.color }}>
                    {tok.text}
                  </span>
                ))}
              </span>

            </div>
          );
        })}
      </div>
    </div>
  );
};
