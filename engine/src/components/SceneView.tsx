import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Scene, ShortProps } from "../types";
import { projectFile } from "../util";
import { AnimatedText } from "./AnimatedText";
import { Captions } from "./Captions";
import { ILLUSTRATIONS } from "../illustrations/registry";
import { LayoutView } from "../layouts/Layouts";

const TRANSITION_FRAMES = 10;

export const SceneView: React.FC<{
  scene: Scene;
  props: ShortProps;
  index: number;
  durationInFrames: number;
}> = ({ scene, props, index, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme, project } = props;
  const transition = scene.transition ?? "fade";

  // Enter transition (first scene enters without one so frame 0 is not blank)
  const enter =
    index === 0 || transition === "none"
      ? 1
      : spring({ frame, fps, durationInFrames: TRANSITION_FRAMES, config: { damping: 200 } });
  const exit = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const enterStyle: React.CSSProperties =
    transition === "slide"
      ? { transform: `translateX(${(1 - enter) * 100}%)` }
      : transition === "zoom"
        ? { transform: `scale(${0.8 + 0.2 * enter})`, opacity: enter }
        : { opacity: enter };

  // Ken Burns on background media
  const kb = interpolate(frame, [0, durationInFrames], [1, 1.12]);

  return (
    <AbsoluteFill style={{ ...enterStyle, opacity: Number(enterStyle.opacity ?? 1) * exit }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 30% 20%, ${theme.bg2}, ${theme.bg} 70%)`,
        }}
      />
      {scene.layout ? (
        <AbsoluteFill
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)",
            backgroundSize: "44px 44px",
          }}
        />
      ) : null}
      {scene.layout ? <LayoutView layout={scene.layout} theme={theme} /> : null}
      {scene.illustration ? (
        ILLUSTRATIONS[scene.illustration] ? (
          (() => {
            const Ill = ILLUSTRATIONS[scene.illustration];
            return scene.content_offset ? (
              <AbsoluteFill style={{ transform: `translateY(${scene.content_offset}px)` }}>
                <Ill scene={scene} theme={theme} />
              </AbsoluteFill>
            ) : (
              <Ill scene={scene} theme={theme} />
            );
          })()
        ) : (
          <AbsoluteFill style={{ background: "#c00", color: "#fff", fontSize: 60, padding: 80 }}>
            Unknown illustration: {scene.illustration}
          </AbsoluteFill>
        )
      ) : scene.video ? (
        <OffthreadVideo
          src={projectFile(project, scene.video)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : scene.image ? (
        <Img
          src={projectFile(project, scene.image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${kb})`,
          }}
        />
      ) : null}
      {(scene.image || scene.video) && (
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.65) 100%)",
          }}
        />
      )}
      <AnimatedText scene={scene} theme={theme} />
      {props.show_captions !== false && scene.captions?.length ? (
        <Captions words={scene.captions} theme={theme} />
      ) : null}
    </AbsoluteFill>
  );
};
