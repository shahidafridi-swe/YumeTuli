// Strategy Pattern series — Part 1: "Rubber Duck কেন উড়ছে?"
// Original script + visuals, inspired by the classic duck-simulator teaching example.
// Beat times (seconds from scene start) come from Whisper word timings of the voiceover
// (public/projects/strategy-p1-bn/audio/scene-N.words.json).
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { IllustrationProps } from "../../../illustrations/registry";
import { CodePanel } from "../../../tech/CodePanel";
import { Duck } from "../../../tech/Duck";
import { ClassBox, ExtendsArrow, Tag } from "../../../tech/Uml";
import { ease, pop, TECH, useT } from "../../../tech/anim";

const CODE_TOP = 945;

const Grid: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: "radial-gradient(rgba(56,189,248,0.10) 2px, transparent 2px)",
      backgroundSize: "44px 44px",
    }}
  />
);

const usePopAt = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number) => pop(frame, fps, at);
};

// 1 — Opening: a rubber duck is flying?!
const Opening: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const x = -200 + 740 * ease(t, 0, 1.2);
  return (
    <AbsoluteFill>
      <Grid />
      <Duck kind="rubber" x={x} y={900} size={240} fly={1} warn={ease(t, 2.0, 0.4)} />
      <Tag x={800} y={600} text="?!" color={TECH.orange} appear={p(0.9)} size={64} />
      <CodePanel
        title="index.php"
        top={CODE_TOP + 40}
        enterAt={1.5}
        lines={["<?php", "$duck = new RubberDuck();", "$duck->swim(); // Swimming!", "$duck->fly();  // Flying!?"]}
        highlights={[{ lines: [4], at: 2.1, color: "orange", label: "😱" }]}
      />
    </AbsoluteFill>
  );
};

// 2 — Duck parent class, MallardDuck & RubberDuck extend it
const Hierarchy: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill>
      <Grid />
      <ClassBox x={540} y={505} name="Duck" methods={[{ text: "+ swim()" }]} width={330} appear={p(3.0)} />
      <ExtendsArrow from={[300, 730]} to={[455, 640]} progress={ease(t, 5.3, 0.5)} />
      <ExtendsArrow from={[780, 730]} to={[625, 640]} progress={ease(t, 6.3, 0.5)} />
      <ClassBox x={300} y={730} name="MallardDuck" width={340} appear={p(5.1)} border={TECH.teal} />
      <ClassBox x={780} y={730} name="RubberDuck" width={340} appear={p(6.1)} border={TECH.teal} />
      <Tag x={540} y={680} text="extends" color={TECH.blue} appear={p(7.6)} size={28} />
      <CodePanel
        top={CODE_TOP}
        enterAt={2.8}
        lines={["class Duck {", "    public function swim() { /* … */ }", "}", "class MallardDuck extends Duck {}", "class RubberDuck extends Duck {}"]}
        reveal={{ 4: 5.1, 5: 6.1 }}
        highlights={[{ lines: [4, 5], at: 7.6, color: "teal", label: "extends" }]}
      />
    </AbsoluteFill>
  );
};

// 3 — fly() added to the parent → every duck can fly, even the rubber one
const AddFly: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const fly = ease(t, 2.4, 0.6);
  const warn = ease(t, 3.6, 0.3);
  return (
    <AbsoluteFill>
      <Grid />
      <Duck kind="mallard" x={300} y={900} size={200} fly={fly} ok={fly * (1 - warn) * 0.6} />
      <Duck kind="rubber" x={770} y={900} size={200} fly={fly} warn={warn} />
      <Tag x={300} y={530} text="Flying! ✓" color={TECH.teal} appear={p(2.6)} />
      <Tag x={770} y={530} text={t < 3.6 ? "Flying!" : "Flying!? ⚠"} color={t < 3.6 ? TECH.teal : TECH.orange} appear={p(2.8)} />
      <Tag x={770} y={590} text="RubberDuck-ও পেল!" color={TECH.orange} appear={p(5.4)} size={28} />
      <CodePanel
        top={CODE_TOP - 10}
        enterAt={0}
        lines={["class Duck {", "    public function swim() { /* … */ }", "    public function fly() {", '        echo "Flying!";', "    }", "}"]}
        reveal={{ 3: 2.2, 4: 2.2, 5: 2.2 }}
        highlights={[
          { lines: [3, 4, 5], at: 2.2, until: 5.4, color: "teal", label: "নতুন" },
          { lines: [3, 4, 5], at: 5.4, color: "orange", label: "সবাই inherit করে" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 4 — Override fly() in RubberDuck: valid, temporary fix
const Override: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const land = ease(t, 2.3, 0.8);
  const ok = ease(t, 4.0, 0.4);
  return (
    <AbsoluteFill>
      <Grid />
      <Duck kind="mallard" x={280} y={900} size={190} fly={1} />
      <Duck kind="rubber" x={770} y={900} size={200} fly={1 - land} warn={(1 - land) * 0.8} ok={ok} />
      <Tag x={770} y={540} text="✓ আপাতত ঠিক" color={TECH.teal} appear={p(4.0)} />
      <Tag x={770} y={605} text="override = valid fix" color={TECH.blue} appear={p(4.3)} size={28} />
      <CodePanel
        top={CODE_TOP + 10}
        title="RubberDuck.php"
        enterAt={0.2}
        lines={["class RubberDuck extends Duck {", "    public function fly() {", "        // রাবারের হাঁস ওড়ে না", "    }", "}"]}
        highlights={[{ lines: [2, 3, 4], at: 1.3, color: "teal", label: "override" }]}
      />
    </AbsoluteFill>
  );
};

// 5 — More duck types → behavior spread across subclasses, duplicate code
const MoreDucks: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const dup = t >= 5.1;
  const xs = [175, 405, 640, 880];
  return (
    <AbsoluteFill>
      <Grid />
      <Duck kind="mallard" x={xs[0]} y={880} size={150} fly={ease(t, 1.8, 0.5) * 0.5} />
      <Duck kind="rubber" x={xs[1]} y={880} size={150} warn={dup ? ease(t, 5.1, 0.3) : 0} />
      <div style={{ position: "absolute", inset: 0, opacity: p(0.5), transform: `translateY(${(1 - p(0.5)) * 40}px)` }}>
        <Duck kind="wooden" x={xs[2]} y={880} size={150} warn={dup ? ease(t, 5.1, 0.3) : 0} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: p(1.0), transform: `translateY(${(1 - p(1.0)) * 40}px)` }}>
        <Duck kind="robot" x={xs[3]} y={880} size={150} fly={ease(t, 3.0, 0.5) * 0.5} />
      </div>
      <Tag x={xs[0]} y={560} text="Flying!" color={TECH.teal} appear={p(1.7)} size={26} />
      <Tag x={xs[1]} y={560} text={dup ? "fly() {} copy" : "ওড়ে না"} color={dup ? TECH.orange : TECH.muted} appear={p(2.2)} size={26} />
      <Tag x={xs[2]} y={560} text={dup ? "fly() {} copy" : "ওড়ে না"} color={dup ? TECH.orange : TECH.muted} appear={p(2.7)} size={26} />
      <Tag x={xs[3]} y={560} text="🚀 Rocket!" color={TECH.blue} appear={p(3.2)} size={26} />
      <Tag x={540} y={500} text="✏️ পরিবর্তন = ২ জায়গায়" color={TECH.orange} appear={p(7.5)} size={30} />
      <CodePanel
        top={CODE_TOP - 10}
        title="Ducks.php"
        enterAt={3.4}
        lines={["class RubberDuck extends Duck {", "    public function fly() {}", "}", "class WoodenDuck extends Duck {", "    public function fly() {}", "}"]}
        highlights={[{ lines: [2], at: 5.1, color: "orange", label: "একই কোড" }, { lines: [5], at: 5.4, color: "orange", label: "আবার!" }]}
      />
    </AbsoluteFill>
  );
};

// 6 — Takeaway: not every Duck flies the same way
const Takeaway: React.FC<IllustrationProps> = () => {
  const p = usePopAt();
  const xs = [175, 405, 640, 880];
  const tags: [string, string][] = [
    ["Flying!", TECH.teal],
    ["✗", TECH.orange],
    ["✗", TECH.orange],
    ["🚀", TECH.blue],
  ];
  return (
    <AbsoluteFill>
      <Grid />
      <Duck kind="mallard" x={xs[0]} y={890} size={140} fly={0.45} />
      <Duck kind="rubber" x={xs[1]} y={890} size={140} />
      <Duck kind="wooden" x={xs[2]} y={890} size={140} />
      <Duck kind="robot" x={xs[3]} y={890} size={140} fly={0.45} />
      {tags.map(([txt, c], i) => (
        <Tag key={i} x={xs[i]} y={600} text={txt} color={c} appear={p(0.3 + i * 0.25)} size={28} />
      ))}
      <CodePanel
        top={CODE_TOP + 40}
        title="index.php"
        enterAt={0.2}
        lines={["$mallard->fly(); // Flying!", "$rubber->fly();  // …", "$wooden->fly();  // …", "$robot->fly();   // Rocket!"]}
        highlights={[
          { lines: [1], at: 0.6, color: "teal" },
          { lines: [2], at: 0.9, color: "orange" },
          { lines: [3], at: 1.2, color: "orange" },
          { lines: [4], at: 1.5, color: "teal" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 7 — Ending: what if the behavior lived separately? Next: Strategy Pattern
const Ending: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const move = ease(t, 0.5, 1.1);
  return (
    <AbsoluteFill>
      <Grid />
      <ClassBox
        x={300}
        y={520}
        name="Duck"
        width={320}
        methods={[{ text: "+ swim()" }, { text: "+ fly()", color: TECH.teal, opacity: 1 - 0.75 * move }]}
      />
      <ClassBox
        x={790}
        y={520}
        name="Fly ?"
        width={300}
        dashed
        border={TECH.teal}
        appear={ease(t, 0.5, 0.5)}
        methods={[{ text: "+ fly()", color: TECH.teal, opacity: move }]}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={465} y1={610} x2={635} y2={610} stroke={TECH.teal} strokeWidth={5} strokeDasharray="14 12" opacity={move} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 760,
          padding: "22px 30px",
          borderRadius: 28,
          background: "linear-gradient(90deg, rgba(45,212,191,0.95), rgba(56,189,248,0.95))",
          color: TECH.navy,
          fontFamily: `"Hind Siliguri", sans-serif`,
          fontWeight: 800,
          fontSize: 44,
          textAlign: "center",
          opacity: p(3.3),
          transform: `scale(${0.7 + 0.3 * p(3.3)})`,
          boxShadow: "0 20px 50px rgba(45,212,191,0.35)",
        }}
      >
        পরের পর্ব → Strategy Pattern
      </div>
      <CodePanel
        top={CODE_TOP + 40}
        enterAt={0}
        lines={["class Duck {", "    // fly() এখানে না রেখে…", "    // আলাদা জায়গায় রাখলে?", "}"]}
        highlights={[{ lines: [2, 3], at: 0.6, color: "teal" }]}
      />
    </AbsoluteFill>
  );
};

export const STRATEGY_P1: Record<string, React.FC<IllustrationProps>> = {
  "strategy/opening": Opening,
  "strategy/hierarchy": Hierarchy,
  "strategy/add-fly": AddFly,
  "strategy/override": Override,
  "strategy/more-ducks": MoreDucks,
  "strategy/takeaway": Takeaway,
  "strategy/ending": Ending,
};
