import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { TECH } from "./anim";

const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700"] });
const BN = `"Hind Siliguri", ${MONO}, sans-serif`;

export type DeliveryOption = { id: string; name: string; sub?: string; price: string; future?: boolean };

// Mobile checkout card (original UI). Same order + 4 km in every scene.
export const CheckoutCard: React.FC<{
  top: number;
  left?: number;
  width?: number;
  options?: DeliveryOption[];
  selected: string; // option id
  fee: string; // text in the "Delivery fee" row, e.g. "৳100"
  feeFlash?: number; // 0..1 teal glow on fee row
  feeColor?: string;
  tap?: { id: string; at: number } | null; // tap ripple on an option
  t?: number;
  appear?: number;
  compact?: boolean;
}> = ({ top, left = 110, width = 860, options, selected, fee, feeFlash = 0, feeColor, tap, t = 0, appear = 1, compact = false }) => {
  const opts: DeliveryOption[] = options ?? [
    { id: "standard", name: "Standard", sub: "২–৩ দিন", price: "৳60" },
    { id: "express", name: "Express", sub: "আজকেই", price: "৳100" },
  ];
  const rowH = compact ? 84 : 100;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width,
        background: TECH.panel,
        border: `2px solid ${TECH.border}`,
        borderRadius: 34,
        padding: compact ? "20px 26px" : "26px 30px",
        boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
        fontFamily: BN,
        color: TECH.text,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 50}px)`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: compact ? 10 : 16 }}>
        <div style={{ fontSize: compact ? 34 : 40, fontWeight: 700 }}>Checkout</div>
        <div style={{ fontSize: compact ? 26 : 28, color: TECH.muted }}>📍 ঠিকানা · <b style={{ color: TECH.blue }}>4 km</b></div>
      </div>
      {opts.map((o) => {
        const on = o.id === selected;
        const tapK = tap && tap.id === o.id ? Math.max(0, Math.min(1, (t - tap.at) / 0.5)) : 0;
        return (
          <div
            key={o.id}
            style={{
              position: "relative",
              height: rowH,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 22px",
              marginTop: 12,
              borderRadius: 22,
              border: `3px ${o.future ? "dashed" : "solid"} ${on ? TECH.teal : TECH.border}`,
              background: on ? "rgba(45,212,191,0.12)" : "transparent",
              opacity: o.future ? 0.85 : 1,
              overflow: "hidden",
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 17, border: `3px solid ${on ? TECH.teal : TECH.muted}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {on ? <div style={{ width: 18, height: 18, borderRadius: 9, background: TECH.teal }} /> : null}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: compact ? 32 : 36, fontWeight: 700, lineHeight: 1.1 }}>{o.name}</div>
              {o.sub ? <div style={{ fontSize: 24, color: TECH.muted, lineHeight: 1.2 }}>{o.sub}</div> : null}
            </div>
            <div style={{ fontSize: compact ? 32 : 36, fontWeight: 700, color: o.future ? TECH.muted : TECH.text }}>{o.price}</div>
            {tapK > 0 && tapK < 1 ? (
              <div
                style={{
                  position: "absolute",
                  left: 40 - 90 * tapK,
                  top: rowH / 2 - 90 * tapK,
                  width: 180 * tapK,
                  height: 180 * tapK,
                  borderRadius: "50%",
                  background: `rgba(45,212,191,${0.35 * (1 - tapK)})`,
                }}
              />
            ) : null}
          </div>
        );
      })}
      <div
        style={{
          marginTop: compact ? 14 : 20,
          paddingTop: compact ? 12 : 16,
          borderTop: `2px solid ${TECH.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: compact ? 30 : 34, color: TECH.muted }}>Delivery fee</div>
        <div
          style={{
            fontSize: compact ? 44 : 52,
            fontWeight: 700,
            color: feeColor ?? TECH.teal,
            textShadow: feeFlash > 0 ? `0 0 ${30 * feeFlash}px ${feeColor ?? TECH.teal}` : "none",
            transform: `scale(${1 + 0.12 * feeFlash})`,
          }}
        >
          {fee}
        </div>
      </div>
    </div>
  );
};

// Finger/tap pointer (simple circle cursor)
export const TapCursor: React.FC<{ x: number; y: number; press?: number; appear?: number }> = ({ x, y, press = 0, appear = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - 32,
      top: y - 32,
      width: 64,
      height: 64,
      borderRadius: 32,
      border: "4px solid #fff",
      background: "rgba(255,255,255,0.25)",
      transform: `scale(${1 - 0.25 * press})`,
      opacity: appear,
      boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
    }}
  />
);

// Horizontal request trace: Click → validate → match → Service → fee()
export const TraceBar: React.FC<{ top: number; steps: string[]; active: number; done?: number; appear?: number }> = ({ top, steps, active, done = -1, appear = 1 }) => {
  const left = 80;
  const w = 1080 - 2 * left;
  const gap = w / (steps.length - 1);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, height: 110, opacity: appear }}>
      <div style={{ position: "absolute", left: left, width: w, top: 26, height: 6, background: TECH.border, borderRadius: 3 }} />
      <div
        style={{
          position: "absolute",
          left: left,
          width: Math.max(0, Math.min(active, steps.length - 1)) * gap,
          top: 26,
          height: 6,
          background: TECH.teal,
          borderRadius: 3,
        }}
      />
      {steps.map((s, i) => {
        const on = i <= active;
        const cur = Math.round(active) === i;
        return (
          <div key={s} style={{ position: "absolute", left: left + i * gap, top: 0, transform: "translateX(-50%)", textAlign: "center" }}>
            <div
              style={{
                width: 58,
                height: 58,
                margin: "0 auto",
                borderRadius: 29,
                background: on ? TECH.teal : TECH.panel2,
                border: `4px solid ${on ? TECH.teal : TECH.border}`,
                boxShadow: cur ? `0 0 26px ${TECH.teal}` : "none",
                color: TECH.navy,
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 26,
                lineHeight: "50px",
              }}
            >
              {i < done || (on && !cur) ? "✓" : i + 1}
            </div>
            <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 22, color: on ? TECH.text : TECH.muted, whiteSpace: "nowrap" }}>{s}</div>
          </div>
        );
      })}
    </div>
  );
};
