import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadBengali } from "@remotion/google-fonts/NotoSansBengali";
import { loadFont as loadHind } from "@remotion/google-fonts/HindSiliguri";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadBaloo } from "@remotion/google-fonts/BalooDa2";
import type { ShortProps } from "./types";
import { SceneView } from "./components/SceneView";
import { BrandOutro, FADE_OUT_FRAMES, OUTRO_BG, OUTRO_FRAMES } from "./brand/BrandOutro";
import { projectFile } from "./util";

const inter = loadInter("normal", { weights: ["700", "900"] });
const bengali = loadBengali("normal", { weights: ["700", "900"] });
const hind = loadHind("normal", { weights: ["700"] });
// Rounded, kid-friendly fonts: Fredoka (Latin), Baloo Da 2 (Bangla + Latin)
const fredoka = loadFredoka("normal", { weights: ["600", "700"] });
const baloo = loadBaloo("normal", { weights: ["700", "800"] });

const FONTS: Record<ShortProps["theme"]["font"], string> = {
  Inter: `${inter.fontFamily}, ${bengali.fontFamily}, sans-serif`,
  NotoSansBengali: `${bengali.fontFamily}, ${inter.fontFamily}, sans-serif`,
  HindSiliguri: `${hind.fontFamily}, ${bengali.fontFamily}, sans-serif`,
  Fredoka: `${fredoka.fontFamily}, ${baloo.fontFamily}, sans-serif`,
  BalooDa2: `${baloo.fontFamily}, ${bengali.fontFamily}, sans-serif`,
};

const FadeToOutro: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: OUTRO_BG, opacity: interpolate(frame, [0, FADE_OUT_FRAMES - 1], [0, 1], { extrapolateRight: "clamp" }) }} />;
};

export const Short: React.FC<ShortProps> = (props) => {
  const { fps, scenes, project, theme } = props;
  const fontFamily = FONTS[theme.font] ?? FONTS.Inter;

  const scenesFrames = scenes.reduce((a, sc) => a + Math.round(sc.duration_sec * fps), 0);
  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily }}>
      {scenes.map((scene, i) => {
        const from = cursor;
        const dur = Math.round(scene.duration_sec * fps);
        cursor += dur;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={dur} name={`Scene ${scene.id}`}>
            <SceneView scene={scene} props={props} index={i} durationInFrames={dur} />
            {scene.audio ? <Audio src={projectFile(project, scene.audio)} /> : null}
          </Sequence>
        );
      })}
      <Sequence from={0} durationInFrames={scenesFrames} name="Overlays">
      {props.logo ? (
        props.logo_plate ? (
          <div
            style={{
              position: "absolute",
              top: 52,
              right: 44,
              padding: "12px 20px",
              borderRadius: 22,
              background: "rgba(255,255,255,0.88)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
            }}
          >
            <Img src={staticFile(props.logo)} style={{ display: "block", width: 200 }} />
          </div>
        ) : (
          <Img
            src={staticFile(props.logo)}
            style={{ position: "absolute", top: theme.logo_top ?? 56, right: 48, width: 190, opacity: 0.92, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
          />
        )
      ) : null}
      {props.music ? (
        <Audio src={projectFile(project, props.music)} volume={props.music_volume ?? 0.12} loop />
      ) : null}
      </Sequence>
      {props.outro ? (
        <>
          {/* main video (incl. logo overlay) fades to charcoal, then the brand outro fades in */}
          <Sequence from={scenesFrames - FADE_OUT_FRAMES} durationInFrames={FADE_OUT_FRAMES} name="Fade to outro">
            <FadeToOutro />
          </Sequence>
          <Sequence from={scenesFrames} durationInFrames={OUTRO_FRAMES} name="Outro">
            <BrandOutro brand={props.outro} />
          </Sequence>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
