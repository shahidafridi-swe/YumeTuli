import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { BrandOutro, OUTRO_BG, OUTRO_FRAMES } from "./BrandOutro";
import type { ShortProps } from "../types";

type OutroProps = Pick<ShortProps, "outro" | "outro_logo" | "outro_logo_ratio" | "outro_video" | "outro_duration_sec">;

/** Length of the outro in frames (0 when there is none). */
export const outroFrames = (p: OutroProps, fps: number) =>
  !p.outro ? 0 : p.outro === "video" ? Math.max(1, Math.round((p.outro_duration_sec ?? 4) * fps)) : OUTRO_FRAMES;

/** Whatever outro the project uses: animated brand/common/custom, or an uploaded video. */
export const Outro: React.FC<OutroProps> = ({ outro, outro_logo, outro_logo_ratio, outro_video }) => {
  if (!outro) return null;
  if (outro === "video") {
    return (
      <AbsoluteFill style={{ background: OUTRO_BG }}>
        {outro_video ? <OffthreadVideo src={staticFile(outro_video)} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : null}
      </AbsoluteFill>
    );
  }
  return <BrandOutro brand={outro} logo={outro_logo} logoRatio={outro_logo_ratio} />;
};

/** Composition for previews in YumeTuli: just the outro, in the requested format. */
export const OutroPreview: React.FC<OutroProps & { format?: ShortProps["format"] }> = (p) => <Outro {...p} />;
