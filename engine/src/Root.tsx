import { Composition, Still } from "remotion";
import { BrandOutro, OUTRO_FRAMES } from "./brand/BrandOutro";
import { Thumb1, Thumb2, Thumb3 } from "./thumbs/StrategyThumbs";
import { ObserverThumb1, ObserverThumb2 } from "./thumbs/ObserverThumbs";
import { SorbotThumb, SpoonTestThumb, SpoonThumb, ZipperThumb } from "./thumbs/HizibiziThumbs";
import { Test3D } from "./three/Test3D";
import { Short } from "./Short";
import type { ShortProps } from "./types";
import { FORMATS, type VideoFormat } from "./format";
import { OutroPreview, outroFrames } from "./brand/Outro";
import example from "../public/projects/example/scenes.json";

export const totalFrames = (p: ShortProps) =>
  Math.max(1, p.scenes.reduce((s, sc) => s + Math.round(sc.duration_sec * p.fps), 0) + outroFrames(p, p.fps));

export const RemotionRoot: React.FC = () => (
  <>
  <Still id="HizibiziSpoonThumb" component={SpoonThumb} width={1080} height={1920} />
  <Still id="HizibiziSpoonTestThumb" component={SpoonTestThumb} width={1080} height={1920} />
  <Still id="HizibiziSorbotThumb" component={SorbotThumb} width={1080} height={1920} />
  <Still id="HizibiziZipperThumb" component={ZipperThumb} width={1080} height={1920} />
  <Composition id="OutroDevDiary" component={BrandOutro} width={1080} height={1920} fps={30} durationInFrames={OUTRO_FRAMES} defaultProps={{ brand: "devdiary" as const }} />
  <Composition id="OutroDevDiaryAlpha" component={BrandOutro} width={1080} height={1920} fps={30} durationInFrames={OUTRO_FRAMES} defaultProps={{ brand: "devdiary" as const, transparent: true }} />
  <Composition id="OutroHizibizi" component={BrandOutro} width={1080} height={1920} fps={30} durationInFrames={OUTRO_FRAMES} defaultProps={{ brand: "hizibizi" as const }} />
  <Composition id="OutroHizibiziAlpha" component={BrandOutro} width={1080} height={1920} fps={30} durationInFrames={OUTRO_FRAMES} defaultProps={{ brand: "hizibizi" as const, transparent: true }} />
  <Composition id="OutroDevDiaryLandscape" component={BrandOutro} width={1920} height={1080} fps={30} durationInFrames={OUTRO_FRAMES} defaultProps={{ brand: "devdiary" as const }} />
  <Composition id="OutroHizibiziLandscape" component={BrandOutro} width={1920} height={1080} fps={30} durationInFrames={OUTRO_FRAMES} defaultProps={{ brand: "hizibizi" as const }} />
  <Still id="ObserverThumb2" component={ObserverThumb2} width={1080} height={1920} />
  <Still id="ObserverThumb1" component={ObserverThumb1} width={1080} height={1920} />
  <Still id="StrategyThumb1" component={Thumb1} width={1080} height={1920} />
  <Still id="StrategyThumb2" component={Thumb2} width={1080} height={1920} />
  <Still id="StrategyThumb3" component={Thumb3} width={1080} height={1920} />
  <Composition
    id="OutroPreview"
    component={OutroPreview}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={OUTRO_FRAMES}
    defaultProps={{ outro: "common", outro_logo: "brand/hizibizi-logo.png", format: "vertical" as const }}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.max(1, outroFrames(props, 30)),
      ...FORMATS[(props.format as VideoFormat | undefined) ?? "vertical"],
    })}
  />
  <Composition id="Test3D" component={Test3D} width={1080} height={1920} fps={30} durationInFrames={300} />
  <Composition
    id="Short"
    component={Short}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={300}
    defaultProps={example as ShortProps}
    calculateMetadata={({ props }) => ({
      fps: props.fps,
      durationInFrames: totalFrames(props),
      ...FORMATS[props.format ?? "vertical"],
    })}
  />
  </>
);
