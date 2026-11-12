// Thumbnails (1080×1920) for the Strategy Pattern series. Render: npm run thumbs
// Key content stays inside the centre 1080×1350 band so a 4:5 / 3:4 grid crop still reads.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadHind } from "@remotion/google-fonts/HindSiliguri";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Duck } from "../tech/Duck";
import { ClassBox, Arrow, Tag } from "../tech/Uml";
import { CheckoutCard } from "../tech/Checkout";
import { TECH } from "../tech/anim";

const { fontFamily: HIND } = loadHind("normal", { weights: ["700"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700"] });

const Frame: React.FC<{ part: number; children: React.ReactNode }> = ({ part, children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 30% 25%, #17345f, ${TECH.navy} 70%)`, fontFamily: `${HIND}, sans-serif`, overflow: "hidden" }}>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(56,189,248,0.12) 2px, transparent 2px)", backgroundSize: "44px 44px" }} />
    <Img src={staticFile("brand/dev-diary-logo.png")} style={{ position: "absolute", top: 70, right: 60, width: 230, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }} />
    <AbsoluteFill style={{ transform: "translateY(50px)" }}>
    <div
      style={{
        position: "absolute",
        top: 300,
        left: 80,
        padding: "10px 30px",
        borderRadius: 999,
        background: TECH.panel2,
        border: `3px solid ${TECH.teal}`,
        color: TECH.text,
        fontSize: 44,
        fontWeight: 700,
      }}
    >
      Strategy Pattern · <span style={{ color: TECH.teal }}>পর্ব {"০১২৩"[part]}</span>
    </div>
    {children}
    <div style={{ position: "absolute", bottom: 360, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
      {["PHP", "Laravel", "Design Pattern"].map((x) => (
        <div key={x} style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: TECH.teal, padding: "8px 24px", borderRadius: 999, border: `3px solid ${TECH.teal}`, background: "rgba(11,20,38,0.7)" }}>
          {x}
        </div>
      ))}
    </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const Headline: React.FC<{ top: number; children: React.ReactNode; size?: number }> = ({ top, children, size = 136 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 70,
      right: 70,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.12,
      color: "#fff",
      textShadow: "0 8px 30px rgba(0,0,0,0.6)",
    }}
  >
    {children}
  </div>
);

const Code: React.FC<{ top: number; line: React.ReactNode; color?: string }> = ({ top, line, color = TECH.orange }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 80,
      right: 80,
      padding: "22px 30px",
      borderRadius: 26,
      background: TECH.panel,
      border: `3px solid ${color}`,
      boxShadow: `0 0 40px ${color}55`,
      fontFamily: MONO,
      fontVariantLigatures: "none",
      fontSize: 44,
      color: TECH.text,
      whiteSpace: "nowrap",
    }}
  >
    {line}
  </div>
);

// পর্ব ১ — the surprising flying rubber duck
export const Thumb1: React.FC = () => (
  <Frame part={1}>
    <Headline top={400}>
      রাবারের হাঁস
      <br />
      <span style={{ color: TECH.orange }}>উড়ছে কেন?!</span>
    </Headline>
    <Duck kind="rubber" x={560} y={1180} size={420} fly={1} warn={1} />
    <Tag x={880} y={760} text="?!" color={TECH.orange} size={90} />
    <Code
      top={1300}
      line={
        <>
          <span style={{ color: "#ffa657" }}>$duck</span>-&gt;<span style={{ color: "#d2a8ff" }}>fly</span>();{" "}
          <span style={{ color: TECH.orange }}>// Flying!? 😱</span>
        </>
      }
    />
  </Frame>
);

// পর্ব ২ — behavior pulled out into FlyBehavior
export const Thumb2: React.FC = () => (
  <Frame part={2}>
    <Headline top={400} size={124}>
      ওড়ার আচরণ
      <br />
      <span style={{ color: TECH.teal }}>আলাদা</span> করো
    </Headline>
    <Duck kind="mallard" x={280} y={1060} size={230} fly={1} ok={1} />
    <Duck kind="rubber" x={800} y={1035} size={230} />
    <Tag x={290} y={1075} text="FlyWithWings" color={TECH.teal} size={38} />
    <Tag x={800} y={1075} text="FlyNoWay" color={TECH.blue} size={38} />
    <ClassBox x={300} y={1165} name="Duck" width={330} nameSize={40} border={TECH.blue} />
    <Arrow from={[465, 1205]} to={[620, 1205]} head="open" color={TECH.teal} label="has-a" />
    <ClassBox x={800} y={1150} name="FlyBehavior" stereo="«interface»" width={350} nameSize={36} border={TECH.teal} glow={0.8} />
    <Code
      top={1300}
      color={TECH.teal}
      line={
        <>
          <span style={{ color: "#ff7b72" }}>return</span> <span style={{ color: "#ffa657" }}>$this</span>-&gt;flyBehavior-&gt;<span style={{ color: "#d2a8ff" }}>fly</span>();
        </>
      }
    />
  </Frame>
);

// পর্ব ৩ — Laravel checkout: ৳60 → ৳100 → ৳120
export const Thumb3: React.FC = () => (
  <Frame part={3}>
    <Headline top={400} size={124}>
      এক click-এ
      <br />
      <span style={{ color: TECH.teal }}>৳60 → ৳100</span>
    </Headline>
    <CheckoutCard top={760} left={110} width={860} selected="express" fee="৳100" feeFlash={1} />
    <Tag x={700} y={1195} text="Laravel-এ কী ঘটলো?" color={TECH.orange} size={44} />
    <Code
      top={1300}
      color={TECH.teal}
      line={
        <>
          <span style={{ color: "#ff7b72" }}>return</span> <span style={{ color: "#ffa657" }}>$this</span>-&gt;strategy-&gt;<span style={{ color: "#d2a8ff" }}>fee</span>(<span style={{ color: "#ffa657" }}>$km</span>);
        </>
      }
    />
  </Frame>
);
