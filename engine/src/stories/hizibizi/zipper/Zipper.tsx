// Code-drawn zipper (top view) in one world coordinate system, so the bag shot and the
// slider close-ups are the same drawing seen through different camera zooms.
//
// World: zipper runs along y (−1000 top/open end … +1000 bottom stop), centre line x = 0.
// Left row = blue teeth at y = i·P; right row = yellow teeth at y = i·P + P/2 (half-pitch offset,
// so every tooth faces a gap on the other side). The slider (wide mouth up, narrow mouth down)
// is centred at sliderY; moving up closes the zipper, moving down opens it.

export const P = 40; // tooth pitch
export const TL = 60; // tooth length (across)
export const TH = 18; // tooth height (along)
export const HEAD = 0.35 * TL; // how far a head crosses the centre line when closed
export const BASE = TL - HEAD; // part on its own side
export const SL = 190; // slider length
export const S_TOP = 82; // row separation at the slider's wide mouth
const OPEN_MAX = 250;

export const BLUE = "#3b82f6";
export const YELLOW = "#facc15";

const smooth = (x: number) => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
};

// Distance between the two rows (0 = interlocked) at world y for a given slider position
export const sepAt = (y: number, sliderY: number) => {
  const top = sliderY - SL / 2;
  if (y < top) return Math.min(OPEN_MAX, S_TOP + (top - y) * 0.22);
  const u = (y - top) / SL;
  return S_TOP * (1 - smooth((u - 0.1) / 0.75));
};

export type Cam = { cx: number; cy: number; s: number };
// Stage card: the zipper is drawn inside this rounded window, centred in the frame, so the
// space above (logo) and below (captions) stays equal.
export const STAGE = { x: 40, y: 220, w: 1000, h: 1220, r: 56 };
export const CY = STAGE.y + STAGE.h / 2; // screen y of the camera centre = stage centre
export const toScreen = (cam: Cam, x: number, y: number) => ({ x: 540 + (x - cam.cx) * cam.s, y: CY + (y - cam.cy) * cam.s });

const range = (a: number, b: number, step: number) => {
  const out: number[] = [];
  for (let v = a; v <= b; v += step) out.push(v);
  return out;
};

const Tooth: React.FC<{ x0: number; x1: number; y: number; color: string; edge: string; headLeft: boolean }> = ({ x0, x1, y, color, edge, headLeft }) => {
  // rounded scoop-and-head tooth from x0 to x1 (head at x1 when !headLeft)
  const h = TH / 2;
  const r = 7;
  const d = headLeft
    ? `M ${x1} ${y - h} L ${x0 + r} ${y - h} Q ${x0 - 3} ${y - h} ${x0 - 3} ${y} Q ${x0 - 3} ${y + h} ${x0 + r} ${y + h} L ${x1} ${y + h} Z`
    : `M ${x0} ${y - h} L ${x1 - r} ${y - h} Q ${x1 + 3} ${y - h} ${x1 + 3} ${y} Q ${x1 + 3} ${y + h} ${x1 - r} ${y + h} L ${x0} ${y + h} Z`;
  return <path d={d} fill={color} stroke={edge} strokeWidth={2.5} strokeLinejoin="round" />;
};

export const ZipperWorld: React.FC<{
  cam: Cam;
  sliderY: number;
  bodyOpacity?: number; // 1 = solid metal slider, low = see-through
  tabOpacity?: number;
  tabGlow?: number;
  dividerGlow?: number;
  showBag?: boolean;
  highlightBlue?: number | null; // world y of a highlighted blue tooth
  highlightAmt?: number;
  gapAmt?: number; // highlight the gap in front of the blue tooth + the two yellow teeth
  overlay?: React.ReactNode; // extra world-space SVG
  framed?: boolean; // clip to a stage card (off by default: hizibizi is full-screen)
}> = ({ cam, sliderY, bodyOpacity = 1, tabOpacity = 1, tabGlow = 0, dividerGlow = 0, showBag = true, highlightBlue = null, highlightAmt = 0, gapAmt = 0, overlay, framed = false }) => {
  const ys = range(-1000, 1000, 10);
  const sep = (y: number) => sepAt(y, sliderY);
  const leftInner = ys.map((y) => [-sep(y) / 2 - BASE, y] as const);
  const rightInner = ys.map((y) => [sep(y) / 2 + BASE, y] as const);
  const pts = (a: readonly (readonly [number, number])[]) => a.map(([x, y]) => `${x},${y}`).join(" ");
  const tapeL = [...ys.map((y) => [-sep(y) / 2 - BASE + 12, y] as const), ...ys.slice().reverse().map((y) => [-sep(y) / 2 - BASE - 64, y] as const)];
  const tapeR = [...ys.map((y) => [sep(y) / 2 + BASE - 12, y] as const), ...ys.slice().reverse().map((y) => [sep(y) / 2 + BASE + 64, y] as const)];
  const top = sliderY - SL / 2;
  const bot = sliderY + SL / 2;
  const sy = range(top, bot, 5);
  const half = (y: number) => sep(y) / 2 + BASE + 26;
  const body = [...sy.map((y) => [half(y), y] as const), ...sy.slice().reverse().map((y) => [-half(y), y] as const)];
  const wallIn = (y: number) => sep(y) / 2 + BASE + 4;
  const wallL = [...sy.map((y) => [-wallIn(y), y] as const), ...sy.slice().reverse().map((y) => [-half(y), y] as const)];
  const wallR = [...sy.map((y) => [wallIn(y), y] as const), ...sy.slice().reverse().map((y) => [half(y), y] as const)];
  const dy = sy.filter((y) => sep(y) / 2 - HEAD - 6 > 0);
  const divider = dy.length
    ? [...dy.map((y) => [sep(y) / 2 - HEAD - 6, y] as const), ...dy.slice().reverse().map((y) => [-(sep(y) / 2 - HEAD - 6), y] as const)]
    : [];
  const teeth = range(-25, 24, 1);
  const hb = highlightBlue;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="metal" x1="0" x2="1">
          <stop offset="0" stopColor="#8b95a5" />
          <stop offset="0.5" stopColor="#e5e7eb" />
          <stop offset="1" stopColor="#8b95a5" />
        </linearGradient>
        <clipPath id="stage">
          <rect x={STAGE.x} y={STAGE.y} width={STAGE.w} height={STAGE.h} rx={STAGE.r} />
        </clipPath>
      </defs>
      {framed ? <rect x={STAGE.x} y={STAGE.y + 14} width={STAGE.w} height={STAGE.h} rx={STAGE.r} fill="rgba(31,41,55,0.18)" /> : null}
      <g clipPath={framed ? "url(#stage)" : undefined}>
      {framed ? <rect x={STAGE.x} y={STAGE.y} width={STAGE.w} height={STAGE.h} fill="#f3e3c7" /> : null}
      <g transform={`translate(540 ${CY}) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`}>
        {showBag ? (
          <g>
            {/* handle + straps */}
            <path d="M -260 -1250 C -260 -1560 260 -1560 260 -1250" fill="none" stroke="#b93d1f" strokeWidth={70} strokeLinecap="round" />
            <rect x={-1000} y={-1100} width={170} height={2300} rx={80} fill="#c2421f" />
            <rect x={830} y={-1100} width={170} height={2300} rx={80} fill="#c2421f" />
            <rect x={-860} y={-1280} width={1720} height={2620} rx={220} fill="#e4572e" />
            <rect x={-640} y={-1120} width={1280} height={2300} rx={160} fill="#d14a26" />
            <rect x={-610} y={-1090} width={1220} height={2240} rx={140} fill="none" stroke="#f6b49e" strokeWidth={8} strokeDasharray="26 18" />
          </g>
        ) : null}
        {/* pocket interior seen through the open part */}
        <polygon points={`${pts(leftInner)} ${pts(rightInner.slice().reverse())}`} fill="#3a1d16" />
        <polygon points={pts(tapeL)} fill="#334155" />
        <polygon points={pts(tapeR)} fill="#334155" />
        {/* teeth */}
        {teeth.map((i) => {
          const y = i * P;
          const s = sep(y);
          const hl = hb != null && Math.abs(y - hb) < 1;
          return (
            <g key={`b${i}`} style={hl && highlightAmt > 0 ? { filter: `drop-shadow(0 0 ${10 * highlightAmt}px #fff)` } : undefined}>
              <Tooth x0={-s / 2 - BASE} x1={-s / 2 + HEAD} y={y} color={BLUE} edge={hl && highlightAmt > 0 ? "#ffffff" : "#1e3a8a"} headLeft={false} />
            </g>
          );
        })}
        {teeth.map((i) => {
          const y = i * P + P / 2;
          const s = sep(y);
          const near = hb != null && gapAmt > 0 && Math.abs(y - hb) < P / 2 + 1;
          return (
            <g key={`y${i}`} style={near ? { filter: `drop-shadow(0 0 ${8 * gapAmt}px #fff7c2)` } : undefined}>
              <Tooth x0={s / 2 - HEAD} x1={s / 2 + BASE} y={y} color={YELLOW} edge={near ? "#ffffff" : "#a16207"} headLeft />
            </g>
          );
        })}
        {/* gap in front of the highlighted blue tooth */}
        {hb != null && gapAmt > 0 ? (
          <rect
            x={sep(hb) / 2 - HEAD - 2}
            y={hb - (P - TH) / 2 + 1}
            width={HEAD + 10}
            height={P - TH - 2}
            fill="rgba(255,255,255,0.18)"
            stroke="#ffffff"
            strokeWidth={3}
            strokeDasharray="6 5"
            opacity={gapAmt}
          />
        ) : null}
        {/* slider body (solid metal or see-through) */}
        <polygon points={pts(body)} fill="url(#metal)" opacity={bodyOpacity} stroke="#4b5563" strokeWidth={4} />
        {bodyOpacity < 1 ? (
          <g opacity={1 - bodyOpacity}>
            <polygon points={pts(body)} fill="rgba(203,213,225,0.10)" stroke="#475569" strokeWidth={4} />
            <polygon points={pts(wallL)} fill="rgba(100,116,139,0.55)" stroke="#334155" strokeWidth={3} />
            <polygon points={pts(wallR)} fill="rgba(100,116,139,0.55)" stroke="#334155" strokeWidth={3} />
            {divider.length ? (
              <polygon
                points={pts(divider)}
                fill="#64748b"
                stroke={dividerGlow > 0 ? "#ffffff" : "#334155"}
                strokeWidth={3 + 3 * dividerGlow}
                style={dividerGlow > 0 ? { filter: `drop-shadow(0 0 ${12 * dividerGlow}px #fff)` } : undefined}
              />
            ) : null}
          </g>
        ) : null}
        {/* pull tab lying on the slider */}
        <g opacity={tabOpacity} style={tabGlow > 0 ? { filter: `drop-shadow(0 0 ${16 * tabGlow}px #fde047)` } : undefined}>
          <rect x={-26} y={sliderY - 70} width={52} height={250} rx={22} fill="url(#metal)" stroke={tabGlow > 0.05 ? "#fde047" : "#4b5563"} strokeWidth={4 + 4 * tabGlow} />
          <rect x={-12} y={sliderY + 120} width={24} height={40} rx={10} fill="#3a1d16" opacity={0.85} />
          <circle cx={0} cy={sliderY - 40} r={14} fill="#6b7280" />
        </g>
        {overlay}
        {/* top stop / bottom stop */}
        <rect x={-BASE - 8} y={1006} width={2 * BASE + 16} height={30} rx={8} fill="#9ca3af" stroke="#4b5563" strokeWidth={3} />
      </g>
      </g>
      {framed ? <rect x={STAGE.x} y={STAGE.y} width={STAGE.w} height={STAGE.h} rx={STAGE.r} fill="none" stroke="#1f2937" strokeWidth={8} /> : null}
    </svg>
  );
};
