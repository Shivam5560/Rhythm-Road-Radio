# YouTube Playback for Rhythm Road Radio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the four-mode `IndianPlaylist` mock into a real, deployable single-page site that actually plays the user's four YouTube/YouTube Music playlists, with shuffle and Hindi track metadata that gracefully falls back to cleaned live YouTube data.

**Architecture:** A new `apps/web` Vite+React package (the real deployable site, no router) hosts a copy of the existing mock components. A `useYouTubePlayer` hook wraps the official YouTube IFrame Player API (hidden 1×1 player, verified against saloon.wtf's own implementation) and exposes simple playback state/controls. A pure `playerReducer` translates YouTube's player-state events into our UI state; pure `trackMetadata`/`shuffle`/`formatTime` helpers are unit-tested in isolation. Per-mode static `TrackMap` files provide curated Hindi metadata with automatic fallback to cleaned live titles for anything not yet curated — no backend.

**Tech Stack:** Vite 7, React 19, TypeScript, lucide-react, YouTube IFrame Player API, Vitest (new to this repo, added scoped to `apps/web`).

## Global Constraints

- No backend/persistence for v1 — mode, volume, and shuffle state all reset on reload (per approved spec).
- `apps/web` is a new, real package; `artifacts/mockup-sandbox`'s copy of these components is left untouched as a design-only mock.
- Single page, no client-side router — `apps/web` renders exactly one component tree.
- Static per-mode Hindi metadata files, checked into the repo, with automatic live-fallback for any video ID not yet curated — never a backend/database.
- Shuffle is a real feature: on `next()` random-picks from the real playlist excluding the current track; `previous()` steps back through actual shuffle history.
- Mirror this repo's existing pnpm workspace conventions exactly: `catalog:` version refs where the dependency is already in `pnpm-workspace.yaml`'s catalog, `@workspace/<name>` package naming, `tsc -p tsconfig.json --noEmit` for typecheck scripts.
- The four real, verified playlist IDs (do not substitute placeholders):
  - driver: `PL0umg_TNpoZTTdZVIi5tfX69pRmoMFGna`
  - rainy: `PL43tsEhYIdTuf-xO_4ZrZtRp1dwulm2SQ`
  - party: `PLfcRxVaMQ7ZM`
  - ghazal: `PL43tsEhYIdTvnK96MqsVkXV90fQFcsdoN`

---

### Task 1: Scaffold the `apps/web` package

**Files:**
- Modify: `pnpm-workspace.yaml:37-41` (add `apps/*` to the `packages` list)
- Modify: `package.json:6` (add `apps/**` to the root `typecheck` filter)
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/index.css`

**Interfaces:**
- Produces: a working `@workspace/web` package other tasks add files into. Its `dev`/`build`/`typecheck` scripts follow the same shape as `artifacts/mockup-sandbox`'s.

- [ ] **Step 1: Add `apps/*` to the workspace packages list**

In `pnpm-workspace.yaml`, change:

```yaml
packages:
  - artifacts/*
  - lib/*
  - lib/integrations/*
  - scripts
```

to:

```yaml
packages:
  - apps/*
  - artifacts/*
  - lib/*
  - lib/integrations/*
  - scripts
```

- [ ] **Step 2: Include `apps/**` in the root typecheck filter**

In `package.json`, change:

```json
"typecheck": "pnpm run typecheck:libs && pnpm -r --filter \"./artifacts/**\" --filter \"./scripts\" --if-present run typecheck"
```

to:

```json
"typecheck": "pnpm run typecheck:libs && pnpm -r --filter \"./apps/**\" --filter \"./artifacts/**\" --filter \"./scripts\" --if-present run typecheck"
```

- [ ] **Step 3: Create `apps/web/package.json`**

```json
{
  "name": "@workspace/web",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@vitejs/plugin-react": "catalog:",
    "lucide-react": "catalog:",
    "react": "catalog:",
    "react-dom": "catalog:",
    "vite": "catalog:",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 4: Create `apps/web/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*", "vite.config.ts"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "noEmit": true,
    "lib": ["es2022", "dom", "dom.iterable"],
    "jsx": "preserve",
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 5: Create `apps/web/vite.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

const port = Number(process.env.PORT ?? 5174);
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
  },
  preview: {
    port,
    host: "0.0.0.0",
  },
  test: {
    environment: "node",
    globals: false,
  },
});
```

- [ ] **Step 6: Create `apps/web/index.html`**

```html
<!doctype html>
<html lang="hi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>रास्ता रेडियो</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create `apps/web/src/index.css`**

```css
*, *::before, *::after {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  padding: 0;
  min-height: 100%;
  background: #0a0604;
}
```

- [ ] **Step 8: Create `apps/web/src/main.tsx` with a placeholder to prove the scaffold boots**

```tsx
import { createRoot } from "react-dom/client";
import "./index.css";

function BootPlaceholder() {
  return (
    <div style={{ color: "#fff4e8", padding: 24, fontFamily: "sans-serif" }}>
      रास्ता रेडियो — scaffold booted
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<BootPlaceholder />);
```

- [ ] **Step 9: Install and verify the scaffold boots**

Run: `pnpm install` (from repo root)
Then: `PORT=5174 BASE_PATH=/ pnpm --filter @workspace/web run dev`
Expected: Vite prints `Local: http://localhost:5174/`. Open it — the page shows "रास्ता रेडियो — scaffold booted" with no console errors.

- [ ] **Step 10: Commit**

```bash
git add pnpm-workspace.yaml package.json apps/web
git commit -m "feat(web): scaffold apps/web as the real deployable app"
```

---

### Task 2: Track metadata resolution (`trackMetadata.ts`)

**Files:**
- Create: `apps/web/src/lib/trackMetadata.ts`
- Test: `apps/web/src/lib/trackMetadata.test.ts`

**Interfaces:**
- Produces: `TrackInfo = { title: string; artist: string }`, `TrackMap = Record<string, TrackInfo>`, `cleanTitle(raw: string): string`, `cleanAuthor(raw: string): string`, `resolveTrackMetadata(videoId: string, curated: TrackMap, liveTitle: string, liveAuthor: string): TrackInfo`. Consumed by Task 6 (`useYouTubePlayer`) and Task 4 (data file doc comments reference `TrackMap`).

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/src/lib/trackMetadata.test.ts
import { describe, expect, it } from "vitest";
import { cleanAuthor, cleanTitle, resolveTrackMetadata } from "./trackMetadata";

describe("cleanTitle", () => {
  it("strips (Official Video) clutter", () => {
    expect(cleanTitle("Ek Pal Ka Jeena (Official Video)")).toBe("Ek Pal Ka Jeena");
  });

  it("strips | T-Series suffix", () => {
    expect(cleanTitle("Kesariya | T-Series")).toBe("Kesariya");
  });

  it("collapses extra whitespace left behind", () => {
    expect(cleanTitle("Tum Ho   (Official Audio)  ")).toBe("Tum Ho");
  });

  it("leaves already-clean titles untouched", () => {
    expect(cleanTitle("Ek Pal Ka Jeena")).toBe("Ek Pal Ka Jeena");
  });
});

describe("cleanAuthor", () => {
  it("strips a trailing - Topic suffix", () => {
    expect(cleanAuthor("Kishore Kumar - Topic")).toBe("Kishore Kumar");
  });

  it("leaves normal channel names untouched", () => {
    expect(cleanAuthor("The Kumar Sanu Official")).toBe("The Kumar Sanu Official");
  });
});

describe("resolveTrackMetadata", () => {
  it("returns the curated entry when the video id is known", () => {
    const curated = { abc123: { title: "एक पल का जीना", artist: "लकी अली" } };
    expect(resolveTrackMetadata("abc123", curated, "Ek Pal Ka Jeena", "Lucky Ali")).toEqual({
      title: "एक पल का जीना",
      artist: "लकी अली",
    });
  });

  it("falls back to cleaned live metadata when the video id is unknown", () => {
    expect(
      resolveTrackMetadata("xyz789", {}, "Tum Ho (Official Audio)", "Mohit Chauhan - Topic"),
    ).toEqual({ title: "Tum Ho", artist: "Mohit Chauhan" });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @workspace/web exec vitest run src/lib/trackMetadata.test.ts`
Expected: FAIL — `Cannot find module './trackMetadata'`

- [ ] **Step 3: Write the implementation**

```ts
// apps/web/src/lib/trackMetadata.ts
export type TrackInfo = { title: string; artist: string };
export type TrackMap = Record<string, TrackInfo>;

const CLUTTER_PATTERNS: RegExp[] = [
  /\(official\s*(video|audio|lyric video|music video)\)/gi,
  /\[official\s*(video|audio|lyric video|music video)\]/gi,
  /\|\s*t-series/gi,
  /\|\s*zee music company/gi,
  /\(lyrical\)/gi,
  /\[lyrics?\]/gi,
];

export function cleanTitle(rawTitle: string): string {
  let cleaned = rawTitle;
  for (const pattern of CLUTTER_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.replace(/\s{2,}/g, " ").trim();
}

export function cleanAuthor(rawAuthor: string): string {
  return rawAuthor.replace(/\s*-\s*Topic$/i, "").trim();
}

export function resolveTrackMetadata(
  videoId: string,
  curated: TrackMap,
  liveTitle: string,
  liveAuthor: string,
): TrackInfo {
  const curatedEntry = curated[videoId];
  if (curatedEntry) return curatedEntry;
  return { title: cleanTitle(liveTitle), artist: cleanAuthor(liveAuthor) };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @workspace/web exec vitest run src/lib/trackMetadata.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/trackMetadata.ts apps/web/src/lib/trackMetadata.test.ts
git commit -m "feat(web): add track metadata resolution with live-title fallback"
```

---

### Task 3: Shuffle logic (`shuffle.ts`)

**Files:**
- Create: `apps/web/src/lib/shuffle.ts`
- Test: `apps/web/src/lib/shuffle.test.ts`

**Interfaces:**
- Produces: `pickShuffleIndex(playlistLength: number, currentIndex: number): number`, `class ShuffleHistory { push(index: number): void; popPrevious(): number | null; clear(): void }`. Consumed by Task 6 (`useYouTubePlayer`).

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/src/lib/shuffle.test.ts
import { describe, expect, it } from "vitest";
import { pickShuffleIndex, ShuffleHistory } from "./shuffle";

describe("pickShuffleIndex", () => {
  it("never returns the current index when more than one track exists", () => {
    for (let i = 0; i < 50; i++) {
      const result = pickShuffleIndex(5, 2);
      expect(result).not.toBe(2);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(5);
    }
  });

  it("returns 0 when the playlist has one or zero tracks", () => {
    expect(pickShuffleIndex(1, 0)).toBe(0);
    expect(pickShuffleIndex(0, 0)).toBe(0);
  });
});

describe("ShuffleHistory", () => {
  it("steps back to the track before the current one", () => {
    const history = new ShuffleHistory();
    history.push(3);
    history.push(7);
    history.push(1);
    expect(history.popPrevious()).toBe(7);
  });

  it("returns null when there is nowhere to go back to", () => {
    const history = new ShuffleHistory();
    history.push(3);
    expect(history.popPrevious()).toBeNull();
  });

  it("clear() empties the history", () => {
    const history = new ShuffleHistory();
    history.push(3);
    history.push(7);
    history.clear();
    expect(history.popPrevious()).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @workspace/web exec vitest run src/lib/shuffle.test.ts`
Expected: FAIL — `Cannot find module './shuffle'`

- [ ] **Step 3: Write the implementation**

```ts
// apps/web/src/lib/shuffle.ts
export function pickShuffleIndex(playlistLength: number, currentIndex: number): number {
  if (playlistLength <= 1) return 0;
  let next = currentIndex;
  while (next === currentIndex) {
    next = Math.floor(Math.random() * playlistLength);
  }
  return next;
}

export class ShuffleHistory {
  private stack: number[] = [];

  push(index: number): void {
    this.stack.push(index);
  }

  popPrevious(): number | null {
    this.stack.pop(); // drop the current track
    const previous = this.stack.pop();
    return previous ?? null;
  }

  clear(): void {
    this.stack = [];
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @workspace/web exec vitest run src/lib/shuffle.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/shuffle.ts apps/web/src/lib/shuffle.test.ts
git commit -m "feat(web): add shuffle index picker and history stack"
```

---

### Task 4: Static per-mode Hindi metadata files + playlist-title fetch script

**Files:**
- Create: `apps/web/src/data/tracks.driver.ts`
- Create: `apps/web/src/data/tracks.rainy.ts`
- Create: `apps/web/src/data/tracks.party.ts`
- Create: `apps/web/src/data/tracks.ghazal.ts`
- Create: `scripts/src/fetch-playlist-titles.ts`
- Modify: `scripts/package.json` (add a `fetch-playlist` script)

**Interfaces:**
- Consumes: `TrackMap` from Task 2 (`apps/web/src/lib/trackMetadata.ts`).
- Produces: four named exports (`driverTracks`, `rainyTracks`, `partyTracks`, `ghazalTracks`), each typed `TrackMap`, consumed by Task 7 (`IndianPlaylist.tsx`).

- [ ] **Step 1: Create the four static data files**

```ts
// apps/web/src/data/tracks.driver.ts
import type { TrackMap } from "../lib/trackMetadata";

/**
 * Hand-curated Hindi title/artist overrides for the बस ड्राइवर playlist,
 * keyed by YouTube video ID. Anything not listed here falls back to a
 * cleaned-up version of its live YouTube title/channel automatically (see
 * resolveTrackMetadata in trackMetadata.ts) — an empty map is a valid,
 * fully working state.
 *
 * To add entries, run:
 *   pnpm --filter @workspace/scripts run fetch-playlist -- \
 *     "https://music.youtube.com/playlist?list=PL0umg_TNpoZTTdZVIi5tfX69pRmoMFGna" \
 *     /tmp/driver-tracks.json
 * then transliterate each { videoId, rawTitle, rawChannel } entry into
 * Devanagari and add it below.
 */
export const driverTracks: TrackMap = {};
```

```ts
// apps/web/src/data/tracks.rainy.ts
import type { TrackMap } from "../lib/trackMetadata";

/**
 * Hand-curated Hindi title/artist overrides for the बारिश का मौसम playlist,
 * keyed by YouTube video ID. See tracks.driver.ts for the fallback
 * behaviour and generation workflow.
 *
 *   pnpm --filter @workspace/scripts run fetch-playlist -- \
 *     "https://music.youtube.com/playlist?list=PL43tsEhYIdTuf-xO_4ZrZtRp1dwulm2SQ" \
 *     /tmp/rainy-tracks.json
 */
export const rainyTracks: TrackMap = {};
```

```ts
// apps/web/src/data/tracks.party.ts
import type { TrackMap } from "../lib/trackMetadata";

/**
 * Hand-curated Hindi title/artist overrides for the पार्टी मोड playlist,
 * keyed by YouTube video ID. See tracks.driver.ts for the fallback
 * behaviour and generation workflow.
 *
 *   pnpm --filter @workspace/scripts run fetch-playlist -- \
 *     "https://music.youtube.com/playlist?list=PLfcRxVaMQ7ZM" \
 *     /tmp/party-tracks.json
 */
export const partyTracks: TrackMap = {};
```

```ts
// apps/web/src/data/tracks.ghazal.ts
import type { TrackMap } from "../lib/trackMetadata";

/**
 * Hand-curated Hindi title/artist overrides for the ग़ज़ल मोड playlist,
 * keyed by YouTube video ID. See tracks.driver.ts for the fallback
 * behaviour and generation workflow.
 *
 *   pnpm --filter @workspace/scripts run fetch-playlist -- \
 *     "https://music.youtube.com/playlist?list=PL43tsEhYIdTvnK96MqsVkXV90fQFcsdoN" \
 *     /tmp/ghazal-tracks.json
 */
export const ghazalTracks: TrackMap = {};
```

- [ ] **Step 2: Add the fetch script to the existing `scripts` package**

```ts
// scripts/src/fetch-playlist-titles.ts
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const playlistUrl = process.argv[2];
const outputPath = process.argv[3];

if (!playlistUrl || !outputPath) {
  console.error("Usage: tsx src/fetch-playlist-titles.ts <playlist-url> <output-json-path>");
  process.exit(1);
}

const result = spawnSync("yt-dlp", ["--flat-playlist", "-J", playlistUrl], {
  encoding: "utf-8",
  maxBuffer: 1024 * 1024 * 64,
});

if (result.status !== 0) {
  console.error(result.stderr || "yt-dlp failed. Is it installed? Try: pip install yt-dlp");
  process.exit(1);
}

type YtDlpEntry = { id: string; title: string; channel?: string; uploader?: string };
const parsed = JSON.parse(result.stdout) as { entries: YtDlpEntry[] };

const tracks = parsed.entries.map((entry) => ({
  videoId: entry.id,
  rawTitle: entry.title,
  rawChannel: entry.channel ?? entry.uploader ?? "",
}));

writeFileSync(outputPath, JSON.stringify(tracks, null, 2), "utf-8");
console.log(`Wrote ${tracks.length} tracks to ${outputPath}`);
```

In `scripts/package.json`, add to `"scripts"`:

```json
"fetch-playlist": "tsx ./src/fetch-playlist-titles.ts"
```

- [ ] **Step 3: Verify the data files typecheck**

Run: `pnpm --filter @workspace/web run typecheck`
Expected: no errors mentioning `tracks.driver.ts`, `tracks.rainy.ts`, `tracks.party.ts`, or `tracks.ghazal.ts`.

- [ ] **Step 4: Verify the fetch script works against one real playlist**

If `yt-dlp` isn't installed: `pip install yt-dlp` (or `brew install yt-dlp`).
Run: `pnpm --filter @workspace/scripts run fetch-playlist -- "https://music.youtube.com/playlist?list=PLfcRxVaMQ7ZM" /tmp/party-tracks.json`
Expected: prints `Wrote 94 tracks to /tmp/party-tracks.json` (or close to it — playlist sizes can drift); `/tmp/party-tracks.json` contains an array of `{ videoId, rawTitle, rawChannel }` objects with real YouTube video IDs.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/data scripts/src/fetch-playlist-titles.ts scripts/package.json
git commit -m "feat(web): add empty per-mode Hindi metadata maps and a playlist-title fetch script"
```

---

### Task 5: Player state reducer (`playerReducer.ts`)

**Files:**
- Create: `apps/web/src/hooks/playerReducer.ts`
- Test: `apps/web/src/hooks/playerReducer.test.ts`

**Interfaces:**
- Produces: `type PlayerStatus = "idle" | "cued" | "playing" | "paused" | "buffering"`, `type PlayerState = { status: PlayerStatus; videoId: string | null; rawTitle: string; rawAuthor: string; currentTime: number; duration: number; shuffled: boolean }`, `initialPlayerState: PlayerState`, `statusFromYouTubeState(ytState: number): PlayerStatus`, `type PlayerAction = { type: "YT_STATE_CHANGE"; ytState: number; videoId: string; rawTitle: string; rawAuthor: string } | { type: "TICK"; currentTime: number; duration: number } | { type: "TOGGLE_SHUFFLE" }`, `playerReducer(state: PlayerState, action: PlayerAction): PlayerState`. Consumed by Task 6 (`useYouTubePlayer`).

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/src/hooks/playerReducer.test.ts
import { describe, expect, it } from "vitest";
import { initialPlayerState, playerReducer, statusFromYouTubeState } from "./playerReducer";

describe("statusFromYouTubeState", () => {
  it("maps YouTube's numeric player states to our status strings", () => {
    expect(statusFromYouTubeState(1)).toBe("playing");
    expect(statusFromYouTubeState(2)).toBe("paused");
    expect(statusFromYouTubeState(3)).toBe("buffering");
    expect(statusFromYouTubeState(5)).toBe("cued");
    expect(statusFromYouTubeState(0)).toBe("idle");
    expect(statusFromYouTubeState(-1)).toBe("idle");
  });
});

describe("playerReducer", () => {
  it("updates status and track info on YT_STATE_CHANGE", () => {
    const next = playerReducer(initialPlayerState, {
      type: "YT_STATE_CHANGE",
      ytState: 1,
      videoId: "abc123",
      rawTitle: "Tum Ho",
      rawAuthor: "Mohit Chauhan",
    });
    expect(next.status).toBe("playing");
    expect(next.videoId).toBe("abc123");
    expect(next.rawTitle).toBe("Tum Ho");
  });

  it("updates currentTime/duration on TICK without touching other fields", () => {
    const playing = playerReducer(initialPlayerState, {
      type: "YT_STATE_CHANGE",
      ytState: 1,
      videoId: "abc123",
      rawTitle: "Tum Ho",
      rawAuthor: "Mohit Chauhan",
    });
    const ticked = playerReducer(playing, { type: "TICK", currentTime: 42, duration: 210 });
    expect(ticked.currentTime).toBe(42);
    expect(ticked.duration).toBe(210);
    expect(ticked.status).toBe("playing");
    expect(ticked.videoId).toBe("abc123");
  });

  it("flips shuffled on TOGGLE_SHUFFLE", () => {
    const toggled = playerReducer(initialPlayerState, { type: "TOGGLE_SHUFFLE" });
    expect(toggled.shuffled).toBe(true);
    const toggledBack = playerReducer(toggled, { type: "TOGGLE_SHUFFLE" });
    expect(toggledBack.shuffled).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @workspace/web exec vitest run src/hooks/playerReducer.test.ts`
Expected: FAIL — `Cannot find module './playerReducer'`

- [ ] **Step 3: Write the implementation**

```ts
// apps/web/src/hooks/playerReducer.ts
export type PlayerStatus = "idle" | "cued" | "playing" | "paused" | "buffering";

export type PlayerState = {
  status: PlayerStatus;
  videoId: string | null;
  rawTitle: string;
  rawAuthor: string;
  currentTime: number;
  duration: number;
  shuffled: boolean;
};

export const initialPlayerState: PlayerState = {
  status: "idle",
  videoId: null,
  rawTitle: "",
  rawAuthor: "",
  currentTime: 0,
  duration: 0,
  shuffled: false,
};

// Mirrors YT.PlayerState: UNSTARTED=-1, ENDED=0, PLAYING=1, PAUSED=2, BUFFERING=3, CUED=5
export function statusFromYouTubeState(ytState: number): PlayerStatus {
  switch (ytState) {
    case 1:
      return "playing";
    case 2:
      return "paused";
    case 3:
      return "buffering";
    case 5:
      return "cued";
    default:
      return "idle";
  }
}

export type PlayerAction =
  | { type: "YT_STATE_CHANGE"; ytState: number; videoId: string; rawTitle: string; rawAuthor: string }
  | { type: "TICK"; currentTime: number; duration: number }
  | { type: "TOGGLE_SHUFFLE" };

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "YT_STATE_CHANGE":
      return {
        ...state,
        status: statusFromYouTubeState(action.ytState),
        videoId: action.videoId,
        rawTitle: action.rawTitle,
        rawAuthor: action.rawAuthor,
      };
    case "TICK":
      return { ...state, currentTime: action.currentTime, duration: action.duration };
    case "TOGGLE_SHUFFLE":
      return { ...state, shuffled: !state.shuffled };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @workspace/web exec vitest run src/hooks/playerReducer.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/hooks/playerReducer.ts apps/web/src/hooks/playerReducer.test.ts
git commit -m "feat(web): add pure player state reducer"
```

---

### Task 6: `useYouTubePlayer` hook + minimal verification harness

**Files:**
- Create: `apps/web/src/hooks/useYouTubePlayer.ts`
- Modify: `apps/web/src/main.tsx` (temporary harness — Task 7 will replace this again)

**Interfaces:**
- Consumes: `playerReducer`, `initialPlayerState` (Task 5); `pickShuffleIndex`, `ShuffleHistory` (Task 3); `resolveTrackMetadata`, `TrackMap` (Task 2).
- Produces: `useYouTubePlayer(playlistId: string, trackMap: TrackMap): { title: string; artist: string; isPlaying: boolean; currentTime: number; duration: number; shuffled: boolean; play(): void; pause(): void; next(): void; previous(): void; toggleShuffle(): void; setVolume(v: number): void }`. Consumed by Task 7 (`IndianPlaylist.tsx`).

This hook wraps the YouTube IFrame Player API, which only exists as a browser global loaded from a remote script — it cannot be meaningfully unit-tested without a heavy fake of `window.YT`. Its pure sub-logic (state mapping, shuffle picking, metadata fallback) is already tested in Tasks 2/3/5. This task's own verification is a real browser check against a minimal harness.

- [ ] **Step 1: Write the hook**

```ts
// apps/web/src/hooks/useYouTubePlayer.ts
import { useEffect, useReducer, useRef } from "react";
import { playerReducer, initialPlayerState } from "./playerReducer";
import { pickShuffleIndex, ShuffleHistory } from "../lib/shuffle";
import { resolveTrackMetadata, type TrackMap } from "../lib/trackMetadata";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;
  apiLoadPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiLoadPromise;
}

export function useYouTubePlayer(playlistId: string, trackMap: TrackMap) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const playerRef = useRef<any>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef(new ShuffleHistory());
  const shuffledRef = useRef(false);
  const readyPlaylistIdRef = useRef<string | null>(null);

  function advanceShuffled() {
    const player = playerRef.current;
    if (!player) return;
    const playlist: string[] = player.getPlaylist() ?? [];
    const currentIndex = player.getPlaylistIndex();
    if (playlist.length === 0) return;
    historyRef.current.push(currentIndex);
    const nextIndex = pickShuffleIndex(playlist.length, currentIndex);
    player.playVideoAt(nextIndex);
  }

  // create the hidden player once, for the life of the component
  useEffect(() => {
    let cancelled = false;
    const host = document.createElement("div");
    host.style.position = "absolute";
    host.style.width = "1px";
    host.style.height = "1px";
    host.style.overflow = "hidden";
    host.style.opacity = "0";
    host.style.pointerEvents = "none";
    document.body.appendChild(host);
    hostRef.current = host;
    const mountPoint = document.createElement("div");
    host.appendChild(mountPoint);

    loadYouTubeIframeApi().then(() => {
      if (cancelled) return;
      playerRef.current = new window.YT!.Player(mountPoint, {
        height: "360",
        width: "640",
        playerVars: { listType: "playlist", list: playlistId, playsinline: 1 },
        events: {
          onReady: () => {
            readyPlaylistIdRef.current = playlistId;
          },
          onStateChange: (event: any) => {
            const data = playerRef.current.getVideoData();
            dispatch({
              type: "YT_STATE_CHANGE",
              ytState: event.data,
              videoId: data.video_id,
              rawTitle: data.title,
              rawAuthor: data.author,
            });
            if (event.data === 0 && shuffledRef.current) {
              advanceShuffled();
            }
          },
          onError: () => {
            playerRef.current?.nextVideo();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      hostRef.current?.remove();
    };
    // Intentionally runs once: initial mount only. Mode/playlist changes
    // are handled by the loadPlaylist effect below, on the same instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // switch playlists on mode change without recreating the player
  useEffect(() => {
    if (!playerRef.current?.loadPlaylist) return;
    if (readyPlaylistIdRef.current === null) return;
    if (readyPlaylistIdRef.current === playlistId) return;
    readyPlaylistIdRef.current = playlistId;
    historyRef.current.clear();
    playerRef.current.loadPlaylist({ listType: "playlist", list: playlistId });
  }, [playlistId]);

  // progress ticker while playing
  useEffect(() => {
    if (state.status !== "playing") return;
    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      dispatch({
        type: "TICK",
        currentTime: player.getCurrentTime(),
        duration: player.getDuration(),
      });
    }, 500);
    return () => window.clearInterval(interval);
  }, [state.status]);

  function next() {
    if (state.shuffled) {
      advanceShuffled();
    } else {
      playerRef.current?.nextVideo();
    }
  }

  function previous() {
    if (state.shuffled) {
      const target = historyRef.current.popPrevious();
      if (target !== null) {
        playerRef.current?.playVideoAt(target);
        return;
      }
    }
    playerRef.current?.previousVideo();
  }

  function toggleShuffle() {
    shuffledRef.current = !shuffledRef.current;
    dispatch({ type: "TOGGLE_SHUFFLE" });
  }

  const track = resolveTrackMetadata(state.videoId ?? "", trackMap, state.rawTitle, state.rawAuthor);

  return {
    title: track.title,
    artist: track.artist,
    isPlaying: state.status === "playing",
    currentTime: state.currentTime,
    duration: state.duration,
    shuffled: state.shuffled,
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    next,
    previous,
    toggleShuffle,
    setVolume: (v: number) => playerRef.current?.setVolume(v),
  };
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm --filter @workspace/web run typecheck`
Expected: no errors.

- [ ] **Step 3: Wire a temporary minimal harness into `main.tsx` to prove the hook works end-to-end**

Replace the contents of `apps/web/src/main.tsx` (this is intentionally temporary — Task 7 replaces it again with the real page):

```tsx
import { createRoot } from "react-dom/client";
import "./index.css";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";

function Harness() {
  const player = useYouTubePlayer("PLfcRxVaMQ7ZM", {});
  return (
    <div style={{ color: "#fff4e8", padding: 24, fontFamily: "sans-serif" }}>
      <p>{player.title || "(loading…)"} — {player.artist}</p>
      <p>{player.isPlaying ? "playing" : "paused"} · shuffle: {player.shuffled ? "on" : "off"}</p>
      <button onClick={player.play}>play</button>
      <button onClick={player.pause}>pause</button>
      <button onClick={player.previous}>prev</button>
      <button onClick={player.next}>next</button>
      <button onClick={player.toggleShuffle}>toggle shuffle</button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Harness />);
```

- [ ] **Step 4: Manually verify real playback in the browser**

Run: `PORT=5174 BASE_PATH=/ pnpm --filter @workspace/web run dev`, open `http://localhost:5174/`.
Expected, clicking through by hand:
- Clicking "play" starts real audio from the Party playlist (`PLfcRxVaMQ7ZM`) and the title/artist line updates from "(loading…)" to a real song name.
- "pause" stops it, "play" resumes.
- "next" and "prev" change the track and update the displayed title.
- "toggle shuffle" then "next" a few times never repeats the immediately-prior track; toggling shuffle back off and clicking "next" resumes native playlist order.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/hooks/useYouTubePlayer.ts apps/web/src/main.tsx
git commit -m "feat(web): add useYouTubePlayer hook wrapping the YouTube IFrame API"
```

---

### Task 7: Wire the real page — copy Scene/CSS, integrate the hook into `IndianPlaylist`, add shuffle UI

**Files:**
- Create: `apps/web/src/lib/formatTime.ts`
- Test: `apps/web/src/lib/formatTime.test.ts`
- Copy: `artifacts/mockup-sandbox/src/components/mockups/indian-playlist/Scene.tsx` → `apps/web/src/components/mockups/indian-playlist/Scene.tsx` (byte-identical, no changes)
- Copy + modify: `artifacts/mockup-sandbox/src/components/mockups/indian-playlist/indian-playlist.css` → `apps/web/src/components/mockups/indian-playlist/indian-playlist.css` (add shuffle/progress styles)
- Create: `apps/web/src/components/mockups/indian-playlist/IndianPlaylist.tsx` (new content, not a copy — integrates the hook)
- Modify: `apps/web/src/main.tsx` (replace the Task 6 harness with the real page)

**Interfaces:**
- Consumes: `SceneStage` (from the copied `Scene.tsx`), `useYouTubePlayer` (Task 6), `driverTracks`/`rainyTracks`/`partyTracks`/`ghazalTracks` (Task 4), `formatTime` (this task).

- [ ] **Step 1: Write the failing test for `formatTime`**

```ts
// apps/web/src/lib/formatTime.test.ts
import { describe, expect, it } from "vitest";
import { formatTime } from "./formatTime";

describe("formatTime", () => {
  it("formats whole minutes and seconds with zero padding", () => {
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(9)).toBe("00:09");
    expect(formatTime(600)).toBe("10:00");
  });

  it("floors fractional seconds", () => {
    expect(formatTime(65.9)).toBe("01:05");
  });

  it("returns 00:00 for invalid or negative input", () => {
    expect(formatTime(NaN)).toBe("00:00");
    expect(formatTime(-5)).toBe("00:00");
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `pnpm --filter @workspace/web exec vitest run src/lib/formatTime.test.ts`
Expected: FAIL — `Cannot find module './formatTime'`

- [ ] **Step 3: Implement `formatTime`**

```ts
// apps/web/src/lib/formatTime.ts
export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "00:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
```

- [ ] **Step 4: Run it, verify it passes**

Run: `pnpm --filter @workspace/web exec vitest run src/lib/formatTime.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Copy `Scene.tsx` unchanged**

```bash
mkdir -p apps/web/src/components/mockups/indian-playlist
cp artifacts/mockup-sandbox/src/components/mockups/indian-playlist/Scene.tsx \
   apps/web/src/components/mockups/indian-playlist/Scene.tsx
```

- [ ] **Step 6: Copy `indian-playlist.css`, then add shuffle/progress styles**

```bash
cp artifacts/mockup-sandbox/src/components/mockups/indian-playlist/indian-playlist.css \
   apps/web/src/components/mockups/indian-playlist/indian-playlist.css
```

Append to the end of `apps/web/src/components/mockups/indian-playlist/indian-playlist.css`:

```css
.player-shuffle{background:none;border:0;color:rgba(255,255,255,.5);cursor:pointer;padding:6px;display:grid;place-items:center}
.player-shuffle:hover{color:rgba(255,255,255,.8)}
.player-shuffle-active{color:var(--mode-accent)}
.player-progress-wrap{display:flex;align-items:center;gap:7px;font:10px 'DM Mono';color:rgba(255,255,255,.55)}
.player-progress-track{width:70px;height:3px;border-radius:2px;background:rgba(255,255,255,.18);overflow:hidden}
.player-progress-track span{display:block;height:100%;background:var(--mode-accent)}

@media(max-width:760px){
  .player-progress-wrap{display:none}
}
```

- [ ] **Step 7: Write `IndianPlaylist.tsx`, integrating the hook**

```tsx
// apps/web/src/components/mockups/indian-playlist/IndianPlaylist.tsx
import { useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import {
  BusFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Droplets,
  MapPin,
  Menu,
  Moon,
  Pause,
  Play,
  Repeat2,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  Waves,
  X,
} from "lucide-react";
import "./indian-playlist.css";
import { SceneStage } from "./Scene";
import { useYouTubePlayer } from "../../../hooks/useYouTubePlayer";
import { formatTime } from "../../../lib/formatTime";
import { driverTracks } from "../../../data/tracks.driver";
import { rainyTracks } from "../../../data/tracks.rainy";
import { partyTracks } from "../../../data/tracks.party";
import { ghazalTracks } from "../../../data/tracks.ghazal";

export type PlaylistMode = "driver" | "party" | "rainy" | "ghazal";

const modes: Record<PlaylistMode, {
  label: string;
  eyebrow: string;
  title: string;
  hindi: string;
  description: string;
  accent: string;
  soft: string;
  chip: string;
  sticker: string;
  cardLabel: string;
  playlistId: string;
}> = {
  driver: {
    label: "बस ड्राइवर",
    eyebrow: "पहाड़ी रूट · खुली छत",
    title: "बादलों के पार, सफ़र जारी है",
    hindi: "लद्दाख की राहों में",
    description: "खुली छत, ठंडी हवा और पहाड़ों का हर मोड़ — हर गाना एक नया नज़ारा है।",
    accent: "#e76f51",
    soft: "#ffe0c2",
    chip: "लेह, लद्दाख",
    sticker: "सुरक्षित सफ़र",
    cardLabel: "रूट / लेह-मनाली",
    playlistId: "PL0umg_TNpoZTTdZVIi5tfX69pRmoMFGna",
  },
  party: {
    label: "पार्टी मोड",
    eyebrow: "गोवा बीच · ढलते सूरज के साथ",
    title: "आज रेत पर नाचेंगे सब",
    hindi: "समंदर किनारे की धुन",
    description: "लहरों की आवाज़, बोनफायर की चिंगारी और पैरों तले रेत — यहाँ हर रात एक जश्न है।",
    accent: "#d7263d",
    soft: "#ffb4b4",
    chip: "अंजुना बीच, गोवा",
    sticker: "बेफिक्र रातें",
    cardLabel: "साइड ए / डांस",
    playlistId: "PLfcRxVaMQ7ZM",
  },
  rainy: {
    label: "बारिश का मौसम",
    eyebrow: "मानसून रेडियो · रात ८ बजे के बाद",
    title: "बारिश को साथ गाने दो",
    hindi: "बारिश की रात",
    description: "हल्की रोशनी, गीली सड़कें और वो गाने जो हर पुरानी याद को याद रखते हैं।",
    accent: "#2a6f97",
    soft: "#b9d9df",
    chip: "वायनाड, केरल",
    sticker: "बारिश / रिपीट",
    cardLabel: "रात / २००७",
    playlistId: "PL43tsEhYIdTuf-xO_4ZrZtRp1dwulm2SQ",
  },
  ghazal: {
    label: "ग़ज़ल मोड",
    eyebrow: "रात की बस · ग़ज़ल की महफ़िल",
    title: "हर शेर में एक कहानी है",
    hindi: "रात की महफ़िल",
    description: "बर्थ की टिमटिमाती बत्ती, शीशे पर बारिश की बूँदें और ग़ज़लें जो नींद से पहले दिल को छू जाएँ।",
    accent: "#c9974a",
    soft: "#f0dcae",
    chip: "आगरा कैंट",
    sticker: "देर रात / ग़ज़ल",
    cardLabel: "बर्थ / सात",
    playlistId: "PL43tsEhYIdTvnK96MqsVkXV90fQFcsdoN",
  },
};

const modeOrder: PlaylistMode[] = ["driver", "rainy", "party", "ghazal"];

const trackMapByMode = {
  driver: driverTracks,
  rainy: rainyTracks,
  party: partyTracks,
  ghazal: ghazalTracks,
};

function ModeIcon({ mode }: { mode: PlaylistMode }) {
  if (mode === "driver") return <BusFront size={16} />;
  if (mode === "party") return <Sparkles size={16} />;
  if (mode === "ghazal") return <Moon size={16} />;
  return <Droplets size={16} />;
}

function NowCard({ mode, title, artist }: { mode: PlaylistMode; title: string; artist: string }) {
  const current = modes[mode];
  return (
    <div className="now-card" aria-label={`${title} अभी बज रहा है`}>
      <span className="art-sticker">{current.sticker}</span>
      <div className="now-card-top"><span>{current.cardLabel}</span></div>
      <div className="now-card-disc">
        {mode === "driver" && <BusFront className="now-card-icon" size={54} strokeWidth={1.2} />}
        {mode === "party" && <Disc3 className="now-card-icon art-spin" size={62} strokeWidth={1.1} />}
        {mode === "rainy" && <Waves className="now-card-icon" size={58} strokeWidth={1.1} />}
        {mode === "ghazal" && <Moon className="now-card-icon" size={54} strokeWidth={1.1} />}
      </div>
      <div className="now-card-title">{title}</div>
      <span className="now-card-sub">{artist}</span>
    </div>
  );
}

export function IndianPlaylist({ mode: initialMode = "rainy" }: { mode?: PlaylistMode }) {
  const [mode, setMode] = useState<PlaylistMode>(initialMode);
  const current = modes[mode];
  const tint = useMemo(() => ({ "--mode-accent": current.accent, "--mode-soft": current.soft } as CSSProperties), [current]);

  const player = useYouTubePlayer(current.playlistId, trackMapByMode[mode]);

  const modeIndex = modeOrder.indexOf(mode);
  const nextMode = () => setMode(modeOrder[(modeIndex + 1) % modeOrder.length]);
  const prevMode = () => setMode(modeOrder[(modeIndex - 1 + modeOrder.length) % modeOrder.length]);

  const swipeStartX = useRef<number | null>(null);
  const isSwipeGuarded = (target: EventTarget | null) =>
    (target as HTMLElement).closest?.(".now-playing, .now-card, .mode-dots, .edge-nav");

  const onSwipeDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (isSwipeGuarded(e.target)) return;
    swipeStartX.current = e.clientX;
  };
  const onSwipeUp = (e: ReactPointerEvent<HTMLElement>) => {
    if (swipeStartX.current == null) return;
    const dx = e.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (dx <= -60) nextMode();
    else if (dx >= 60) prevMode();
  };
  const onSwipeCancel = () => { swipeStartX.current = null; };

  const wheelLocked = useRef(false);
  const onWheelSwipe = (e: ReactWheelEvent<HTMLElement>) => {
    if (isSwipeGuarded(e.target)) return;
    if (Math.abs(e.deltaX) < 24 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    if (wheelLocked.current) return;
    wheelLocked.current = true;
    if (e.deltaX > 0) nextMode(); else prevMode();
    window.setTimeout(() => { wheelLocked.current = false; }, 550);
  };

  return (
    <main
      className={`indian-playlist mode-${mode}`}
      style={tint}
      onPointerDown={onSwipeDown}
      onPointerUp={onSwipeUp}
      onPointerCancel={onSwipeCancel}
      onWheel={onWheelSwipe}
    >
      <SceneStage mode={mode} />
      <div className="scene-scrim scene-scrim-left" />
      <div className="scene-scrim scene-scrim-edges" />
      <div className="grain" />

      <header className="topbar">
        <div className="brand-mark"><span>रास्ता</span><b>रेडियो</b></div>
        <div className="live-pill"><span className="live-dot" /> बस में लाइव</div>
        <button className="menu-button" aria-label="मेनू खोलें"><Menu size={21} /></button>
      </header>

      <nav className="mode-dots" aria-label="मोड चुनें">
        <span className="mode-current"><ModeIcon mode={mode} />{current.label}</span>
        <span className="mode-dot-row">
          {modeOrder.map((key) => (
            <button key={key} className={`mode-dot ${mode === key ? "mode-dot-active" : ""}`} onClick={() => setMode(key)} aria-label={modes[key].label} />
          ))}
        </span>
      </nav>

      <button className="edge-nav edge-nav-prev" onClick={prevMode} aria-label="पिछला मोड"><ChevronLeft size={20} /></button>
      <button className="edge-nav edge-nav-next" onClick={nextMode} aria-label="अगला मोड"><ChevronRight size={20} /></button>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" />{current.eyebrow}</p>
          <h1>{current.title}</h1>
          <div className="hindi-title">{current.hindi}</div>
          <p className="description">{current.description}</p>
          <div className="route-chip"><MapPin size={15} /><span>{current.chip}</span><ChevronDown size={15} /></div>
        </div>
        <div className="hero-art"><NowCard mode={mode} title={player.title} artist={player.artist} /></div>
      </section>

      <footer className="now-playing">
        <div className="now-art" style={{ background: current.accent }}><Disc3 size={22} /></div>
        <div className="now-copy"><span>अभी बज रहा है</span><strong>{player.title}</strong><small>{player.artist}</small></div>
        {player.isPlaying && <span className="player-eq" aria-hidden="true"><i /><i /><i /></span>}
        <div className="player-controls">
          <button onClick={player.previous} aria-label="पिछला गाना"><SkipBack size={18} fill="currentColor" /></button>
          <button className="play-button" onClick={player.isPlaying ? player.pause : player.play} aria-label={player.isPlaying ? "रोकें" : "चलाएँ"}>
            {player.isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <button onClick={player.next} aria-label="अगला गाना"><SkipForward size={18} fill="currentColor" /></button>
        </div>
        <div className="player-progress-wrap">
          <span>{formatTime(player.currentTime)}</span>
          <div className="player-progress-track">
            <span style={{ width: `${player.duration ? (player.currentTime / player.duration) * 100 : 0}%` }} />
          </div>
          <span>{formatTime(player.duration)}</span>
        </div>
        <button className={`player-shuffle ${player.shuffled ? "player-shuffle-active" : ""}`} onClick={player.toggleShuffle} aria-label={player.shuffled ? "शफ़ल बंद करें" : "शफ़ल करें"}>
          <Shuffle size={15} />
        </button>
        <div className="player-volume">
          <Volume2 size={15} />
          <input type="range" min="0" max="100" defaultValue={68} onChange={(e) => player.setVolume(Number(e.target.value))} aria-label="आवाज़" />
        </div>
        <Repeat2 className="player-repeat" size={16} />
        <button className="close-player" aria-label="प्लेयर बंद करें" onClick={player.pause}><X size={16} /></button>
      </footer>
    </main>
  );
}
```

- [ ] **Step 8: Replace `main.tsx` with the real page**

```tsx
// apps/web/src/main.tsx
import { createRoot } from "react-dom/client";
import "./index.css";
import { IndianPlaylist } from "./components/mockups/indian-playlist/IndianPlaylist";

createRoot(document.getElementById("root")!).render(<IndianPlaylist />);
```

- [ ] **Step 9: Typecheck**

Run: `pnpm --filter @workspace/web run typecheck`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/lib/formatTime.ts apps/web/src/lib/formatTime.test.ts \
        apps/web/src/components/mockups/indian-playlist apps/web/src/main.tsx
git commit -m "feat(web): wire real page — IndianPlaylist driven by live YouTube playback"
```

---

### Task 8: End-to-end manual verification across all four modes

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `PORT=5174 BASE_PATH=/ pnpm --filter @workspace/web run dev`, open `http://localhost:5174/`.

- [ ] **Step 2: Verify autoplay gating**

Expected: on load, the footer shows a "play" icon (not "pause") and no audio plays before any click, per the browser autoplay policy noted in the spec.

- [ ] **Step 3: Verify playback controls on the default (rainy) mode**

Click play → real audio starts from the "Rain" playlist and the `NowCard`/footer title update from a real song. Click pause → audio stops. Click next/previous → track and displayed title change. Drag the volume slider → audible volume changes. The progress bar/time advance while playing.

- [ ] **Step 4: Verify shuffle**

Click the shuffle button (icon should highlight in the mode's accent color). Click "next" five times — confirm no immediate repeat of the prior track. Click "previous" — confirm it steps back through the tracks just played, not to native playlist order. Turn shuffle back off, click next — confirm it now advances in native playlist order.

- [ ] **Step 5: Verify mode switching loads the correct playlist**

Swipe (or use the dots/edge chevrons) through बस ड्राइवर → बारिश का मौसम → पार्टी मोड → ग़ज़ल मोड. For each, confirm playback continues (autoplay already unlocked from Step 2) with a track that plausibly belongs to that playlist's theme, and the visual scene/copy match the mode as before.

- [ ] **Step 6: Verify the live-fallback path for metadata**

Since Task 4's static maps are still empty, every currently playing track is exercising the fallback path. Confirm displayed titles look like cleaned real YouTube titles (no literal "(Official Video)"/"| T-Series" text visible), not blank and not raw uncleaned text.

- [ ] **Step 7: Verify no page scrollbar**

Confirm the layout still fits one viewport with no scrollbar, consistent with the earlier fixed-viewport work — nothing in this task changed layout/CSS structurally.

---

### Task 9: Root-level verification

**Files:** none (verification only, unless a fix is needed).

- [ ] **Step 1: Full workspace typecheck**

Run: `pnpm run typecheck` (from repo root)
Expected: passes, including `@workspace/web`.

- [ ] **Step 2: Full workspace build**

Run: `pnpm run build` (from repo root)
Expected: passes, including `@workspace/web`'s Vite production build (`apps/web/dist`).

- [ ] **Step 3: Run the full `apps/web` test suite**

Run: `pnpm --filter @workspace/web run test`
Expected: all tests from Tasks 2, 3, 5, and 7 pass (18 tests total: 7 trackMetadata + 4 shuffle + 4 playerReducer + 3 formatTime).

- [ ] **Step 4: Fix and commit if anything failed**

If any of the above failed, fix the specific issue in the relevant file from the task that introduced it, re-run the failing command, and commit the fix with a message describing what was wrong (not a generic "fix build").
