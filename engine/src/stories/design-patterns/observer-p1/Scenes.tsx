// Dev Diary — Observer Pattern in PHP, Part 1 (weather station)
// Warm ivory theme: charcoal text, plum = active observer connection, burnt orange = temperature.
// Beat times (seconds from scene start) come from the aligned captions in
// public/projects/observer-p1-bn/scenes.json. Runnable PHP: public/projects/observer-p1-bn/source/weather.php
//
// Vertical block (centred): logo 140 · title ~300 · visuals 440–1050 · code 1080–1430 · captions end 1770.
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import type { IllustrationProps } from "../../../illustrations/registry";
import { CodePanel } from "../../../tech/CodePanel";
import { ease, pop, useT } from "../../../tech/anim";

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
const lerp = (t: number, a: number, b: number, from: number, to: number) =>
  interpolate(t, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ---------- layout ----------
const ST = { x: 250, base: 1010 }; // station
const ANT: [number, number] = [ST.x + 40, 560]; // where connections leave the station
const CUR = { x: 560, y: 450, w: 440, h: 180 };
const HIS = { x: 560, y: 660, w: 440, h: 250 };
const THIRD = { x: 560, y: 935, w: 440, h: 110 };
const inPort = (c: { x: number; y: number; h: number }): [number, number] => [c.x, c.y + c.h / 2];

// ---------- pieces ----------
const Grid: React.FC = () => (
  <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(37,35,42,0.07) 2px, transparent 2px)", backgroundSize: "44px 44px" }} />
);

export const Station: React.FC<{ temp: number; t: number; glow?: number; reading?: number }> = ({ temp, t, glow = 0, reading = 1 }) => {
  const level = lerp(temp, 20, 40, 0, 1);
  const tubeTop = 640;
  const tubeBot = 900;
  const merc = tubeBot - (tubeBot - tubeTop) * level;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <g style={glow > 0 ? { filter: `drop-shadow(0 0 ${16 * glow}px ${PLUM})` } : undefined} stroke={INK} strokeWidth={5} strokeLinejoin="round">
        {/* tripod + mast */}
        <path d={`M ${ST.x - 110} ${ST.base} L ${ST.x} ${ST.base - 170} L ${ST.x + 110} ${ST.base}`} fill="none" strokeWidth={8} />
        <rect x={ST.x - 10} y={520} width={20} height={ST.base - 520 - 150} fill="#d9d4cb" />
        {/* anemometer */}
        <g transform={`rotate(${t * 140} ${ST.x} 500)`}>
          {[0, 120, 240].map((a) => (
            <g key={a} transform={`rotate(${a} ${ST.x} 500)`}>
              <line x1={ST.x} y1={500} x2={ST.x + 70} y2={500} strokeWidth={5} />
              <path d={`M ${ST.x + 62} 486 a 16 16 0 0 1 0 28 Z`} fill={IVORY} />
            </g>
          ))}
        </g>
        <circle cx={ST.x} cy={500} r={12} fill={INK} />
        {/* antenna (connection point) */}
        <line x1={ST.x + 10} y1={570} x2={ANT[0]} y2={ANT[1]} strokeWidth={5} />
        <circle cx={ANT[0]} cy={ANT[1]} r={10} fill={PLUM} />
        {/* thermometer housing */}
        <rect x={ST.x - 60} y={610} width={120} height={330} rx={26} fill={CARD} />
        <rect x={ST.x - 12} y={tubeTop} width={24} height={tubeBot - tubeTop} rx={12} fill="#f1ece3" />
        <rect x={ST.x - 8} y={merc} width={16} height={tubeBot - merc} rx={8} fill={ORANGE} stroke="none" />
        <circle cx={ST.x} cy={tubeBot + 10} r={22} fill={ORANGE} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={ST.x + 20} y1={tubeTop + 20 + i * 55} x2={ST.x + 38} y2={tubeTop + 20 + i * 55} strokeWidth={3} />
        ))}
      </g>
      {/* reading */}
      <g opacity={reading}>
        <rect x={ST.x - 95} y={950} width={190} height={74} rx={37} fill={ORANGE} />
        <text x={ST.x} y={1001} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={44} fill="#fff">
          {Math.round(temp)}°C
        </text>
      </g>
      <text x={ST.x} y={1062} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill={INK}>
        WeatherStation
      </text>
    </svg>
  );
};

const Card: React.FC<{ box: { x: number; y: number; w: number; h: number }; title: string; children?: React.ReactNode; appear?: number; dashed?: boolean; glow?: number; tint?: string }> = ({
  box,
  title,
  children,
  appear = 1,
  dashed = false,
  glow = 0,
  tint,
}) => (
  <div
    style={{
      position: "absolute",
      left: box.x,
      top: box.y,
      width: box.w,
      height: box.h,
      background: CARD,
      border: `4px ${dashed ? "dashed" : "solid"} ${tint ?? INK}`,
      borderRadius: 26,
      boxShadow: glow > 0 ? `0 0 ${36 * glow}px ${PLUM}, 0 10px 0 rgba(37,35,42,0.12)` : "0 10px 0 rgba(37,35,42,0.12)",
      opacity: appear,
      transform: `translateX(${(1 - appear) * 60}px)`,
      overflow: "hidden",
    }}
  >
    <div style={{ padding: "10px 20px 0", fontFamily: MONO, fontWeight: 700, fontSize: 26, color: tint ?? INK }}>{title}</div>
    {children}
  </div>
);

export const CurrentCard: React.FC<{ value: number | null; flash?: number; appear?: number; glow?: number }> = ({ value, flash = 0, appear = 1, glow = 0 }) => (
  <Card box={CUR} title="CurrentDisplay" appear={appear} glow={glow}>
    <div
      style={{
        textAlign: "center",
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 96,
        lineHeight: "120px",
        color: ORANGE,
        transform: `scale(${1 + 0.15 * flash})`,
        textShadow: flash > 0 ? `0 0 ${24 * flash}px rgba(184,74,32,0.6)` : "none",
      }}
    >
      {value == null ? "--" : `${value}°C`}
    </div>
  </Card>
);

// history graph: y from 28..35°C
export const HistoryCard: React.FC<{ points: number[]; newAmt?: number; appear?: number; glow?: number; ringLast?: number }> = ({ points, newAmt = 1, appear = 1, glow = 0, ringLast = 0 }) => {
  const gx = (i: number) => 70 + i * 120;
  const gy = (v: number) => 205 - (v - 28) * 22;
  return (
    <Card box={HIS} title="HistoryDisplay" appear={appear} glow={glow}>
      <svg width={HIS.w} height={HIS.h - 40} style={{ position: "absolute", left: 0, top: 40 }}>
        <line x1={40} y1={205 - 40} x2={HIS.w - 30} y2={205 - 40} stroke={MUTED} strokeWidth={2} />
        <line x1={40} y1={20} x2={40} y2={205 - 40} stroke={MUTED} strokeWidth={2} />
        {[30, 32, 34].map((v) => (
          <text key={v} x={32} y={gy(v) - 40 + 8} textAnchor="end" fontFamily={MONO} fontSize={18} fill={MUTED}>
            {v}
          </text>
        ))}
        {points.length > 1 ? (
          <line
            x1={gx(points.length - 2)}
            y1={gy(points[points.length - 2]) - 40}
            x2={gx(points.length - 2) + (gx(points.length - 1) - gx(points.length - 2)) * newAmt}
            y2={gy(points[points.length - 2]) - 40 + (gy(points[points.length - 1]) - gy(points[points.length - 2])) * newAmt}
            stroke={ORANGE}
            strokeWidth={5}
          />
        ) : null}
        {points.map((v, i) => {
          const isNew = i === points.length - 1;
          const s = isNew ? newAmt : 1;
          return s <= 0 ? null : (
            <g key={i}>
              <circle cx={gx(i)} cy={gy(v) - 40} r={12 * s} fill={ORANGE} stroke="#fff" strokeWidth={3} />
              <text x={gx(i)} y={gy(v) - 40 - 22} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={INK} opacity={s}>
                {v}
              </text>
              {isNew && ringLast > 0 ? <circle cx={gx(i)} cy={gy(v) - 40} r={26} fill="none" stroke={PLUM} strokeWidth={5} strokeDasharray="8 6" opacity={ringLast} /> : null}
            </g>
          );
        })}
      </svg>
    </Card>
  );
};

// Station → display link. plum = subscribed observer (flowing dashes); ink = direct method call.
export const Link: React.FC<{ to: [number, number]; amt: number; t: number; kind?: "observer" | "direct"; label?: string; cut?: number }> = ({ to, amt, t, kind = "observer", label, cut = 0 }) => {
  if (amt <= 0) return null;
  const [x1, y1] = ANT;
  const len = amt * (1 - cut);
  const x2 = x1 + (to[0] - x1) * len;
  const y2 = y1 + (to[1] - y1) * len;
  const col = kind === "observer" ? PLUM : INK;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {cut > 0 ? <line x1={x1} y1={y1} x2={to[0]} y2={to[1]} stroke={MUTED} strokeWidth={3} strokeDasharray="4 12" opacity={0.6 * cut} /> : null}
      {len > 0.01 ? (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={col}
          strokeWidth={kind === "observer" ? 7 : 5}
          strokeDasharray={kind === "observer" ? "18 10" : undefined}
          strokeDashoffset={kind === "observer" ? -t * 60 : 0}
          strokeLinecap="round"
        />
      ) : null}
      {kind === "direct" && amt >= 1 ? <circle cx={to[0]} cy={to[1]} r={9} fill={INK} /> : null}
      {label && amt >= 1 && cut < 0.5 ? (
        <text x={(x1 + to[0]) / 2} y={(y1 + to[1]) / 2 - 14} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={col}>
          {label}
        </text>
      ) : null}
    </svg>
  );
};

// A temperature value travelling along a link
const Packet: React.FC<{ to: [number, number]; t: number; at: number; dur?: number; value: number }> = ({ to, t, at, dur = 1.0, value }) => {
  if (t < at || t > at + dur) return null;
  const k = (t - at) / dur;
  const x = ANT[0] + (to[0] - ANT[0]) * k;
  const y = ANT[1] + (to[1] - ANT[1]) * k;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%,-50%)",
        padding: "4px 14px",
        borderRadius: 999,
        background: ORANGE,
        color: "#fff",
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 30,
        boxShadow: "0 0 18px rgba(184,74,32,0.6)",
      }}
    >
      {value}
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; text: string; appear: number; color?: string; fg?: string; size?: number }> = ({ x, y, text, appear, color = INK, fg = "#fff", size = 30 }) =>
  appear <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * appear})`,
        opacity: appear,
        background: color,
        color: fg,
        fontFamily: BN,
        fontWeight: 700,
        fontSize: size,
        padding: "4px 18px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );

const ObserverList: React.FC<{ items: string[]; appear: number; strike?: number }> = ({ items, appear, strike = -1 }) =>
  appear <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: 330,
        top: 860,
        padding: "10px 16px",
        borderRadius: 18,
        background: CARD,
        border: `3px solid ${PLUM}`,
        fontFamily: MONO,
        fontSize: 22,
        color: INK,
        opacity: appear,
        lineHeight: 1.45,
      }}
    >
      <div style={{ color: PLUM, fontWeight: 700 }}>$observers</div>
      {items.map((it, i) => (
        <div key={it} style={{ textDecoration: i === strike ? "line-through" : "none", color: i === strike ? MUTED : INK }}>
          • {it}
        </div>
      ))}
    </div>
  );

// ---------- scenes ----------

// 1 — A new display was added: does the station's code have to change every time?
const Hook: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const temp = lerp(t, 3.3, 4.6, 28, 30);
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Station temp={temp} t={t} reading={ease(t, 3.32, 0.4)} />
      <CurrentCard value={t > 4.6 ? 30 : null} flash={ease(t, 4.6, 0.2) * (1 - ease(t, 5.2, 0.4))} appear={ease(t, 1.6, 0.5)} />
      <Link to={inPort(CUR)} amt={ease(t, 2.0, 0.5)} t={t} kind="direct" />
      <Tag x={780} y={430} text="নতুন display" appear={p(2.02) * (1 - ease(t, 6.5, 0.3))} color={PLUM} />
      <Tag x={780} y={700} text="reading দেখাতে হবে" appear={p(5.32) * (1 - ease(t, 6.5, 0.3))} color={ORANGE} />
      <CodePanel
        title="WeatherStation.php"
        top={CODE_TOP}
        enterAt={6.6}
        fontSize={32}
        lines={["class WeatherStation", "{", "    // নতুন display এলেই", "    // এখানে নতুন code?"]}
        highlights={[{ lines: [3, 4], at: 7.57, color: "orange", label: "প্রতিবার?" }]}
      />
    </AbsoluteFill>
  );
};

// 2 — Direct calls to two displays; a third display means another line in the station
const Direct: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const third = ease(t, 8.35, 0.5) * (1 - ease(t, 12.67, 0.5));
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Station temp={30} t={t} />
      <CurrentCard value={30} glow={ease(t, 3.9, 0.3) * (1 - ease(t, 5.6, 0.3))} />
      <HistoryCard points={[30]} glow={ease(t, 5.7, 0.3) * (1 - ease(t, 7.5, 0.3))} />
      <Card box={THIRD} title="ThirdDisplay" appear={third} dashed tint={ORANGE}>
        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 30, color: ORANGE }}>নতুন?</div>
      </Card>
      <Link to={inPort(CUR)} amt={ease(t, 1.34, 0.5)} t={t} kind="direct" label="->show($t)" />
      <Link to={inPort(HIS)} amt={ease(t, 1.6, 0.5)} t={t} kind="direct" label="->add($t)" />
      <Link to={inPort(THIRD)} amt={ease(t, 10.75, 0.5) * (1 - ease(t, 12.67, 0.4))} t={t} kind="direct" />
      <Tag x={250} y={420} text="সরাসরি call" appear={p(1.34)} color={INK} />
      <CodePanel
        title="WeatherStation.php"
        top={CODE_TOP}
        enterAt={0.6}
        side={56}
        fontSize={30}
        lines={["function setTemperature(float $t): void {", "    $this->currentDisplay->show($t);", "    $this->historyDisplay->add($t);", "    $this->thirdDisplay->show($t);", "}"]}
        reveal={{ 4: 8.35 }}
        highlights={[
          { lines: [2], at: 3.9, until: 5.7, color: "teal", label: "এখন কত ডিগ্রি" },
          { lines: [3], at: 5.7, until: 8.35, color: "teal", label: "history" },
          { lines: [4], at: 8.35, until: 12.4, color: "orange", label: "আরেকটা call" },
          { lines: [4], at: 12.4, color: "orange", label: "মুছতেও code খোলো" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 3 — The station's job is only to measure
const Job: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const temp = 30 + 0.6 * Math.sin(t * 2.2);
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Station temp={temp} t={t} glow={ease(t, 1.78, 0.3) * (1 - ease(t, 3.2, 0.3))} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.35 + 0.65 * ease(t, 3.2, 0.3) }}>
        <CurrentCard value={30} glow={ease(t, 3.78, 0.3) * (1 - ease(t, 5.0, 0.3))} />
        <HistoryCard points={[30]} glow={ease(t, 5.44, 0.3) * (1 - ease(t, 6.5, 0.3))} />
      </div>
      <Tag x={250} y={420} text="কাজ: তাপমাত্রা মাপা" appear={p(1.78)} color={ORANGE} />
      <Tag x={780} y={940} text="কে কী দেখাবে — station জানবে কেন?" appear={p(6.57)} color={PLUM} size={26} />
      <CodePanel
        title="WeatherStation.php"
        top={CODE_TOP}
        enterAt={0.3}
        fontSize={32}
        lines={["class WeatherStation", "{", "    private float $temperature; // শুধু মাপা", "}"]}
        highlights={[{ lines: [3], at: 1.78, color: "orange", label: "station-এর কাজ" }]}
      />
    </AbsoluteFill>
  );
};

// 4 — Observer interface; each display writes update() its own way; displays subscribe; station keeps a list
const Interface: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const subCur = ease(t, 12.49, 0.6);
  const subHis = ease(t, 12.9, 0.6);
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Station temp={30} t={t} reading={0} glow={ease(t, 13.77, 0.3)} />
      <CurrentCard value={null} glow={ease(t, 7.04, 0.3) * (1 - ease(t, 9.9, 0.3))} />
      <HistoryCard points={[]} glow={ease(t, 7.38, 0.3) * (1 - ease(t, 9.9, 0.3))} />
      <Tag x={780} y={448} text="implements Observer" appear={p(7.04) * (1 - ease(t, 9.9, 0.3))} color={PLUM} size={24} />
      <Tag x={780} y={658} text="implements Observer" appear={p(7.38) * (1 - ease(t, 9.9, 0.3))} color={PLUM} size={24} />
      <Link to={inPort(CUR)} amt={subCur} t={t} label="subscribe" />
      <Link to={inPort(HIS)} amt={subHis} t={t} label="subscribe" />
      <ObserverList items={["CurrentDisplay", "HistoryDisplay"].slice(0, t >= 15.07 ? 2 : t >= 14.85 ? 1 : 0)} appear={ease(t, 14.29, 0.4)} />
      <CodePanel
        title="Observer.php"
        top={CODE_TOP}
        enterAt={0.2}
        exitAt={6.95}
        fontSize={32}
        lines={["interface Observer {", "    public function update(", "        float $temperature", "    ): void;", "}"]}
        highlights={[
          { lines: [1], at: 1.08, until: 3.12, color: "teal", label: "interface" },
          { lines: [2, 3, 4], at: 3.12, until: 5.46, color: "teal", label: "update()" },
          { lines: [3], at: 5.46, color: "orange", label: "নতুন তাপমাত্রা" },
        ]}
      />
      <CodePanel
        title="Displays.php"
        top={CODE_TOP}
        enterAt={7.0}
        exitAt={9.9}
        fontSize={31}
        lines={["// CurrentDisplay::update()", "$this->temperature = $temperature;", "// HistoryDisplay::update()", "$this->readings[] = $temperature;"]}
        highlights={[
          { lines: [2], at: 7.38, until: 8.1, color: "teal", label: "সংখ্যা বদলায়" },
          { lines: [4], at: 8.1, color: "teal", label: "point যোগ" },
        ]}
      />
      <CodePanel
        title="WeatherStation.php"
        top={CODE_TOP}
        enterAt={10.0}
        side={56}
        fontSize={30}
        lines={["private array $observers = [];", "", "public function subscribe(Observer $o): void {", "    $this->observers[] = $o;", "}"]}
        highlights={[
          { lines: [3, 4], at: 12.49, until: 14.29, color: "teal", label: "subscribe" },
          { lines: [1], at: 14.29, color: "teal", label: "তালিকা" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 5 — 30 to both; then 32: the loop calls update(32) on every subscriber at the same time
const ARRIVE = 6.3;
const Notify: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const temp = t < 2.28 ? 30 : lerp(t, 2.28, 3.0, 30, 32);
  const got32 = t >= ARRIVE;
  const got30 = t >= 1.3;
  const points = got32 ? [30, 32] : got30 ? [30] : [];
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Station temp={temp} t={t} />
      <Link to={inPort(CUR)} amt={1} t={t} />
      <Link to={inPort(HIS)} amt={1} t={t} />
      <Packet to={inPort(CUR)} t={t} at={0.3} value={30} />
      <Packet to={inPort(HIS)} t={t} at={0.3} value={30} />
      <Packet to={inPort(CUR)} t={t} at={ARRIVE - 1.2} dur={1.2} value={32} />
      <Packet to={inPort(HIS)} t={t} at={ARRIVE - 1.2} dur={1.2} value={32} />
      <CurrentCard value={got32 ? 32 : got30 ? 30 : null} flash={ease(t, ARRIVE, 0.2) * (1 - ease(t, ARRIVE + 0.8, 0.4)) + ease(t, 7.05, 0.2) * (1 - ease(t, 8.6, 0.4))} />
      <HistoryCard points={points} newAmt={got32 ? ease(t, ARRIVE, 0.4) : got30 ? ease(t, 1.3, 0.4) : 0} ringLast={ease(t, 11.72, 0.3) * (1 - ease(t, 14.2, 0.3))} />
      <Tag x={780} y={448} text="সংখ্যা বদলালো" appear={p(14.58)} color={ORANGE} size={26} />
      <Tag x={780} y={940} text="নতুন point যোগ হলো" appear={p(14.88)} color={ORANGE} size={26} />
      <ObserverList items={["CurrentDisplay", "HistoryDisplay"]} appear={1 - ease(t, 0.2, 0.3)} />
      <CodePanel
        title="index.php"
        top={CODE_TOP}
        enterAt={0}
        exitAt={3.5}
        side={56}
        fontSize={30}
        lines={["$station->subscribe($currentDisplay);", "$station->subscribe($historyDisplay);", "$station->setTemperature(30);", "$station->setTemperature(32);"]}
        highlights={[
          { lines: [3], at: 0.2, until: 2.28, color: "orange", label: "30 → দুজনেই" },
          { lines: [4], at: 2.28, color: "orange", label: "32" },
        ]}
      />
      <CodePanel
        title="WeatherStation::setTemperature()"
        top={CODE_TOP}
        enterAt={3.55}
        side={56}
        fontSize={30}
        lines={["foreach ($this->observers as $observer) {", "    $observer->update($temperature);", "}"]}
        highlights={[
          { lines: [1], at: 3.6, until: 5.0, color: "teal", label: "প্রত্যেকে" },
          { lines: [2], at: 5.0, color: "orange", label: "update(32)" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 6 — Unsubscribe the history display; send 33. Current shows 33, graph stays at 32. Hold.
const Unsub: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const cut = ease(t, 1.24, 0.7);
  const temp = t < 2.57 ? 32 : lerp(t, 2.57, 3.3, 32, 33);
  const got33 = t >= 4.48;
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Station temp={temp} t={t} />
      <Link to={inPort(CUR)} amt={1} t={t} />
      <Link to={inPort(HIS)} amt={1} t={t} cut={cut} />
      <Packet to={inPort(CUR)} t={t} at={3.3} dur={1.18} value={33} />
      <CurrentCard value={got33 ? 33 : 32} flash={ease(t, 4.48, 0.2) * (1 - ease(t, 5.3, 0.4))} />
      <HistoryCard points={[30, 32]} ringLast={ease(t, 7.36, 0.3)} />
      <ObserverList items={["CurrentDisplay", "HistoryDisplay"]} appear={1} strike={t >= 1.6 ? 1 : -1} />
      <Tag x={780} y={448} text="৩৩ ✓" appear={p(5.3)} color={ORANGE} />
      <Tag x={780} y={940} text="এখনও ৩২ — খবর পায়নি" appear={p(8.64)} color={PLUM} size={26} />
      <CodePanel
        title="index.php"
        top={CODE_TOP}
        enterAt={0}
        side={56}
        fontSize={30}
        lines={["$station->unsubscribe($historyDisplay);", "$station->setTemperature(33);", "// Current: 33", "// History: [30, 32]"]}
        highlights={[
          { lines: [1], at: 1.24, until: 2.57, color: "teal", label: "unsubscribe" },
          { lines: [2], at: 2.57, until: 5.3, color: "orange", label: "33" },
          { lines: [3, 4], at: 5.3, color: "orange", label: "ফল" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 7 — Subject / Observers; adding a new display = teach update() + subscribe; station code unchanged
const Recap: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const third = ease(t, 8.75, 0.5);
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      <Station temp={33} t={t} glow={ease(t, 2.48, 0.3) * (1 - ease(t, 4.0, 0.3))} />
      <Link to={inPort(CUR)} amt={1} t={t} />
      <Link to={inPort(HIS)} amt={1} t={t} />
      <Link to={inPort(THIRD)} amt={ease(t, 11.75, 0.6)} t={t} label="subscribe" />
      <CurrentCard value={33} glow={ease(t, 6.79, 0.3) * (1 - ease(t, 8.3, 0.3))} />
      <HistoryCard points={[30, 32]} glow={ease(t, 6.79, 0.3) * (1 - ease(t, 8.3, 0.3))} />
      <Card box={THIRD} title="StatsDisplay" appear={third} dashed={t < 10.29} tint={PLUM}>
        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 26, color: PLUM, opacity: ease(t, 10.29, 0.3) }}>implements Observer</div>
      </Card>
      <Tag x={250} y={420} text="Subject" appear={p(3.06)} color={INK} size={40} />
      {/* Observers bracket */}
      <div style={{ position: "absolute", left: 1018, top: 450, width: 18, height: 600, borderTop: `5px solid ${PLUM}`, borderRight: `5px solid ${PLUM}`, borderBottom: `5px solid ${PLUM}`, borderRadius: "0 14px 14px 0", opacity: ease(t, 7.04, 0.4) }} />
      <Tag x={780} y={410} text="Observers" appear={p(7.6)} color={PLUM} size={40} />
      <CodePanel
        title="WeatherStation::setTemperature()"
        top={CODE_TOP}
        enterAt={0.2}
        side={56}
        fontSize={30}
        lines={["foreach ($this->observers as $observer) {", "    $observer->update($temperature);", "}"]}
        highlights={[{ lines: [1, 2, 3], at: 12.93, color: "teal", label: "একই থাকে ✓" }]}
      />
    </AbsoluteFill>
  );
};

// 8 — Teaser: Laravel OrderPlaced event → customer + shop
const Next: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const box = (x: number, y: number, w: number, label: string, sub: string, at: number, col: string) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        padding: "18px 20px",
        background: CARD,
        border: `4px solid ${col}`,
        borderRadius: 24,
        textAlign: "center",
        opacity: p(at),
        transform: `scale(${0.8 + 0.2 * p(at)})`,
        boxShadow: "0 10px 0 rgba(37,35,42,0.12)",
      }}
    >
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: col }}>{label}</div>
      <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 26, color: INK }}>{sub}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Grid />
      {box(290, 470, 500, "OrderPlaced", "Laravel event", 3.06, ORANGE)}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={480} y1={600} x2={300} y2={760} stroke={PLUM} strokeWidth={7} strokeDasharray="18 10" strokeDashoffset={-t * 60} opacity={ease(t, 4.94, 0.4)} />
        <line x1={600} y1={600} x2={780} y2={760} stroke={PLUM} strokeWidth={7} strokeDasharray="18 10" strokeDashoffset={-t * 60} opacity={ease(t, 5.78, 0.4)} />
      </svg>
      {box(90, 770, 400, "Customer", "email পাবে", 4.94, PLUM)}
      {box(590, 770, 400, "দোকান", "notification", 5.78, PLUM)}
      <div
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          top: 960,
          padding: "22px 20px",
          borderRadius: 28,
          textAlign: "center",
          background: INK,
          color: IVORY,
          fontFamily: BN,
          fontWeight: 700,
          fontSize: 38,
          opacity: p(0.36),
        }}
      >
        পরের পর্ব → Laravel-এ <span style={{ color: "#ffb38a" }}>Observer</span>
      </div>
      <CodePanel
        title="Laravel (preview)"
        top={CODE_TOP + 20}
        enterAt={2.78}
        fontSize={32}
        lines={["OrderPlaced::dispatch($order);", "// → customer-কে জানাও", "// → দোকানকে জানাও"]}
        highlights={[{ lines: [1], at: 3.06, color: "orange", label: "event" }]}
      />
    </AbsoluteFill>
  );
};

export const OBSERVER_P1 = {
  "observer1/hook": Hook,
  "observer1/direct": Direct,
  "observer1/job": Job,
  "observer1/interface": Interface,
  "observer1/notify": Notify,
  "observer1/unsub": Unsub,
  "observer1/recap": Recap,
  "observer1/next": Next,
};
