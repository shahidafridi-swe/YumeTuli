// hizibizi · Why Is That? — "Spoon mirror test" (YumeTuli #14). Same script as the spoon episode,
// so it reuses those scenes, wrapped in StagePage (house centring: SHIFT 85, logo_top 141, caption_bottom 145).
// Content block keeps its original on-screen position (85 + 35 = 120 px down); the badge lines up with the logo (141).
import type { IllustrationProps } from "../../../illustrations/registry";
import { SPOON, SpoonLayoutContext, type SpoonLayout } from "../spoon/Scenes";
import { SHIFT, StagePage } from "../common";

const CREAM = "#FFF4E2";
const LAYOUT: SpoonLayout = { shift: 120 - SHIFT, badgeTop: 141 - SHIFT, overscan: true, paper: false, legendPlate: true };

const wrap = (Scene: React.FC<IllustrationProps>): React.FC<IllustrationProps> => {
  const Wrapped: React.FC<IllustrationProps> = (props) => (
    <StagePage bg={CREAM} card={CREAM}>
      <SpoonLayoutContext.Provider value={LAYOUT}>
        <Scene {...props} />
      </SpoonLayoutContext.Provider>
    </StagePage>
  );
  return Wrapped;
};

export const SPOON_TEST = {
  "spoon-mirror-test/hook": wrap(SPOON["spoon/hook"]),
  "spoon-mirror-test/close": wrap(SPOON["spoon/close"]),
  "spoon-mirror-test/curve": wrap(SPOON["spoon/curve"]),
  "spoon-mirror-test/far": wrap(SPOON["spoon/far"]),
  "spoon-mirror-test/near": wrap(SPOON["spoon/near"]),
  "spoon-mirror-test/end": wrap(SPOON["spoon/end"]),
};
