// Dev Diary · Observer Pattern thumbnails (1080×1920, ivory theme). Render: npm run thumbs:patterns
// Block is centred: space above the logo ≈ space below the chips.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadHind } from "@remotion/google-fonts/HindSiliguri";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { CurrentCard, HistoryCard, Link, Station } from "../stories/design-patterns/observer-p1/Scenes";
import { Checkout, DESTS, DestCard, Hub, Paths } from "../stories/design-patterns/observer-p2/Scenes";

const { fontFamily: HIND } = loadHind("normal", { weights: ["700"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700"] });
const IVORY = "#FAF7EF";
const INK = "#25232A";
const PLUM = "#702963";
const ORANGE = "#B84A20";

export const ObserverThumb1: React.FC = () => (
  <AbsoluteFill style={{ background: IVORY, fontFamily: `${HIND}, sans-serif`, overflow: "hidden" }}>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(37,35,42,0.07) 2px, transparent 2px)", backgroundSize: "44px 44px" }} />
    <Img src={staticFile("brand/dev-diary-logo-black.png")} style={{ position: "absolute", top: 235, right: 70, width: 210 }} />
    <div style={{ position: "absolute", top: 265, left: 70, padding: "8px 26px", borderRadius: 999, background: IVORY, border: `4px solid ${PLUM}`, color: INK, fontSize: 40, fontWeight: 700 }}>
      Observer Pattern · <span style={{ color: PLUM }}>পর্ব ১</span>
    </div>
    <div style={{ position: "absolute", top: 385, left: 70, right: 60, fontSize: 108, fontWeight: 700, lineHeight: 1.14, color: INK }}>
      তাপমাত্রা বদলালে
      <br />
      <span style={{ color: PLUM }}>সবাই</span> জানবে কীভাবে?
    </div>
    {/* station → two subscribed displays (same drawing as the video) */}
    <AbsoluteFill style={{ transform: "translateY(335px)" }}>
      <Station temp={32} t={0.3} />
      <Link to={[560, 540]} amt={1} t={0} />
      <Link to={[560, 785]} amt={1} t={0} />
      <CurrentCard value={32} flash={0.4} />
      <HistoryCard points={[30, 32]} />
    </AbsoluteFill>
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 1460,
        padding: "20px 28px",
        borderRadius: 26,
        background: "#0f1d36",
        border: `4px solid ${PLUM}`,
        fontFamily: MONO,
        fontVariantLigatures: "none",
        fontSize: 42,
        color: "#e6edf3",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "#ffa657" }}>$observer</span>-&gt;<span style={{ color: "#d2a8ff" }}>update</span>(<span style={{ color: "#ffa657" }}>$temperature</span>);
    </div>
    <div style={{ position: "absolute", top: 1625, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
      {["PHP", "Laravel", "Design Pattern"].map((x) => (
        <div key={x} style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: PLUM, padding: "6px 22px", borderRadius: 999, border: `3px solid ${PLUM}`, background: IVORY }}>
          {x}
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// Part 2 — one OrderPlaced event, three listeners, same order number everywhere
export const ObserverThumb2: React.FC = () => (
  <AbsoluteFill style={{ background: IVORY, fontFamily: `${HIND}, sans-serif`, overflow: "hidden" }}>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(37,35,42,0.07) 2px, transparent 2px)", backgroundSize: "44px 44px" }} />
    <Img src={staticFile("brand/dev-diary-logo-black.png")} style={{ position: "absolute", top: 235, right: 70, width: 210 }} />
    <div style={{ position: "absolute", top: 265, left: 70, padding: "8px 26px", borderRadius: 999, background: IVORY, border: `4px solid ${PLUM}`, color: INK, fontSize: 40, fontWeight: 700 }}>
      Observer · <span style={{ color: PLUM }}>পর্ব ২ · Laravel</span>
    </div>
    <div style={{ position: "absolute", top: 385, left: 70, right: 60, fontSize: 104, fontWeight: 700, lineHeight: 1.14, color: INK }}>
      একটা <span style={{ color: ORANGE }}>অর্ডার</span>,
      <br />
      <span style={{ color: PLUM }}>তিনজন</span> জানবে
    </div>
    <AbsoluteFill style={{ transform: "translateY(310px)" }}>
      <Checkout t={0} order={1043} tapAt={-5} confirmAt={-5} />
      <Paths t={0} show={{ email: 1, shop: 1, warehouse: 1 }} />
      <Hub glow={0.6} />
      <DestCard d={DESTS[0]} t={0} order={1043} />
      <DestCard d={DESTS[1]} t={0} order={1043} />
      <DestCard d={DESTS[2]} t={0} order={1043} />
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 70, right: 70, top: 1440, padding: "20px 28px", borderRadius: 26, background: "#0f1d36", border: `4px solid ${PLUM}`, fontFamily: MONO, fontVariantLigatures: "none", fontSize: 44, color: "#e6edf3", whiteSpace: "nowrap" }}>
      <span style={{ color: "#7ee787" }}>OrderPlaced</span>::<span style={{ color: "#d2a8ff" }}>dispatch</span>(<span style={{ color: "#ffa657" }}>$order</span>);
    </div>
    <div style={{ position: "absolute", top: 1610, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
      {["PHP", "Laravel", "Design Pattern"].map((x) => (
        <div key={x} style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: PLUM, padding: "6px 22px", borderRadius: 999, border: `3px solid ${PLUM}`, background: IVORY }}>
          {x}
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
