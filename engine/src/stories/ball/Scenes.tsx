import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Kid, KidDefs } from "../../characters/Kid";
import { Elephant, ElephantDefs } from "../../characters/Elephant";
import { Park, ParkDefs, GROUND_Y } from "../../illustrations/Park";

// Same stage, characters and safe zones as stories/kite. All movement is frame-driven.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Ball: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle r={38} fill="#f43f5e" stroke="#ab2444" strokeWidth={5} />
    <path d="M -30 -21 Q 0 4 30 -21 M -28 24 Q 0 2 28 24" fill="none" stroke="#ffd76b" strokeWidth={7} />
    <ellipse cx={-13} cy={-18} rx={10} ry={6} fill="white" opacity={0.65} />
  </g>
);
const Pond: React.FC = () => {
  const f = useCurrentFrame();
  return <g>
    <ellipse cx={1065} cy={1340} rx={245} ry={105} fill="#eac48c" />
    <ellipse cx={1070} cy={1334} rx={228} ry={87} fill="#38bce8" />
    {[0, 1, 2].map(i => <path key={i} d={`M ${900+i*60} ${1310+i*30} q 40 ${Math.sin(f/12+i)*8} 80 0`} stroke="#c8f5ff" strokeWidth={5} fill="none" />)}
  </g>;
};
const Stage: React.FC<{ children: React.ReactNode; pond?: boolean }> = ({ children, pond = true }) => (
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <defs><ParkDefs /><KidDefs /><ElephantDefs /></defs>
    <Park tree={false} />{pond && <Pond />}{children}
  </svg>
);
const useBeat = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return { frame, p: frame / durationInFrames };
};
const tip = (frame: number, up: number) => ({
  x: 660 + (300 - 30 * up + Math.sin(frame / 7) * 6 * (1 - up)),
  y: GROUND_Y + (-60 - 600 * up),
});
export const Play: React.FC = () => {
  const { p } = useBeat();
  const t = interpolate(p, [0.35, 1], [0, 1], clamp);
  return <Stage>
    <Kid x={240} y={GROUND_Y} scale={1} armR={100} mood="excited" lookX={1} />
    <Elephant x={660} y={GROUND_Y} scale={1} trunkUp={0.15} />
    <Ball x={451 + 509*t} y={1107 + 43*t - Math.sin(t*Math.PI)*250} />
  </Stage>;
};
export const Splash: React.FC = () => {
  const { p, frame } = useBeat();
  const t = interpolate(p, [0, 0.4], [0, 1], clamp);
  return <Stage>
    <Kid x={240} y={GROUND_Y} scale={1} armR={60} mood="surprised" lookX={1} />
    <Elephant x={660} y={GROUND_Y} scale={1} happy={false} />
    <Ball x={960+60*t} y={1150+165*t+Math.sin(frame/8)*t*4} />
    {p>0.35 && p<0.7 && [0,1,2,3,4].map(i => <ellipse key={i} cx={850+i*38} cy={1250-Math.sin((p-0.35)/0.35*Math.PI)*90+i%2*20} rx={7} ry={15} fill="#9feaff" />)}
  </Stage>;
};
export const Reach: React.FC = () => {
  const { p, frame } = useBeat();
  const t = interpolate(p, [0.1, 0.95], [0, 1], clamp);
  return <Stage>
    <Kid x={240} y={GROUND_Y} scale={1} mood="surprised" lookX={1} />
    <Elephant x={660} y={GROUND_Y} scale={1} />
    <Ball x={1020-60*t} y={1315+Math.sin(frame/8)*4} />
    {[0,1,2].map(i=><path key={i} d={`M ${1000-((frame*3+i*70)%220)} ${1030+i*45} q -35 -10 -70 0`} stroke="white" strokeWidth={6} fill="none" opacity={0.7} />)}
  </Stage>;
};
export const Rescue: React.FC = () => {
  const { p, frame } = useBeat();
  const up = interpolate(p, [0.1, 0.65], [0, 0.65], clamp);
  const pos = tip(frame, up);
  return <Stage>
    <Kid x={240} y={GROUND_Y} scale={1} armR={120} mood="excited" lookX={1} lookY={-0.5} />
    <Elephant x={660} y={GROUND_Y} scale={1} trunkUp={up} />
    <Ball x={pos.x} y={pos.y-24} />
    {p<0.7 && [0,1,2].map(i => <ellipse key={i} cx={pos.x+i*13-10} cy={pos.y+40+(frame*4+i*25)%90} rx={5} ry={10} fill="#46bfea" />)}
  </Stage>;
};
export const Ending: React.FC = () => {
  const { p, frame } = useBeat();
  const leave = interpolate(p, [0.72, 1], [0, 1], clamp);
  const sneeze = p>0.08 && p<0.2 ? Math.sin(frame*1.8)*8 : 0;
  const tiaX = 240 - leave * 30;
  const lift = leave * Math.abs(Math.sin(frame / 5)) * 15;
  const bob = Math.sin(frame / 8) * 4;
  // Match Kid's right hand: shoulder (78, -250), arm length 135, angle 100°.
  const armAngle = 100 * Math.PI / 180;
  const handX = tiaX + 78 + Math.sin(armAngle) * 135;
  const handY = GROUND_Y - lift + bob - 250 + Math.cos(armAngle) * 135;
  return <Stage pond={false}>
    <Kid x={tiaX} y={GROUND_Y} scale={1} armR={100} mood="excited" lookX={1} lift={lift} />
    <Elephant x={660-leave*30+sneeze} y={GROUND_Y} scale={1} trunkUp={0.15} walk={leave>0} />
    {/* Held props draw last and follow the hand through idle bob and hops. */}
    <Ball x={handX} y={handY-20} />
    {p<0.22 && [0,1,2].map(i=><ellipse key={i} cx={955-i*15+sneeze} cy={1250+p*300+i*12} rx={5} ry={10} fill="#46bfea" />)}
  </Stage>;
};
