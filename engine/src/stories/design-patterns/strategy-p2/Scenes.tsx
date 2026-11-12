// Strategy Pattern series — Part 2: "Strategy Pattern দিয়ে সমাধান"
// Original script + visuals. Beat times (seconds from scene start) come from the aligned captions
// (public/projects/strategy-p2-bn/scenes.json → captions, from Whisper word timings).
// Full runnable PHP: public/projects/strategy-p2-bn/source/strategy.php
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { IllustrationProps } from "../../../illustrations/registry";
import { CodePanel } from "../../../tech/CodePanel";
import { Duck } from "../../../tech/Duck";
import { Arrow, ClassBox, Tag } from "../../../tech/Uml";
import { ease, pop, TECH, useT } from "../../../tech/anim";

// Vertical budget: title ≈ 230–400, diagram 430–880, code 900–1320, captions ≈ 1360–1540.
const CODE_TOP = 900;

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

// Small dot that travels along a line (used for delegation / injection)
const Packet: React.FC<{ from: [number, number]; to: [number, number]; at: number; dur: number; color?: string; label?: string }> = ({
  from,
  to,
  at,
  dur,
  color = TECH.teal,
  label,
}) => {
  const t = useT();
  if (t < at || t > at + dur + 0.15) return null;
  const k = interpolate(t, [at, at + dur], [0, 1], { extrapolateRight: "clamp" });
  const x = from[0] + (to[0] - from[0]) * k;
  const y = from[1] + (to[1] - from[1]) * k;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 26, height: 26, borderRadius: 13, background: color, boxShadow: `0 0 24px ${color}` }} />
      {label ? <div style={{ color, fontFamily: '"Hind Siliguri", sans-serif', fontWeight: 700, fontSize: 28, whiteSpace: "nowrap" }}>{label}</div> : null}
    </div>
  );
};

// 1 — Recap: mallard flies, rubber duck doesn't — same Duck family, different behavior
const Recap: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill>
      <Grid />
      <Duck kind="rubber" x={780} y={820} size={190} ok={0} />
      <Tag x={780} y={560} text="ওড়ে না" color={TECH.blue} appear={p(1.0)} size={34} />
      <Duck kind="mallard" x={300} y={820} size={190} fly={ease(t, 2.3, 0.6)} />
      <Tag x={300} y={470} text="ওড়ে ✓" color={TECH.teal} appear={p(2.6)} size={34} />
      {/* same family bracket */}
      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          top: 860,
          height: 18,
          borderLeft: `4px solid ${TECH.blue}`,
          borderRight: `4px solid ${TECH.blue}`,
          borderBottom: `4px solid ${TECH.blue}`,
          borderRadius: "0 0 14px 14px",
          opacity: ease(t, 3.7, 0.4),
        }}
      />
      <CodePanel
        title="Part 1 recap"
        top={CODE_TOP + 40}
        enterAt={3.7}
        fontSize={34}
        lines={["class MallardDuck extends Duck {}", "class RubberDuck extends Duck {}", "// একই Duck family…", "// কিন্তু ওড়ার আচরণ আলাদা?"]}
        highlights={[
          { lines: [1, 2], at: 4.0, until: 5.2, color: "teal", label: "Duck family" },
          { lines: [4], at: 5.2, color: "orange", label: "কীভাবে?" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 2 — Pull fly() out of Duck into a FlyBehavior interface
const Interface: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const out = ease(t, 0.9, 1.0);
  return (
    <AbsoluteFill>
      <Grid />
      <ClassBox x={270} y={480} name="Duck" width={320} methods={[{ text: "+ swim()" }, { text: "+ fly()", opacity: 1 - out }]} />
      {/* fly() travelling out of Duck */}
      <div
        style={{
          position: "absolute",
          left: 150 + 470 * out,
          top: 595 - 40 * out,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 28,
          color: TECH.teal,
          opacity: out > 0 && out < 1 ? 1 : 0,
        }}
      >
        + fly()
      </div>
      <ClassBox
        x={790}
        y={470}
        name="FlyBehavior"
        stereo="«interface»"
        width={360}
        border={TECH.teal}
        dashed={t < 4.5}
        appear={ease(t, 1.4, 0.4)}
        glow={ease(t, 4.6, 0.3) * (1 - ease(t, 5.6, 0.5))}
        methods={[{ text: "+ fly(): string", color: TECH.teal, opacity: ease(t, 1.9, 0.3) }]}
      />
      <CodePanel
        title="FlyBehavior.php"
        top={CODE_TOP + 40}
        enterAt={3.3}
        lines={["interface FlyBehavior", "{", "    public function fly(): string;", "}"]}
        highlights={[
          { lines: [1], at: 3.7, until: 6.6, color: "teal", label: "interface" },
          { lines: [3], at: 6.6, color: "teal", label: "শুধু signature" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 3 — Two concrete strategies implement FlyBehavior
const Concrete: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const lines = (cls: string, msg: string) => [`class ${cls}`, "    implements FlyBehavior", "{", "    public function fly(): string {", `        return "${msg}";`, "    }"];
  return (
    <AbsoluteFill>
      <Grid />
      <ClassBox x={540} y={430} name="FlyBehavior" stereo="«interface»" width={360} border={TECH.teal} methods={[{ text: "+ fly(): string", color: TECH.teal }]} />
      <ClassBox x={285} y={700} name="FlyWithWings" width={350} nameSize={32} appear={p(0.9)} glow={ease(t, 3.1, 0.3) * (1 - ease(t, 5.4, 0.3))} />
      <ClassBox x={795} y={700} name="FlyNoWay" width={350} nameSize={32} appear={p(1.2)} glow={ease(t, 5.6, 0.3)} />
      <Arrow from={[285, 700]} to={[460, 625]} dashed head="hollow" color={TECH.teal} progress={ease(t, 1.9, 0.5)} />
      <Arrow from={[795, 700]} to={[620, 625]} dashed head="hollow" color={TECH.teal} progress={ease(t, 2.1, 0.5)} />
      <Tag x={540} y={660} text="implements" color={TECH.teal} appear={p(2.3)} size={26} />
      <Tag x={285} y={800} text="ডানা দিয়ে উড়ছি!" color={TECH.teal} appear={p(4.3)} size={30} />
      <Tag x={795} y={800} text="আমি উড়তে পারি না।" color={TECH.blue} appear={p(7.0)} size={30} />
      <CodePanel
        title="FlyWithWings.php"
        top={CODE_TOP + 20}
        enterAt={0.5}
        exitAt={5.4}
        fontSize={32}
        lines={lines("FlyWithWings", "ডানা দিয়ে উড়ছি!")}
        highlights={[
          { lines: [2], at: 1.92, until: 3.06, color: "teal", label: "implements" },
          { lines: [1], at: 3.06, until: 4.28, color: "teal" },
          { lines: [5], at: 4.28, color: "teal", label: "return" },
        ]}
      />
      <CodePanel
        title="FlyNoWay.php"
        top={CODE_TOP + 20}
        enterAt={5.5}
        fontSize={32}
        lines={lines("FlyNoWay", "আমি উড়তে পারি না।")}
        highlights={[
          { lines: [1], at: 5.64, until: 6.98, color: "teal" },
          { lines: [5], at: 6.98, color: "teal", label: "return" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 4 — Duck stores a FlyBehavior (has-a), received through the constructor
const Constructor: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill>
      <Grid />
      <ClassBox
        x={270}
        y={470}
        name="Duck"
        width={340}
        methods={[
          { text: "- flyBehavior", color: TECH.teal, opacity: ease(t, 3.1, 0.4) },
          { text: "+ swim()" },
          { text: "+ fly() { … }", strike: ease(t, 1.3, 0.6), opacity: 1 - 0.6 * ease(t, 2.2, 0.5) },
        ]}
      />
      <Tag x={270} y={420} text="নিজে ওড়ে না" color={TECH.orange} appear={p(1.4) * (1 - ease(t, 2.9, 0.3))} size={28} />
      <ClassBox x={800} y={470} name="FlyBehavior" stereo="«interface»" width={330} border={TECH.teal} appear={p(3.0)} methods={[{ text: "+ fly(): string", color: TECH.teal }]} />
      <Arrow from={[442, 560]} to={[633, 560]} head="open" color={TECH.teal} progress={ease(t, 3.4, 0.5)} label="has-a" labelAppear={ease(t, 4.0, 0.3)} />
      <CodePanel
        title="Duck.php"
        top={CODE_TOP}
        enterAt={0.4}
        fontSize={32}
        lines={[
          "private FlyBehavior $flyBehavior;",
          "",
          "public function __construct(",
          "    FlyBehavior $flyBehavior",
          ") {",
          "    $this->flyBehavior = $flyBehavior;",
        ]}
        highlights={[
          { lines: [3, 4], at: 2.8, until: 3.9, color: "teal", label: "receive" },
          { lines: [6], at: 3.9, until: 4.5, color: "teal", label: "store" },
          { lines: [1], at: 4.5, color: "teal", label: "private typed" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 5 — performFly() delegates to $this->flyBehavior->fly()
const Delegate: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill>
      <Grid />
      <ClassBox x={270} y={480} name="Duck" width={340} glow={ease(t, 0.5, 0.3) * (1 - ease(t, 2.3, 0.3))} methods={[{ text: "- flyBehavior", color: TECH.teal }, { text: "+ performFly()", color: TECH.text }]} />
      <ClassBox x={800} y={480} name="FlyBehavior" stereo="«interface»" width={330} border={TECH.teal} glow={ease(t, 3.4, 0.3) * (1 - ease(t, 4.6, 0.4))} methods={[{ text: "+ fly(): string", color: TECH.teal }]} />
      <Arrow from={[442, 640]} to={[633, 640]} head="open" color={TECH.teal} progress={ease(t, 2.3, 0.5)} label="delegates" labelAppear={ease(t, 2.6, 0.3)} />
      <Tag x={180} y={420} text="call" color={TECH.blue} appear={p(1.3) * (1 - ease(t, 2.5, 0.3))} size={26} />
      {/* call travels Duck → FlyBehavior, result travels back */}
      <Packet from={[442, 690]} to={[633, 690]} at={2.6} dur={0.9} label="fly()" />
      <Packet from={[633, 760]} to={[442, 760]} at={3.9} dur={0.9} color={TECH.blue} label="string" />
      <Tag x={540} y={790} text="delegation" color={TECH.teal} appear={p(5.6)} size={44} />
      <CodePanel
        title="Duck.php"
        top={CODE_TOP + 40}
        enterAt={0.3}
        lines={["public function performFly(): string", "{", "    return $this->flyBehavior->fly();", "}"]}
        fontSize={34}
        highlights={[
          { lines: [1], at: 0.52, until: 2.6, color: "teal", label: "call" },
          { lines: [3], at: 2.6, color: "teal", label: "কাজ দিয়ে দেয়" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 6 — Subclasses pass their strategy through the inherited constructor
const Inject: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const woodIn = ease(t, 4.4, 0.6);
  return (
    <AbsoluteFill>
      <Grid />
      <Duck kind="mallard" x={210} y={820} size={150} fly={ease(t, 1.6, 0.6)} />
      <Duck kind="rubber" x={540} y={820} size={150} />
      <AbsoluteFill style={{ opacity: woodIn, transform: `translateX(${(1 - woodIn) * 80}px)` }}>
        <Duck kind="wooden" x={870} y={820} size={150} />
      </AbsoluteFill>
      {/* strategy chips dropping onto ducks */}
      <Tag x={210} y={interpolate(ease(t, 1.04, 0.5), [0, 1], [400, 455])} text="FlyWithWings" color={TECH.teal} appear={p(1.04)} size={26} />
      <Tag x={540} y={interpolate(ease(t, 3.18, 0.5), [0, 1], [400, 455])} text="FlyNoWay" color={TECH.blue} appear={p(3.18)} size={26} />
      <Tag x={870} y={interpolate(ease(t, 5.9, 0.5), [0, 1], [400, 455])} text="FlyNoWay" color={TECH.blue} appear={p(5.9)} size={26} />
      <Tag x={705} y={455} text="♻ reuse" color={TECH.teal} appear={p(6.3)} size={30} />
      <Tag x={210} y={855} text="ডানা দিয়ে উড়ছি!" color={TECH.teal} appear={p(3.9)} size={24} />
      <Tag x={540} y={855} text="উড়তে পারি না।" color={TECH.blue} appear={p(4.1)} size={24} />
      <CodePanel
        title="index.php"
        top={CODE_TOP + 10}
        side={56}
        fontSize={29}
        enterAt={0}
        lines={[
          "class MallardDuck extends Duck {}",
          "class RubberDuck extends Duck {}",
          "$mallard = new MallardDuck(new FlyWithWings());",
          "$rubber = new RubberDuck(new FlyNoWay());",
          "echo $mallard->performFly();",
          "echo $rubber->performFly();",
        ]}
        highlights={[
          { lines: [1, 2], at: 0, until: 1.04, color: "teal", label: "extends Duck" },
          { lines: [3], at: 1.04, until: 2.32, color: "teal" },
          { lines: [4], at: 2.32, until: 3.7, color: "teal" },
          { lines: [5], at: 3.7, until: 4.1, color: "teal" },
          { lines: [6], at: 4.1, until: 5.4, color: "teal" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 7 — Swap the strategy at runtime with a setter: same object, new behavior
const Runtime: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const swap = ease(t, 4.38, 0.5);
  const fly = 1 - ease(t, 4.7, 0.8);
  return (
    <AbsoluteFill>
      <Grid />
      <Duck kind="mallard" x={540} y={880} size={180} fly={fly} ok={ease(t, 5.84, 0.3) * (1 - ease(t, 7.0, 0.3))} />
      <Tag x={540} y={415} text="$mallard" color={TECH.blue} appear={p(0.3)} size={30} />
      {/* old chip leaves, new chip comes in */}
      <Tag x={540 - 380 * swap} y={478} text="FlyWithWings" color={TECH.teal} appear={1 - swap} size={28} />
      <Tag x={540 + 380 * (1 - swap)} y={478} text="FlyNoWay" color={TECH.blue} appear={swap} size={28} />
      <Tag x={250} y={760} text="একই object" color={TECH.teal} appear={p(5.84)} size={28} />
      <Tag x={820} y={640} text="behavior বদলালো" color={TECH.orange} appear={p(7.84)} size={28} />
      <CodePanel
        title="Duck.php"
        top={CODE_TOP + 20}
        enterAt={0.2}
        exitAt={4.95}
        fontSize={32}
        lines={["public function setFlyBehavior(", "    FlyBehavior $flyBehavior", "): void {", "    $this->flyBehavior = $flyBehavior;", "}"]}
        highlights={[
          { lines: [1], at: 2.18, until: 3.6, color: "teal", label: "setter" },
          { lines: [4], at: 3.6, color: "teal", label: "property update" },
        ]}
      />
      <CodePanel
        title="index.php"
        top={CODE_TOP + 20}
        enterAt={5.0}
        fontSize={32}
        lines={["echo $mallard->performFly();", "// ডানা দিয়ে উড়ছি!", "$mallard->setFlyBehavior(new FlyNoWay());", "echo $mallard->performFly();", "// আমি উড়তে পারি না।"]}
        highlights={[
          { lines: [3], at: 5.1, until: 5.84, color: "teal", label: "setter" },
          { lines: [1, 4], at: 5.84, until: 7.84, color: "teal", label: "একই $mallard" },
          { lines: [4, 5], at: 7.84, color: "orange", label: "নতুন result" },
        ]}
      />
    </AbsoluteFill>
  );
};

// 8 — Recap diagram: Context / Strategy interface / Concrete strategies
const Diagram: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  const ctx = ease(t, 6.82, 0.3);
  const strat = ease(t, 8.28, 0.3);
  const conc = ease(t, 10.79, 0.3);
  const rows = [
    { at: 1.71, text: "একই কাজ, বিভিন্ন পদ্ধতি" },
    { at: 3.42, text: "প্রতিটা পদ্ধতি আলাদা object-এ" },
    { at: 4.94, text: "প্রয়োজনমতো বেছে নাও" },
  ];
  return (
    <AbsoluteFill>
      <Grid />
      <ClassBox x={250} y={450} name="Duck" width={300} appear={p(0.2)} glow={ctx * (1 - ease(t, 8.2, 0.3))} methods={[{ text: "- flyBehavior" }, { text: "+ performFly()" }]} />
      <ClassBox x={800} y={450} name="FlyBehavior" stereo="«interface»" width={330} border={TECH.teal} appear={p(0.4)} glow={strat * (1 - ease(t, 10.7, 0.3))} methods={[{ text: "+ fly(): string", color: TECH.teal }]} />
      <Arrow from={[400, 560]} to={[635, 560]} head="open" color={TECH.teal} progress={ease(t, 0.6, 0.4)} label="has-a" />
      <ClassBox x={560} y={745} name="FlyWithWings" width={280} nameSize={30} appear={p(0.7)} glow={conc} />
      <ClassBox x={880} y={745} name="FlyNoWay" width={230} nameSize={30} appear={p(0.8)} glow={conc} />
      <Arrow from={[600, 745]} to={[760, 655]} dashed head="hollow" color={TECH.teal} progress={ease(t, 0.9, 0.4)} />
      <Arrow from={[880, 745]} to={[840, 655]} dashed head="hollow" color={TECH.teal} progress={ease(t, 1.0, 0.4)} />
      {/* role labels */}
      <Tag x={250} y={395} text="Context" color={TECH.blue} appear={p(6.82)} size={32} />
      <Tag x={800} y={395} text="Strategy interface" color={TECH.teal} appear={p(9.34)} size={30} />
      <Tag x={720} y={845} text="Concrete strategies" color={TECH.teal} appear={p(11.8)} size={30} />
      {/* definition card */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 960,
          padding: "26px 34px",
          borderRadius: 28,
          background: TECH.panel,
          border: `2px solid ${TECH.border}`,
          opacity: ease(t, 1.5, 0.4),
          fontFamily: '"Hind Siliguri", sans-serif',
          fontWeight: 700,
          fontSize: 40,
          color: TECH.text,
          lineHeight: 1.55,
        }}
      >
        {rows.map((r) => (
          <div key={r.at} style={{ opacity: ease(t, r.at, 0.35), transform: `translateX(${(1 - ease(t, r.at, 0.35)) * 40}px)` }}>
            <span style={{ color: TECH.teal }}>✓ </span>
            {r.text}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 9 — Ending teaser
const Ending: React.FC<IllustrationProps> = () => {
  const t = useT();
  const p = usePopAt();
  return (
    <AbsoluteFill>
      <Grid />
      <Duck kind="mallard" x={-150 + 1400 * ease(t, 0, 4.2)} y={760} size={180} fly={1} />
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 900,
          padding: "30px 30px",
          borderRadius: 30,
          textAlign: "center",
          background: `linear-gradient(135deg, ${TECH.teal}, ${TECH.blue})`,
          color: TECH.navy,
          fontFamily: '"Hind Siliguri", sans-serif',
          fontWeight: 700,
          fontSize: 46,
          transform: `scale(${0.7 + 0.3 * p(0.3)})`,
          opacity: p(0.3),
        }}
      >
        পরের পর্ব → বাস্তব কাজে Strategy
      </div>
      <Tag x={540} y={1080} text="Dev Diary · Strategy Pattern সিরিজ" color={TECH.panel2} dark={false} appear={p(1.2)} size={28} />
    </AbsoluteFill>
  );
};

export const STRATEGY_P2 = {
  "strategy2/recap": Recap,
  "strategy2/interface": Interface,
  "strategy2/concrete": Concrete,
  "strategy2/constructor": Constructor,
  "strategy2/delegate": Delegate,
  "strategy2/inject": Inject,
  "strategy2/runtime": Runtime,
  "strategy2/diagram": Diagram,
  "strategy2/ending": Ending,
};
