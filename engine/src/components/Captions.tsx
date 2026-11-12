import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionWord, Theme } from "../types";

const WORDS_PER_PAGE = 4;
const CHARS_PER_PAGE = 26; // ≈ 2 lines at 60px in a 900px box — keeps captions to max 2 lines

// Split words into pages: ≤ 4 words and ≤ CHARS_PER_PAGE characters (long English terms get fewer per page).
const paginate = (words: CaptionWord[]) => {
  const pageOf: number[] = [];
  const starts: number[] = [];
  let count = 0;
  let chars = 0;
  let sentenceEnd = false;
  words.forEach((w, i) => {
    const len = [...w.word].length;
    const isLast = i === words.length - 1;
    // break after a sentence end; never leave a lone last word on its own page
    if (i === 0 || ((count >= WORDS_PER_PAGE || chars + len > CHARS_PER_PAGE || (sentenceEnd && count >= 2)) && !(isLast && chars + len <= CHARS_PER_PAGE + 8))) {
      starts.push(i);
      count = 0;
      chars = 0;
    }
    count++;
    chars += len + 1;
    sentenceEnd = /[।?!.]$/.test(w.word);
    pageOf.push(starts.length - 1);
  });
  return { pageOf, starts };
};

// TikTok-style captions: show a page of words, highlight the current one.
export const Captions: React.FC<{ words: CaptionWord[]; theme: Theme }> = ({ words, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const current = words.findIndex((w) => t >= w.start && t < w.end);
  const active = current === -1 ? words.findLastIndex((w) => t >= w.end) : current;
  if (active < 0) return null;

  const { pageOf, starts } = paginate(words);
  const pg = pageOf[active];
  const pageStart = starts[pg];
  const page = words.slice(pageStart, starts[pg + 1] ?? words.length);

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: theme.caption_bottom ?? 380 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 32px",
          fontSize: 60,
          maxWidth: 900,
          lineHeight: 1.25,
          background: theme.caption_style === "shadow" ? "transparent" : (theme.caption_bg ?? "rgba(20, 30, 60, 0.55)"),
          textShadow: theme.caption_style === "shadow" ? "0 4px 14px rgba(0,0,0,0.55), 0 0 4px rgba(0,0,0,0.6)" : undefined,
          borderRadius: 40,
          paddingTop: 14,
          paddingLeft: 36,
          paddingRight: 36,
          paddingBottom: 18,
          marginLeft: 90,
          marginRight: 90,
          fontWeight: 900,
          textAlign: "center",
          WebkitTextStroke: "3px rgba(0,0,0,0.85)",
          paintOrder: "stroke fill",
        }}
      >
        {page.map((w, i) => {
          const isActive = pageStart + i === active;
          return (
            <span
              key={i}
              style={{
                color: isActive ? (theme.caption_accent ?? theme.accent) : (theme.caption_color ?? theme.text),
                transform: isActive ? "scale(1.12)" : "scale(1)",
                display: "inline-block",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
