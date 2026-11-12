// Strategy Pattern series — Part 3 (final): Checkout delivery fee with Strategy (PHP + Laravel)
// Same order + same 4 km everywhere, so only the changed rule moves the result.
// Beat times (seconds from scene start) come from the aligned captions in
// public/projects/strategy-p3-bn/scenes.json. Runnable source: public/projects/strategy-p3-bn/source/
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import type { IllustrationProps } from "../../../illustrations/registry";
import { CodePanel } from "../../../tech/CodePanel";
import { CheckoutCard, TapCursor, TraceBar } from "../../../tech/Checkout";
import { Arrow, ClassBox, Tag } from "../../../tech/Uml";
import { ease, pop, TECH, useT } from "../../../tech/anim";

const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700"] });
const BN = `"Hind Siliguri", ${MONO}, sans-serif`;

// Vertical budget: title ≈ 230–400, visuals 430–880, code ≈ 900–1320, captions ≈ 1360–1540.
// Grid overscans so it still covers the frame when the scene is shifted by content_offset
const Grid: React.FC = () => (
  <AbsoluteFill
    style={{
      top: -400,
      bottom: -400,
      backgroundImage: "radial-gradient(rgba(56,189,248,0.10) 2px, transparent 2px)",
      backgroundSize: "44px 44px",
    }}
  />
);

const usePopAt = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number) => pop(frame, fps, at);
};

const count = (t: number, at: number, dur: number, from: number, to: number) =>
  Math.round(interpolate(t, [at, at + dur], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

const Packet: React.FC<{ from: [number, number]; to: [number, number]; at: number; dur: number; color?: string; label?: string }> = ({
  from,
  to,
  at,
  dur,
  color = TECH.teal,
  label,
}) => {
  const t = useT();
  if (t < at || t > at + dur + 0.1) return null;
  const k = interpolate(t, [at, at + dur], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: from[0] + (to[0] - from[0]) * k,
        top: from[1] + (to[1] - from[1]) * k,
        transform: "translate(-50%,-50%)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div style={{ width: 24, height: 24, borderRadius: 12, background: color, boxShadow: `0 0 24px ${color}` }} />
      {label ? <div style={{ color, fontFamily: MONO, fontWeight: 700, fontSize: 28, whiteSpace: "nowrap" }}>{label}</div> : null}
    </div>
  );
};

// Rounded info card
const Card: React.FC<{ top: number; left?: number; right?: number; appear?: number; children: React.ReactNode; border?: string; dashed?: boolean }> = ({
  top,
  left = 90,
  right = 90,
  appear = 1,
  children,
  border = TECH.border,
  dashed,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left,
      right,
      padding: "24px 30px",
      borderRadius: 28,
      background: TECH.panel,
      border: `3px ${dashed ? "dashed" : "solid"} ${border}`,
      boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
      opacity: appear,
      transform: `translateY(${(1 - appear) * 40}px)`,
      fontFamily: BN,
      color: TECH.text,
    }}
  >
    {children}
  </div>
);

// 1 — Hook: same order, Standard ৳60 → tap Express → ৳100. What happened inside Laravel?
const Hook: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const express = t >= 5.1;
  const fee = express ? count(t, 5.2, 1.4, 60, 100) : 60;
  // cursor: appears 4.3, moves to Express row, presses at 5.0
  const cx = 300;
  const cy = interpolate(t, [4.3, 4.95], [880, 735], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const press = ease(t, 4.95, 0.12) * (1 - ease(t, 5.15, 0.2));
  return (
    <AbsoluteFill>
      <Grid />
      <CheckoutCard
        top={440}
        t={t}
        appear={ease(t, 0, 0.5)}
        selected={express ? "express" : "standard"}
        fee={t < 3.9 ? "—" : `৳${fee}`}
        feeFlash={ease(t, 3.9, 0.2) * (1 - ease(t, 4.4, 0.4)) + ease(t, 6.6, 0.2) * (1 - ease(t, 7.4, 0.4))}
        tap={{ id: "express", at: 5.0 }}
      />
      <TapCursor x={cx} y={cy} press={press} appear={ease(t, 4.3, 0.2) * (1 - ease(t, 6.2, 0.3))} />
      {/* black box: click → Laravel app ? → ৳100 */}
      <div style={{ position: "absolute", top: 945, left: 0, right: 0, height: 140 }}>
        <Tag x={190} y={30} text="👆 Click" color={TECH.blue} appear={p(8.02)} size={36} />
        <Arrow from={[300, 1000]} to={[400, 1000]} progress={ease(t, 8.6, 0.4)} color={TECH.muted} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 420,
          top: 935,
          width: 330,
          height: 130,
          borderRadius: 26,
          border: `3px dashed ${TECH.teal}`,
          background: "rgba(45,212,191,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          fontFamily: BN,
          fontWeight: 700,
          fontSize: 38,
          color: TECH.text,
          opacity: p(9.48),
          transform: `scale(${0.8 + 0.2 * p(9.48)})`,
        }}
      >
        Laravel app
        <span style={{ color: TECH.orange, fontSize: 56, transform: `scale(${1 + 0.15 * Math.sin(t * 6) * ease(t, 10.7, 0.3)})` }}>?</span>
      </div>
      <Arrow from={[770, 1000]} to={[850, 1000]} progress={ease(t, 10.4, 0.4)} color={TECH.muted} />
      <Tag x={935} y={970} text="৳100" color={TECH.teal} appear={p(10.6)} size={40} />
    </AbsoluteFill>
  );
};

// 2 — Express math on the same 4 km: ৳60 + 4 × ৳10 = ৳100
const Math2: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const line = ease(t, 1.52, 0.5);
  const kmAt = [10.3, 10.65, 11.0, 11.35];
  const x0 = 210;
  const x1 = 870;
  return (
    <AbsoluteFill>
      <Grid />
      {/* route */}
      <div style={{ position: "absolute", left: x0 - 60, top: 450, fontSize: 80, opacity: p(0.44) }}>🏪</div>
      <div style={{ position: "absolute", left: x1 - 20, top: 450, fontSize: 80, opacity: p(1.12) }}>🏠</div>
      <div style={{ position: "absolute", left: x0 + 50, top: 495, height: 8, width: (x1 - x0 - 70) * line, background: TECH.border, borderRadius: 4 }} />
      {kmAt.map((at, i) => {
        const seg = (x1 - x0 - 70) / 4;
        const on = ease(t, at, 0.25);
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: x0 + 50 + i * seg, top: 495, height: 8, width: seg * on, background: TECH.teal, borderRadius: 4 }} />
            <div style={{ position: "absolute", left: x0 + 50 + (i + 1) * seg - 8, top: 487, width: 24, height: 24, borderRadius: 12, background: line >= (i + 1) / 4 ? TECH.blue : "transparent" }} />
            <Tag x={x0 + 50 + (i + 0.5) * seg} y={525} text="+৳10" color={TECH.teal} appear={p(at)} size={26} />
          </div>
        );
      })}
      <Tag x={(x0 + x1) / 2 + 10} y={420} text="4 km" color={TECH.blue} appear={p(1.92)} size={34} />
      {/* Standard */}
      <Card top={620} appear={ease(t, 3.9, 0.4)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 38, fontWeight: 700 }}>
          <span>Standard</span>
          <span style={{ color: TECH.muted, fontSize: 30, fontWeight: 400 }}>সবসময়</span>
          <span style={{ color: TECH.teal, opacity: p(5.86), fontSize: 46 }}>৳60</span>
        </div>
      </Card>
      {/* Express formula */}
      <Card top={790} appear={ease(t, 6.91, 0.4)} border={TECH.teal}>
        <div style={{ fontSize: 38, fontWeight: 700, marginBottom: 10 }}>Express · 4 km</div>
        <div style={{ fontFamily: MONO, fontSize: 60, fontWeight: 700, lineHeight: 1.45 }}>
          <span style={{ opacity: p(9.18) }}>৳60</span>
          <span style={{ opacity: p(12.48), color: TECH.blue }}> + 4 × ৳10</span>
          <div style={{ opacity: p(15.0) }}>
            = ৳60 <span style={{ color: TECH.blue }}>+ ৳40</span>
          </div>
          <div style={{ opacity: p(16.84), color: TECH.teal, transform: `scale(${0.8 + 0.2 * p(16.84)})`, transformOrigin: "left center" }}>= ৳100</div>
        </div>
      </Card>
    </AbsoluteFill>
  );
};

// 3 — Simple if/else works... until Same Day arrives and Express's rate changes
const IfElse: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const crowd = ease(t, 11.38, 0.4);
  return (
    <AbsoluteFill>
      <Grid />
      <div style={{ position: "absolute", inset: 0, filter: crowd > 0 ? `drop-shadow(0 0 ${22 * crowd}px rgba(251,146,60,0.55))` : "none" }}>
        <CodePanel
          title="deliveryFee()"
          top={440}
          enterAt={0.2}
          fontSize={34}
          lines={["if ($method === 'standard') {", "    $fee = 60;", "} else {", "    $fee = 60 + $km * 10;", "}"]}
          highlights={[
            { lines: [1, 2, 3, 4, 5], at: 1.24, until: 3.0, color: "teal", label: "দুই নিয়ম" },
            { lines: [4], at: 9.73, until: 11.38, color: "orange", label: "rate বদল" },
            { lines: [1, 2, 3, 4, 5], at: 11.38, color: "orange", label: "সব এক method-এ" },
          ]}
        />
      </div>
      {/* Same Day — future requirement */}
      <div
        style={{
          position: "absolute",
          top: 835,
          left: 90,
          right: 90,
          height: 96,
          borderRadius: 22,
          border: `3px dashed ${TECH.muted}`,
          display: "flex",
          alignItems: "center",
          padding: "0 26px",
          gap: 18,
          fontFamily: BN,
          color: TECH.text,
          opacity: ease(t, 3.92, 0.4),
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700 }}>Same Day</div>
        <div style={{ fontSize: 26, color: TECH.muted, flex: 1 }}>{t >= 5.72 ? "অর্ডারের সময় অনুযায়ী" : "শীঘ্রই আসছে"}</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: TECH.orange }}>৳ ?</div>
      </div>
      <Tag x={810} y={812} text="future requirement" color={TECH.blue} appear={p(4.3)} size={24} />
      {/* ghost branch that would be added */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: 90,
          right: 90,
          padding: "16px 24px",
          borderRadius: 20,
          border: `3px dashed ${TECH.orange}`,
          fontFamily: `${MONO}, "Hind Siliguri", sans-serif`,
          fontVariantLigatures: "none",
          fontSize: 28,
          color: TECH.orange,
          lineHeight: 1.5,
          whiteSpace: "pre",
          opacity: ease(t, 6.09, 0.4) * 0.95,
        }}
      >
        {"+ elseif ($method === 'same_day') {\n+     // সময় দেখে নতুন হিসাব…\n+ }"}
      </div>
      <Tag x={540} y={1150} text="একটা rule বদলালেও → একই method খুলতে হয়" color={TECH.orange} appear={p(13.37)} size={28} />
    </AbsoluteFill>
  );
};

// 4 — Checkout always asks the same question; only the rule that answers it changes
const Question: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const rules = [
    { x: 215, name: "Standard", rule: "৳60", at: 5.44 },
    { x: 540, name: "Express", rule: "60 + km×10", at: 5.9 },
    { x: 865, name: "Same Day", rule: "সময় অনুযায়ী", at: 6.36, future: true },
  ];
  return (
    <AbsoluteFill>
      <Grid />
      <div
        style={{
          position: "absolute",
          left: 190,
          right: 190,
          top: 440,
          padding: "22px 26px",
          borderRadius: 30,
          background: TECH.panel2,
          border: `3px solid ${TECH.blue}`,
          textAlign: "center",
          fontFamily: BN,
          fontWeight: 700,
          fontSize: 40,
          color: TECH.text,
          opacity: p(1.24),
          transform: `scale(${0.85 + 0.15 * p(1.24)})`,
        }}
      >
        <div style={{ fontSize: 26, color: TECH.muted, fontWeight: 400 }}>Checkout জিজ্ঞেস করে</div>
        Delivery charge কত? <span style={{ fontFamily: MONO, color: TECH.blue, fontSize: 34 }}>(4 km)</span>
      </div>
      <Tag x={540} y={600} text="প্রতিবার একই প্রশ্ন" color={TECH.blue} appear={p(2.1)} size={28} />
      {rules.map((r) => (
        <div key={r.name}>
          <Arrow from={[540, 655]} to={[r.x, 735]} progress={ease(t, r.at - 0.2, 0.4)} color={TECH.border} head="open" />
          <div
            style={{
              position: "absolute",
              left: r.x - 145,
              top: 745,
              width: 290,
              height: 150,
              borderRadius: 24,
              border: `3px ${r.future ? "dashed" : "solid"} ${TECH.teal}`,
              background: TECH.panel,
              textAlign: "center",
              fontFamily: BN,
              color: TECH.text,
              paddingTop: 18,
              opacity: p(r.at),
              transform: `scale(${0.8 + 0.2 * p(r.at)})`,
              boxShadow: ease(t, 9.7, 0.3) > 0 ? `0 0 ${30 * ease(t, 9.7, 0.3)}px rgba(45,212,191,0.5)` : "none",
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 700 }}>{r.name}</div>
            <div style={{ fontFamily: `${MONO}, "Hind Siliguri"`, fontSize: 30, color: TECH.teal, marginTop: 8 }}>{r.rule}</div>
          </div>
          <Tag x={r.x} y={910} text="strategy" color={TECH.teal} appear={p(9.7)} size={26} />
        </div>
      ))}
      <Card top={1010} appear={ease(t, 7.16, 0.4)}>
        <div style={{ fontSize: 36, fontWeight: 700, textAlign: "center" }}>
          প্রশ্ন <span style={{ color: TECH.blue }}>একই</span> · উত্তরের নিয়ম <span style={{ color: TECH.teal }}>আলাদা</span>
        </div>
      </Card>
    </AbsoluteFill>
  );
};

// 5 — DeliveryStrategy interface: fee(int $km): int
const Interface: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill>
      <Grid />
      <ClassBox
        x={540}
        y={440}
        name="DeliveryStrategy"
        stereo="«interface»"
        width={430}
        border={TECH.teal}
        dashed={t < 2.35}
        appear={ease(t, 1.32, 0.4)}
        glow={ease(t, 10.15, 0.3) * (1 - ease(t, 13.0, 0.4))}
        methods={[{ text: "+ fee(int $km): int", color: TECH.teal, opacity: ease(t, 4.46, 0.3) }]}
      />
      <Tag x={540} y={640} text="Checkout শুধু fee() চেনে" color={TECH.blue} appear={p(11.29)} size={28} />
      <ClassBox x={285} y={710} name="StandardDelivery" width={330} nameSize={28} dashed border={TECH.muted} appear={ease(t, 13.13, 0.4)} methods={[{ text: "সূত্র এখানে", color: TECH.teal }]} />
      <ClassBox x={795} y={710} name="ExpressDelivery" width={330} nameSize={28} dashed border={TECH.muted} appear={ease(t, 13.4, 0.4)} methods={[{ text: "সূত্র এখানে", color: TECH.teal }]} />
      <CodePanel
        title="DeliveryStrategy.php"
        top={930}
        enterAt={1.0}
        fontSize={34}
        lines={["interface DeliveryStrategy", "{", "    public function fee(int $km): int;", "}"]}
        highlights={[
          { lines: [1], at: 1.32, until: 4.0, color: "teal", label: "interface" },
          { lines: [3], at: 4.0, until: 6.68, color: "teal", label: "একটাই method" },
          { lines: [3], at: 6.68, until: 7.82, color: "teal", label: "int $km = দূরত্ব" },
          { lines: [3], at: 7.82, until: 10.15, color: "teal", label: ": int = পূর্ণ টাকা" },
          { lines: [1, 2, 3, 4], at: 10.15, until: 13.13, color: "teal", label: "Checkout-এর চুক্তি" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 6 — StandardDelivery and ExpressDelivery implement it (separate shots)
const Classes: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const lines = (cls: string, ret: string) => [`class ${cls}`, "    implements DeliveryStrategy", "{", "    public function fee(int $km): int {", `        return ${ret};`, "    }"];
  return (
    <AbsoluteFill>
      <Grid />
      <ClassBox x={540} y={430} name="DeliveryStrategy" stereo="«interface»" width={400} border={TECH.teal} methods={[{ text: "+ fee(int $km): int", color: TECH.teal }]} />
      <ClassBox x={275} y={700} name="StandardDelivery" width={350} nameSize={28} appear={p(0.6)} glow={ease(t, 5.44, 0.3) * (1 - ease(t, 8.3, 0.3))} />
      <ClassBox x={805} y={700} name="ExpressDelivery" width={350} nameSize={28} appear={p(1.6)} glow={ease(t, 8.49, 0.3)} />
      <Arrow from={[300, 700]} to={[470, 638]} dashed head="hollow" color={TECH.teal} progress={ease(t, 3.9, 0.5)} />
      <Arrow from={[780, 700]} to={[610, 638]} dashed head="hollow" color={TECH.teal} progress={ease(t, 4.1, 0.5)} />
      <Tag x={540} y={670} text="implements" color={TECH.teal} appear={p(4.28)} size={26} />
      <Tag x={275} y={790} text="৳60" color={TECH.teal} appear={p(7.28)} size={32} />
      <Tag x={805} y={790} text="60 + km × 10" color={TECH.teal} appear={p(12.12)} size={30} />
      <CodePanel
        title="StandardDelivery.php"
        top={900}
        enterAt={0.4}
        exitAt={8.2}
        fontSize={32}
        lines={lines("StandardDelivery", "60")}
        highlights={[
          { lines: [2], at: 4.28, until: 5.44, color: "teal", label: "implements" },
          { lines: [4], at: 5.44, until: 7.28, color: "teal", label: "fee()" },
          { lines: [5], at: 7.28, color: "teal", label: "সবসময় 60" },
        ]}
      />
      <CodePanel
        title="ExpressDelivery.php"
        top={900}
        enterAt={8.3}
        fontSize={32}
        lines={lines("ExpressDelivery", "60 + $km * 10")}
        highlights={[
          { lines: [4], at: 8.49, until: 9.56, color: "teal", label: "fee()" },
          { lines: [5], at: 9.56, color: "teal", label: "60 + 4 × 10 = 100" },
        ]}
      />
    </AbsoluteFill>
  );
};

const TRACE = ["Click", "validate", "match", "Service", "fee()"];

// 7 — Trace: click → Laravel controller validates → match selects strategy → CheckoutService
const Controller: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const active = t < 4.76 ? 0 : t < 8.89 ? 1 : t < 11.25 ? 2 : 3;
  const reqMove = ease(t, 3.0, 0.8);
  return (
    <AbsoluteFill>
      <Grid />
      <TraceBar top={440} steps={TRACE} active={t < 1.75 ? -1 : active} appear={ease(t, 0, 0.4)} />
      {/* selected Express row (same checkout) */}
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 420,
          top: 600,
          height: 96,
          borderRadius: 22,
          border: `3px solid ${TECH.teal}`,
          background: "rgba(45,212,191,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 22px",
          fontFamily: BN,
          color: TECH.text,
          opacity: ease(t, 1.75, 0.4),
        }}
      >
        <div style={{ width: 30, height: 30, borderRadius: 15, border: `3px solid ${TECH.teal}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 16, height: 16, borderRadius: 8, background: TECH.teal }} />
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, flex: 1 }}>Express</div>
        <div style={{ fontSize: 28, color: TECH.muted }}>4 km</div>
      </div>
      {/* request payload travels to the controller */}
      <div
        style={{
          position: "absolute",
          left: 120 + 450 * reqMove,
          top: 730,
          padding: "10px 18px",
          borderRadius: 16,
          background: TECH.panel2,
          border: `2px solid ${TECH.blue}`,
          fontFamily: MONO,
          fontSize: 26,
          color: TECH.text,
          whiteSpace: "nowrap",
          opacity: ease(t, 2.7, 0.3),
        }}
      >
        delivery_method: <span style={{ color: "#a5d6ff" }}>"express"</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 600,
          width: 390,
          top: 600,
          height: 96,
          borderRadius: 22,
          border: `3px solid ${TECH.blue}`,
          background: TECH.panel2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONO,
          fontSize: 28,
          fontWeight: 700,
          color: TECH.text,
          opacity: p(3.44),
        }}
      >
        CheckoutController
      </div>
      <Tag x={795} y={815} text="✓ express = allowed" color={TECH.teal} appear={p(8.14) * (1 - ease(t, 11.2, 0.3))} size={28} />
      <Tag x={795} y={815} text="new CheckoutService($strategy)" color={TECH.teal} appear={p(11.25)} size={24} />
      <CodePanel
        title="CheckoutController.php"
        top={910}
        enterAt={3.44}
        exitAt={8.6}
        fontSize={32}
        lines={["$data = $request->validate([", "    'delivery_method' =>", "        'required|in:standard,express',", "]);"]}
        highlights={[
          { lines: [2, 3], at: 4.76, until: 7.36, color: "teal", label: "validate" },
          { lines: [3], at: 7.36, color: "teal", label: "অনুমোদিত option?" },
        ]}
      />
      <CodePanel
        title="CheckoutController.php"
        top={910}
        side={56}
        enterAt={8.7}
        fontSize={29}
        lines={[
          "$strategy = match ($data['delivery_method']) {",
          "    'standard' => new StandardDelivery(),",
          "    'express' => new ExpressDelivery(),",
          "};",
          "$service = new CheckoutService($strategy);",
        ]}
        highlights={[
          { lines: [1], at: 8.89, until: 9.32, color: "teal", label: "match" },
          { lines: [3], at: 9.32, until: 11.25, color: "teal", label: "express →" },
          { lines: [5], at: 11.25, color: "teal", label: "constructor" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 8 — CheckoutService::deliveryFee(4) → $this->strategy->fee(4): Express 100, Standard 60
const Service: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const std = t >= 7.9;
  return (
    <AbsoluteFill>
      <Grid />
      <TraceBar top={440} steps={TRACE} active={4} />
      <ClassBox x={265} y={585} name="CheckoutService" width={360} nameSize={30} methods={[{ text: "+ deliveryFee(4)", color: TECH.text }]} glow={ease(t, 15.66, 0.3)} border={TECH.blue} />
      <ClassBox
        x={810}
        y={585}
        name={std ? "StandardDelivery" : "ExpressDelivery"}
        stereo="$this->strategy"
        width={340}
        nameSize={28}
        border={TECH.teal}
        glow={ease(t, 4.64, 0.3) * (1 - ease(t, 6.8, 0.3)) + ease(t, 11.62, 0.3) * (1 - ease(t, 13.6, 0.3))}
        methods={[{ text: std ? "return 60" : "60 + 4 × 10", color: TECH.teal }]}
      />
      <Arrow from={[447, 650]} to={[637, 650]} head="open" color={TECH.teal} progress={ease(t, 0.6, 0.4)} label="delegates" />
      <Packet from={[447, 690]} to={[637, 690]} at={1.44} dur={1.4} label="fee(4)" />
      <Packet from={[637, 740]} to={[447, 740]} at={5.2} dur={1.0} color={TECH.blue} label="100" />
      <Packet from={[447, 690]} to={[637, 690]} at={9.32} dur={1.2} label="fee(4)" />
      <Packet from={[637, 740]} to={[447, 740]} at={12.3} dur={0.9} color={TECH.blue} label="60" />
      <Tag x={290} y={810} text="Express → ৳100" color={TECH.teal} appear={p(6.62)} size={32} />
      <Tag x={790} y={810} text="Standard → ৳60" color={TECH.teal} appear={p(13.2)} size={32} />
      <Tag x={540} y={872} text="কোন সূত্র? CheckoutService জানে না" color={TECH.blue} appear={p(15.66)} size={26} />
      <CodePanel
        title="CheckoutService.php"
        top={940}
        enterAt={0.1}
        fontSize={34}
        lines={["public function deliveryFee(int $km): int", "{", "    return $this->strategy->fee($km);", "}"]}
        highlights={[
          { lines: [3], at: 0.18, until: 7.46, color: "teal", label: "fee($km = 4)" },
          { lines: [3], at: 7.46, color: "teal", label: "একই line" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 9 — Rate change: only ExpressDelivery's per-km rate 10 → 15; checkout shows ৳100 → ৳120
const Rate: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const changed = t >= 4.24;
  const standard = t >= 10.82;
  const fee = standard ? 60 : t >= 9.52 ? count(t, 9.52, 0.7, 100, 120) : 100;
  return (
    <AbsoluteFill>
      <Grid />
      <CodePanel
        title="ExpressDelivery.php"
        top={430}
        enterAt={0.2}
        fontSize={32}
        lines={[
          "class ExpressDelivery",
          "    implements DeliveryStrategy",
          "{",
          "    public function fee(int $km): int {",
          `        return 60 + $km * ${changed ? 15 : 10};`,
          "    }",
        ]}
        highlights={[
          { lines: [5], at: 3.3, until: 4.24, color: "teal", label: "rate 10" },
          { lines: [5], at: 4.24, color: "teal", label: "শুধু এই line: 10 → 15" },
        ]}
      />
      <CheckoutCard
        top={860}
        compact
        t={t}
        selected={standard ? "standard" : "express"}
        options={[
          { id: "standard", name: "Standard", sub: "২–৩ দিন", price: "৳60" },
          { id: "express", name: "Express", sub: "আজকেই", price: t >= 9.52 ? "৳120" : "৳100" },
        ]}
        fee={`৳${fee}`}
        feeFlash={ease(t, 9.6, 0.2) * (1 - ease(t, 10.6, 0.3)) + ease(t, 10.9, 0.2) * (1 - ease(t, 11.6, 0.3))}
        tap={{ id: "standard", at: 10.82 }}
      />
      <Tag x={540} y={1262} text="৳60 + 4 × ৳15 = ৳120" color={TECH.teal} appear={p(9.52) * (1 - ease(t, 10.75, 0.25))} size={32} />
      <Tag x={540} y={1262} text="Standard: অপরিবর্তিত ✓" color={TECH.blue} appear={p(10.82) * (1 - ease(t, 12.1, 0.25))} size={30} />
      <Tag x={540} y={1262} text="CheckoutService: কোনো change নেই ✓" color={TECH.blue} appear={p(12.17)} size={30} />
    </AbsoluteFill>
  );
};

// 10 — Recap: Duck → FlyBehavior (Part 2) beside CheckoutService → DeliveryStrategy (today)
const Recap: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill>
      <Grid />
      <Tag x={270} y={430} text="পর্ব ২" color={TECH.panel2} dark={false} appear={p(0.2)} size={30} />
      <Tag x={810} y={430} text="আজ" color={TECH.panel2} dark={false} appear={p(3.66)} size={30} />
      <ClassBox x={270} y={500} name="Duck" width={300} appear={p(0.74)} methods={[{ text: "performFly()" }]} />
      <Arrow from={[270, 630]} to={[270, 720]} head="open" color={TECH.teal} progress={ease(t, 1.5, 0.4)} />
      <ClassBox x={270} y={730} name="FlyBehavior" stereo="«interface»" width={300} nameSize={30} border={TECH.teal} appear={p(2.34)} />
      <ClassBox x={810} y={500} name="CheckoutService" width={340} nameSize={30} appear={p(4.13)} methods={[{ text: "deliveryFee()" }]} />
      <Arrow from={[810, 630]} to={[810, 720]} head="open" color={TECH.teal} progress={ease(t, 5.4, 0.4)} />
      <ClassBox x={810} y={730} name="DeliveryStrategy" stereo="«interface»" width={340} nameSize={30} border={TECH.teal} appear={p(6.38)} />
      <Tag x={540} y={545} text="Context" color={TECH.blue} appear={p(6.9)} size={28} />
      <Tag x={540} y={770} text="Strategy" color={TECH.teal} appear={p(7.2)} size={28} />
      <Tag x={540} y={655} text="delegates" color={TECH.teal} appear={p(7.5)} size={24} />
      <CodePanel
        title="same pattern"
        top={960}
        enterAt={7.83}
        fontSize={31}
        lines={["$duck->performFly();", "// → $this->flyBehavior->fly()", "$checkout->deliveryFee(4);", "// → $this->strategy->fee(4)"]}
        highlights={[{ lines: [2, 4], at: 8.6, color: "teal", label: "কাজটা delegate" }]}
      />
    </AbsoluteFill>
  );
};

// 11 — Decision: one fixed fee → config; several independently-changing rules → Strategy
const Decision: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill>
      <Grid />
      <Card top={440} appear={ease(t, 0, 0.4)}>
        <div style={{ fontSize: 34, color: TECH.muted }}>শুধু একটা নির্দিষ্ট charge?</div>
        <div style={{ fontSize: 44, fontWeight: 700, marginTop: 4 }}>
          → <span style={{ color: TECH.blue }}>config</span>-এ রাখো
        </div>
        <div style={{ fontFamily: MONO, fontSize: 30, color: "#a5d6ff", marginTop: 10, opacity: ease(t, 2.12, 0.4), fontVariantLigatures: "none" }}>
          config('delivery.fee') <span style={{ color: TECH.muted }}>// 60</span>
        </div>
      </Card>
      <Card top={730} appear={ease(t, 3.43, 0.4)} border={TECH.teal}>
        <div style={{ fontSize: 34, color: TECH.muted }}>একই কাজের কয়েকটা নিয়ম, আলাদাভাবে বদলায়?</div>
        <div style={{ fontSize: 48, fontWeight: 700, marginTop: 4, opacity: p(6.72) }}>
          → <span style={{ color: TECH.teal }}>Strategy Pattern</span> ✓
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap", opacity: ease(t, 4.82, 0.4) }}>
          {["Standard", "Express", "Same Day"].map((n) => (
            <div key={n} style={{ fontFamily: MONO, fontSize: 26, padding: "6px 16px", borderRadius: 999, border: `2px solid ${TECH.teal}`, color: TECH.teal }}>
              {n}
            </div>
          ))}
        </div>
      </Card>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 1090,
          padding: "22px 26px",
          borderRadius: 28,
          textAlign: "center",
          background: `linear-gradient(135deg, ${TECH.teal}, ${TECH.blue})`,
          color: TECH.navy,
          fontFamily: BN,
          fontWeight: 700,
          fontSize: 36,
          opacity: p(8.7),
          transform: `scale(${0.8 + 0.2 * p(8.7)})`,
        }}
      >
        Dev Diary · Strategy Pattern সিরিজ সমাপ্ত
      </div>
    </AbsoluteFill>
  );
};

export const STRATEGY_P3 = {
  "strategy3/hook": Hook,
  "strategy3/math": Math2,
  "strategy3/ifelse": IfElse,
  "strategy3/question": Question,
  "strategy3/interface": Interface,
  "strategy3/classes": Classes,
  "strategy3/controller": Controller,
  "strategy3/service": Service,
  "strategy3/rate": Rate,
  "strategy3/recap": Recap,
  "strategy3/decision": Decision,
};
