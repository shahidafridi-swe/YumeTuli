import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { useAudioData } from "@remotion/media-utils";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Tia3D, Pip3D, Kite3D } from "./Characters3D";
import { AnimatedText } from "../components/AnimatedText";
import { loadFont } from "@remotion/google-fonts/BalooDa2";

const { fontFamily } = loadFont("normal", { weights: ["800"] });

// 3D look test: Tia flies her kite and talks; Pip walks in, waves his trunk and replies.
// Lip-sync: mouth opening follows the RMS loudness of each character's voice clip.

const TIA_LINE = { file: "test3d/tia.mp3", start: 10 };
const PIP_LINE = { file: "test3d/pip.mp3", start: 170 };

// 0..1 mouth opening from audio loudness at the current frame (smoothed over ±1 frame)
const useTalk = (file: string, startFrame: number) => {
  const audio = useAudioData(staticFile(file));
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!audio) return 0;
  const wave = audio.channelWaveforms[0];
  const rms = (tSec: number) => {
    const a = Math.floor(tSec * audio.sampleRate);
    const b = Math.floor((tSec + 1 / fps) * audio.sampleRate);
    if (a < 0 || b > wave.length) return 0;
    let sum = 0;
    for (let i = a; i < b; i++) sum += wave[i] * wave[i];
    return Math.sqrt(sum / Math.max(1, b - a));
  };
  const t = (frame - startFrame) / fps;
  if (t < 0 || t > audio.durationInSeconds) return 0;
  const v = (rms(t - 1 / fps) + 2 * rms(t) + rms(t + 1 / fps)) / 4;
  return Math.min(1, Math.max(0, (v - 0.015) * 6));
};

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera);
  const z = interpolate(frame, [0, durationInFrames], [9.8, 7.4], { easing: Easing.inOut(Easing.quad) });
  const lookY = interpolate(frame, [0, durationInFrames], [2.1, 1.75]);
  const x = interpolate(frame, [0, durationInFrames], [-0.25, 0.15]);
  useEffect(() => {
    camera.position.set(x, 2.2, z);
    camera.lookAt(0.1, lookY, 0);
  }, [camera, x, z, lookY]);
  return null;
};

const Tree: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.16, 0.24, 2.4, 20]} />
      <meshStandardMaterial color="#a0632e" roughness={0.9} />
    </mesh>
    {[
      [0, 2.9, 0, 1.05],
      [-0.75, 2.45, 0.1, 0.75],
      [0.75, 2.5, -0.1, 0.8],
      [0.1, 2.35, 0.55, 0.7],
    ].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]} castShadow>
        <sphereGeometry args={[r, 32, 32]} />
        <meshPhysicalMaterial color="#46c35a" roughness={0.6} clearcoat={0.3} />
      </mesh>
    ))}
    {[
      [-0.5, 2.6, 0.75],
      [0.55, 3.1, 0.8],
      [0.85, 2.3, 0.6],
      [-0.2, 3.3, 0.85],
    ].map(([x, y, z], i) => (
      <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshPhysicalMaterial color="#ff4d4d" clearcoat={1} roughness={0.2} />
      </mesh>
    ))}
  </group>
);

const Cloud: React.FC<{ position: [number, number, number]; s?: number }> = ({ position, s = 1 }) => (
  <group position={position} scale={s}>
    {[
      [0, 0, 0, 0.6],
      [-0.6, -0.15, 0, 0.42],
      [0.62, -0.12, 0, 0.45],
      [0.15, 0.3, 0, 0.45],
    ].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[r, 24, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
    ))}
  </group>
);

const KiteString: React.FC<{ from: THREE.Vector3; to: THREE.Vector3 }> = ({ from, to }) => {
  const geo = useMemo(() => {
    const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0.15, -0.25, 0));
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(from, mid, to), 32, 0.006, 6, false);
  }, [from, to]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
};

const World: React.FC<{ tiaTalk: number; pipTalk: number }> = ({ tiaTalk, pipTalk }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();
  const pipX = interpolate(frame, [0, 100], [3.2, 0.75], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const arrived = frame > 100;
  const trunk = arrived ? interpolate(frame, [100, 130], [0, 0.85], { extrapolateRight: "clamp" }) * (frame > 165 ? 0.6 : 1) : 0;
  const pipTurn = interpolate(frame, [PIP_LINE.start - 15, PIP_LINE.start], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  void dur;
  const kitePos: [number, number, number] = [-0.1 + Math.sin(frame / 14) * 0.25, 3.45 + Math.cos(frame / 11) * 0.12, -0.6];
  const tiaX = -0.65;
  const hand = new THREE.Vector3(tiaX + 0.46, 1.29, -0.02);
  const kiteBottom = new THREE.Vector3(kitePos[0], kitePos[1] - 0.38, kitePos[2]);

  return (
    <>
      <CameraRig />
      <hemisphereLight args={["#dff3ff", "#6fcf5a", 1.6]} />
      <directionalLight
        position={[3, 7, 5]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={6}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
        shadow-radius={6}
      />
      <ambientLight intensity={0.35} />

      {/* ground + hills */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color="#6fd651" roughness={0.95} />
      </mesh>
      <mesh position={[-5, -2.2, -9]} scale={[1.6, 0.6, 1]}>
        <sphereGeometry args={[5, 48, 48]} />
        <meshStandardMaterial color="#8ee06e" roughness={1} />
      </mesh>
      <mesh position={[5, -2.4, -10]} scale={[1.7, 0.6, 1]}>
        <sphereGeometry args={[5, 48, 48]} />
        <meshStandardMaterial color="#7fd862" roughness={1} />
      </mesh>
      {/* flowers */}
      {[
        [-1.7, 1.4, "#ff5fa2"],
        [1.8, 1.6, "#b07bff"],
        [-1.2, 2.6, "#ff9f1c"],
        [1.3, 2.8, "#ff5fa2"],
        [-0.3, 3.2, "#b07bff"],
        [2.3, 0.2, "#ff9f1c"],
      ].map(([x, z, c], i) => (
        <group key={i} position={[x as number, 0.03, z as number]}>
          {[0, 1, 2, 3, 4].map((k) => (
            <mesh key={k} position={[Math.cos((k * 2 * Math.PI) / 5) * 0.05, 0, Math.sin((k * 2 * Math.PI) / 5) * 0.05]} scale={[1, 0.4, 1]}>
              <sphereGeometry args={[0.04, 10, 10]} />
              <meshStandardMaterial color={c as string} />
            </mesh>
          ))}
          <mesh position={[0, 0.01, 0]}>
            <sphereGeometry args={[0.025, 10, 10]} />
            <meshStandardMaterial color="#ffd93b" />
          </mesh>
        </group>
      ))}
      <Tree position={[1.75, 0, -3.2]} />
      <Cloud position={[-2.2 + frame * 0.004, 5.6, -6]} s={1.1} />
      <Cloud position={[1.8 + frame * 0.003, 6.6, -7]} s={1.4} />

      <Kite3D position={kitePos} rotation={Math.sin(frame / 12) * 0.15} frame={frame} />
      <KiteString from={hand} to={kiteBottom} />
      <Tia3D
        position={[tiaX, 0, 0.1]}
        rotationY={0.25 + pipTurn * 0.3}
        frame={frame}
        armR={2.4 + Math.sin(frame / 10) * 0.05}
        elbowR={0.15}
        armL={-0.45 - tiaTalk * 0.5 - Math.sin(frame / 6) * 0.15 * Math.min(1, tiaTalk * 3)}
        elbowL={-0.9 - tiaTalk * 0.4}
        look={pipTurn > 0.5 ? [0.8, 0.1] : [0.3, 0.2]}
        talk={tiaTalk}
      />
      <Pip3D position={[pipX, 0, -0.1]} rotationY={-0.55 + pipTurn * 0.1} frame={frame} walk={!arrived} trunkUp={trunk} talk={pipTalk} />
    </>
  );
};

export const Test3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  const tiaTalk = useTalk(TIA_LINE.file, TIA_LINE.start);
  const pipTalk = useTalk(PIP_LINE.file, PIP_LINE.start);
  return (
    <AbsoluteFill style={{ fontFamily, background: "linear-gradient(180deg, #4fb8ff 0%, #9fdcff 55%, #d9f3ff 100%)" }}>
      {/* sun */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 90,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "radial-gradient(circle, #fff7b0 0%, #ffd93b 60%, #ffb703 100%)",
          boxShadow: "0 0 80px 30px rgba(255, 220, 80, 0.5)",
        }}
      />
      <Sequence from={TIA_LINE.start}>
        <Audio src={staticFile(TIA_LINE.file)} />
      </Sequence>
      <Sequence from={PIP_LINE.start}>
        <Audio src={staticFile(PIP_LINE.file)} />
      </Sequence>
      <ThreeCanvas width={width} height={height} shadows flat gl={{ alpha: true, antialias: true }} camera={{ fov: 38, position: [0, 1.5, 7.2] }}>
        <World tiaTalk={tiaTalk} pipTalk={pipTalk} />
      </ThreeCanvas>
      <AnimatedText
        scene={{
          id: 1,
          duration_sec: 5,
          narration: "",
          on_screen_text: "এ হলো *টিয়া!*",
          visual: "",
          text_animation: "pop",
          text_position: "top",
        }}
        theme={{ bg: "#4fb8ff", bg2: "#9fdcff", text: "#ffffff", accent: "#ff3b6b", stroke: "#1d3a6b", font: "BalooDa2" }}
      />
    </AbsoluteFill>
  );
};
