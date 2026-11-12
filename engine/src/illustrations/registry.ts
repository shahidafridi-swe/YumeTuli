// Code-drawn animated scenes, referenced from scenes.json via `scene.illustration`.
// Free alternative to AI images: characters and backgrounds are SVG + Remotion animation.
// Add a story: create src/stories/<story>/Scenes.tsx, register its scenes here as "<story>/<scene>".
import * as Ball from "../stories/ball/Scenes";
import * as Kite from "../stories/kite/Scenes";

import type { Scene, Theme } from "../types";
import { STRATEGY_P1 } from "../stories/design-patterns/strategy-p1/Scenes";
import { STRATEGY_P2 } from "../stories/design-patterns/strategy-p2/Scenes";
import { STRATEGY_P3 } from "../stories/design-patterns/strategy-p3/Scenes";
import { OBSERVER_P1 } from "../stories/design-patterns/observer-p1/Scenes";
import { OBSERVER_P2 } from "../stories/design-patterns/observer-p2/Scenes";
import { ZIPPER } from "../stories/hizibizi/zipper/Scenes";
import { SORBOT } from "../stories/hizibizi/sorbot/Scenes";
import { SPOON } from "../stories/hizibizi/spoon/Scenes";

export type IllustrationProps = { scene: Scene; theme: Theme };

export const ILLUSTRATIONS: Record<string, React.FC<IllustrationProps>> = {
  ...STRATEGY_P1,
  ...STRATEGY_P2,
  ...STRATEGY_P3,
  ...OBSERVER_P1,
  ...OBSERVER_P2,
  ...ZIPPER,
  ...SORBOT,
  ...SPOON,
  "ball/play": Ball.Play,
  "ball/splash": Ball.Splash,
  "ball/reach": Ball.Reach,
  "ball/rescue": Ball.Rescue,
  "ball/ending": Ball.Ending,
  "kite/flying": Kite.KiteFlying,
  "kite/stuck": Kite.KiteStuck,
  "kite/jumping": Kite.Jumping,
  "kite/pip-arrives": Kite.PipArrives,
  "kite/teamwork": Kite.Teamwork,
  "kite/free": Kite.KiteFree,
  "kite/happy-ending": Kite.HappyEnding,
};
