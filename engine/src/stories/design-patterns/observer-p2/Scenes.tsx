// Dev Diary — Observer Pattern in Laravel, Part 2 (OrderPlaced event)
// Ivory theme (Part 1 style): charcoal text, plum = event path, burnt orange = the active order number.
// The SAME order number shows on checkout, email and shop screens so the eye can follow the flow.
// Beat times come from public/projects/design-patterns/observer-p2-bn/scenes.json captions.
// Runnable Laravel 13 source: public/projects/design-patterns/observer-p2-bn/source/laravel-shop
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import type { IllustrationProps } from "../../../illustrations/registry";
import { CodePanel } from "../../../tech/CodePanel";
import { ease, pop, useT } from "../../../tech/anim";
import { CurrentCard, HistoryCard, Link, Station } from "../observer-p1/Scenes";

const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700"] });
const BN = `"Hind Siliguri", ${MONO}, sans-serif`;

const IVORY = "#FAF7EF";
const INK = "#25232A";
const PLUM = "#702963";
const ORANGE = "#B84A20";
const MUTED = "#8c8693";
const CARD = "#ffffff";
const CODE_TOP = 1080;

const usePopAt = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number) => pop(frame, fps, at);
};
const prog = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ---------- layout ----------
const CHECKOUT = { x: 60, y: 450, w: 360, h: 330 };
const BUTTON: [number, number] = [CHECKOUT.x + CHECKOUT.w / 2, CHECKOUT.y + 270];
const HUB: [number, number] = [240, 930];
type Dest = { key: string; y: number; title: string };
export const DESTS: Dest[] = [
  { key: "email", y: 440, title: "Inbox" },
  { key: "shop", y: 650, title: "Shop" },
  { key: "warehouse", y: 860, title: "Warehouse" },
];
const DX = 590;
const DW = 420;
const DH = 175;
const port = (d: Dest): [number, number] => [DX, d.y + DH / 2];

// ---------- pieces ----------
const Grid: React.FC = () => (
  <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(37,35,42,0.07) 2px, transparent 2px)", backgroundSize: "44px 44px" }} />
);

const OrderNo: React.FC<{ n: number; size?: number }> = ({ n, size = 34 }) => (
  <span style={{ background: ORANGE, color: "#fff", borderRadius: 12, padding: "0 10px", fontFamily: MONO, fontWeight: 700, fontSize: size }}>#{n}</span>
);

export const Checkout: React.FC<{ t: number; order: number; tapAt: number; confirmAt: number }> = ({ t, order, tapAt, confirmAt }) => {
  const tap = t >= tapAt && t < tapAt + 0.5 ? (t - tapAt) / 0.5 : 0;
  const ok = t >= confirmAt;
  return (
    <div style={{ position: "absolute", left: CHECKOUT.x, top: CHECKOUT.y, width: CHECKOUT.w, height: CHECKOUT.h, background: CARD, border: `4px solid ${INK}`, borderRadius: 32, boxShadow: "0 10px 0 rgba(37,35,42,0.12)", fontFamily: BN, color: INK, overflow: "hidden" }}>
      <div style={{ padding: "16px 22px", fontFamily: MONO, fontWeight: 700, fontSize: 30 }}>Checkout</div>
      <div style={{ padding: "0 22px", fontSize: 30 }}>
        অর্ডার <OrderNo n={order} />
      </div>
      <div style={{ padding: "6px 22px", fontSize: 24, color: MUTED }}>২টা আইটেম · ৳850</div>
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          top: 230,
          height: 74,
          borderRadius: 20,
          background: ok ? "#2f7d4f" : PLUM,
          color: "#fff",
          fontFamily: BN,
          fontWeight: 700,
          fontSize: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 - 0.06 * Math.sin(tap * Math.PI)})`,
        }}
      >
        {ok ? "✓ Order confirmed" : "Place order"}
      </div>
      {tap > 0 ? <div style={{ position: "absolute", left: CHECKOUT.w / 2 - 90 * tap, top: 267 - 90 * tap, width: 180 * tap, height: 180 * tap, borderRadius: "50%", background: `rgba(112,41,99,${0.35 * (1 - tap)})` }} /> : null}
    </div>
  );
};

export const DestCard: React.FC<{ d: Dest; t: number; order: number | null; appear?: number; glow?: number; dashed?: boolean; at?: number }> = ({ d, t, order, appear = 1, glow = 0, dashed = false, at = -1 }) => {
  const fresh = at >= 0 ? ease(t, at, 0.3) * (1 - ease(t, at + 1.2, 0.4)) : 0;
  const msg =
    d.key === "email" ? (
      <>আপনার অর্ডার নম্বর {order != null ? <OrderNo n={order} size={28} /> : "…"}</>
    ) : d.key === "shop" ? (
      <>নতুন অর্ডার {order != null ? <OrderNo n={order} size={28} /> : "…"} প্রস্তুত করুন</>
    ) : (
      <>অর্ডার {order != null ? <OrderNo n={order} size={28} /> : "…"} pack করুন</>
    );
  const icon = d.key === "email" ? "✉" : d.key === "shop" ? "🛍" : "📦";
  return (
    <div
      style={{
        position: "absolute",
        left: DX,
        top: d.y,
        width: DW,
        height: DH,
        background: CARD,
        border: `4px ${dashed ? "dashed" : "solid"} ${dashed ? MUTED : INK}`,
        borderRadius: 26,
        opacity: appear,
        transform: `translateX(${(1 - appear) * 60}px) scale(${1 + 0.04 * fresh})`,
        boxShadow: glow + fresh > 0 ? `0 0 ${34 * Math.max(glow, fresh)}px ${PLUM}, 0 10px 0 rgba(37,35,42,0.12)` : "0 10px 0 rgba(37,35,42,0.12)",
        fontFamily: BN,
        color: INK,
        padding: "12px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontWeight: 700, fontSize: 26 }}>
        <span style={{ fontSize: 30 }}>{icon}</span>
        {d.title}
      </div>
      <div style={{ marginTop: 14, fontSize: 30, fontWeight: 700, lineHeight: 1.5 }}>{dashed ? <span style={{ color: MUTED }}>?</span> : msg}</div>
    </div>
  );
};

// plum event path: button → hub → destination (quadratic curves)
const pathTo = (d: Dest) => {
  const [hx, hy] = HUB;
  const [px, py] = port(d);
  return `M ${hx} ${hy} C ${hx + 200} ${hy} ${px - 150} ${py} ${px} ${py}`;
};
const pointOn = (d: Dest, k: number): [number, number] => {
  const [hx, hy] = HUB;
  const [px, py] = port(d);
  const P0 = [hx, hy];
  const P1 = [hx + 200, hy];
  const P2 = [px - 150, py];
  const P3 = [px, py];
  const u = 1 - k;
  return [
    u * u * u * P0[0] + 3 * u * u * k * P1[0] + 3 * u * k * k * P2[0] + k * k * k * P3[0],
    u * u * u * P0[1] + 3 * u * u * k * P1[1] + 3 * u * k * k * P2[1] + k * k * k * P3[1],
  ];
};

export const Paths: React.FC<{ t: number; show: Record<string, number>; feed?: number }> = ({ t, show, feed = 1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <line x1={BUTTON[0]} y1={CHECKOUT.y + CHECKOUT.h} x2={HUB[0]} y2={HUB[1] - 46} stroke={PLUM} strokeWidth={7} strokeDasharray="18 10" strokeDashoffset={-t * 60} opacity={feed} />
    {DESTS.map((d) =>
      (show[d.key] ?? 0) > 0 ? (
        <path key={d.key} d={pathTo(d)} fill="none" stroke={PLUM} strokeWidth={7} strokeDasharray="18 10" strokeDashoffset={-t * 60} opacity={show[d.key]} pathLength={1000} />
      ) : null,
    )}
  </svg>
);

export const Hub: React.FC<{ glow?: number; appear?: number }> = ({ glow = 0, appear = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: HUB[0] - 150,
      top: HUB[1] - 46,
      width: 300,
      height: 92,
      borderRadius: 46,
      background: INK,
      color: IVORY,
      fontFamily: MONO,
      fontWeight: 700,
      fontSize: 26,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 1.15,
      opacity: appear,
      boxShadow: glow > 0 ? `0 0 ${40 * glow}px ${PLUM}` : "none",
    }}
  >
    Event
    <span>Dispatcher</span>
  </div>
);

// envelope chip "OrderPlaced #n" travelling along a path
const Envelope: React.FC<{ x: number; y: number; n: number; show: number }> = ({ x, y, n, show }) =>
  show <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%,-50%)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px",
        borderRadius: 16,
        background: CARD,
        border: `3px solid ${PLUM}`,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 22,
        color: PLUM,
        opacity: show,
        boxShadow: "0 0 18px rgba(112,41,99,0.4)",
        whiteSpace: "nowrap",
      }}
    >
      OrderPlaced <OrderNo n={n} size={22} />
    </div>
  );

// chip travels button → hub
const ToHub: React.FC<{ t: number; at: number; dur?: number; n: number }> = ({ t, at, dur = 1.3, n }) => {
  if (t < at || t > at + dur + 0.2) return null;
  const k = prog(t, at, at + dur);
  return <Envelope x={BUTTON[0] + (HUB[0] - BUTTON[0]) * k} y={CHECKOUT.y + CHECKOUT.h + (HUB[1] - 46 - CHECKOUT.y - CHECKOUT.h) * k} n={n} show={1} />;
};
// chip travels hub → destination
const ToDest: React.FC<{ t: number; d: Dest; at: number; dur?: number; n: number }> = ({ t, d, at, dur = 1.2, n }) => {
  if (t < at || t > at + dur + 0.1) return null;
  const [x, y] = pointOn(d, prog(t, at, at + dur));
  return <Envelope x={x} y={y} n={n} show={1} />;
};

const Tag: React.FC<{ x: number; y: number; text: string; appear: number; color?: string; size?: number }> = ({ x, y, text, appear, color = INK, size = 28 }) =>
  appear <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * appear})`, opacity: appear, background: color, color: "#fff", fontFamily: BN, fontWeight: 700, fontSize: size, padding: "4px 18px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {text}
    </div>
  );

// ---------- scenes ----------

// 1 — Place order #1042 → email receipt + shop notification. Warehouse too: change checkout?
const Hook: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Checkout t={t} order={1042} tapAt={0.3} confirmAt={0.8} />
      <DestCard d={DESTS[0]} t={t} order={1042} appear={ease(t, 1.86, 0.4)} at={2.76} />
      <DestCard d={DESTS[1]} t={t} order={1042} appear={ease(t, 4.24, 0.4)} at={5.12} />
      <DestCard d={DESTS[2]} t={t} order={null} dashed appear={ease(t, 7.5, 0.4)} />
      <Tag x={240} y={900} text="checkout বদলাতে হবে?" appear={p(9.5)} color={ORANGE} />
      <CodePanel
        title="CheckoutController.php"
        top={CODE_TOP}
        enterAt={6.9}
        fontSize={30}
        side={56}
        lines={["$order = Order::create($data);", "// email পাঠাও…", "// দোকানকে জানাও…", "// warehouse-কেও? আবার এখানে?"]}
        highlights={[{ lines: [4], at: 9.07, color: "orange", label: "code বদল?" }]}
      />
    </AbsoluteFill>
  );
};

// 2 — After save, OrderPlaced::dispatch($order); event class (Dispatchable, public Order $order). #1042 → dispatcher
const Event: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Checkout t={t} order={1042} tapAt={-5} confirmAt={-5} />
      <Paths t={t} show={{}} feed={ease(t, 6.5, 0.4)} />
      <Hub appear={ease(t, 6.5, 0.4)} glow={ease(t, 8.6, 0.3) * (1 - ease(t, 9.4, 0.3))} />
      <ToHub t={t} at={7.0} n={1042} />
      <Tag x={790} y={540} text="checkout: অর্ডার তৈরি" appear={p(3.06) * (1 - ease(t, 6.3, 0.3))} color={INK} />
      <Tag x={790} y={540} text="OrderPlaced + $order" appear={p(9.65)} color={PLUM} />
      <Tag x={790} y={620} text="কোন অর্ডার? → #1042" appear={p(13.67)} color={ORANGE} />
      <CodePanel
        title="PlaceOrder.php"
        top={CODE_TOP}
        enterAt={0.2}
        exitAt={7.3}
        fontSize={31}
        lines={["$order = Order::create($data);", "", "OrderPlaced::dispatch($order);"]}
        highlights={[
          { lines: [1], at: 3.06, until: 4.91, color: "teal", label: "তৈরি" },
          { lines: [1], at: 4.91, until: 6.13, color: "teal", label: "save" },
          { lines: [3], at: 6.13, color: "orange", label: "dispatch" },
        ]}
      />
      <CodePanel
        title="app/Events/OrderPlaced.php"
        top={CODE_TOP}
        enterAt={7.4}
        fontSize={27}
        side={36}
        lines={["class OrderPlaced", "{", "    use Dispatchable;", "    public function __construct(public Order $order) {}", "}"]}
        highlights={[
          { lines: [1], at: 7.49, until: 8.6, color: "teal", label: "event" },
          { lines: [3], at: 8.6, until: 9.65, color: "teal", label: "Dispatchable" },
          { lines: [4], at: 9.65, color: "orange", label: "public Order $order" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 3 — #1042 dispatched once; dispatcher finds two listeners
const Dispatch: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Checkout t={t} order={1042} tapAt={-5} confirmAt={-5} />
      <Paths t={t} show={{ email: ease(t, 10.42, 0.6), shop: ease(t, 11.0, 0.6) }} />
      <Hub glow={ease(t, 6.8, 0.3) * (1 - ease(t, 10.3, 0.4))} />
      <ToHub t={t} at={4.5} dur={1.6} n={1042} />
      <DestCard d={DESTS[0]} t={t} order={null} appear={ease(t, 10.42, 0.4)} />
      <DestCard d={DESTS[1]} t={t} order={null} appear={ease(t, 11.0, 0.4)} />
      <Tag x={240} y={1040} text="মাত্র একবার" appear={p(4.52)} color={ORANGE} />
      <Tag x={800} y={1080 - 50} text="listener: ২টা" appear={p(12.18)} color={PLUM} />
      <CodePanel
        title="dispatch → listeners"
        top={CODE_TOP + 40}
        enterAt={0.2}
        fontSize={30}
        side={56}
        lines={["OrderPlaced::dispatch($order); // #1042", "// dispatcher খোঁজে:", "//  → SendOrderConfirmation", "//  → NotifyShop"]}
        highlights={[
          { lines: [1], at: 3.41, until: 8.26, color: "orange", label: "একবার" },
          { lines: [2], at: 8.26, until: 10.42, color: "teal", label: "কোন listener?" },
          { lines: [3, 4], at: 10.42, color: "teal", label: "২টা" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 4 — Branch 1: SendOrderConfirmation::handle() takes $event->order → email shows #1042
const Email: React.FC<IllustrationProps> = () => {
  const t = useT();
  const got = t >= 7.4;
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Checkout t={t} order={1042} tapAt={-5} confirmAt={-5} />
      <Paths t={t} show={{ email: 1, shop: 0.25 }} />
      <Hub glow={ease(t, 0.6, 0.3) * (1 - ease(t, 2.5, 0.3))} />
      <ToDest t={t} d={DESTS[0]} at={6.0} dur={1.4} n={1042} />
      <DestCard d={DESTS[0]} t={t} order={got ? 1042 : null} glow={ease(t, 0.6, 0.3) * (1 - ease(t, 2.6, 0.3))} at={got ? 7.94 : -1} />
      <DestCard d={DESTS[1]} t={t} order={null} appear={0.35} />
      <CodePanel
        title="app/Listeners/SendOrderConfirmation.php"
        top={CODE_TOP}
        enterAt={0.1}
        fontSize={29}
        side={56}
        lines={["public function handle(OrderPlaced $event): void", "{", "    $order = $event->order;", "    Mail::to($order->customer_email)", "        ->send(new OrderConfirmation($order));"]}
        highlights={[
          { lines: [1], at: 2.76, until: 4.09, color: "teal", label: "handle" },
          { lines: [3], at: 4.09, until: 5.43, color: "orange", label: "$event->order" },
          { lines: [4, 5], at: 5.43, color: "teal", label: "email" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 5 — Branch 2: NotifyShop gets the same order → shop screen shows #1042
const Shop: React.FC<IllustrationProps> = () => {
  const t = useT();
  const got = t >= 7.3;
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Checkout t={t} order={1042} tapAt={-5} confirmAt={-5} />
      <Paths t={t} show={{ email: 0.35, shop: 1 }} />
      <Hub />
      <ToDest t={t} d={DESTS[1]} at={5.7} dur={1.5} n={1042} />
      <DestCard d={DESTS[0]} t={t} order={1042} appear={0.55} />
      <DestCard d={DESTS[1]} t={t} order={got ? 1042 : null} glow={ease(t, 0.5, 0.3) * (1 - ease(t, 2.4, 0.3))} at={got ? 7.52 : -1} />
      <CodePanel
        title="app/Listeners/NotifyShop.php"
        top={CODE_TOP}
        enterAt={0.1}
        fontSize={28}
        side={44}
        lines={["public function handle(OrderPlaced $event): void", "{", "    $order = $event->order;", '    Log::info("Shop: নতুন অর্ডার {$order->id} প্রস্তুত করুন");', "}"]}
        highlights={[
          { lines: [1], at: 1.18, until: 2.64, color: "teal", label: "handle" },
          { lines: [3], at: 2.64, until: 5.24, color: "orange", label: "একই $event->order" },
          { lines: [4], at: 5.24, color: "teal", label: "দোকান" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 6 — Back to the question: where does the warehouse code go?
const Question: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Checkout t={t} order={1042} tapAt={-5} confirmAt={-5} />
      <Paths t={t} show={{ email: 1, shop: 1 }} />
      <Hub />
      <DestCard d={DESTS[0]} t={t} order={1042} />
      <DestCard d={DESTS[1]} t={t} order={1042} />
      <DestCard d={DESTS[2]} t={t} order={null} dashed appear={ease(t, 1.77, 0.4)} />
      <Tag x={800} y={1080 - 30} text="কোথায় code লিখব?" appear={p(3.3)} color={ORANGE} />
      <CodePanel
        title="Checkout — বদলাতে হবে?"
        top={CODE_TOP + 40}
        enterAt={0.1}
        fontSize={31}
        lines={["$order = Order::create($data);", "OrderPlaced::dispatch($order);"]}
        highlights={[{ lines: [2], at: 3.3, color: "orange", label: "এখানে?" }]}
      />
    </AbsoluteFill>
  );
};

// 7 — Add NotifyWarehouse; order #1043: one dispatch, all three listeners get #1043. Hold the full frame.
const Warehouse: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const second = t >= 5.88;
  const arrive = 12.0;
  const n = (k: string) => (t >= arrive ? 1043 : k === "warehouse" ? null : 1042);
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Checkout t={t} order={second ? 1043 : 1042} tapAt={6.2} confirmAt={6.8} />
      <Paths t={t} show={{ email: 1, shop: 1, warehouse: ease(t, 3.7, 0.8) }} />
      <Hub glow={ease(t, 10.0, 0.3) * (1 - ease(t, 11.0, 0.3))} />
      <ToHub t={t} at={8.4} dur={1.6} n={1043} />
      {DESTS.map((d) => (
        <ToDest key={d.key} t={t} d={d} at={10.6} dur={1.4} n={1043} />
      ))}
      <DestCard d={DESTS[0]} t={t} order={n("email")} at={arrive} />
      <DestCard d={DESTS[1]} t={t} order={n("shop")} at={arrive} />
      <DestCard d={DESTS[2]} t={t} order={n("warehouse")} appear={ease(t, 0.3, 0.5)} at={arrive} />
      <Tag x={800} y={1080 - 30} text="৩ listener · একই #1043" appear={p(13.93)} color={PLUM} />
      <CodePanel
        title="app/Listeners/NotifyWarehouse.php"
        top={CODE_TOP}
        enterAt={0.1}
        exitAt={5.8}
        fontSize={30}
        side={56}
        lines={["public function handle(OrderPlaced $event): void", "{", "    $order = $event->order;", '    Log::info("Warehouse: অর্ডার {$order->id} pack করুন");', "}"]}
        highlights={[
          { lines: [1], at: 0.3, until: 3.7, color: "teal", label: "নতুন listener" },
          { lines: [1], at: 3.7, color: "orange", label: "OrderPlaced-এর সঙ্গে যুক্ত" },
        ]}
      />
      <CodePanel
        title="Checkout (অপরিবর্তিত)"
        top={CODE_TOP + 40}
        enterAt={5.9}
        fontSize={31}
        lines={["$order = Order::create($data); // #1043", "OrderPlaced::dispatch($order);"]}
        highlights={[
          { lines: [1], at: 6.17, until: 9.83, color: "orange", label: "#1043" },
          { lines: [2], at: 9.83, color: "orange", label: "একবারই" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 8 — Recap beside Part 1: the station kept its own list; in Laravel the dispatcher delivers the event
const Recap: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const half = (children: React.ReactNode, left: number, appear: number) => (
    <div style={{ position: "absolute", left, top: 440, width: 500, height: 620, overflow: "hidden", opacity: appear }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: "scale(0.46)", transformOrigin: "0 0" }}>{children}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      {half(
        <AbsoluteFill style={{ top: -380 }}>
          <Station temp={33} t={t} />
          <Link to={[560, 540]} amt={1} t={t} />
          <Link to={[560, 785]} amt={1} t={t} />
          <CurrentCard value={33} />
          <HistoryCard points={[30, 32]} />
        </AbsoluteFill>,
        40,
        ease(t, 0.2, 0.4),
      )}
      {half(
        <AbsoluteFill style={{ top: -380 }}>
          <Checkout t={t} order={1043} tapAt={-5} confirmAt={-5} />
          <Paths t={t} show={{ email: 1, shop: 1, warehouse: 1 }} />
          <Hub glow={ease(t, 5.78, 0.3)} />
          <DestCard d={DESTS[0]} t={t} order={1043} />
          <DestCard d={DESTS[1]} t={t} order={1043} />
          <DestCard d={DESTS[2]} t={t} order={1043} />
        </AbsoluteFill>,
        560,
        ease(t, 3.6, 0.4),
      )}
      <div style={{ position: "absolute", left: 540, top: 450, width: 3, height: 560, background: MUTED, opacity: 0.4 }} />
      <Tag x={290} y={420} text="পর্ব ১: Station নিজেই তালিকা রাখে" appear={p(1.56)} color={INK} size={24} />
      <Tag x={800} y={420} text="পর্ব ২: Dispatcher পৌঁছে দেয়" appear={p(5.22)} color={PLUM} size={24} />
      <Tag x={540} y={1035} text="একই ধারণা: Observer" appear={p(7.06)} color={ORANGE} size={30} />
      <CodePanel
        title="Part 1 vs Part 2"
        top={CODE_TOP}
        enterAt={0.3}
        fontSize={30}
        side={56}
        lines={["// পর্ব ১: subject নিজেই list রাখে", "$station->subscribe($display);", "// পর্ব ২: Laravel dispatcher", "OrderPlaced::dispatch($order);"]}
        highlights={[
          { lines: [1, 2], at: 0.38, until: 3.6, color: "teal", label: "পর্ব ১" },
          { lines: [3, 4], at: 3.6, color: "teal", label: "পর্ব ২" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 9 — Takeaway: the happening goes in the event, each job's rule in its own listener
const Takeaway: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const jobs = [
    { x: 200, label: "Email", icon: "✉", at: 4.47 },
    { x: 540, label: "দোকান", icon: "🛍", at: 4.7 },
    { x: 880, label: "Warehouse", icon: "📦", at: 4.93 },
  ];
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <div style={{ position: "absolute", left: 290, top: 450, width: 500, padding: "18px 0", textAlign: "center", borderRadius: 26, background: CARD, border: `4px solid ${ORANGE}`, fontFamily: MONO, fontWeight: 700, fontSize: 36, color: ORANGE, opacity: p(1.39) }}>
        OrderPlaced
        <div style={{ fontFamily: BN, fontSize: 26, color: INK }}>ঘটনা — একবার</div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {jobs.map((j) => (
          <line key={j.x} x1={540} y1={590} x2={j.x} y2={720} stroke={PLUM} strokeWidth={7} strokeDasharray="18 10" strokeDashoffset={-t * 60} opacity={ease(t, j.at, 0.4)} />
        ))}
      </svg>
      {jobs.map((j) => (
        <div key={j.x} style={{ position: "absolute", left: j.x - 150, top: 730, width: 300, padding: "18px 0", textAlign: "center", borderRadius: 24, background: CARD, border: `4px solid ${PLUM}`, opacity: p(j.at), fontFamily: BN, color: INK }}>
          <div style={{ fontSize: 44 }}>{j.icon}</div>
          <div style={{ fontWeight: 700, fontSize: 30 }}>{j.label}</div>
          <div style={{ fontFamily: MONO, fontSize: 20, color: PLUM }}>নিজের listener</div>
        </div>
      ))}
      <Tag x={540} y={960} text="ঘটনা → event · কাজের নিয়ম → listener" appear={p(8.84)} color={INK} size={28} />
      <CodePanel
        title="app/"
        top={CODE_TOP}
        enterAt={6.0}
        fontSize={29}
        side={56}
        lines={["Events/OrderPlaced.php            // ঘটনা", "Listeners/SendOrderConfirmation.php", "Listeners/NotifyShop.php", "Listeners/NotifyWarehouse.php"]}
        highlights={[
          { lines: [1], at: 6.28, until: 8.84, color: "orange", label: "event" },
          { lines: [2, 3, 4], at: 8.84, color: "teal", label: "listener" },
        ]}
      />
    </AbsoluteFill>
  );
};

export const OBSERVER_P2 = {
  "observer2/hook": Hook,
  "observer2/event": Event,
  "observer2/dispatch": Dispatch,
  "observer2/email": Email,
  "observer2/shop": Shop,
  "observer2/question": Question,
  "observer2/warehouse": Warehouse,
  "observer2/recap": Recap,
  "observer2/takeaway": Takeaway,
};
