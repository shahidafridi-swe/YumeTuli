import { useCurrentFrame } from "remotion";

// Bright park world for 1080x1920 SVG. Ground line at GROUND_Y.
export const GROUND_Y = 1380;
export const TREE = { x: 800, canopyY: 700 };

export const ParkDefs: React.FC = () => (
  <>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#4fb8ff" />
      <stop offset="60%" stopColor="#9fdcff" />
      <stop offset="100%" stopColor="#d9f3ff" />
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#fff7b0" />
      <stop offset="60%" stopColor="#ffd93b" />
      <stop offset="100%" stopColor="#ffb703" />
    </radialGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#7ee05a" />
      <stop offset="100%" stopColor="#3fae3a" />
    </linearGradient>
    <radialGradient id="leaf" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stopColor="#8af06a" />
      <stop offset="70%" stopColor="#3fbf4a" />
      <stop offset="100%" stopColor="#2a9a3a" />
    </radialGradient>
  </>
);

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={0.95}>
    <ellipse cx={0} cy={0} rx={90} ry={50} fill="#fff" />
    <ellipse cx={-70} cy={15} rx={60} ry={38} fill="#fff" />
    <ellipse cx={75} cy={15} rx={65} ry={40} fill="#fff" />
    <ellipse cx={10} cy={-35} rx={60} ry={45} fill="#fff" />
  </g>
);

const Flower: React.FC<{ x: number; y: number; c: string }> = ({ x, y, c }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={-3} y={0} width={6} height={40} fill="#2f8f2f" />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 14} cy={Math.sin((a * Math.PI) / 180) * 14} r={11} fill={c} />
    ))}
    <circle cx={0} cy={0} r={9} fill="#ffd93b" />
  </g>
);

export const Park: React.FC<{ tree?: boolean; shake?: number; wind?: number }> = ({
  tree = true,
  shake = 0,
  wind = 0,
}) => {
  const frame = useCurrentFrame();
  const drift = frame * 0.6 + wind * frame * 2;
  const sway = Math.sin(frame / 10) * 2 + shake * Math.sin(frame * 1.7) * 8;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#sky)" />
      {/* sun with rotating rays */}
      <g transform={`translate(120, 150) scale(0.75) rotate(${frame * 0.5})`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-8} y={-150} width={16} height={45} rx={8} fill="#ffd93b" transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle cx={120} cy={150} r={68} fill="url(#sun)" />
      <Cloud x={((300 + drift) % 1400) - 150} y={560} s={0.9} />
      <Cloud x={((900 + drift * 0.7) % 1400) - 150} y={430} s={1.2} />
      <Cloud x={((600 + drift * 0.5) % 1400) - 150} y={820} s={0.7} />
      {/* far hills */}
      <ellipse cx={200} cy={GROUND_Y + 40} rx={520} ry={260} fill="#9be37a" />
      <ellipse cx={900} cy={GROUND_Y + 60} rx={560} ry={240} fill="#8ad86b" />
      {/* ground */}
      <rect x={0} y={GROUND_Y - 40} width={1080} height={1920 - GROUND_Y + 40} fill="url(#grass)" />
      <path d={`M 0 ${GROUND_Y - 40} Q 270 ${GROUND_Y - 80} 540 ${GROUND_Y - 40} T 1080 ${GROUND_Y - 40}`} fill="#7ee05a" />
      {/* path */}
      <path d={`M 380 1920 Q 460 ${GROUND_Y + 160} 540 ${GROUND_Y + 10} L 600 ${GROUND_Y + 10} Q 600 ${GROUND_Y + 160} 720 1920 Z`} fill="#f2d39b" opacity={0.8} />
      <Flower x={90} y={GROUND_Y + 60} c="#ff5fa2" />
      <Flower x={170} y={GROUND_Y + 120} c="#b07bff" />
      <Flower x={980} y={GROUND_Y + 90} c="#ff5fa2" />
      <Flower x={900} y={GROUND_Y + 170} c="#ff9f1c" />
      <Flower x={60} y={GROUND_Y + 230} c="#ff9f1c" />
      {tree ? (
        <g transform={`rotate(${sway * 0.3}, ${TREE.x}, ${GROUND_Y})`}>
          <path
            d={`M ${TREE.x - 55} ${GROUND_Y} Q ${TREE.x - 30} ${GROUND_Y - 300} ${TREE.x - 35} ${TREE.canopyY + 120} L ${TREE.x + 35} ${TREE.canopyY + 120} Q ${TREE.x + 30} ${GROUND_Y - 300} ${TREE.x + 55} ${GROUND_Y} Z`}
            fill="#a0632e"
          />
          <g transform={`translate(${sway}, 0)`}>
            <circle cx={TREE.x - 170} cy={TREE.canopyY + 60} r={150} fill="url(#leaf)" />
            <circle cx={TREE.x + 160} cy={TREE.canopyY + 50} r={150} fill="url(#leaf)" />
            <circle cx={TREE.x} cy={TREE.canopyY - 60} r={200} fill="url(#leaf)" />
            <circle cx={TREE.x + 30} cy={TREE.canopyY + 90} r={140} fill="url(#leaf)" />
            {[[-120, 0], [90, -80], [150, 100], [-60, 120], [20, -170]].map(([dx, dy], i) => (
              <circle key={i} cx={TREE.x + dx} cy={TREE.canopyY + dy} r={16} fill="#ff4d4d" />
            ))}
          </g>
        </g>
      ) : null}
    </g>
  );
};

// Red & yellow diamond kite with a bow tail. (x,y) = kite center.
export const Kite: React.FC<{ x: number; y: number; rot?: number; scale?: number; tail?: boolean }> = ({
  x,
  y,
  rot = 0,
  scale = 1,
  tail = true,
}) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rot}) scale(${scale})`}>
      {tail ? (
      <g>
      <path
        d={`M 0 90 Q ${-20 + Math.sin(frame / 5) * 25} 170 ${Math.sin(frame / 4) * 30} 250 Q ${20 + Math.sin(frame / 6) * 25} 320 ${Math.sin(frame / 5) * 20} 380`}
        stroke="#555"
        strokeWidth={4}
        fill="none"
      />
      {[170, 250, 330].map((ty, i) => (
        <g key={i} transform={`translate(${Math.sin(frame / 5 + i) * 22}, ${ty})`}>
          <path d="M -22 -12 L 0 0 L -22 12 Z M 22 -12 L 0 0 L 22 12 Z" fill={i % 2 ? "#ffd93b" : "#3b82f6"} />
        </g>
      ))}
      </g>
      ) : null}
      <path d="M 0 -110 L 80 -10 L 0 90 L -80 -10 Z" fill="#ff3b3b" />
      <path d="M 0 -110 L 80 -10 L 0 -10 Z" fill="#ffd93b" />
      <path d="M 0 -10 L -80 -10 L 0 90 Z" fill="#ffd93b" />
      <path d="M 0 -110 L 0 90 M -80 -10 L 80 -10" stroke="#b31d1d" strokeWidth={5} />
    </g>
  );
};

// Confetti / sparkle burst
export const Confetti: React.FC<{ startFrame?: number }> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame() - startFrame;
  if (frame < 0) return null;
  const colors = ["#ff3b3b", "#ffd93b", "#3b82f6", "#ff5fa2", "#7ee05a", "#b07bff"];
  return (
    <g>
      {Array.from({ length: 60 }).map((_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const r = seed / 233280;
        const x = (i * 137) % 1080;
        const y = -50 + frame * (8 + r * 8) - ((i * 53) % 400);
        const rot = frame * (4 + r * 10);
        return (
          <rect key={i} x={x} y={y} width={18} height={28} rx={4} fill={colors[i % colors.length]} transform={`rotate(${rot} ${x + 9} ${y + 14})`} />
        );
      })}
    </g>
  );
};
