import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene, Theme } from "../types";
import { useFormat } from "../format";

// Safe zones for 9:16 shorts: keep text out of top ~12% and bottom ~20% (platform UI).
// Landscape (16:9) has no platform UI on top, so titles sit higher and smaller.
const POSITION: Record<"vertical" | "landscape", Record<string, React.CSSProperties>> = {
  vertical: {
    top: { justifyContent: "flex-start", paddingTop: 260 },
    center: { justifyContent: "center" },
    bottom: { justifyContent: "flex-end", paddingBottom: 520 },
  },
  landscape: {
    top: { justifyContent: "flex-start", paddingTop: 90 },
    center: { justifyContent: "center" },
    bottom: { justifyContent: "flex-end", paddingBottom: 240 },
  },
};

export const AnimatedText: React.FC<{ scene: Scene; theme: Theme }> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { landscape } = useFormat();
  const text = scene.on_screen_text ?? "";
  if (!text && !scene.emoji) return null;

  const anim = scene.text_animation ?? "pop";
  const s = spring({ frame: frame - 3, fps, config: { damping: 12, stiffness: 120 } });

  let style: React.CSSProperties = {};
  let shown = text;
  if (anim === "pop") style = { transform: `scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 1.5) };
  if (anim === "slide-up")
    style = { transform: `translateY(${(1 - s) * 120}px)`, opacity: Math.min(1, s * 1.5) };
  if (anim === "typewriter") {
    const chars = Array.from(text);
    const n = Math.floor(interpolate(frame, [3, 3 + chars.length * 1.6], [0, chars.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }));
    shown = chars.slice(0, n).join("");
  }

  // *word* = accent color, ~word~ = warn color (problems)
  const parts = shown.split(/(\*[^*]+\*?|~[^~]+~?)/g);

  const fontSize = (text.length > 40 ? 88 : text.length > 22 ? 108 : 132) * (theme.title_scale ?? 1) * (landscape ? 0.72 : 1);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        padding: "0 80px",
        ...POSITION[landscape ? "landscape" : "vertical"][scene.text_position ?? "center"],
        ...(scene.text_position === "top" && theme.title_top != null ? { paddingTop: theme.title_top } : {}),
      }}
    >
      {scene.emoji ? (
        <div style={{ fontSize: 180, marginBottom: 30, transform: `scale(${s})` }}>{scene.emoji}</div>
      ) : null}
      <div
        style={{
          color: theme.text,
          fontSize,
          fontWeight: 900,
          lineHeight: 1.2,
          textAlign: "center",
          textShadow: "0 6px 24px rgba(0,0,0,0.6)",
          ...(theme.stroke ? { WebkitTextStroke: `14px ${theme.stroke}`, paintOrder: "stroke fill" } : {}),
          whiteSpace: "pre-wrap",
          ...style,
        }}
      >
        {parts.map((p, i) =>
          p.startsWith("*") || p.startsWith("~") ? (
            <span key={i} style={{ color: p.startsWith("~") ? theme.warn ?? "#fb923c" : theme.accent }}>
              {p.replace(/[*~]/g, "")}
            </span>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </div>
    </AbsoluteFill>
  );
};
