import { useMemo } from "react";
import * as THREE from "three";

// Toy-like 3D versions of the original characters Tia and Pip.
// Units ≈ meters. Origin = between the feet. Both face +z (camera) by default.
// `talk` (0..1) opens the mouth — drive it from audio amplitude for lip-sync.

const toy = (color: string, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) => (
  <meshPhysicalMaterial color={color} roughness={0.45} clearcoat={0.6} clearcoatRoughness={0.25} {...extra} />
);

// Organic limb: lathe profile hanging down from the origin (-y), rounded at both ends,
// radius tapers from r0 (top) to r1 (bottom) with a soft bulge in the middle.
const limbCache = new Map<string, THREE.LatheGeometry>();
const limbGeometry = (len: number, r0: number, r1: number, bulge = 0.12) => {
  const key = `${len}|${r0}|${r1}|${bulge}`;
  const hit = limbCache.get(key);
  if (hit) return hit;
  const pts: THREE.Vector2[] = [];
  const N = 10;
  for (let i = 0; i <= N; i++) {
    const a = -Math.PI / 2 + (i / N) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.max(0.0001, r1 * Math.cos(a)), -len + r1 * Math.sin(a)));
  }
  for (let i = 1; i < 16; i++) {
    const t = i / 16;
    const r = r1 + (r0 - r1) * t + Math.sin(Math.PI * t) * bulge * (r0 + r1) * 0.5;
    pts.push(new THREE.Vector2(r, -len + len * t));
  }
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.max(0.0001, r0 * Math.cos(a)), r0 * Math.sin(a)));
  }
  const g = new THREE.LatheGeometry(pts, 32);
  g.computeVertexNormals();
  limbCache.set(key, g);
  return g;
};

const Limb: React.FC<{ len: number; r0: number; r1: number; color: string; bulge?: number }> = ({ len, r0, r1, color, bulge }) => (
  <mesh geometry={limbGeometry(len, r0, r1, bulge)} castShadow>
    {toy(color)}
  </mesh>
);

const Eye: React.FC<{ x: number; y: number; z: number; r: number; blink: number; look?: [number, number] }> = ({
  x,
  y,
  z,
  r,
  blink,
  look = [0, 0],
}) => (
  <group position={[x, y, z]} scale={[1, blink, 1]}>
    <mesh scale={[1, 1.12, 0.6]}>
      <sphereGeometry args={[r, 32, 32]} />
      {toy("#ffffff", { clearcoat: 1 })}
    </mesh>
    <mesh position={[look[0] * r * 0.25, look[1] * r * 0.25 - r * 0.05, r * 0.42]} scale={[1, 1.1, 0.5]}>
      <sphereGeometry args={[r * 0.68, 32, 32]} />
      {toy("#24130b", { clearcoat: 1, roughness: 0.2 })}
    </mesh>
    <mesh position={[look[0] * r * 0.25 + r * 0.25, look[1] * r * 0.25 + r * 0.25, r * 0.75]}>
      <sphereGeometry args={[r * 0.2, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
    <mesh position={[look[0] * r * 0.25 - r * 0.2, look[1] * r * 0.25 - r * 0.3, r * 0.72]}>
      <sphereGeometry args={[r * 0.09, 12, 12]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  </group>
);

// Mouth: closed = smile arc; talking = open oval with tongue + teeth, height follows `open`.
const Mouth: React.FC<{ y: number; z: number; r: number; open: number; lip: string }> = ({ y, z, r, open, lip }) => {
  const o = Math.min(1, Math.max(0, open));
  if (o < 0.08) {
    return (
      <group position={[0, y, z]}>
        <mesh rotation={[0, 0, Math.PI]} scale={[1, 0.8, 0.3]}>
          <circleGeometry args={[r, 32, 0, Math.PI]} />
          <meshStandardMaterial color="#5e1a12" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[r, r * 0.2, 12, 32, Math.PI]} />
          {toy(lip)}
        </mesh>
      </group>
    );
  }
  const h = r * (0.35 + o * 1.25);
  const w = r * (1.05 - o * 0.2);
  return (
    <group position={[0, y - r * 0.25, z]}>
      <mesh scale={[w, h, r * 0.35]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#4a120c" />
      </mesh>
      <mesh position={[0, -h * 0.45, r * 0.18]} scale={[w * 0.6, h * 0.35, r * 0.2]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#ff7b8a" />
      </mesh>
      <mesh position={[0, h * 0.62, r * 0.22]} scale={[w * 0.55, h * 0.16, r * 0.12]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh scale={[w, h, r * 0.4]}>
        <torusGeometry args={[1, 0.14, 12, 40]} />
        {toy(lip)}
      </mesh>
    </group>
  );
};

export type Tia3DProps = {
  position?: [number, number, number];
  rotationY?: number;
  frame: number;
  armR?: number; // shoulder raise (rad): 0 = down, ~2.4 = up
  armL?: number;
  elbowR?: number; // forearm bend (rad)
  elbowL?: number;
  hop?: number;
  look?: [number, number];
  talk?: number; // 0..1 mouth open
};

const SKIN = "#c98b5f";
const SKIN_DARK = "#b0744a";
const HAIR = "#3a2216";
const SHIRT = "#ffcf3a";
const DENIM = "#3b82f6";

export const Tia3D: React.FC<Tia3DProps> = ({
  position = [0, 0, 0],
  rotationY = 0,
  frame,
  armR = 0.25,
  armL = -0.25,
  elbowR = 0.2,
  elbowL = -0.2,
  hop = 0,
  look = [0, 0],
  talk = 0,
}) => {
  const bob = Math.sin(frame / 8) * 0.012;
  const blink = frame % 80 > 75 ? 0.1 : 1;
  const brow = talk * 0.035;
  const headNod = talk * 0.06;

  // Two-segment arm: shoulder → elbow → mitten hand with thumb
  const arm = (side: 1 | -1, shoulder: number, elbow: number) => (
    <group position={[side * 0.24, 1.02, 0]} rotation={[0, 0, shoulder]}>
      <mesh position={[0, -0.04, 0]} scale={[1, 1.1, 1]} castShadow>
        <sphereGeometry args={[0.095, 24, 24]} />
        {toy(SHIRT)}
      </mesh>
      <Limb len={0.16} r0={0.066} r1={0.056} color={SKIN} />
      <group position={[0, -0.16, 0]} rotation={[0, 0, elbow]}>
        <Limb len={0.15} r0={0.056} r1={0.05} color={SKIN} />
        <group position={[0, -0.2, 0]}>
          <mesh scale={[0.85, 1.05, 0.65]} castShadow>
            <sphereGeometry args={[0.075, 24, 24]} />
            {toy(SKIN)}
          </mesh>
          <mesh position={[side * -0.055, 0.02, 0.025]} rotation={[0, 0, side * 0.7]} castShadow>
            <capsuleGeometry args={[0.022, 0.04, 6, 10]} />
            {toy(SKIN)}
          </mesh>
        </group>
      </group>
    </group>
  );

  return (
    <group position={[position[0], position[1] + hop, position[2]]} rotation={[0, rotationY, 0]}>
      <group position={[0, bob, 0]}>
        {/* legs: tapered denim, then shoes with white sole */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.11, 0.46, 0]}>
            <Limb len={0.32} r0={0.1} r1={0.075} color={DENIM} bulge={0.05} />
            <group position={[0, -0.4, 0.04]}>
              <mesh scale={[0.95, 0.62, 1.45]} castShadow>
                <sphereGeometry args={[0.11, 32, 24]} />
                {toy("#e8333a", { clearcoat: 1 })}
              </mesh>
              <mesh position={[0, -0.045, 0]} scale={[0.95, 0.18, 1.45]}>
                <sphereGeometry args={[0.112, 32, 16]} />
                {toy("#ffffff")}
              </mesh>
            </group>
          </group>
        ))}
        {/* torso: rounded shirt, overalls over the lower half */}
        <mesh position={[0, 0.88, 0]} scale={[1, 0.92, 0.82]} castShadow>
          <sphereGeometry args={[0.27, 40, 40]} />
          {toy(SHIRT)}
        </mesh>
        <mesh position={[0, 0.7, 0]} scale={[1, 0.9, 0.9]} castShadow>
          <sphereGeometry args={[0.305, 40, 40, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.7]} />
          {toy(DENIM)}
        </mesh>
        {/* bib + straps hugging the chest */}
        <mesh position={[0, 0.84, 0.19]} rotation={[-0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.26, 0.2, 0.05]} />
          {toy(DENIM)}
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.1, 0.99, 0.1]} rotation={[-0.9, 0, 0]}>
              <boxGeometry args={[0.05, 0.24, 0.03]} />
              {toy(DENIM)}
            </mesh>
            <mesh position={[s * 0.1, 0.93, 0.225]}>
              <sphereGeometry args={[0.025, 12, 12]} />
              {toy("#ffd93b", { clearcoat: 1 })}
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.8, 0.222]} rotation={[-0.25, 0, 0]}>
          <boxGeometry args={[0.1, 0.06, 0.01]} />
          {toy("#2a64c9")}
        </mesh>
        <mesh position={[0, 1.08, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.1, 20]} />
          {toy(SKIN)}
        </mesh>
        {arm(1, armR, elbowR)}
        {arm(-1, armL, elbowL)}
        {/* head */}
        <group position={[0, 1.52, 0]} rotation={[headNod, 0, 0]}>
          <mesh castShadow scale={[1, 0.96, 0.95]}>
            <sphereGeometry args={[0.45, 48, 48]} />
            {toy(SKIN, { clearcoat: 0.3, roughness: 0.55 })}
          </mesh>
          <mesh rotation={[-0.35, 0, 0]} castShadow>
            <sphereGeometry args={[0.47, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
            {toy(HAIR, { roughness: 0.7, clearcoat: 0.2 })}
          </mesh>
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh position={[s * 0.47, 0.12, -0.05]} castShadow>
                <sphereGeometry args={[0.21, 32, 32]} />
                {toy(HAIR, { roughness: 0.75, clearcoat: 0.1 })}
              </mesh>
              <mesh position={[s * 0.33, 0.18, 0.12]}>
                <sphereGeometry args={[0.075, 24, 24]} />
                {toy("#e8333a", { clearcoat: 1 })}
              </mesh>
              <mesh position={[s * 0.44, -0.04, 0]} scale={[0.5, 1, 0.8]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                {toy(SKIN_DARK)}
              </mesh>
              <mesh position={[s * 0.26, -0.13, 0.36]} scale={[1, 0.6, 0.3]}>
                <sphereGeometry args={[0.075, 16, 16]} />
                <meshStandardMaterial color="#ff6f7d" transparent opacity={0.55} />
              </mesh>
              <mesh position={[s * 0.16, 0.16 + brow, 0.405]} rotation={[0, 0, Math.PI / 2 - s * 0.18]}>
                <capsuleGeometry args={[0.018, 0.07, 6, 10]} />
                {toy(HAIR)}
              </mesh>
            </group>
          ))}
          <Eye x={-0.16} y={0.01} z={0.36} r={0.11} blink={blink} look={look} />
          <Eye x={0.16} y={0.01} z={0.36} r={0.11} blink={blink} look={look} />
          <mesh position={[0, -0.09, 0.44]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            {toy(SKIN_DARK)}
          </mesh>
          <Mouth y={-0.2} z={0.405} r={0.085} open={talk} lip="#a3402f" />
        </group>
      </group>
    </group>
  );
};

export type Pip3DProps = {
  position?: [number, number, number];
  rotationY?: number;
  frame: number;
  trunkUp?: number; // 0 relaxed curl, 1 raised
  walk?: boolean;
  talk?: number; // 0..1 mouth open
};

const BLUE = "#6fb6ff";
const BLUE_DARK = "#4a8fe0";

// Elephant leg: thick column, slightly wider at the foot, with three toenails
const ElephantLeg: React.FC = () => (
  <group>
    <group position={[0, 0.42, 0]}>
      <Limb len={0.3} r0={0.15} r1={0.165} color={BLUE_DARK} bulge={0.04} />
    </group>
    {[-1, 0, 1].map((k) => (
      <mesh key={k} position={[k * 0.075, 0.05, 0.135 - Math.abs(k) * 0.02]} scale={[1, 0.8, 0.6]}>
        <sphereGeometry args={[0.04, 16, 12]} />
        {toy("#f4e3c8", { clearcoat: 1 })}
      </mesh>
    ))}
  </group>
);

export const Pip3D: React.FC<Pip3DProps> = ({ position = [0, 0, 0], rotationY = 0, frame, trunkUp = 0, walk = false, talk = 0 }) => {
  const blink = frame % 95 > 90 ? 0.1 : 1;
  const step = walk ? Math.sin(frame / 3) : 0;
  const ear = Math.sin(frame / 6) * 0.15 + talk * 0.15;

  const t = trunkUp;
  const wave = Math.sin(frame / 5) * 0.08 * t + Math.sin(frame / 2.2) * 0.04 * talk;
  const tipX = wave * 2.5;
  const tipY = 0.82 + t * 1.18 + (1 - t) * 0.06;
  const tipZ = 1.12 - (1 - t) * 0.04;
  // Trunk: tapered tube along a curve — thick at the face, thinner at the tip
  const trunk = useMemo(() => {
    const pts = [
      new THREE.Vector3(0, 1.1, 0.74),
      new THREE.Vector3(0, 0.95 + t * 0.25, 0.9 + t * 0.05),
      new THREE.Vector3(wave, 0.8 + t * 0.6, 0.99 + t * 0.12),
      new THREE.Vector3(wave * 2, 0.76 + t * 1.0, 1.06 + t * 0.05),
      new THREE.Vector3(tipX, tipY, tipZ),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const SEG = 48;
    const RAD = 18;
    const g = new THREE.TubeGeometry(curve, SEG, 0.1, RAD, false);
    const pos = g.attributes.position;
    const centers = curve.getPoints(SEG);
    for (let i = 0; i <= SEG; i++) {
      const scale = 1 - (i / SEG) * 0.35;
      const c = centers[i];
      for (let j = 0; j <= RAD; j++) {
        const idx = i * (RAD + 1) + j;
        pos.setXYZ(
          idx,
          c.x + (pos.getX(idx) - c.x) * scale,
          c.y + (pos.getY(idx) - c.y) * scale,
          c.z + (pos.getZ(idx) - c.z) * scale,
        );
      }
    }
    g.computeVertexNormals();
    return g;
  }, [t, wave, tipX, tipY, tipZ]);

  return (
    <group position={[position[0], position[1] + Math.abs(step) * 0.04, position[2]]} rotation={[0, rotationY, 0]}>
      {[
        [-0.3, 0.3, 1],
        [0.3, 0.3, -1],
        [-0.3, -0.3, -1],
        [0.3, -0.3, 1],
      ].map(([x, z, ph], i) => (
        <group key={i} position={[x, Math.max(0, step * ph) * 0.08, z]} rotation={[step * ph * 0.15, 0, 0]}>
          <ElephantLeg />
        </group>
      ))}
      <mesh position={[0, 0.72, -0.05]} scale={[1, 0.85, 1.1]} castShadow>
        <sphereGeometry args={[0.58, 48, 48]} />
        {toy(BLUE)}
      </mesh>
      <mesh position={[0, 0.75, -0.7]} rotation={[0.6, 0, 0]} castShadow>
        <capsuleGeometry args={[0.03, 0.2, 6, 8]} />
        {toy(BLUE_DARK)}
      </mesh>
      <mesh position={[0, 0.98, 0.3]} rotation={[Math.PI / 2 + 0.25, 0, 0]} castShadow>
        <torusGeometry args={[0.4, 0.07, 16, 48]} />
        {toy("#ff8a1f")}
      </mesh>
      <group position={[0, 1.28, 0.4]}>
        <mesh castShadow>
          <sphereGeometry args={[0.44, 48, 48]} />
          {toy(BLUE)}
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.5, 0.02, -0.05]} rotation={[0, s * (0.35 + ear), 0]}>
            <mesh position={[s * 0.22, 0, 0]} scale={[1, 1.15, 0.22]} castShadow>
              <sphereGeometry args={[0.36, 32, 32]} />
              {toy(BLUE_DARK)}
            </mesh>
            <mesh position={[s * 0.22, -0.02, 0.06]} scale={[0.75, 0.9, 0.12]}>
              <sphereGeometry args={[0.36, 32, 32]} />
              {toy("#ffb3c7")}
            </mesh>
          </group>
        ))}
        <Eye x={-0.17} y={0.08} z={0.34} r={0.1} blink={blink} look={[0, 0.2]} />
        <Eye x={0.17} y={0.08} z={0.34} r={0.1} blink={blink} look={[0, 0.2]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.27, -0.08, 0.33]} scale={[1, 0.6, 0.3]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color="#ff6f9a" transparent opacity={0.55} />
            </mesh>
            <mesh position={[s * 0.17, 0.21 + talk * 0.03, 0.39]} rotation={[0, 0, Math.PI / 2 - s * 0.2]}>
              <capsuleGeometry args={[0.016, 0.06, 6, 10]} />
              {toy("#2c4f86")}
            </mesh>
          </group>
        ))}
        {[-0.05, 0.05].map((x, i) => (
          <mesh key={i} position={[x, 0.46, 0.05]} rotation={[0, 0, x * 6]}>
            <capsuleGeometry args={[0.02, 0.1, 6, 8]} />
            {toy("#3a5f9c")}
          </mesh>
        ))}
        {/* mouth just below the trunk base */}
        <group position={[0.16, -0.24, 0.36]} rotation={[0.3, 0.35, 0]}>
          <Mouth y={0} z={0} r={0.065} open={talk} lip="#3a6fc0" />
        </group>
      </group>
      <mesh geometry={trunk} castShadow>
        {toy(BLUE)}
      </mesh>
      <mesh position={[tipX, tipY, tipZ]}>
        <sphereGeometry args={[0.068, 16, 16]} />
        {toy(BLUE_DARK)}
      </mesh>
    </group>
  );
};

// Red & yellow diamond kite (flat), faces +z
export const Kite3D: React.FC<{ position: [number, number, number]; rotation?: number; frame: number }> = ({
  position,
  rotation = 0,
  frame,
}) => {
  const shapes = useMemo(() => {
    const tri = (pts: [number, number][]) => {
      const s = new THREE.Shape();
      s.moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach(([x, y]) => s.lineTo(x, y));
      s.closePath();
      return s;
    };
    return {
      tl: tri([[0, 0.45], [-0.32, 0.05], [0, 0.05]]),
      tr: tri([[0, 0.45], [0.32, 0.05], [0, 0.05]]),
      bl: tri([[0, -0.4], [-0.32, 0.05], [0, 0.05]]),
      br: tri([[0, -0.4], [0.32, 0.05], [0, 0.05]]),
    };
  }, []);
  return (
    <group position={position} rotation={[0, Math.sin(frame / 15) * 0.3, rotation]}>
      {(
        [
          ["tl", "#ff3b3b"],
          ["tr", "#ffd93b"],
          ["bl", "#ffd93b"],
          ["br", "#ff3b3b"],
        ] as const
      ).map(([k, c]) => (
        <mesh key={k} castShadow>
          <shapeGeometry args={[shapes[k]]} />
          {toy(c, { side: THREE.DoubleSide })}
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.sin(frame / 5 + i) * 0.08, -0.55 - i * 0.22, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          {toy(i % 2 ? "#3b82f6" : "#ffd93b")}
        </mesh>
      ))}
    </group>
  );
};
