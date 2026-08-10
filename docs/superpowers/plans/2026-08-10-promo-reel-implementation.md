# रास्ता रेडियो Promo Reel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render a 28-second silent animated promo reel for rastaradio.tech in 1080×1920 and 1080×1080, covering all four playlist modes and animating the real interaction flow.

**Architecture:** A new `apps/reel` Remotion package imports the live site's own `SceneStage` SVG art, `indian-playlist.css`, and curated track data through a webpack alias, then re-choreographs them on a frame-indexed timeline. The dependency runs one way — the reel imports `apps/web`, never the reverse — so the reel can never break the live site. Pure logic (timeline ranges, layout boxes, gesture positions, reveal math) lives in testable modules with no React; components consume those modules and are verified by PNG spot-renders.

**Tech Stack:** Remotion 4 (React video, bundles its own ffmpeg), React 19.1.0, TypeScript 5.9, Vitest, pnpm workspaces.

## Global Constraints

- **Duration is exactly 840 frames at 30fps (28.0s).** Never change one without the other.
- **Vertical is 1080×1920; square is 1080×1080.** Square is a re-layout, not a crop.
- **Instagram safe area (vertical):** all content within `x ∈ [80, 1000]`, `y ∈ [280, 1560]`.
- **Never modify `minimumReleaseAge` in `pnpm-workspace.yaml`.** It is a supply-chain defence. If a package version is younger than 1 day, pin to an older patch instead.
- **React must be `catalog:`** — the workspace pins `19.1.0` and Remotion must match the site's React.
- **Only one line of `apps/web` may change:** `const modes` → `export const modes`. No other edit to the site is authorised by this plan.
- **Marketing copy must be true.** Never claim "no ads" — the YouTube iframe can serve them. Permitted claims: non-stop, four modes, hand-curated Devanagari track names, swipe to switch, no sign-up.
- **Mode order is `driver → rainy → party → ghazal`**, matching `modeOrder` in `IndianPlaylist.tsx`.
- **Accent colors come from `modes[x].accent` in `apps/web`.** Never hard-code a hex that duplicates one.
- All commands run from the repo root unless stated; Remotion CLI commands run from `apps/reel`.

---

### Task 1: Scaffold the Remotion package and prove Devanagari renders

Nothing else can be verified until a frame can actually be rendered with the right fonts. This task ends with a PNG on disk showing `बादलों के पार, सफ़र जारी है` in Yatra One over the real Ladakh scene.

**Files:**
- Create: `apps/reel/package.json`
- Create: `apps/reel/tsconfig.json`
- Create: `apps/reel/remotion.config.ts`
- Create: `apps/reel/vitest.config.ts`
- Create: `apps/reel/src/fonts.ts`
- Create: `apps/reel/src/index.ts`
- Create: `apps/reel/src/Root.tsx`
- Create: `apps/reel/src/Probe.tsx`
- Create: `apps/reel/.gitignore`
- Modify: `apps/web/src/components/mockups/indian-playlist/IndianPlaylist.tsx:35`

**Interfaces:**
- Consumes: nothing.
- Produces: `@site/*` alias resolving to `apps/web/src/*`; `loadReelFonts(): {display: string; body: string; mono: string}` from `src/fonts.ts`; the exported `modes` record from `@site/components/mockups/indian-playlist/IndianPlaylist`.

- [ ] **Step 1: Create the package manifest**

`apps/reel/package.json`:

```json
{
  "name": "@workspace/reel",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "studio": "remotion studio",
    "render:vertical": "remotion render ReelVertical out/rasta-reel-9x16.mp4 --codec=h264 --crf=18 --enforce-audio-track",
    "render:square": "remotion render ReelSquare out/rasta-reel-1x1.mp4 --codec=h264 --crf=18 --enforce-audio-track",
    "render:cover": "remotion still ReelVertical out/cover.png --frame=90",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@remotion/cli": "^4.0.0",
    "@remotion/google-fonts": "^4.0.0",
    "remotion": "^4.0.0",
    "react": "catalog:",
    "react-dom": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "typescript": "~5.9.3",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Create the TypeScript config with the `@site` path mapping**

`apps/reel/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "types": ["node"],
    "noEmit": true,
    "allowImportingTsExtensions": false,
    "baseUrl": ".",
    "paths": {
      "@site/*": ["../web/src/*"]
    }
  },
  "include": ["src", "remotion.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 3: Create the Remotion config with the webpack alias**

`apps/reel/remotion.config.ts`:

```ts
import { Config } from "@remotion/cli/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteSrc = path.resolve(here, "..", "web", "src");

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(4);

Config.overrideWebpackConfig((current) => ({
  ...current,
  resolve: {
    ...current.resolve,
    alias: {
      ...current.resolve?.alias,
      "@site": siteSrc,
    },
  },
}));
```

- [ ] **Step 4: Create the Vitest config and gitignore**

`apps/reel/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "@site": path.resolve(here, "..", "web", "src") },
  },
  test: { environment: "node" },
});
```

`apps/reel/.gitignore`:

```
out/
```

- [ ] **Step 5: Export `modes` from the site**

In `apps/web/src/components/mockups/indian-playlist/IndianPlaylist.tsx`, change line 35 from:

```ts
const modes: Record<PlaylistMode, {
```

to:

```ts
export const modes: Record<PlaylistMode, {
```

This is the only permitted change to `apps/web`.

- [ ] **Step 6: Write the font loader**

`apps/reel/src/fonts.ts`:

```ts
import { loadFont as loadYatra } from "@remotion/google-fonts/YatraOne";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansDevanagari";
import { loadFont as loadMono } from "@remotion/google-fonts/DMMono";

export interface ReelFonts {
  display: string;
  body: string;
  mono: string;
}

/**
 * The site loads these three faces through a remote CSS `@import`, which races
 * Remotion's first frame and silently falls back. Loading them here instead
 * blocks rendering until the faces are actually available.
 */
export function loadReelFonts(): ReelFonts {
  const yatra = loadYatra("normal", { weights: ["400"], subsets: ["devanagari", "latin"] });
  const noto = loadNoto("normal", { weights: ["400", "500", "600", "700"], subsets: ["devanagari"] });
  const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });
  return {
    display: yatra.fontFamily,
    body: noto.fontFamily,
    mono: mono.fontFamily,
  };
}
```

- [ ] **Step 7: Write the probe composition**

`apps/reel/src/Probe.tsx`:

```tsx
import { AbsoluteFill } from "remotion";
import { SceneStage } from "@site/components/mockups/indian-playlist/Scene";
import { modes } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import "@site/components/mockups/indian-playlist/indian-playlist.css";
import { loadReelFonts } from "./fonts";

const fonts = loadReelFonts();

/** Throwaway composition proving fonts, the `@site` alias and SVG art all work. */
export function Probe() {
  return (
    <AbsoluteFill className="indian-playlist mode-driver" style={{ padding: 0 }}>
      <SceneStage mode="driver" />
      <AbsoluteFill style={{ zIndex: 5, justifyContent: "flex-end", padding: 80 }}>
        <h1 style={{ fontFamily: fonts.display, fontSize: 96, lineHeight: 1.1, color: "#fff4e8", margin: 0 }}>
          {modes.driver.title}
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 34, color: modes.driver.accent, margin: "16px 0 0" }}>
          {modes.driver.chip}
        </p>
        <p style={{ fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: "#fff4e8", margin: "24px 0 0" }}>
          MOUNTAIN HIGHWAY. WINDOWS DOWN.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 8: Register the root**

`apps/reel/src/Root.tsx`:

```tsx
import { Composition } from "remotion";
import { Probe } from "./Probe";

export function RemotionRoot() {
  return (
    <Composition
      id="Probe"
      component={Probe}
      durationInFrames={30}
      fps={30}
      width={1080}
      height={1920}
    />
  );
}
```

`apps/reel/src/index.ts`:

```ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

Remotion's CLI looks for the entry point at `src/index.ts` by default, so no extra config is needed.

- [ ] **Step 9: Install**

Run from the repo root:

```bash
pnpm install
```

Expected: `@workspace/reel` is picked up by the existing `apps/*` glob in `pnpm-workspace.yaml`; Remotion downloads a headless Chrome shell (~150MB) on first install.

If install fails with a `minimumReleaseAge` error, the newest Remotion patch is under a day old. **Do not disable the setting.** Instead run `pnpm view remotion versions --json | tail -20`, pick a version published more than 24 hours ago, and pin all three Remotion packages to that exact version.

- [ ] **Step 10: Render the probe frame and inspect it**

```bash
cd apps/reel && npx remotion still Probe out/probe.png --frame=0
```

Expected: `apps/reel/out/probe.png` exists at 1080×1920.

Open it and confirm all four of these, which is the entire point of this task:
1. The Ladakh mountains, prayer flags and red bus are drawn (the `@site` alias resolved).
2. `बादलों के पार, सफ़र जारी है` renders in Yatra One — a heavy display face with a solid unbroken shirorekha — **not** a generic fallback.
3. Conjuncts and matras are correctly shaped: `फ़` keeps its nuqta, `बा` and `के` place their matras correctly.
4. The mono line is letterspaced and monospaced.

If the Devanagari is shaped wrongly or shows tofu boxes, stop and fix font loading before continuing — every later task depends on it.

- [ ] **Step 11: Verify typecheck passes across the workspace**

```bash
cd /Users/shivamsourav/Desktop/AI/Rasta && pnpm run typecheck
```

Expected: PASS, including `apps/web` (proving the `export` change broke nothing).

- [ ] **Step 12: Commit**

```bash
git add apps/reel apps/web/src/components/mockups/indian-playlist/IndianPlaylist.tsx pnpm-lock.yaml
git commit -m "feat(reel): scaffold Remotion package with site alias and font loading"
```

---

### Task 2: Timeline, layout and copy modules

Pure data and math with no React, so all of it is unit-testable. Locking the frame ranges and safe-area boxes down here prevents drift later.

**Files:**
- Create: `apps/reel/src/timeline.ts`
- Create: `apps/reel/src/timeline.test.ts`
- Create: `apps/reel/src/layout.ts`
- Create: `apps/reel/src/layout.test.ts`
- Create: `apps/reel/src/copy.ts`
- Create: `apps/reel/src/copy.test.ts`

**Interfaces:**
- Consumes: `modes`, `PlaylistMode` from `@site/...IndianPlaylist`.
- Produces:
  - `FPS: 30`, `DURATION_IN_FRAMES: 840`, `BEATS: Beat[]`, `beat(name: BeatName): Beat`, `localProgress(frame: number, b: Beat): number`
  - `type Format = "vertical" | "square"`, `layoutFor(format: Format): Layout`
  - `MODE_RAIL: Record<PlaylistMode, string>`, `HOOK_RAIL`, `FEATURE_RAIL: [string, string, string]`, `CTA_RAIL`, `CTA_URL`

- [ ] **Step 1: Write the failing timeline test**

`apps/reel/src/timeline.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { BEATS, DURATION_IN_FRAMES, FPS, beat, localProgress } from "./timeline";

describe("timeline", () => {
  it("runs exactly 28 seconds", () => {
    expect(DURATION_IN_FRAMES / FPS).toBe(28);
  });

  it("has contiguous beats with no gaps or overlaps", () => {
    let cursor = 0;
    for (const b of BEATS) {
      expect(b.from).toBe(cursor);
      cursor += b.durationInFrames;
    }
    expect(cursor).toBe(DURATION_IN_FRAMES);
  });

  it("gives every mode a 4 second block", () => {
    for (const name of ["driver", "rainy", "party", "ghazal"] as const) {
      expect(beat(name).durationInFrames).toBe(120);
    }
  });

  it("reports progress within a beat as 0 at its start and 1 at its end", () => {
    const b = beat("driver");
    expect(localProgress(b.from, b)).toBe(0);
    expect(localProgress(b.from + b.durationInFrames, b)).toBe(1);
    expect(localProgress(b.from + 60, b)).toBeCloseTo(0.5);
  });

  it("clamps progress outside the beat", () => {
    const b = beat("driver");
    expect(localProgress(0, b)).toBe(0);
    expect(localProgress(839, b)).toBe(1);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @workspace/reel run test
```

Expected: FAIL — cannot resolve `./timeline`.

- [ ] **Step 3: Implement the timeline**

`apps/reel/src/timeline.ts`:

```ts
export const FPS = 30;
export const DURATION_IN_FRAMES = 840;

export type BeatName =
  | "hook"
  | "driver"
  | "rainy"
  | "party"
  | "ghazal"
  | "feature1"
  | "feature2"
  | "feature3"
  | "cta";

export interface Beat {
  name: BeatName;
  from: number;
  durationInFrames: number;
}

export const BEATS: Beat[] = [
  { name: "hook", from: 0, durationInFrames: 105 },
  { name: "driver", from: 105, durationInFrames: 120 },
  { name: "rainy", from: 225, durationInFrames: 120 },
  { name: "party", from: 345, durationInFrames: 120 },
  { name: "ghazal", from: 465, durationInFrames: 120 },
  { name: "feature1", from: 585, durationInFrames: 55 },
  { name: "feature2", from: 640, durationInFrames: 55 },
  { name: "feature3", from: 695, durationInFrames: 55 },
  { name: "cta", from: 750, durationInFrames: 90 },
];

export function beat(name: BeatName): Beat {
  const found = BEATS.find((b) => b.name === name);
  if (!found) throw new Error(`Unknown beat: ${name}`);
  return found;
}

/** Position of an absolute frame inside a beat, clamped to 0..1. */
export function localProgress(frame: number, b: Beat): number {
  const raw = (frame - b.from) / b.durationInFrames;
  return Math.min(1, Math.max(0, raw));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm --filter @workspace/reel run test
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Write the failing layout test**

`apps/reel/src/layout.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { layoutFor } from "./layout";

describe("layoutFor", () => {
  it("sizes the vertical format for Instagram", () => {
    const l = layoutFor("vertical");
    expect(l.width).toBe(1080);
    expect(l.height).toBe(1920);
  });

  it("sizes the square format for LinkedIn", () => {
    const l = layoutFor("square");
    expect(l.width).toBe(1080);
    expect(l.height).toBe(1080);
  });

  it("keeps every vertical content box inside the Instagram safe area", () => {
    const l = layoutFor("vertical");
    for (const [name, box] of Object.entries(l.boxes)) {
      expect(box.x, `${name}.x`).toBeGreaterThanOrEqual(l.safe.left);
      expect(box.y, `${name}.y`).toBeGreaterThanOrEqual(l.safe.top);
      expect(box.x + box.width, `${name} right edge`).toBeLessThanOrEqual(l.safe.right);
      expect(box.y + box.height, `${name} bottom edge`).toBeLessThanOrEqual(l.safe.bottom);
    }
  });

  it("keeps every square content box inside its own bounds", () => {
    const l = layoutFor("square");
    for (const [name, box] of Object.entries(l.boxes)) {
      expect(box.x + box.width, `${name} right edge`).toBeLessThanOrEqual(l.width);
      expect(box.y + box.height, `${name} bottom edge`).toBeLessThanOrEqual(l.height);
    }
  });
});
```

- [ ] **Step 6: Run it to make sure it fails**

```bash
pnpm --filter @workspace/reel run test
```

Expected: FAIL — cannot resolve `./layout`.

- [ ] **Step 7: Implement the layout**

`apps/reel/src/layout.ts`:

```ts
export type Format = "vertical" | "square";

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Layout {
  format: Format;
  width: number;
  height: number;
  /** Region Instagram's own UI does not cover. */
  safe: { left: number; top: number; right: number; bottom: number };
  boxes: {
    rollBoard: Box;
    nowCard: Box;
    hero: Box;
    rail: Box;
    player: Box;
  };
  type: {
    hero: number;
    wordmark: number;
    rail: number;
    railTracking: number;
    body: number;
  };
}

const VERTICAL: Layout = {
  format: "vertical",
  width: 1080,
  height: 1920,
  safe: { left: 80, top: 280, right: 1000, bottom: 1560 },
  boxes: {
    rollBoard: { x: 80, y: 300, width: 560, height: 120 },
    nowCard: { x: 620, y: 620, width: 360, height: 330 },
    hero: { x: 80, y: 1000, width: 860, height: 260 },
    rail: { x: 80, y: 1300, width: 860, height: 60 },
    player: { x: 80, y: 1400, width: 860, height: 150 },
  },
  type: { hero: 96, wordmark: 84, rail: 26, railTracking: 6, body: 32 },
};

const SQUARE: Layout = {
  format: "square",
  width: 1080,
  height: 1080,
  safe: { left: 64, top: 64, right: 1016, bottom: 1016 },
  boxes: {
    rollBoard: { x: 64, y: 90, width: 500, height: 104 },
    nowCard: { x: 700, y: 250, width: 300, height: 280 },
    hero: { x: 64, y: 560, width: 620, height: 220 },
    rail: { x: 64, y: 820, width: 800, height: 54 },
    player: { x: 64, y: 900, width: 952, height: 116 },
  },
  type: { hero: 76, wordmark: 68, rail: 22, railTracking: 5, body: 28 },
};

export function layoutFor(format: Format): Layout {
  return format === "vertical" ? VERTICAL : SQUARE;
}
```

- [ ] **Step 8: Run the tests to verify they pass**

```bash
pnpm --filter @workspace/reel run test
```

Expected: PASS, 9 tests.

- [ ] **Step 9: Write the failing copy test**

`apps/reel/src/copy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CTA_RAIL, CTA_URL, FEATURE_RAIL, HOOK_RAIL, MODE_RAIL } from "./copy";

const MODES = ["driver", "rainy", "party", "ghazal"] as const;
const all = () => [...Object.values(MODE_RAIL), ...FEATURE_RAIL, HOOK_RAIL, CTA_RAIL];

describe("copy", () => {
  it("has rail copy for every mode", () => {
    for (const m of MODES) {
      expect(MODE_RAIL[m], m).toBeTruthy();
    }
  });

  it("has exactly three feature lines", () => {
    expect(FEATURE_RAIL).toHaveLength(3);
  });

  it("keeps every rail line short enough for one line at rail size", () => {
    for (const line of all()) {
      expect(line.length, line).toBeLessThanOrEqual(40);
    }
  });

  it("sets every rail line in upper case", () => {
    for (const line of all()) {
      expect(line, line).toBe(line.toUpperCase());
    }
  });

  it("never claims the product is ad-free, which would be untrue", () => {
    for (const line of all()) {
      expect(line).not.toMatch(/\bADS?\b|\bAD-FREE\b/);
    }
  });

  it("points at the real domain", () => {
    expect(CTA_URL).toBe("rastaradio.tech");
  });
});
```

- [ ] **Step 10: Run it to make sure it fails**

```bash
pnpm --filter @workspace/reel run test
```

Expected: FAIL — cannot resolve `./copy`.

- [ ] **Step 11: Implement the copy**

`apps/reel/src/copy.ts`:

```ts
import type { PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";

/**
 * Every English line that appears in the reel. Single source of truth so the
 * wording can be revised without touching a component.
 *
 * Constraints enforced by copy.test.ts: upper case, 40 characters or fewer,
 * and no ad-free claim — the YouTube iframe can serve ads.
 */

export const HOOK_RAIL = "FOUR MOODS. ONE ENDLESS ROAD.";

export const MODE_RAIL: Record<PlaylistMode, string> = {
  driver: "MOUNTAIN HIGHWAY. WINDOWS DOWN.",
  rainy: "MONSOON NIGHT. WET STREETS.",
  party: "GOA SUNSET. BONFIRE ON THE SAND.",
  ghazal: "NIGHT BUS. LAMP-LIT MEHFIL.",
};

export const FEATURE_RAIL: [string, string, string] = [
  "SWIPE. THE WORLD CHANGES.",
  "EVERY TRACK NAMED BY HAND.",
  "THE WHOLE PLAYLIST, ONE TAP.",
];

export const CTA_RAIL = "NO SIGN-UP. JUST PRESS PLAY.";
export const CTA_URL = "rastaradio.tech";
```

- [ ] **Step 12: Run the tests to verify they pass**

```bash
pnpm --filter @workspace/reel run test
```

Expected: PASS, 15 tests.

- [ ] **Step 13: Commit**

```bash
git add apps/reel/src
git commit -m "feat(reel): add timeline, layout and copy modules with tests"
```

---

### Task 3: Frame-sync the site's CSS animations

The rain, the drifting mist bands, the spinning disc and the EQ bars are CSS keyframe animations. Remotion renders with the page paused, so without this task they render frozen and the rainy mode looks like a still photograph.

**Files:**
- Create: `apps/reel/src/lib/cssAnimationSync.ts`
- Create: `apps/reel/src/lib/cssAnimationSync.test.ts`
- Create: `apps/reel/src/lib/useCssAnimationSync.ts`

**Interfaces:**
- Consumes: `FPS` from `../timeline`.
- Produces: `syncCssAnimations(timeMs: number, animations: Pick<Animation, "pause" | "currentTime">[]): void` and the React hook `useCssAnimationSync(): void`.

- [ ] **Step 1: Write the failing test**

`apps/reel/src/lib/cssAnimationSync.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { syncCssAnimations } from "./cssAnimationSync";

function fakeAnimation() {
  return { pause: vi.fn(), currentTime: 0 as number | CSSNumericValue | null };
}

describe("syncCssAnimations", () => {
  it("pauses every animation so wall-clock time cannot drift the frame", () => {
    const a = fakeAnimation();
    const b = fakeAnimation();
    syncCssAnimations(500, [a, b]);
    expect(a.pause).toHaveBeenCalledOnce();
    expect(b.pause).toHaveBeenCalledOnce();
  });

  it("seeks every animation to the requested time", () => {
    const a = fakeAnimation();
    syncCssAnimations(1234, [a]);
    expect(a.currentTime).toBe(1234);
  });

  it("keeps going when one animation refuses to be seeked", () => {
    const bad = {
      pause: vi.fn(),
      set currentTime(_v: number | CSSNumericValue | null) {
        throw new Error("not seekable");
      },
      get currentTime() {
        return 0;
      },
    };
    const good = fakeAnimation();
    expect(() => syncCssAnimations(700, [bad, good])).not.toThrow();
    expect(good.currentTime).toBe(700);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @workspace/reel run test
```

Expected: FAIL — cannot resolve `./cssAnimationSync`.

- [ ] **Step 3: Implement the sync function**

`apps/reel/src/lib/cssAnimationSync.ts`:

```ts
type Seekable = Pick<Animation, "pause" | "currentTime">;

/**
 * Drive every running CSS animation to an explicit point in time.
 *
 * Remotion captures frames with the page paused, so CSS keyframe animations
 * (`.rain-drop`, `.rain-mist-band`, `.art-spin`, `.player-eq i`) would render
 * frozen. Seeking through the Web Animations API rather than overriding
 * `animation-delay` in CSS matters: each rain drop carries its own inline
 * delay, and WAAPI's `currentTime` is measured on a timeline that already
 * includes that delay — so the stagger survives.
 */
export function syncCssAnimations(timeMs: number, animations: Seekable[]): void {
  for (const animation of animations) {
    try {
      animation.pause();
      animation.currentTime = timeMs;
    } catch {
      // A finished or non-seekable animation must not abort the whole frame.
    }
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm --filter @workspace/reel run test
```

Expected: PASS, 18 tests.

- [ ] **Step 5: Implement the hook**

`apps/reel/src/lib/useCssAnimationSync.ts`:

```ts
import { useEffect } from "react";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { syncCssAnimations } from "./cssAnimationSync";

/**
 * Hold the frame until the site's CSS animations have been seeked to it.
 * Must be called by any component that mounts `SceneStage` or the player bar.
 */
export function useCssAnimationSync(): void {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    const handle = delayRender(`css-animation-sync frame ${frame}`);
    syncCssAnimations((frame / fps) * 1000, document.getAnimations());
    continueRender(handle);
  }, [frame, fps]);
}
```

- [ ] **Step 6: Prove it works against real frames**

Temporarily point the `Probe` composition at the rainy mode: in `apps/reel/src/Probe.tsx`, change the class to `mode-rainy`, change `<SceneStage mode="driver" />` to `<SceneStage mode="rainy" />`, add `useCssAnimationSync()` as the first line of the component body, and raise the `Probe` composition's `durationInFrames` to `60` in `Root.tsx`.

Then render three consecutive frames:

```bash
cd apps/reel
npx remotion still Probe out/rain-00.png --frame=0
npx remotion still Probe out/rain-08.png --frame=8
npx remotion still Probe out/rain-16.png --frame=16
```

Expected: three PNGs where **the rain streaks are at visibly different heights**. If all three are identical, the sync is not working — the most likely cause is `useCssAnimationSync` being called in a component that mounts before `SceneStage`'s elements exist, so move the call into the component that renders `SceneStage`.

Revert `Probe.tsx` and `Root.tsx` to driver mode and 30 frames once verified; the probe is disposable scaffolding.

- [ ] **Step 7: Commit**

```bash
git add apps/reel/src/lib
git commit -m "feat(reel): frame-sync the site's CSS animations via the Web Animations API"
```

---

### Task 4: SceneLayer with camera movement

Wraps the site's `SceneStage` with a camera transform, the site's scrims, and grain. Because `.scene-stage` is `position: fixed`, a CSS `transform` on its ancestor makes it resolve against that ancestor instead of the viewport — which is exactly what gives us a free camera.

**Files:**
- Create: `apps/reel/src/lib/camera.ts`
- Create: `apps/reel/src/lib/camera.test.ts`
- Create: `apps/reel/src/scenes/SceneLayer.tsx`

**Interfaces:**
- Consumes: `useCssAnimationSync` from `../lib/useCssAnimationSync`; `SceneStage`, `PlaylistMode` from `@site/...`.
- Produces: `cameraTransform(progress: number, opts?: CameraOptions): {scale: number; y: number}` and `<SceneLayer mode progress dragX? />`.

- [ ] **Step 1: Write the failing camera test**

`apps/reel/src/lib/camera.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cameraTransform } from "./camera";

describe("cameraTransform", () => {
  it("starts pushed in and settles at rest", () => {
    expect(cameraTransform(0).scale).toBeCloseTo(1.08);
    expect(cameraTransform(1).scale).toBeCloseTo(1.0);
  });

  it("never scales below 1, which would expose the canvas edge", () => {
    for (let p = 0; p <= 1.5; p += 0.05) {
      expect(cameraTransform(p).scale).toBeGreaterThanOrEqual(1);
    }
  });

  it("drifts vertically as it settles", () => {
    expect(cameraTransform(0).y).not.toBe(cameraTransform(1).y);
  });

  it("honours a custom start scale", () => {
    expect(cameraTransform(0, { from: 1.2 }).scale).toBeCloseTo(1.2);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @workspace/reel run test
```

Expected: FAIL — cannot resolve `./camera`.

- [ ] **Step 3: Implement the camera**

`apps/reel/src/lib/camera.ts`:

```ts
export interface CameraOptions {
  /** Scale at progress 0. Must be >= 1 so the canvas edge never shows. */
  from?: number;
  /** Vertical drift in pixels across the beat. */
  drift?: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
/** Ease-out cubic — decelerating, so the camera lands rather than stops. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function cameraTransform(
  progress: number,
  { from = 1.08, drift = 24 }: CameraOptions = {},
): { scale: number; y: number } {
  const t = easeOut(clamp01(progress));
  return {
    scale: Math.max(1, from + (1 - from) * t),
    y: drift * (1 - t) * -1,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm --filter @workspace/reel run test
```

Expected: PASS, 22 tests.

- [ ] **Step 5: Implement SceneLayer**

`apps/reel/src/scenes/SceneLayer.tsx`:

```tsx
import { AbsoluteFill } from "remotion";
import { SceneStage } from "@site/components/mockups/indian-playlist/Scene";
import type { PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import { modes } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import "@site/components/mockups/indian-playlist/indian-playlist.css";
import { useCssAnimationSync } from "../lib/useCssAnimationSync";
import { cameraTransform, type CameraOptions } from "../lib/camera";

export interface SceneLayerProps {
  mode: PlaylistMode;
  /** 0..1 through the beat this scene belongs to. */
  progress: number;
  /** Horizontal offset in px while a swipe is being dragged. */
  dragX?: number;
  camera?: CameraOptions;
}

export function SceneLayer({ mode, progress, dragX = 0, camera }: SceneLayerProps) {
  useCssAnimationSync();
  const { scale, y } = cameraTransform(progress, camera);
  const current = modes[mode];

  return (
    <AbsoluteFill
      className={`indian-playlist mode-${mode}`}
      style={{
        padding: 0,
        height: "100%",
        // The mode tint the site sets inline, so the scrims and accents match.
        ["--mode-accent" as string]: current.accent,
        ["--mode-soft" as string]: current.soft,
      }}
    >
      {/* This transform is what gives `.scene-stage`'s `position: fixed`
          children a containing block, turning it into a camera. */}
      <AbsoluteFill style={{ transform: `translate3d(${dragX}px, ${y}px, 0) scale(${scale})` }}>
        <SceneStage mode={mode} />
        <div className="scene-scrim scene-scrim-left" />
        <div className="scene-scrim scene-scrim-edges" />
        <div className="grain" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 6: Verify visually**

Point `Probe` at `<SceneLayer mode="rainy" progress={0.5} />` (removing its own `SceneStage`), then:

```bash
cd apps/reel && npx remotion still Probe out/scenelayer.png --frame=0
```

Expected: the full rainy scene fills 1080×1920 with the left scrim darkening the left edge and grain over the top. Confirm the scene is scaled up slightly, with no black gap at any edge.

- [ ] **Step 7: Commit**

```bash
git add apps/reel/src
git commit -m "feat(reel): add SceneLayer with camera push-in over the site's scenes"
```

---

### Task 5: The destination roll-board

The signature transition. Mode changes roll a mechanical bus destination board rather than cross-fading.

**Files:**
- Create: `apps/reel/src/lib/rollBoard.ts`
- Create: `apps/reel/src/lib/rollBoard.test.ts`
- Create: `apps/reel/src/overlay/RollBoard.tsx`

**Interfaces:**
- Consumes: `layoutFor` from `../layout`.
- Produces: `rollOffset(progress: number, rowHeight: number): number`, `highlightSweep(progress: number): number`, and `<RollBoard from to progress accent width height fontFamily />`.

- [ ] **Step 1: Write the failing test**

`apps/reel/src/lib/rollBoard.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { highlightSweep, rollOffset } from "./rollBoard";

describe("rollOffset", () => {
  it("shows the outgoing row at rest", () => {
    expect(rollOffset(0, 120)).toBe(0);
  });

  it("lands exactly on the incoming row", () => {
    expect(rollOffset(1, 120)).toBeCloseTo(-120);
  });

  it("overshoots past the incoming row before settling, like a real roller", () => {
    const overshot = Array.from({ length: 40 }, (_, i) => rollOffset(0.6 + i * 0.01, 120));
    expect(Math.min(...overshot)).toBeLessThan(-120);
  });

  it("is monotonic for the first half of the roll", () => {
    let previous = Infinity;
    for (let p = 0; p <= 0.5; p += 0.05) {
      const value = rollOffset(p, 120);
      expect(value).toBeLessThanOrEqual(previous);
      previous = value;
    }
  });
});

describe("highlightSweep", () => {
  it("is off screen at both ends and crosses the board in the middle", () => {
    expect(highlightSweep(0)).toBeLessThanOrEqual(0);
    expect(highlightSweep(1)).toBeGreaterThanOrEqual(1);
    expect(highlightSweep(0.5)).toBeGreaterThan(0.2);
    expect(highlightSweep(0.5)).toBeLessThan(0.8);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @workspace/reel run test
```

Expected: FAIL — cannot resolve `./rollBoard`.

- [ ] **Step 3: Implement the roll maths**

`apps/reel/src/lib/rollBoard.ts`:

```ts
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Vertical offset of the roller strip, in pixels, as it turns from the
 * outgoing place name to the incoming one. Overshoots and springs back so it
 * reads as a mechanical roller with slack rather than a CSS transition.
 */
export function rollOffset(progress: number, rowHeight: number): number {
  const t = clamp01(progress);
  // Damped sine: settles on 1 with a decaying overshoot after the first pass.
  const damped = 1 - Math.pow(2, -9 * t) * Math.cos(t * Math.PI * 2.1);
  return -rowHeight * damped;
}

/** 0..1 position of the specular highlight sweeping across the metal. */
export function highlightSweep(progress: number): number {
  return clamp01(progress) * 1.6 - 0.3;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm --filter @workspace/reel run test
```

Expected: PASS, 27 tests.

- [ ] **Step 5: Implement the component**

`apps/reel/src/overlay/RollBoard.tsx`:

```tsx
import { highlightSweep, rollOffset } from "../lib/rollBoard";

export interface RollBoardProps {
  /** Place name rolling out. */
  from: string;
  /** Place name rolling in. */
  to: string;
  progress: number;
  accent: string;
  width: number;
  height: number;
  fontFamily: string;
  fontSize: number;
}

export function RollBoard({ from, to, progress, accent, width, height, fontFamily, fontSize }: RollBoardProps) {
  const offset = rollOffset(progress, height);
  const sweep = highlightSweep(progress);

  const row: React.CSSProperties = {
    height,
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "0 26px",
    fontFamily,
    fontSize,
    fontWeight: 600,
    letterSpacing: 0.4,
    color: "#fff4e8",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        borderRadius: 8,
        background: "rgba(10,6,4,.42)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,.18)",
        boxShadow: "inset 0 10px 24px rgba(0,0,0,.45), inset 0 -10px 24px rgba(0,0,0,.45)",
      }}
    >
      <div style={{ transform: `translateY(${offset}px)` }}>
        <div style={row}>
          <Pin accent={accent} />
          {from}
        </div>
        <div style={row}>
          <Pin accent={accent} />
          {to}
        </div>
      </div>

      {/* Specular highlight — sells the strip as curved metal mid-roll. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(100deg, transparent ${sweep * 100 - 18}%, rgba(255,255,255,.22) ${sweep * 100}%, transparent ${sweep * 100 + 18}%)`,
        }}
      />
    </div>
  );
}

function Pin({ accent }: { accent: string }) {
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: 999,
        background: accent,
        boxShadow: `0 0 16px ${accent}`,
        flexShrink: 0,
      }}
    />
  );
}
```

- [ ] **Step 6: Verify visually**

In `Probe`, render `<RollBoard from={modes.driver.chip} to={modes.rainy.chip} progress={0.45} accent={modes.rainy.accent} width={560} height={120} fontFamily={fonts.body} fontSize={38} />` over the scene, then:

```bash
cd apps/reel && npx remotion still Probe out/rollboard.png --frame=0
```

Expected: the board shows both place names partly clipped mid-roll, with the highlight band crossing it. Confirm `लेह, लद्दाख` and `वायनाड, केरल` are correctly shaped Devanagari.

- [ ] **Step 7: Commit**

```bash
git add apps/reel/src
git commit -m "feat(reel): add the destination roll-board mode transition"
```

---

### Task 6: Kinetic typography — shirorekha reveal, wordmark, rail

**Files:**
- Create: `apps/reel/src/lib/reveal.ts`
- Create: `apps/reel/src/lib/reveal.test.ts`
- Create: `apps/reel/src/overlay/HindiHero.tsx`
- Create: `apps/reel/src/overlay/Rail.tsx`
- Create: `apps/reel/src/overlay/Wordmark.tsx`

**Interfaces:**
- Consumes: `layoutFor` from `../layout`.
- Produces: `shirorekhaClip(progress: number): {right: number; bottom: number}`, `wordStagger(index: number, count: number, progress: number): number`, and `<HindiHero />`, `<Rail />`, `<Wordmark />`.

- [ ] **Step 1: Write the failing test**

`apps/reel/src/lib/reveal.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { shirorekhaClip, wordStagger } from "./reveal";

describe("shirorekhaClip", () => {
  it("hides everything before the reveal starts", () => {
    expect(shirorekhaClip(0)).toEqual({ right: 100, bottom: 88 });
  });

  it("draws the head-stroke left to right first, keeping letterforms hidden", () => {
    const mid = shirorekhaClip(0.175);
    expect(mid.right).toBeGreaterThan(0);
    expect(mid.right).toBeLessThan(100);
    expect(mid.bottom).toBe(88);
  });

  it("has the head-stroke fully drawn before letterforms begin to drop", () => {
    expect(shirorekhaClip(0.35).right).toBe(0);
    expect(shirorekhaClip(0.35).bottom).toBe(88);
  });

  it("fully reveals the line at the end", () => {
    expect(shirorekhaClip(1)).toEqual({ right: 0, bottom: 0 });
  });
});

describe("wordStagger", () => {
  it("gives the first word a head start over the last", () => {
    expect(wordStagger(0, 4, 0.5)).toBeGreaterThan(wordStagger(3, 4, 0.5));
  });

  it("has every word settled by the end", () => {
    for (let i = 0; i < 4; i++) {
      expect(wordStagger(i, 4, 1)).toBe(1);
    }
  });

  it("has no word started at the beginning", () => {
    for (let i = 0; i < 4; i++) {
      expect(wordStagger(i, 4, 0)).toBe(0);
    }
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @workspace/reel run test
```

Expected: FAIL — cannot resolve `./reveal`.

- [ ] **Step 3: Implement the reveal maths**

`apps/reel/src/lib/reveal.ts`:

```ts
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Fraction of the reveal spent drawing the head-stroke before letters drop. */
const STROKE_PHASE = 0.35;
/** Percentage of the line box below the shirorekha. */
const BELOW_STROKE = 88;

/**
 * Clip insets for the two-stage Devanagari reveal.
 *
 * Yatra One carries a solid shirorekha across the top of every glyph, so the
 * line can be revealed by first wiping the top band left to right (the stroke
 * drawing itself), then lifting the bottom inset (the letterforms dropping out
 * of it). This reveal is only possible in a Devanagari display face.
 */
export function shirorekhaClip(progress: number): { right: number; bottom: number } {
  const t = clamp01(progress);
  const stroke = clamp01(t / STROKE_PHASE);
  const body = clamp01((t - STROKE_PHASE) / (1 - STROKE_PHASE));
  return {
    right: (1 - stroke) * 100,
    bottom: BELOW_STROKE * (1 - body),
  };
}

/** Per-word progress 0..1, staggered so words land left to right. */
export function wordStagger(index: number, count: number, progress: number): number {
  const t = clamp01(progress);
  if (t === 0) return 0;
  const span = 1 / (count + 2);
  const start = index * span * 0.8;
  return clamp01((t - start) / (1 - start));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm --filter @workspace/reel run test
```

Expected: PASS, 34 tests.

- [ ] **Step 5: Implement HindiHero**

`apps/reel/src/overlay/HindiHero.tsx`:

```tsx
import { shirorekhaClip, wordStagger } from "../lib/reveal";

export interface HindiHeroProps {
  text: string;
  /** 0..1 through the reveal. */
  progress: number;
  fontFamily: string;
  fontSize: number;
  width: number;
  color?: string;
}

export function HindiHero({ text, progress, fontFamily, fontSize, width, color = "#fff4e8" }: HindiHeroProps) {
  const clip = shirorekhaClip(progress);
  const words = text.split(" ");

  return (
    <div
      style={{
        width,
        clipPath: `inset(0 ${clip.right}% ${clip.bottom}% 0)`,
        fontFamily,
        fontSize,
        lineHeight: 1.08,
        color,
        textShadow: "0 4px 28px rgba(0,0,0,.45)",
        display: "flex",
        flexWrap: "wrap",
        columnGap: "0.28em",
      }}
    >
      {words.map((word, i) => {
        const t = wordStagger(i, words.length, progress);
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              transform: `translateY(${(1 - t) * -0.14 * fontSize}px)`,
              opacity: 0.35 + t * 0.65,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Implement Rail**

`apps/reel/src/overlay/Rail.tsx`:

```tsx
export interface RailProps {
  text: string;
  /** 0..1 — the rail wipes in from the left and its rules draw outward. */
  progress: number;
  fontFamily: string;
  fontSize: number;
  tracking: number;
  width: number;
  accent: string;
}

/**
 * The English marketing line, set as a bus-timetable rule rather than a
 * caption: mono, upper case, widely tracked, deliberately subordinate to the
 * Devanagari display type above it.
 */
export function Rail({ text, progress, fontFamily, fontSize, tracking, width, accent }: RailProps) {
  const t = Math.min(1, Math.max(0, progress));
  const rule = (
    <div style={{ height: 1, width: `${t * 100}%`, background: "rgba(255,244,232,.34)" }} />
  );

  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 12 }}>
      {rule}
      <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: t }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, flexShrink: 0 }} />
        <span
          style={{
            fontFamily,
            fontSize,
            letterSpacing: tracking,
            color: "rgba(255,244,232,.88)",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>
      {rule}
    </div>
  );
}
```

- [ ] **Step 7: Implement Wordmark**

`apps/reel/src/overlay/Wordmark.tsx`:

```tsx
import { shirorekhaClip } from "../lib/reveal";

export interface WordmarkProps {
  progress: number;
  displayFamily: string;
  bodyFamily: string;
  fontSize: number;
}

/** `रास्ता रेडियो`, matching the site's `.brand-mark` treatment. */
export function Wordmark({ progress, displayFamily, bodyFamily, fontSize }: WordmarkProps) {
  const clip = shirorekhaClip(progress);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        clipPath: `inset(0 ${clip.right}% ${clip.bottom}% 0)`,
        color: "#fff4e8",
      }}
    >
      <span style={{ fontFamily: displayFamily, fontSize }}>रास्ता</span>
      <span style={{ fontFamily: bodyFamily, fontSize: fontSize * 0.42, fontWeight: 700, letterSpacing: 1 }}>
        रेडियो
      </span>
    </div>
  );
}
```

- [ ] **Step 8: Verify the reveal reads correctly mid-animation**

In `Probe`, render `<HindiHero text={modes.driver.title} progress={0.2} .../>` and a second at `progress={0.7}`, then:

```bash
cd apps/reel
npx remotion still Probe out/hero-stroke.png --frame=0
```

Expected: at `0.2` only a horizontal bar of ink is visible (the shirorekha, partially drawn, with no letterform bodies). At `0.7` the letters have dropped down out of the stroke. If at `0.2` you can already read whole letters, the `BELOW_STROKE` constant needs raising for this font size.

- [ ] **Step 9: Commit**

```bash
git add apps/reel/src
git commit -m "feat(reel): add shirorekha hero reveal, timetable rail and wordmark"
```

---

### Task 7: Gesture cue and the interactive player bar

This is the task that makes the reel animate the *flow* rather than showing states. Every UI change in the reel must be visibly caused by a gesture.

**Files:**
- Create: `apps/reel/src/lib/gestures.ts`
- Create: `apps/reel/src/lib/gestures.test.ts`
- Create: `apps/reel/src/overlay/TouchCue.tsx`
- Create: `apps/reel/src/overlay/PlayerBar.tsx`

**Interfaces:**
- Consumes: `layoutFor` from `../layout`.
- Produces: `type Gesture`, `gestureState(g: Gesture, frame: number): {x: number; y: number; pressed: boolean; visible: boolean; progress: number}`, `<TouchCue />`, `<PlayerBar />`.

- [ ] **Step 1: Write the failing test**

`apps/reel/src/lib/gestures.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { gestureState, type Gesture } from "./gestures";

const tap: Gesture = { kind: "tap", at: [500, 1400], startFrame: 10, durationInFrames: 12 };
const swipe: Gesture = { kind: "swipe", from: [800, 900], to: [300, 900], startFrame: 0, durationInFrames: 20 };

describe("gestureState", () => {
  it("is invisible before it starts", () => {
    expect(gestureState(tap, 0).visible).toBe(false);
  });

  it("is invisible well after it ends", () => {
    expect(gestureState(tap, 100).visible).toBe(false);
  });

  it("sits on the target throughout a tap", () => {
    const s = gestureState(tap, 14);
    expect(s.visible).toBe(true);
    expect(s.x).toBe(500);
    expect(s.y).toBe(1400);
  });

  it("registers the press partway through a tap, not on the first frame", () => {
    expect(gestureState(tap, 10).pressed).toBe(false);
    expect(gestureState(tap, 16).pressed).toBe(true);
  });

  it("travels from start to end across a swipe", () => {
    expect(gestureState(swipe, 0).x).toBe(800);
    expect(gestureState(swipe, 20).x).toBe(300);
    const mid = gestureState(swipe, 10).x;
    expect(mid).toBeLessThan(800);
    expect(mid).toBeGreaterThan(300);
  });

  it("holds a swipe pressed for its whole travel", () => {
    expect(gestureState(swipe, 10).pressed).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @workspace/reel run test
```

Expected: FAIL — cannot resolve `./gestures`.

- [ ] **Step 3: Implement the gesture model**

`apps/reel/src/lib/gestures.ts`:

```ts
export type Point = [number, number];

export type Gesture =
  | { kind: "tap"; at: Point; startFrame: number; durationInFrames: number }
  | { kind: "swipe"; from: Point; to: Point; startFrame: number; durationInFrames: number }
  | { kind: "drag"; from: Point; to: Point; startFrame: number; durationInFrames: number };

export interface GestureState {
  x: number;
  y: number;
  /** True while the finger is down — drives the ring's contact state. */
  pressed: boolean;
  visible: boolean;
  /** 0..1 through the gesture. */
  progress: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Frames the cue lingers after release before fading out. */
const TAIL_FRAMES = 8;
/** Fraction of a tap spent approaching before contact registers. */
const TAP_CONTACT = 0.45;

export function gestureState(g: Gesture, frame: number): GestureState {
  const elapsed = frame - g.startFrame;
  const visible = elapsed >= 0 && elapsed <= g.durationInFrames + TAIL_FRAMES;
  const progress = clamp01(elapsed / g.durationInFrames);
  const hidden: GestureState = { x: 0, y: 0, pressed: false, visible: false, progress };

  if (!visible) return hidden;

  if (g.kind === "tap") {
    return {
      x: g.at[0],
      y: g.at[1],
      pressed: progress >= TAP_CONTACT && elapsed <= g.durationInFrames,
      visible: true,
      progress,
    };
  }

  const t = easeInOut(progress);
  return {
    x: g.from[0] + (g.to[0] - g.from[0]) * t,
    y: g.from[1] + (g.to[1] - g.from[1]) * t,
    pressed: elapsed <= g.durationInFrames,
    visible: true,
    progress,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm --filter @workspace/reel run test
```

Expected: PASS, 41 tests.

- [ ] **Step 5: Implement TouchCue**

`apps/reel/src/overlay/TouchCue.tsx`:

```tsx
import { gestureState, type Gesture } from "../lib/gestures";

export interface TouchCueProps {
  gesture: Gesture;
  frame: number;
  accent: string;
}

/**
 * The gesture indicator: a ring in the mode's accent trailing a dashed tail
 * that echoes the road markings in the driver scene. Never a generic cursor.
 */
export function TouchCue({ gesture, frame, accent }: TouchCueProps) {
  const s = gestureState(gesture, frame);
  if (!s.visible) return null;

  const size = s.pressed ? 58 : 74;
  const fade = s.progress > 1 ? 0 : 1;

  return (
    <>
      {gesture.kind !== "tap" && (
        <div
          style={{
            position: "absolute",
            left: Math.min(gesture.from[0], s.x),
            top: s.y - 1,
            width: Math.abs(s.x - gesture.from[0]),
            height: 2,
            borderTop: `2px dashed ${accent}`,
            opacity: 0.5 * fade,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: s.x - size / 2,
          top: s.y - size / 2,
          width: size,
          height: size,
          borderRadius: 999,
          border: `2px solid ${accent}`,
          background: s.pressed ? `${accent}33` : "transparent",
          boxShadow: `0 0 ${s.pressed ? 34 : 18}px ${accent}`,
          opacity: fade,
        }}
      />
    </>
  );
}
```

- [ ] **Step 6: Implement PlayerBar**

`apps/reel/src/overlay/PlayerBar.tsx`:

```tsx
import { ListMusic, Pause, Play, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { formatTime } from "@site/lib/formatTime";

export interface PlayerBarProps {
  title: string;
  artist: string;
  isPlaying: boolean;
  shuffled: boolean;
  /** 0..1 of the track elapsed. */
  fraction: number;
  durationSeconds: number;
  accent: string;
  width: number;
  bodyFamily: string;
  monoFamily: string;
  /** Scale up the button being pressed this frame. */
  pressing?: "play" | "shuffle" | "queue" | "scrub" | null;
}

export function PlayerBar({
  title, artist, isPlaying, shuffled, fraction, durationSeconds,
  accent, width, bodyFamily, monoFamily, pressing = null,
}: PlayerBarProps) {
  const press = (key: string) => (pressing === key ? "scale(0.88)" : "scale(1)");

  return (
    <div
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        padding: "22px 26px",
        borderRadius: 22,
        background: "rgba(10,6,4,.52)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,.16)",
        color: "#fff4e8",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 62, height: 62, borderRadius: 16, background: accent, flexShrink: 0,
            display: "grid", placeItems: "center",
          }}
        >
          {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: monoFamily, fontSize: 16, letterSpacing: 3, color: accent }}>बज रहा है</div>
          <div
            style={{
              fontFamily: bodyFamily, fontSize: 34, fontWeight: 600,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
          <div style={{ fontFamily: bodyFamily, fontSize: 24, opacity: 0.66 }}>{artist}</div>
        </div>
        {isPlaying && <Equaliser accent={accent} />}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <SkipBack size={26} fill="currentColor" />
        <div style={{ transform: press("play"), transition: "none" }}>
          {isPlaying ? <Pause size={34} fill="currentColor" /> : <Play size={34} fill="currentColor" />}
        </div>
        <SkipForward size={26} fill="currentColor" />

        <span style={{ fontFamily: monoFamily, fontSize: 20 }}>
          {formatTime(fraction * durationSeconds)}
        </span>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,.18)", position: "relative" }}>
          <div style={{ width: `${fraction * 100}%`, height: "100%", borderRadius: 3, background: accent }} />
          <div
            style={{
              position: "absolute", left: `${fraction * 100}%`, top: -6,
              width: 18, height: 18, marginLeft: -9, borderRadius: 999,
              background: "#fff4e8", opacity: pressing === "scrub" ? 1 : 0,
            }}
          />
        </div>
        <span style={{ fontFamily: monoFamily, fontSize: 20 }}>{formatTime(durationSeconds)}</span>

        <div style={{ transform: press("shuffle"), color: shuffled ? accent : "#fff4e8" }}>
          <Shuffle size={24} />
        </div>
        <div style={{ transform: press("queue") }}>
          <ListMusic size={24} />
        </div>
      </div>
    </div>
  );
}

function Equaliser({ accent }: { accent: string }) {
  // Real CSS animation from the site's stylesheet, seeked per frame by
  // useCssAnimationSync in SceneLayer.
  return (
    <span className="player-eq" aria-hidden style={{ transform: "scale(2)" }}>
      <i /><i /><i />
    </span>
  );
}
```

Add `lucide-react` to `apps/reel/package.json` dependencies as `"lucide-react": "catalog:"` and run `pnpm install`.

- [ ] **Step 7: Verify visually**

In `Probe`, render `<PlayerBar title="मैंने रोया" artist="तनवीर एवान" isPlaying shuffled={false} fraction={0.42} durationSeconds={214} accent={modes.rainy.accent} width={860} .../>` with a `<TouchCue gesture={{kind:"tap", at:[300,1470], startFrame:0, durationInFrames:12}} frame={8} accent={modes.rainy.accent} />`, then:

```bash
cd apps/reel && npx remotion still Probe out/player.png --frame=8
```

Expected: a wide glass player bar with Devanagari track name, a 42%-filled progress bar in the rainy accent, timecode `03:34` on the right, and the accent ring visible in its pressed state.

- [ ] **Step 8: Commit**

```bash
git add apps/reel/src apps/reel/package.json pnpm-lock.yaml
git commit -m "feat(reel): add gesture cue and interactive player bar"
```

---

### Task 8: NowCard and playlist sheet

**Files:**
- Create: `apps/reel/src/lib/tracks.ts`
- Create: `apps/reel/src/lib/tracks.test.ts`
- Create: `apps/reel/src/overlay/NowCardVertical.tsx`
- Create: `apps/reel/src/overlay/PlaylistSheetVertical.tsx`

**Interfaces:**
- Consumes: `driverTracks`, `rainyTracks`, `partyTracks`, `ghazalTracks` from `@site/data/tracks.*`; `TrackMap` from `@site/lib/trackMetadata`.
- Produces: `tracksFor(mode: PlaylistMode): {title: string; artist: string}[]`, `<NowCardVertical />`, `<PlaylistSheetVertical />`.

- [ ] **Step 1: Write the failing test**

`apps/reel/src/lib/tracks.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { tracksFor } from "./tracks";

const MODES = ["driver", "rainy", "party", "ghazal"] as const;

describe("tracksFor", () => {
  it("returns real curated tracks for every mode", () => {
    for (const m of MODES) {
      expect(tracksFor(m).length, m).toBeGreaterThan(3);
    }
  });

  it("returns Devanagari titles, not raw YouTube titles", () => {
    for (const m of MODES) {
      expect(tracksFor(m)[0].title, m).toMatch(/[ऀ-ॿ]/);
    }
  });

  it("gives every track an artist", () => {
    for (const m of MODES) {
      for (const track of tracksFor(m)) {
        expect(track.artist, `${m}: ${track.title}`).toBeTruthy();
      }
    }
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @workspace/reel run test
```

Expected: FAIL — cannot resolve `./tracks`.

- [ ] **Step 3: Implement the track reader**

`apps/reel/src/lib/tracks.ts`:

```ts
import type { PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { TrackMap } from "@site/lib/trackMetadata";
import { driverTracks } from "@site/data/tracks.driver";
import { rainyTracks } from "@site/data/tracks.rainy";
import { partyTracks } from "@site/data/tracks.party";
import { ghazalTracks } from "@site/data/tracks.ghazal";

export interface ReelTrack {
  title: string;
  artist: string;
}

const BY_MODE: Record<PlaylistMode, TrackMap> = {
  driver: driverTracks,
  rainy: rainyTracks,
  party: partyTracks,
  ghazal: ghazalTracks,
};

/**
 * The mode's hand-curated Devanagari track list, in map order. These are the
 * real names shown on the site — the reel never invents a track.
 */
export function tracksFor(mode: PlaylistMode): ReelTrack[] {
  return Object.values(BY_MODE[mode]).map((t) => ({ title: t.title, artist: t.artist }));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm --filter @workspace/reel run test
```

Expected: PASS, 44 tests. If a mode's map is empty, that test failure is real information — populate the map in `apps/web` first or exclude that mode from the sheet beat.

- [ ] **Step 5: Implement NowCardVertical**

`apps/reel/src/overlay/NowCardVertical.tsx`:

```tsx
import { BusFront, Disc3, Moon, Waves } from "lucide-react";
import { modes, type PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";

export interface NowCardVerticalProps {
  mode: PlaylistMode;
  title: string;
  artist: string;
  /** 0..1 — the card flies in from the right and settles with a slight tilt. */
  progress: number;
  width: number;
  bodyFamily: string;
  monoFamily: string;
}

export function NowCardVertical({ mode, title, artist, progress, width, bodyFamily, monoFamily }: NowCardVerticalProps) {
  const current = modes[mode];
  const t = 1 - Math.pow(1 - Math.min(1, Math.max(0, progress)), 3);

  return (
    <div
      style={{
        width,
        padding: "26px 26px 30px",
        borderRadius: 26,
        background: "rgba(10,6,4,.42)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,.16)",
        boxShadow: "0 30px 74px rgba(0,0,0,.45)",
        color: "#fff4e8",
        transform: `translateX(${(1 - t) * 140}px) rotate(${(1 - t) * 6 - 2.5}deg)`,
        opacity: t,
      }}
    >
      <div style={{ fontFamily: monoFamily, fontSize: 15, letterSpacing: 2, opacity: 0.7 }}>
        {current.cardLabel}
      </div>
      <div
        style={{
          margin: "18px 0 20px",
          aspectRatio: "1 / 1",
          borderRadius: 16,
          background: current.accent,
          display: "grid",
          placeItems: "center",
        }}
      >
        {mode === "driver" && <BusFront size={78} strokeWidth={1.2} />}
        {mode === "party" && <Disc3 className="art-spin" size={86} strokeWidth={1.1} />}
        {mode === "rainy" && <Waves size={82} strokeWidth={1.1} />}
        {mode === "ghazal" && <Moon size={78} strokeWidth={1.1} />}
      </div>
      <div style={{ fontFamily: bodyFamily, fontSize: 30, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontFamily: bodyFamily, fontSize: 22, opacity: 0.66, marginTop: 6 }}>{artist}</div>
    </div>
  );
}
```

- [ ] **Step 6: Implement PlaylistSheetVertical**

`apps/reel/src/overlay/PlaylistSheetVertical.tsx`:

```tsx
import type { ReelTrack } from "../lib/tracks";

export interface PlaylistSheetVerticalProps {
  heading: string;
  tracks: ReelTrack[];
  currentIndex: number;
  /** 0..1 — the sheet slides up from the bottom edge. */
  progress: number;
  accent: string;
  width: number;
  height: number;
  bodyFamily: string;
  monoFamily: string;
}

export function PlaylistSheetVertical({
  heading, tracks, currentIndex, progress, accent, width, height, bodyFamily, monoFamily,
}: PlaylistSheetVerticalProps) {
  const t = 1 - Math.pow(1 - Math.min(1, Math.max(0, progress)), 3);
  const rows = tracks.slice(0, 6);

  return (
    <div
      style={{
        width,
        height,
        transform: `translateY(${(1 - t) * height}px)`,
        opacity: 0.4 + t * 0.6,
        borderRadius: "28px 28px 0 0",
        background: "linear-gradient(180deg, rgba(20,11,9,.98), rgba(10,6,4,.98))",
        border: "1px solid rgba(255,255,255,.14)",
        borderBottom: 0,
        boxShadow: "0 -26px 74px rgba(0,0,0,.5)",
        padding: "18px 26px 0",
        color: "#fff4e8",
        overflow: "hidden",
      }}
    >
      <div style={{ width: 64, height: 5, borderRadius: 3, background: "rgba(255,255,255,.28)", margin: "0 auto 20px" }} />
      <div style={{ fontFamily: monoFamily, fontSize: 17, letterSpacing: 3, color: accent, marginBottom: 18 }}>
        {heading}
      </div>
      {rows.map((track, i) => (
        <div
          key={`${track.title}-${i}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "16px 14px",
            borderRadius: 14,
            background: i === currentIndex ? `${accent}26` : "transparent",
          }}
        >
          <span style={{ fontFamily: monoFamily, fontSize: 18, opacity: 0.55, width: 34 }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: "block", fontFamily: bodyFamily, fontSize: 27, fontWeight: 600,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                color: i === currentIndex ? accent : "#fff4e8",
              }}
            >
              {track.title}
            </span>
            <span style={{ display: "block", fontFamily: bodyFamily, fontSize: 20, opacity: 0.6 }}>
              {track.artist}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Verify visually**

Render both in `Probe` at `progress={1}` and spot-render a PNG. Expected: real Devanagari track names from `tracks.ghazal.ts` (e.g. `लग जा गले से फिर` / `लता मंगेशकर`) with row 1 highlighted in the ghazal accent.

- [ ] **Step 8: Commit**

```bash
git add apps/reel/src
git commit -m "feat(reel): add now-card and playlist sheet with real curated tracks"
```

---

### Task 9: ModeBlock — assemble one 4-second mode segment

**Files:**
- Create: `apps/reel/src/lib/modeChoreography.ts`
- Create: `apps/reel/src/lib/modeChoreography.test.ts`
- Create: `apps/reel/src/scenes/ModeBlock.tsx`

**Interfaces:**
- Consumes: everything from Tasks 3–8.
- Produces: `choreographyFor(mode: PlaylistMode, layout: Layout): ModeChoreography` and `<ModeBlock mode previousMode layout fonts />`.

- [ ] **Step 1: Write the failing test**

`apps/reel/src/lib/modeChoreography.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { layoutFor } from "../layout";
import { choreographyFor } from "./modeChoreography";

const layout = layoutFor("vertical");
const MODES = ["driver", "rainy", "party", "ghazal"] as const;

describe("choreographyFor", () => {
  it("defines a gesture for every mode, so no state changes without a cause", () => {
    for (const m of MODES) {
      expect(choreographyFor(m, layout).gestures.length, m).toBeGreaterThan(0);
    }
  });

  it("keeps every gesture inside the 120 frame mode block", () => {
    for (const m of MODES) {
      for (const g of choreographyFor(m, layout).gestures) {
        expect(g.startFrame, m).toBeGreaterThanOrEqual(0);
        expect(g.startFrame + g.durationInFrames, m).toBeLessThanOrEqual(120);
      }
    }
  });

  it("puts every gesture inside the safe area", () => {
    for (const m of MODES) {
      for (const g of choreographyFor(m, layout).gestures) {
        const points = g.kind === "tap" ? [g.at] : [g.from, g.to];
        for (const [x, y] of points) {
          expect(x, m).toBeGreaterThanOrEqual(0);
          expect(x, m).toBeLessThanOrEqual(layout.width);
          expect(y, m).toBeGreaterThanOrEqual(layout.safe.top);
          expect(y, m).toBeLessThanOrEqual(layout.safe.bottom);
        }
      }
    }
  });

  it("does not swipe into the driver mode, which is the reel's opening state", () => {
    expect(choreographyFor("driver", layout).gestures.some((g) => g.kind === "swipe")).toBe(false);
  });

  it("swipes into every mode after the first", () => {
    for (const m of ["rainy", "party", "ghazal"] as const) {
      expect(choreographyFor(m, layout).gestures.some((g) => g.kind === "swipe"), m).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @workspace/reel run test
```

Expected: FAIL — cannot resolve `./modeChoreography`.

- [ ] **Step 3: Implement the choreography**

`apps/reel/src/lib/modeChoreography.ts`:

```ts
import type { PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { Layout } from "../layout";
import type { Gesture } from "./gestures";

export interface ModeChoreography {
  gestures: Gesture[];
  /** Frame within the block at which playback visibly starts. */
  playFromFrame: number | null;
  /** Frame within the block at which shuffle lights up. */
  shuffleFromFrame: number | null;
}

/**
 * What the viewer's finger does during each 120-frame mode block. Every state
 * change in the reel is caused by one of these, so nothing appears to change
 * on its own.
 */
export function choreographyFor(mode: PlaylistMode, layout: Layout): ModeChoreography {
  const player = layout.boxes.player;
  const playButton: [number, number] = [player.x + 150, player.y + 108];
  const shuffleButton: [number, number] = [player.x + player.width - 150, player.y + 108];
  const scrubStart: [number, number] = [player.x + 380, player.y + 108];
  const scrubEnd: [number, number] = [player.x + 620, player.y + 108];
  const swipeY = layout.safe.top + 400;
  const swipeIn: Gesture = {
    kind: "swipe",
    from: [900, swipeY],
    to: [220, swipeY],
    startFrame: 0,
    durationInFrames: 18,
  };

  switch (mode) {
    case "driver":
      // Opening state — the reel is already here, so no swipe in.
      return {
        gestures: [{ kind: "tap", at: playButton, startFrame: 62, durationInFrames: 14 }],
        playFromFrame: 70,
        shuffleFromFrame: null,
      };
    case "rainy":
      return { gestures: [swipeIn], playFromFrame: 0, shuffleFromFrame: null };
    case "party":
      return {
        gestures: [swipeIn, { kind: "tap", at: shuffleButton, startFrame: 74, durationInFrames: 14 }],
        playFromFrame: 0,
        shuffleFromFrame: 82,
      };
    case "ghazal":
      return {
        gestures: [
          swipeIn,
          { kind: "drag", from: scrubStart, to: scrubEnd, startFrame: 66, durationInFrames: 30 },
        ],
        playFromFrame: 0,
        shuffleFromFrame: null,
      };
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm --filter @workspace/reel run test
```

Expected: PASS, 49 tests.

- [ ] **Step 5: Implement ModeBlock**

`apps/reel/src/scenes/ModeBlock.tsx`:

```tsx
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { modes, type PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { Layout } from "../layout";
import type { ReelFonts } from "../fonts";
import { MODE_RAIL } from "../copy";
import { SceneLayer } from "./SceneLayer";
import { RollBoard } from "../overlay/RollBoard";
import { HindiHero } from "../overlay/HindiHero";
import { Rail } from "../overlay/Rail";
import { NowCardVertical } from "../overlay/NowCardVertical";
import { PlayerBar } from "../overlay/PlayerBar";
import { TouchCue } from "../overlay/TouchCue";
import { choreographyFor } from "../lib/modeChoreography";
import { gestureState } from "../lib/gestures";
import { tracksFor } from "../lib/tracks";

export interface ModeBlockProps {
  mode: PlaylistMode;
  previousMode: PlaylistMode;
  layout: Layout;
  fonts: ReelFonts;
}

const BLOCK_FRAMES = 120;
const ROLL_FRAMES = 26;

/** One 4-second mode segment. Frame is local to the block (0..119). */
export function ModeBlock({ mode, previousMode, layout, fonts }: ModeBlockProps) {
  const frame = useCurrentFrame();
  const current = modes[mode];
  const chor = choreographyFor(mode, layout);
  const { boxes, type } = layout;

  const rollProgress = Math.min(1, frame / ROLL_FRAMES);
  const heroProgress = Math.min(1, Math.max(0, (frame - 16) / 44));
  const railProgress = Math.min(1, Math.max(0, (frame - 44) / 26));
  const cardProgress = Math.min(1, Math.max(0, (frame - 30) / 34));
  const sceneProgress = frame / BLOCK_FRAMES;

  // The scene follows the finger during a swipe, then releases.
  const swipe = chor.gestures.find((g) => g.kind === "swipe");
  const dragX = swipe
    ? (1 - Math.min(1, frame / (swipe.durationInFrames + 6))) * -70
    : 0;

  const isPlaying = chor.playFromFrame !== null && frame >= chor.playFromFrame;
  const shuffled = chor.shuffleFromFrame !== null && frame >= chor.shuffleFromFrame;

  const pressing = (() => {
    for (const g of chor.gestures) {
      const s = gestureState(g, frame);
      if (!s.pressed) continue;
      if (g.kind === "drag") return "scrub" as const;
      if (chor.shuffleFromFrame !== null && g.startFrame === chor.shuffleFromFrame - 8) return "shuffle" as const;
      if (g.kind === "tap") return "play" as const;
    }
    return null;
  })();

  const drag = chor.gestures.find((g) => g.kind === "drag");
  const dragState = drag ? gestureState(drag, frame) : null;
  const fraction = dragState?.pressed
    ? 0.22 + dragState.progress * 0.44
    : 0.22 + (frame / BLOCK_FRAMES) * 0.1;

  const track = tracksFor(mode)[0] ?? { title: current.hindi, artist: current.label };

  return (
    <AbsoluteFill>
      <SceneLayer mode={mode} progress={sceneProgress} dragX={dragX} />

      <AbsoluteFill style={{ zIndex: 6 }}>
        <div style={{ position: "absolute", ...toStyle(boxes.rollBoard) }}>
          <RollBoard
            from={modes[previousMode].chip}
            to={current.chip}
            progress={rollProgress}
            accent={current.accent}
            width={boxes.rollBoard.width}
            height={boxes.rollBoard.height}
            fontFamily={fonts.body}
            fontSize={type.body}
          />
        </div>

        <div style={{ position: "absolute", ...toStyle(boxes.nowCard) }}>
          <NowCardVertical
            mode={mode}
            title={track.title}
            artist={track.artist}
            progress={cardProgress}
            width={boxes.nowCard.width}
            bodyFamily={fonts.body}
            monoFamily={fonts.mono}
          />
        </div>

        <div style={{ position: "absolute", ...toStyle(boxes.hero) }}>
          <HindiHero
            text={current.title}
            progress={heroProgress}
            fontFamily={fonts.display}
            fontSize={type.hero}
            width={boxes.hero.width}
          />
        </div>

        <div style={{ position: "absolute", ...toStyle(boxes.rail) }}>
          <Rail
            text={MODE_RAIL[mode]}
            progress={railProgress}
            fontFamily={fonts.mono}
            fontSize={type.rail}
            tracking={type.railTracking}
            width={boxes.rail.width}
            accent={current.accent}
          />
        </div>

        <div style={{ position: "absolute", ...toStyle(boxes.player) }}>
          <PlayerBar
            title={track.title}
            artist={track.artist}
            isPlaying={isPlaying}
            shuffled={shuffled}
            fraction={fraction}
            durationSeconds={214}
            accent={current.accent}
            width={boxes.player.width}
            bodyFamily={fonts.body}
            monoFamily={fonts.mono}
            pressing={pressing}
          />
        </div>

        {chor.gestures.map((g, i) => (
          <TouchCue key={i} gesture={g} frame={frame} accent={current.accent} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function toStyle(box: { x: number; y: number; width: number; height: number }) {
  return { left: box.x, top: box.y, width: box.width, height: box.height };
}
```

- [ ] **Step 6: Verify the whole block reads**

Temporarily register a composition `ModeProbe` in `Root.tsx` rendering `<ModeBlock mode="rainy" previousMode="driver" layout={layoutFor("vertical")} fonts={loadReelFonts()} />` at 120 frames, then:

```bash
cd apps/reel
npx remotion still ModeProbe out/block-10.png --frame=10
npx remotion still ModeProbe out/block-50.png --frame=50
npx remotion still ModeProbe out/block-110.png --frame=110
```

Expected: at frame 10 the roll-board is mid-roll and the hero has only its shirorekha; at 50 the hero is readable, the card has landed and the rail has drawn; at 110 everything is settled with the rain visibly different from frame 50.

- [ ] **Step 7: Commit**

```bash
git add apps/reel/src
git commit -m "feat(reel): assemble the mode block with gesture-driven state changes"
```

---

### Task 10: Sequences and the full vertical timeline

**Files:**
- Create: `apps/reel/src/sequences/Hook.tsx`
- Create: `apps/reel/src/sequences/Features.tsx`
- Create: `apps/reel/src/sequences/Cta.tsx`
- Create: `apps/reel/src/Reel.tsx`
- Modify: `apps/reel/src/Root.tsx`
- Delete: `apps/reel/src/Probe.tsx`

**Interfaces:**
- Consumes: `BEATS`, `beat`, `DURATION_IN_FRAMES`, `FPS`, `ModeBlock`, `layoutFor`, `loadReelFonts`, copy constants.
- Produces: `<Reel format />` and the `ReelVertical` composition.

- [ ] **Step 1: Implement the Hook sequence**

`apps/reel/src/sequences/Hook.tsx`:

```tsx
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { modes } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { Layout } from "../layout";
import type { ReelFonts } from "../fonts";
import { HOOK_RAIL } from "../copy";
import { SceneLayer } from "../scenes/SceneLayer";
import { Wordmark } from "../overlay/Wordmark";
import { Rail } from "../overlay/Rail";

export function Hook({ layout, fonts }: { layout: Layout; fonts: ReelFonts }) {
  const frame = useCurrentFrame();
  const accent = modes.driver.accent;

  return (
    <AbsoluteFill>
      <SceneLayer mode="driver" progress={frame / 105} camera={{ from: 1.14, drift: 40 }} />
      <AbsoluteFill style={{ zIndex: 6, justifyContent: "center", alignItems: "center", gap: 44 }}>
        <Wordmark
          progress={Math.min(1, frame / 40)}
          displayFamily={fonts.display}
          bodyFamily={fonts.body}
          fontSize={layout.type.wordmark}
        />
        <div style={{ width: layout.boxes.rail.width }}>
          <Rail
            text={HOOK_RAIL}
            progress={Math.min(1, Math.max(0, (frame - 44) / 26))}
            fontFamily={fonts.mono}
            fontSize={layout.type.rail}
            tracking={layout.type.railTracking}
            width={layout.boxes.rail.width}
            accent={accent}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Implement the Features sequence**

`apps/reel/src/sequences/Features.tsx`:

```tsx
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { modes, type PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { Layout } from "../layout";
import type { ReelFonts } from "../fonts";
import { FEATURE_RAIL } from "../copy";
import { SceneLayer } from "../scenes/SceneLayer";
import { Rail } from "../overlay/Rail";
import { NowCardVertical } from "../overlay/NowCardVertical";
import { PlaylistSheetVertical } from "../overlay/PlaylistSheetVertical";
import { TouchCue } from "../overlay/TouchCue";
import { tracksFor } from "../lib/tracks";
import type { Gesture } from "../lib/gestures";

const ORDER: PlaylistMode[] = ["driver", "rainy", "party", "ghazal"];

/** Feature 1: four taps on the mode dots, world changing on each. 55 frames. */
export function FeatureSwipe({ layout, fonts }: { layout: Layout; fonts: ReelFonts }) {
  const frame = useCurrentFrame();
  const index = Math.min(3, Math.floor(frame / 13));
  const mode = ORDER[index];
  const dotX = layout.boxes.rollBoard.x + 40 + index * 62;
  const dotY = layout.boxes.rollBoard.y - 0;
  const tap: Gesture = { kind: "tap", at: [dotX, dotY], startFrame: index * 13, durationInFrames: 10 };

  return (
    <AbsoluteFill>
      <SceneLayer mode={mode} progress={(frame % 13) / 13} camera={{ from: 1.03, drift: 8 }} />
      <AbsoluteFill style={{ zIndex: 6 }}>
        <div style={{ position: "absolute", left: layout.boxes.rollBoard.x, top: dotY, display: "flex", gap: 22 }}>
          {ORDER.map((m, i) => (
            <span
              key={m}
              style={{
                width: i === index ? 46 : 14,
                height: 14,
                borderRadius: 7,
                background: i === index ? modes[m].accent : "rgba(255,244,232,.32)",
              }}
            />
          ))}
        </div>
        <div style={{ position: "absolute", left: layout.boxes.rail.x, top: layout.boxes.rail.y }}>
          <Rail
            text={FEATURE_RAIL[0]}
            progress={Math.min(1, frame / 12)}
            fontFamily={fonts.mono}
            fontSize={layout.type.rail}
            tracking={layout.type.railTracking}
            width={layout.boxes.rail.width}
            accent={modes[mode].accent}
          />
        </div>
        <TouchCue gesture={tap} frame={frame} accent={modes[mode].accent} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** Feature 2: push in on the card, curated names cycling. 55 frames. */
export function FeatureNames({ layout, fonts }: { layout: Layout; fonts: ReelFonts }) {
  const frame = useCurrentFrame();
  const tracks = tracksFor("ghazal");
  const track = tracks[Math.floor(frame / 11) % tracks.length];

  return (
    <AbsoluteFill>
      <SceneLayer mode="ghazal" progress={frame / 55} camera={{ from: 1.0, drift: 6 }} />
      <AbsoluteFill style={{ zIndex: 6, justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${1 + Math.min(1, frame / 55) * 0.18})` }}>
          <NowCardVertical
            mode="ghazal"
            title={track.title}
            artist={track.artist}
            progress={1}
            width={layout.boxes.nowCard.width}
            bodyFamily={fonts.body}
            monoFamily={fonts.mono}
          />
        </div>
        <div style={{ position: "absolute", left: layout.boxes.rail.x, top: layout.boxes.rail.y }}>
          <Rail
            text={FEATURE_RAIL[1]}
            progress={Math.min(1, frame / 12)}
            fontFamily={fonts.mono}
            fontSize={layout.type.rail}
            tracking={layout.type.railTracking}
            width={layout.boxes.rail.width}
            accent={modes.ghazal.accent}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** Feature 3: tap opens the playlist sheet. 55 frames. */
export function FeatureSheet({ layout, fonts }: { layout: Layout; fonts: ReelFonts }) {
  const frame = useCurrentFrame();
  const tap: Gesture = {
    kind: "tap",
    at: [layout.boxes.player.x + 300, layout.boxes.player.y + 40],
    startFrame: 2,
    durationInFrames: 12,
  };

  return (
    <AbsoluteFill>
      <SceneLayer mode="ghazal" progress={frame / 55} camera={{ from: 1.0, drift: 6 }} />
      <AbsoluteFill style={{ zIndex: 6 }}>
        <div style={{ position: "absolute", left: layout.boxes.rail.x, top: layout.safe.top }}>
          <Rail
            text={FEATURE_RAIL[2]}
            progress={Math.min(1, frame / 12)}
            fontFamily={fonts.mono}
            fontSize={layout.type.rail}
            tracking={layout.type.railTracking}
            width={layout.boxes.rail.width}
            accent={modes.ghazal.accent}
          />
        </div>
        <div style={{ position: "absolute", left: 40, top: 700 }}>
          <PlaylistSheetVertical
            heading={`प्लेलिस्ट · ${modes.ghazal.label}`}
            tracks={tracksFor("ghazal")}
            currentIndex={0}
            progress={Math.min(1, Math.max(0, (frame - 12) / 24))}
            accent={modes.ghazal.accent}
            width={1000}
            height={820}
            bodyFamily={fonts.body}
            monoFamily={fonts.mono}
          />
        </div>
        <TouchCue gesture={tap} frame={frame} accent={modes.ghazal.accent} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 3: Implement the CTA sequence**

`apps/reel/src/sequences/Cta.tsx`:

```tsx
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { modes } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { Layout } from "../layout";
import type { ReelFonts } from "../fonts";
import { CTA_RAIL, CTA_URL } from "../copy";
import { SceneLayer } from "../scenes/SceneLayer";
import { Wordmark } from "../overlay/Wordmark";
import { Rail } from "../overlay/Rail";

export function Cta({ layout, fonts }: { layout: Layout; fonts: ReelFonts }) {
  const frame = useCurrentFrame();
  const accent = modes.driver.accent;
  const underline = Math.min(1, Math.max(0, (frame - 46) / 26));

  return (
    <AbsoluteFill>
      <SceneLayer mode="driver" progress={frame / 90} camera={{ from: 1.06, drift: 20 }} />
      <AbsoluteFill
        style={{ zIndex: 6, justifyContent: "center", alignItems: "center", gap: 40, background: "rgba(10,6,4,.34)" }}
      >
        <Wordmark
          progress={Math.min(1, frame / 30)}
          displayFamily={fonts.display}
          bodyFamily={fonts.body}
          fontSize={layout.type.wordmark}
        />
        <Rail
          text={CTA_RAIL}
          progress={Math.min(1, Math.max(0, (frame - 24) / 22))}
          fontFamily={fonts.mono}
          fontSize={layout.type.rail}
          tracking={layout.type.railTracking}
          width={layout.boxes.rail.width}
          accent={accent}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 40, letterSpacing: 3, color: "#fff4e8" }}>
            {CTA_URL}
          </span>
          <div style={{ height: 3, width: `${underline * 100}%`, minWidth: 2, background: accent, alignSelf: "stretch" }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 4: Implement the master timeline**

`apps/reel/src/Reel.tsx`:

```tsx
import { AbsoluteFill, Sequence } from "remotion";
import { layoutFor, type Format } from "./layout";
import { loadReelFonts } from "./fonts";
import { beat } from "./timeline";
import { ModeBlock } from "./scenes/ModeBlock";
import { Hook } from "./sequences/Hook";
import { FeatureNames, FeatureSheet, FeatureSwipe } from "./sequences/Features";
import { Cta } from "./sequences/Cta";

const fonts = loadReelFonts();

export function Reel({ format }: { format: Format }) {
  const layout = layoutFor(format);
  const props = { layout, fonts };

  const at = (name: Parameters<typeof beat>[0]) => {
    const b = beat(name);
    return { from: b.from, durationInFrames: b.durationInFrames };
  };

  return (
    <AbsoluteFill style={{ background: "#0a0604" }}>
      <Sequence {...at("hook")}><Hook {...props} /></Sequence>
      <Sequence {...at("driver")}><ModeBlock mode="driver" previousMode="ghazal" {...props} /></Sequence>
      <Sequence {...at("rainy")}><ModeBlock mode="rainy" previousMode="driver" {...props} /></Sequence>
      <Sequence {...at("party")}><ModeBlock mode="party" previousMode="rainy" {...props} /></Sequence>
      <Sequence {...at("ghazal")}><ModeBlock mode="ghazal" previousMode="party" {...props} /></Sequence>
      <Sequence {...at("feature1")}><FeatureSwipe {...props} /></Sequence>
      <Sequence {...at("feature2")}><FeatureNames {...props} /></Sequence>
      <Sequence {...at("feature3")}><FeatureSheet {...props} /></Sequence>
      <Sequence {...at("cta")}><Cta {...props} /></Sequence>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 5: Replace the Root with the real compositions**

`apps/reel/src/Root.tsx`:

```tsx
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { DURATION_IN_FRAMES, FPS } from "./timeline";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="ReelVertical"
        component={Reel}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ format: "vertical" as const }}
      />
      <Composition
        id="ReelSquare"
        component={Reel}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ format: "square" as const }}
      />
    </>
  );
}
```

Then delete `apps/reel/src/Probe.tsx` — it was disposable scaffolding.

- [ ] **Step 6: Spot-render one frame per sequence and review all nine**

```bash
cd apps/reel
for f in 50 160 280 400 520 600 660 720 800; do
  npx remotion still ReelVertical out/beat-$f.png --frame=$f
done
```

Expected: nine PNGs, one inside each beat. Check each for: correct mode scene, readable Devanagari, rail text present, nothing crossing `y > 1560` or `x > 1000`.

- [ ] **Step 7: Run typecheck and tests**

```bash
cd /Users/shivamsourav/Desktop/AI/Rasta && pnpm run typecheck && pnpm --filter @workspace/reel run test
```

Expected: both PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/reel/src
git commit -m "feat(reel): assemble the full 28 second vertical timeline"
```

---

### Task 11: Render the deliverables

**Files:**
- Create: `apps/reel/README.md`

- [ ] **Step 1: Render the vertical master**

```bash
cd apps/reel && pnpm run render:vertical
```

Expected: `apps/reel/out/rasta-reel-9x16.mp4`. This takes 5–15 minutes — the scenes use `feTurbulence`/`feDisplacementMap` filters that are expensive per frame. If it runs far longer, lower `Config.setConcurrency` in `remotion.config.ts` (memory pressure causes thrashing) or raise it if CPU is idle.

- [ ] **Step 2: Verify the vertical file**

```bash
cd apps/reel && npx remotion versions && ls -lh out/rasta-reel-9x16.mp4
```

Then confirm by playing it back:

```bash
open out/rasta-reel-9x16.mp4
```

Check all five, and do not proceed until each is confirmed:
1. Duration reads 28 seconds.
2. Rain visibly falls during the monsoon block.
3. The roll-board rolls on every mode change.
4. Every UI state change is preceded by the touch ring.
5. No text is clipped by the frame edge.

- [ ] **Step 3: Render the square cut and review it**

```bash
cd apps/reel && pnpm run render:square && open out/rasta-reel-1x1.mp4
```

Expected: `out/rasta-reel-1x1.mp4` at 1080×1080 with the hero, card and rail re-laid-out — not letterboxed. If elements overlap, adjust `SQUARE` in `layout.ts`; `layout.test.ts` already guards the bounds.

- [ ] **Step 4: Render the cover still**

```bash
cd apps/reel && pnpm run render:cover
```

Expected: `out/cover.png` — frame 90 of the hook, wordmark fully revealed over the Ladakh scene.

- [ ] **Step 5: Write the package README**

`apps/reel/README.md`:

```markdown
# @workspace/reel

Remotion project that renders the रास्ता रेडियो promo reel.

It imports `apps/web`'s real `SceneStage` art, stylesheet and curated track
data through the `@site` webpack alias, so the reel always matches the live
site. The dependency runs one way — never import from this package in
`apps/web`.

## Commands

- `pnpm --filter @workspace/reel run studio` — scrubbable live preview
- `pnpm --filter @workspace/reel run render:vertical` — 1080×1920 Instagram master
- `pnpm --filter @workspace/reel run render:square` — 1080×1080 LinkedIn cut
- `pnpm --filter @workspace/reel run render:cover` — cover still
- `pnpm --filter @workspace/reel run test` — unit tests for timeline, layout, copy and motion maths

## Gotchas

- **Videos render silent by design.** Audio is added in the Instagram app at
  post time. `--enforce-audio-track` writes a silent AAC stream because some
  uploaders reject a file with no audio stream at all.
- **`useCssAnimationSync` must be called by any component mounting
  `SceneStage`.** Remotion renders with the page paused, so without it the rain
  and the EQ bars come out frozen.
- **Fonts load through `@remotion/google-fonts`, not the site's CSS
  `@import`.** The remote import races the first frame and silently falls back
  to a non-Devanagari face.
- **Marketing copy lives only in `src/copy.ts`** and is constrained by
  `copy.test.ts`. Never claim the product is ad-free — the YouTube iframe can
  serve ads.
- Full renders take 5–15 minutes because of the scenes' SVG displacement filters.
```

- [ ] **Step 6: Commit**

```bash
git add apps/reel/README.md
git commit -m "docs(reel): document render commands and rendering gotchas"
```

---

### Task 12: Platform copy

**Files:**
- Create: `apps/reel/copy/instagram.md`
- Create: `apps/reel/copy/linkedin.md`

- [ ] **Step 1: Write the Instagram caption**

`apps/reel/copy/instagram.md`:

```markdown
# Instagram Reel

**Cover:** `out/cover.png`
**Video:** `out/rasta-reel-9x16.mp4`
**Audio:** pick a trending audio in the app — the file is rendered silent on purpose.

## Caption

चार मूड। एक अनंत सफ़र। 🚌

रास्ता रेडियो — a radio station that never stops playing.

Pick a world and drive:
🏔️ बस ड्राइवर — Leh-Manali highway, windows down
🌧️ बारिश का मौसम — monsoon night, wet streets
🌅 पार्टी मोड — Anjuna beach, bonfire, sunset
🌙 ग़ज़ल मोड — night bus, lamp-lit mehfil

Every track named by hand in Devanagari. No sign-up. Just press play.

🔗 rastaradio.tech

## Hashtags

#hindimusic #bollywoodmusic #90sbollywood #retrobollywood #ghazal #indiedev
#buildinpublic #webdevelopment #reactjs #uidesign #indiantravel #roadtrip
#monsoonvibes #goa #ladakh
```

- [ ] **Step 2: Write the LinkedIn post**

`apps/reel/copy/linkedin.md`:

```markdown
# LinkedIn post

**Video:** `out/rasta-reel-1x1.mp4` (square outperforms vertical in the LinkedIn
feed and does not letterbox on desktop)

## Post

I built a radio station that never stops playing.

रास्ता रेडियो is four curated worlds, and you swipe between them:

→ बस ड्राइवर — the Leh-Manali highway, windows down
→ बारिश का मौसम — a monsoon night on wet streets
→ पार्टी मोड — Anjuna beach at sunset
→ ग़ज़ल मोड — a night bus and a lamp-lit mehfil

Three things I cared about more than I expected to:

**The interface is entirely in Hindi.** Not translated — written in Hindi
first. It changed what the product felt like.

**Every track is named by hand.** Playlist apps show you raw YouTube titles
full of "Full HD Video Song 1080p". Each track here carries a curated
Devanagari title and artist.

**The backdrops are drawn, not stock.** Four full-bleed SVG scenes, each run
through a displacement filter so the linework wobbles like a sketchbook rather
than a vector icon set.

Built with React and TypeScript. This reel is rendered with Remotion — it
imports the site's actual scene components and animates them on a frame
timeline, so what you're watching is the real UI, not a mockup of it.

rastaradio.tech — no sign-up, just press play.

#buildinpublic #react #typescript #frontend #uidesign #musictech
```

- [ ] **Step 3: Commit**

```bash
git add apps/reel/copy
git commit -m "docs(reel): add Instagram and LinkedIn post copy"
```

---

## Self-review

**Spec coverage.** Every spec section maps to a task: art direction §2 → Tasks 5, 6 (roll-board, shirorekha, rail); storyboard §3 → Tasks 9, 10; architecture §4 → Tasks 1, 2; deliverables §5 → Tasks 11, 12; risks §6 → Tasks 1 (fonts, install), 3 (CSS animation sync), 11 (render time); verification §7 → Tasks 3 Step 6 (rain moves), 10 Step 6 (per-sequence stills), 11 Steps 2–4 (rendered files).

**Interface consistency.** `layoutFor` returns `boxes`/`type`/`safe` and is consumed with those names in Tasks 6–10. `gestureState` returns `{x, y, pressed, visible, progress}`, consumed with those fields in `TouchCue` and `ModeBlock`. `loadReelFonts` returns `{display, body, mono}`, used with those keys throughout. `tracksFor` returns `ReelTrack[]` with `{title, artist}`, matching `PlayerBar`, `NowCardVertical` and `PlaylistSheetVertical`.

**Known trade-off.** `PlayerBar` shows a fixed `durationSeconds={214}` rather than a real track length. The site reads duration from the YouTube player at runtime, which does not exist in a render. This is a promotional timecode, not a claim about a specific track.
