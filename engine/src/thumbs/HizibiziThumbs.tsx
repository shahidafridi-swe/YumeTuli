// hizibizi · Why Is That? thumbnails (1080×1920). Render: npm run thumbs:hizibizi
// Key content stays in the centre 1080×1350 band so a 4:5 / 3:4 grid crop still reads.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadHind } from "@remotion/google-fonts/HindSiliguri";
import { CY, ZipperWorld } from "../stories/hizibizi/zipper/Zipper";
import { FINGER_REST, Finger, Glass, H, PICK, Room } from "../stories/hizibizi/sorbot/Scenes";
import { SpoonFront } from "../stories/hizibizi/spoon/Scenes";

const { fontFamily: HIND } = loadHind("normal", { weights: ["700"] });
const BG = "#fdf1dc";
const INK = "#1f2937";

export const ZipperThumb: React.FC = () => (
  <AbsoluteFill style={{ background: BG, fontFamily: `${HIND}, sans-serif`, overflow: "hidden" }}>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(228,87,46,0.12) 3px, transparent 3px)", backgroundSize: "48px 48px" }} />
    <Img src={staticFile("brand/hizibizi-logo.png")} style={{ position: "absolute", top: 130, right: 70, width: 320 }} />
    <div
      style={{
        position: "absolute",
        top: 380,
        left: 70,
        padding: "8px 28px",
        borderRadius: 18,
        background: INK,
        color: "#fff",
        fontSize: 44,
        fontWeight: 700,
      }}
    >
      Why Is That? <span style={{ color: "#fde047" }}>· পর্ব ১</span>
    </div>
    <div style={{ position: "absolute", top: 470, left: 70, right: 60, fontSize: 112, fontWeight: 700, lineHeight: 1.12, color: INK }}>
      ব্যাগের চেইন
      <br />
      <span style={{ color: "#e4572e" }}>এক টানে</span> বন্ধ হয়
      <br />
      কীভাবে<span style={{ color: "#e4572e" }}>?</span>
    </div>
    {/* zipper close-up window: the blue tooth locking between two yellow teeth */}
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 890,
        height: 800,
        borderRadius: 48,
        overflow: "hidden",
        border: `8px solid ${INK}`,
        boxShadow: "0 18px 0 rgba(31,41,55,0.25)",
      }}
    >
      <div style={{ position: "absolute", left: -70, top: 400 - CY, width: 1080, height: 1920 }}>
        <ZipperWorld cam={{ cx: 0, cy: -215, s: 2.3 }} sliderY={-262} bodyOpacity={0.15} tabOpacity={0} highlightBlue={-200} highlightAmt={1} gapAmt={1} framed={false} />
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        right: 40,
        top: 850,
        width: 170,
        height: 170,
        borderRadius: 85,
        background: "#fde047",
        border: `8px solid ${INK}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 120,
        fontWeight: 700,
        color: INK,
        transform: "rotate(10deg)",
      }}
    >
      ?
    </div>
  </AbsoluteFill>
);

// পর্ব ২ — red sorbot inside, clear drop outside. Block centred: equal space above logo and below window.
export const SorbotThumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFF4E2", fontFamily: `${HIND}, sans-serif`, overflow: "hidden" }}>
    <Img src={staticFile("brand/hizibizi-logo.png")} style={{ position: "absolute", top: 160, right: 70, width: 300 }} />
    <div style={{ position: "absolute", top: 180, left: 70, padding: "8px 26px", borderRadius: 18, background: "#203247", color: "#fff", fontSize: 40, fontWeight: 700 }}>
      Why Is That? <span style={{ color: "#fde047" }}>· পর্ব ২</span>
    </div>
    <div style={{ position: "absolute", top: 300, left: 70, right: 60, fontSize: 118, fontWeight: 700, lineHeight: 1.14, color: "#203247" }}>
      শরবত <span style={{ color: "#C92D48" }}>লাল</span>,
      <br />
      ফোঁটা <span style={{ color: "#1f9e93" }}>স্বচ্ছ</span> কেন?
    </div>
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 620,
        height: 1140,
        borderRadius: 48,
        overflow: "hidden",
        border: "8px solid #203247",
        boxShadow: "0 18px 0 rgba(32,50,71,0.22)",
      }}
    >
      <div style={{ position: "absolute", left: -70, top: -300, width: 1080, height: 1920 }}>
        <Room tableY={1250} />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <Glass {...H} ice={[1, 1, 1]} drops={1} hideDrop={PICK} />
          <Finger tx={FINGER_REST.x} ty={FINGER_REST.y} drop={1} />
        </svg>
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        right: 40,
        top: 1290,
        width: 170,
        height: 170,
        borderRadius: 85,
        background: "#fde047",
        border: "8px solid #203247",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 120,
        fontWeight: 700,
        color: "#203247",
        transform: "rotate(10deg)",
      }}
    >
      ?
    </div>
  </AbsoluteFill>
);

// পর্ব ৩ — the upside-down face in a spoon. Block centred (equal space above pill and below spoon).
export const SpoonThumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFF4E2", fontFamily: `${HIND}, sans-serif`, overflow: "hidden" }}>
    <Img src={staticFile("brand/hizibizi-logo.png")} style={{ position: "absolute", top: 165, right: 70, width: 300 }} />
    <div style={{ position: "absolute", top: 180, left: 70, padding: "8px 26px", borderRadius: 18, background: "#203247", color: "#fff", fontSize: 40, fontWeight: 700 }}>
      Why Is That? <span style={{ color: "#fde047" }}>· পর্ব ৩</span>
    </div>
    <div style={{ position: "absolute", top: 300, left: 70, right: 60, fontSize: 112, fontWeight: 700, lineHeight: 1.14, color: "#203247" }}>
      চামচে মুখ
      <br />
      <span style={{ color: "#C47A00" }}>উল্টো</span> কেন?
    </div>
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <ellipse cx={540} cy={1730} rx={330} ry={34} fill="rgba(32,50,71,0.12)" />
      <g transform="rotate(-8 540 1060)">
        <SpoonFront cx={540} cy={1000} rx={300} ry={390} flip={0} id="thumb" />
      </g>
    </svg>
    <div
      style={{
        position: "absolute",
        right: 70,
        top: 760,
        width: 170,
        height: 170,
        borderRadius: 85,
        background: "#fde047",
        border: "8px solid #203247",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 120,
        fontWeight: 700,
        color: "#203247",
        transform: "rotate(10deg)",
      }}
    >
      ?
    </div>
  </AbsoluteFill>
);
