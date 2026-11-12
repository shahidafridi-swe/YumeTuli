import { useCurrentFrame } from "remotion";

// "Tia" — original character. Warm brown skin, two puffy pigtails with red bobbles,
// yellow shirt, blue overalls, red shoes. Origin (0,0) = between the feet. Height ≈ 560.

export type Mood = "happy" | "sad" | "surprised" | "excited";

export type KidProps = {
  x: number;
  y: number;
  scale?: number;
  mood?: Mood;
  armL?: number; // degrees, 0 = down, 180 = straight up
  armR?: number;
  lift?: number; // px upward (jumps)
  flip?: boolean; // face left
  lookX?: number; // -1..1 pupil offset
  lookY?: number;
};

const SKIN = "#c98b5f";
const SKIN_DARK = "#a86d45";
const HAIR = "#3a2216";

export const Kid: React.FC<KidProps> = ({
  x,
  y,
  scale = 1,
  mood = "happy",
  armL = 20,
  armR = 20,
  lift = 0,
  flip = false,
  lookX = 0,
  lookY = 0,
}) => {
  const frame = useCurrentFrame();
  // Blink every ~2.7s for 4 frames
  const blink = frame % 80 > 75 ? 0.1 : 1;
  // Idle breathing bob
  const bob = Math.sin(frame / 8) * 4;

  const arm = (side: -1 | 1, angle: number) => (
    <g transform={`translate(${side * 78}, -250) rotate(${side * -angle})`}>
      <rect x={-20} y={-10} width={40} height={130} rx={20} fill="#ffcf3a" />
      <circle cx={0} cy={135} r={28} fill={SKIN} />
    </g>
  );

  const mouth =
    mood === "sad" ? (
      <path d="M -34 78 Q 0 50 34 78" stroke="#6b2a1a" strokeWidth={9} fill="none" strokeLinecap="round" />
    ) : mood === "surprised" ? (
      <ellipse cx={0} cy={72} rx={20} ry={26} fill="#7a2418" />
    ) : (
      <g>
        <path d={mood === "excited" ? "M -50 50 Q 0 130 50 50 Z" : "M -40 55 Q 0 110 40 55 Z"} fill="#7a2418" />
        <ellipse cx={0} cy={mood === "excited" ? 92 : 82} rx={20} ry={11} fill="#ff7b8a" />
      </g>
    );

  const eye = (cx: number) => (
    <g transform={`translate(${cx}, -10) scale(1, ${blink})`}>
      <ellipse cx={0} cy={0} rx={34} ry={40} fill="#fff" />
      <circle cx={lookX * 10} cy={4 + lookY * 10} r={24} fill="#3b1f12" />
      <circle cx={lookX * 10} cy={4 + lookY * 10} r={13} fill="#120804" />
      <circle cx={lookX * 10 + 9} cy={-6 + lookY * 10} r={8} fill="#fff" />
      <circle cx={lookX * 10 - 8} cy={14 + lookY * 10} r={4} fill="#fff" />
    </g>
  );

  return (
    <g transform={`translate(${x}, ${y - lift}) scale(${flip ? -scale : scale}, ${scale})`}>
      {/* shadow */}
      <ellipse cx={0} cy={6 + lift / scale} rx={110 - lift * 0.15} ry={18} fill="rgba(0,0,0,0.18)" />
      <g transform={`translate(0, ${bob})`}>
        {/* legs + shoes */}
        <rect x={-55} y={-110} width={42} height={100} rx={18} fill="#2f6fe0" />
        <rect x={13} y={-110} width={42} height={100} rx={18} fill="#2f6fe0" />
        <ellipse cx={-38} cy={-8} rx={40} ry={22} fill="#e8333a" />
        <ellipse cx={38} cy={-8} rx={40} ry={22} fill="#e8333a" />
        {/* arms behind body */}
        {arm(-1, armL)}
        {arm(1, armR)}
        {/* shirt + overalls */}
        <rect x={-80} y={-290} width={160} height={120} rx={50} fill="#ffcf3a" />
        <path d="M -78 -200 L 78 -200 L 82 -100 Q 0 -80 -82 -100 Z" fill="#3b82f6" />
        <rect x={-55} y={-240} width={110} height={60} rx={16} fill="#3b82f6" />
        <circle cx={-40} cy={-225} r={9} fill="#ffcf3a" />
        <circle cx={40} cy={-225} r={9} fill="#ffcf3a" />
        <rect x={-22} y={-170} width={44} height={30} rx={8} fill="#2a64c9" />
        {/* head */}
        <g transform="translate(0, -420)">
          {/* pigtail puffs */}
          <circle cx={-140} cy={-40} r={62} fill={HAIR} />
          <circle cx={140} cy={-40} r={62} fill={HAIR} />
          <circle cx={-100} cy={-30} r={18} fill="#e8333a" />
          <circle cx={100} cy={-30} r={18} fill="#e8333a" />
          {/* ears */}
          <circle cx={-128} cy={20} r={26} fill={SKIN_DARK} />
          <circle cx={128} cy={20} r={26} fill={SKIN_DARK} />
          {/* face */}
          <circle cx={0} cy={0} r={135} fill="url(#kidSkin)" />
          {/* hair cap */}
          <path d="M -132 -20 Q -120 -150 0 -145 Q 120 -150 132 -20 Q 90 -95 0 -92 Q -90 -95 -132 -20 Z" fill={HAIR} />
          <path d="M -20 -140 Q 10 -175 40 -150" stroke={HAIR} strokeWidth={16} fill="none" strokeLinecap="round" />
          {eye(-50)}
          {eye(50)}
          {/* eyebrows */}
          <path
            d={mood === "sad" ? "M -78 -62 L -28 -52 M 28 -52 L 78 -62" : "M -78 -55 Q -50 -70 -24 -58 M 24 -58 Q 50 -70 78 -55"}
            stroke={HAIR}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
          />
          {/* cheeks */}
          <ellipse cx={-88} cy={40} rx={24} ry={15} fill="#ff6f7d" opacity={0.45} />
          <ellipse cx={88} cy={40} rx={24} ry={15} fill="#ff6f7d" opacity={0.45} />
          {/* nose */}
          <ellipse cx={0} cy={30} rx={12} ry={8} fill={SKIN_DARK} />
          {mouth}
        </g>
      </g>
    </g>
  );
};

// Gradients used by Kid — render once per SVG.
export const KidDefs: React.FC = () => (
  <radialGradient id="kidSkin" cx="40%" cy="35%" r="70%">
    <stop offset="0%" stopColor="#dda07a" />
    <stop offset="70%" stopColor={SKIN} />
    <stop offset="100%" stopColor={SKIN_DARK} />
  </radialGradient>
);
