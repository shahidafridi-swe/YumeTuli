import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Kid, KidDefs } from "../../characters/Kid";
import { Elephant, ElephantDefs } from "../../characters/Elephant";
import { Park, ParkDefs, Kite, Confetti, GROUND_Y } from "../../illustrations/Park";

// "Tia & Pip: The Kite in the Tree" — original story.
const STUCK = { x: 750, y: 620 };

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <ParkDefs />
      <KidDefs />
      <ElephantDefs />
    </defs>
    {children}
  </svg>
);

const useP = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  return { frame, fps, dur: durationInFrames, p: frame / durationInFrames };
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const String_: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = (l) => (
  <path d={`M ${l.x1} ${l.y1} Q ${(l.x1 + l.x2) / 2 + 40} ${(l.y1 + l.y2) / 2 + 60} ${l.x2} ${l.y2}`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.9} />
);

const WindLines: React.FC = () => {
  const { frame } = useP();
  return (
    <g stroke="#ffffff" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.8}>
      {[620, 760, 900, 1040].map((y, i) => {
        const x = ((frame * 30 + i * 300) % 1500) - 400;
        return <path key={y} d={`M ${x} ${y} q 80 -40 160 0 t 160 0`} />;
      })}
    </g>
  );
};

// 1. Tia flies her kite
export const KiteFlying: React.FC = () => {
  const { frame } = useP();
  const kx = 430 + Math.sin(frame / 14) * 40;
  const ky = 650 + Math.cos(frame / 11) * 30;
  return (
    <Stage>
      <Park />
      <String_ x1={405} y1={1013} x2={kx} y2={ky + 72} />
      <Kite x={kx} y={ky} rot={Math.sin(frame / 12) * 10} scale={0.8} />
      <Kid x={260} y={GROUND_Y} armR={150} armL={25} mood="excited" lookX={0.5} lookY={-0.8} />
    </Stage>
  );
};

// 2. Wind blows the kite into the tree
export const KiteStuck: React.FC = () => {
  const { frame, dur } = useP();
  const t = interpolate(frame, [0, dur * 0.45], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const kx = interpolate(t, [0, 1], [430, STUCK.x]) + Math.sin(t * Math.PI) * 120;
  const ky = interpolate(t, [0, 1], [650, STUCK.y]) - Math.sin(t * Math.PI) * 150;
  const settled = t >= 1;
  return (
    <Stage>
      <Park wind={1} shake={settled ? 1 : 0} />
      {!settled ? <String_ x1={405} y1={1013} x2={kx} y2={ky + 72} /> : null}
      <Kite x={kx + (settled ? Math.sin(frame) * 3 : 0)} y={ky} rot={t * 35 + (settled ? Math.sin(frame / 2) * 4 : 0)} scale={0.8} />
      <WindLines />
      <Kid x={300} y={GROUND_Y} armR={settled ? 60 : 150} armL={settled ? 60 : 25} mood="surprised" lookX={0.8} lookY={-0.8} />
    </Stage>
  );
};

// 3. Tia jumps but can't reach
export const Jumping: React.FC = () => {
  const { frame, p } = useP();
  const lift = p < 0.8 ? Math.abs(Math.sin(frame / 7)) * 70 : 0;
  return (
    <Stage>
      <Park />
      <Kite x={STUCK.x} y={STUCK.y} rot={35} scale={0.8} />
      <Kid x={470} y={GROUND_Y} lift={lift} armL={170} armR={170} mood={p < 0.8 ? "surprised" : "sad"} lookX={0.4} lookY={-1} />
    </Stage>
  );
};

// 4. Pip the elephant arrives
export const PipArrives: React.FC = () => {
  const { frame, dur, fps } = useP();
  const walkEnd = dur * 0.55;
  const ex = interpolate(frame, [0, walkEnd], [-380, 230], { ...clamp, easing: Easing.out(Easing.quad) });
  const arrived = frame > walkEnd;
  const wave = arrived ? 0.45 + Math.sin(frame / 4) * 0.25 : 0.1;
  const turn = spring({ frame: frame - walkEnd * 0.6, fps, config: { damping: 14 } });
  return (
    <Stage>
      <Park />
      <Kite x={STUCK.x} y={STUCK.y} rot={35} scale={0.8} />
      <Elephant x={ex} y={GROUND_Y} scale={0.9} walk={!arrived} trunkUp={wave} />
      <Kid x={700} y={GROUND_Y} flip={turn > 0.5} mood={turn > 0.5 ? "excited" : "sad"} armL={turn > 0.5 ? 140 : 20} armR={20} lookX={turn > 0.5 ? 0.6 : 0} />
    </Stage>
  );
};

// 5. Teamwork: Tia climbs on Pip's back, Pip lifts his trunk
export const Teamwork: React.FC = () => {
  const { frame, dur, fps } = useP();
  const climb = spring({ frame, fps, durationInFrames: Math.round(dur * 0.35), config: { damping: 16 } });
  const trunk = interpolate(frame, [dur * 0.3, dur * 0.7], [0.2, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const reach = interpolate(frame, [dur * 0.35, dur * 0.55], [30, 172], clamp);
  return (
    <Stage>
      <Park />
      <Kite x={STUCK.x} y={STUCK.y} rot={35} scale={0.8} />
      <Elephant x={540} y={GROUND_Y} scale={0.9} trunkUp={trunk} />
      <Kid
        x={interpolate(climb, [0, 1], [330, 610])}
        y={interpolate(climb, [0, 1], [GROUND_Y, GROUND_Y - 290])}
        scale={0.85}
        armL={reach}
        armR={reach}
        mood="excited"
        lookX={0.5}
        lookY={-1}
      />
    </Stage>
  );
};

// 6. Got it! Kite drops into Tia's hands (held above her head)
export const KiteFree: React.FC = () => {
  const { frame, dur } = useP();
  const t = interpolate(frame, [dur * 0.15, dur * 0.4], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const kx = interpolate(t, [0, 1], [STUCK.x, 590]);
  const ky = interpolate(t, [0, 1], [STUCK.y, 520]);
  const caught = t >= 1;
  const kite = <Kite x={kx} y={ky + (caught ? Math.sin(frame / 4) * 8 : 0)} rot={interpolate(t, [0, 1], [35, 0])} scale={0.8} tail={!caught} />;
  return (
    <Stage>
      <Park shake={caught ? 0 : 1} />
      {!caught ? kite : null}
      <Elephant x={540} y={GROUND_Y} scale={0.9} trunkUp={0.92 + Math.sin(frame / 4) * 0.08} />
      <Kid x={590} y={GROUND_Y - 290} scale={0.85} armL={172} armR={172} mood="excited" lookY={-1} />
      {caught ? kite : null}
      <Confetti startFrame={Math.round(dur * 0.4)} />
    </Stage>
  );
};

// 7. Happy ending: flying the kite together
export const HappyEnding: React.FC = () => {
  const { frame } = useP();
  const kx = 560 + Math.sin(frame / 14) * 60;
  const ky = 640 + Math.cos(frame / 11) * 40;
  const hop = Math.abs(Math.sin(frame / 6)) * 40;
  return (
    <Stage>
      <Park tree={false} />
      <String_ x1={385} y1={1013 - hop} x2={kx} y2={ky + 72} />
      <Kite x={kx} y={ky} rot={Math.sin(frame / 12) * 12} />
      <Elephant x={720} y={GROUND_Y} scale={0.8} flip trunkUp={0.6 + Math.sin(frame / 5) * 0.3} />
      <Kid x={240} y={GROUND_Y} lift={hop} armR={150} armL={120} mood="excited" lookX={0.6} lookY={-0.6} />
      {[0, 1, 2, 3].map((i) => {
        const hy = 1100 - ((frame * 4 + i * 150) % 600);
        return (
          <path
            key={i}
            transform={`translate(${470 + i * 50 + Math.sin(frame / 8 + i) * 20}, ${hy}) scale(1.4)`}
            d="M 0 10 C -20 -10 -30 15 0 35 C 30 15 20 -10 0 10 Z"
            fill="#ff4d8d"
            opacity={Math.min(1, (1100 - hy) / 200) * (1 - (1100 - hy) / 600)}
          />
        );
      })}
      <Confetti />
    </Stage>
  );
};
