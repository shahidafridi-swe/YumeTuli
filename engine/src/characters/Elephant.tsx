import { useCurrentFrame } from "remotion";

// "Pip" — original character. Small sky-blue elephant, big pink-lined ears, orange scarf.
// Origin (0,0) = ground under the body center. Faces right by default. Back top ≈ y -300.

export type ElephantProps = {
  x: number;
  y: number;
  scale?: number;
  trunkUp?: number; // 0 = relaxed curl, 1 = stretched straight up
  happy?: boolean;
  walk?: boolean;
  flip?: boolean;
};

const BODY = "#6fb6ff";
const BODY_DARK = "#4a8fe0";

export const Elephant: React.FC<ElephantProps> = ({
  x,
  y,
  scale = 1,
  trunkUp = 0,
  happy = true,
  walk = false,
  flip = false,
}) => {
  const frame = useCurrentFrame();
  const blink = frame % 95 > 90 ? 0.1 : 1;
  const step = walk ? Math.sin(frame / 3) : 0;
  const earFlap = Math.sin(frame / 6) * 6;

  // Trunk: from mouth area (190,-200) to tip; interpolate relaxed → raised
  const bx = 205;
  const by = -190;
  const tipX = 300 + trunkUp * -30 + Math.sin(frame / 7) * 6 * (1 - trunkUp);
  const tipY = -60 + trunkUp * -600;
  const cX = 330 - trunkUp * 40;
  const cY = -110 - trunkUp * 280;
  const curl = 1 - trunkUp;

  const leg = (lx: number, phase: number) => (
    <g transform={`translate(${lx}, ${-80 + Math.max(0, step * phase) * -18})`}>
      <rect x={-34} y={-30} width={68} height={110} rx={28} fill={BODY_DARK} />
      <ellipse cx={0} cy={72} rx={34} ry={12} fill="#f4e3c8" />
    </g>
  );

  return (
    <g transform={`translate(${x}, ${y}) scale(${flip ? -scale : scale}, ${scale})`}>
      <ellipse cx={20} cy={4} rx={230} ry={24} fill="rgba(0,0,0,0.18)" />
      <g transform={`translate(0, ${walk ? Math.abs(step) * -8 : 0})`}>
        {/* tail */}
        <path d="M -200 -170 Q -250 -150 -240 -110" stroke={BODY_DARK} strokeWidth={14} fill="none" strokeLinecap="round" />
        <circle cx={-240} cy={-105} r={14} fill="#3a5f9c" />
        {/* back legs */}
        {leg(-130, 1)}
        {leg(-40, -1)}
        {/* body */}
        <ellipse cx={-20} cy={-180} rx={200} ry={150} fill="url(#eleBody)" />
        {/* front legs */}
        {leg(60, 1)}
        {leg(140, -1)}
        {/* scarf */}
        <path d="M 60 -290 Q 120 -220 175 -260 L 185 -225 Q 120 -180 55 -250 Z" fill="#ff8a1f" />
        <path d="M 95 -240 L 70 -170 L 110 -175 Z" fill="#ff8a1f" />
        {/* head */}
        <g transform="translate(150, -290)">
          {/* ear behind */}
          <g transform={`rotate(${earFlap}, -40, 0)`}>
            <ellipse cx={-70} cy={10} rx={110} ry={125} fill={BODY_DARK} />
            <ellipse cx={-70} cy={15} rx={80} ry={95} fill="#ffb3c7" />
          </g>
          <circle cx={30} cy={0} r={120} fill="url(#eleBody)" />
          {/* trunk */}
          <path
            d={`M ${bx - 150} ${by + 290} Q ${cX - 150} ${cY + 290} ${tipX - 150} ${tipY + 290}`}
            stroke={BODY}
            strokeWidth={58}
            fill="none"
            strokeLinecap="round"
          />
          {curl > 0.2 ? (
            <circle cx={tipX - 150 - 14 * curl} cy={tipY + 290 - 10 * curl} r={22 * curl} fill="none" stroke={BODY} strokeWidth={22} />
          ) : null}
          <ellipse cx={tipX - 150} cy={tipY + 290} rx={26} ry={14} fill={BODY_DARK} transform={`rotate(${trunkUp * -80} ${tipX - 150} ${tipY + 290})`} />
          {/* eye */}
          <g transform={`translate(70, -20) scale(1, ${blink})`}>
            <ellipse cx={0} cy={0} rx={30} ry={36} fill="#fff" />
            <circle cx={6} cy={4} r={20} fill="#1b2b4a" />
            <circle cx={13} cy={-5} r={7} fill="#fff" />
            <circle cx={0} cy={12} r={3.5} fill="#fff" />
          </g>
          <path d="M 45 -72 Q 70 -85 98 -70" stroke="#2c4f86" strokeWidth={7} fill="none" strokeLinecap="round" />
          {/* cheek + smile */}
          <ellipse cx={90} cy={50} rx={22} ry={13} fill="#ff6f9a" opacity={0.5} />
          <path
            d={happy ? "M 20 70 Q 45 100 75 82" : "M 20 88 Q 45 70 75 88"}
            stroke="#2c4f86"
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
          />
          {/* hair tuft */}
          <path d="M 20 -118 Q 30 -150 45 -120 Q 55 -150 65 -115" stroke="#3a5f9c" strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

export const ElephantDefs: React.FC = () => (
  <radialGradient id="eleBody" cx="40%" cy="30%" r="75%">
    <stop offset="0%" stopColor="#a9d6ff" />
    <stop offset="65%" stopColor={BODY} />
    <stop offset="100%" stopColor={BODY_DARK} />
  </radialGradient>
);
