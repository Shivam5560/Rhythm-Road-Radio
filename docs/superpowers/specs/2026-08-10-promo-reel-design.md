# रास्ता रेडियो — animated promo reel

**Date:** 2026-08-10
**Goal:** A 28-second animated reel promoting rastaradio.tech, covering all four modes and
explaining the product, for posting as an Instagram Reel and a LinkedIn video post.

---

## 1. Decisions

These were settled during brainstorming and are not open questions.

| Decision | Choice |
|---|---|
| Language | Site UI stays Devanagari Hindi; marketing overlay copy is English |
| Footage | Rebuilt in Remotion from the site's real components — not screen-captured |
| Audio | Rendered silent; a trending audio is added in the Instagram app at post time |
| Formats | 1080×1920 master (Instagram) + 1080×1080 re-layout (LinkedIn) |
| Narrative | Continuous-journey spine with feature beats folded in |
| Framing | Full-bleed — no browser chrome, no phone mockup |
| Interaction | The reel animates the **flow**: gestures drive every state change on screen |

### Why Remotion

There is no `ffmpeg` on this machine, so nothing can currently encode video. Remotion ships a
bundled ffmpeg (no `brew install`), and being React it can import `apps/web`'s actual
`SceneStage` SVG art, `indian-playlist.css`, and curated track data. The reel is therefore not a
depiction of the site — it is the site's own components running on a frame timeline.

Remotion's free licence covers individuals and companies of ≤3 people.

---

## 2. Art direction

### Signature: the destination roll-board

The site already renders a `.route-chip` naming each mode's real place — लेह, लद्दाख / वायनाड,
केरल / अंजुना बीच, गोवा / आगरा कैंट. Indian long-distance buses carry a mechanical roller
destination board. Mode transitions are therefore **not cross-fades**: the destination board
physically rolls to the next place, and the world behind it changes to match.

This makes the transition carry information rather than decorate the cut, and it is drawn from
the product's own subject matter rather than from a motion-graphics library.

Mechanics: a masked strip, `overflow:hidden`, two place-name rows translating on Y with a slight
overshoot and a rubber settle; a thin specular highlight sweeps across the strip at the midpoint
of the roll to read as curved metal.

### Type: the shirorekha reveal

Yatra One is a Devanagari display face, so every hero line carries the horizontal head-stroke
(shirorekha) across its top. Hero lines reveal in two stages:

1. The shirorekha draws left-to-right (a `clip-path` inset animating on the top ~8% of the line box).
2. Letterforms drop down out of it, staggered per word, with a short ease-out.

Used **only** on the four mode hero lines and the CTA. Not on the English rail, not on the
feature beats — restraint is what keeps it a signature rather than a tic.

### English copy is deliberately small

The marketing overlay is DM Mono, uppercase, ~26px, wide letterspacing, between two hairline
rules — reading as a bus timetable line, not a caption. This inverts the reel convention of huge
bold captions.

Justification: the product's thesis is an unapologetically Hindi experience. Shrinking the
English to timetable scale signals confidence. Retention is carried by the roll-board, the
gestures and the scene changes, not by caption size.

### Palette

Taken entirely from the site — no new brand colors are invented.

| Token | Value | Source |
|---|---|---|
| `film` | `#0a0604` | `.scene-stage` background |
| `ink` | `#fff4e8` | `--ink` |
| `accent.driver` | `#e76f51` | `modes.driver.accent` |
| `accent.rainy` | `#2a6f97` | `modes.rainy.accent` |
| `accent.party` | `#d7263d` | `modes.party.accent` |
| `accent.ghazal` | `#c9974a` | `modes.ghazal.accent` |

Per-mode `--ink` / `--surface` overrides in `indian-playlist.css` carry through automatically via
the `mode-*` class.

### Typefaces

| Role | Face | Use |
|---|---|---|
| Display | Yatra One | Hindi hero lines, wordmark |
| Body | Noto Sans Devanagari | Track names, route names, eyebrows |
| Utility | DM Mono | English marketing rail, timecodes, mode index |

All three are already loaded by the site; all three are on Google Fonts.

### Touch indicator

Gestures are shown by a ring in the current mode's accent color trailing a short dashed tail —
echoing the dashed road markings in the driver scene. It appears only while acting and fades
within 8 frames of releasing. No generic white cursor dot.

---

## 3. Storyboard — 28s at 30fps (840 frames)

Interaction beats are marked **[flow]**; these are the moments where a gesture visibly causes
the UI state change, rather than the state simply being shown.

| Frames | Time | Beat | Content |
|---|---|---|---|
| 0–105 | 0.0–3.5s | **Hook** | Opens already inside the Ladakh scene, camera pushing in (scale 1.08→1.00). `रास्ता रेडियो` wordmark draws on via shirorekha reveal. English rail: `FOUR MOODS. ONE ENDLESS ROAD.` |
| 105–225 | 3.5–7.5s | **बस ड्राइवर** | Roll-board lands on `लेह, लद्दाख`. Hero line reveals. NowCard slides in with a real curated track. **[flow]** tap on the play button → Play morphs to Pause, EQ bars start, progress bar begins running. Rail: `MOUNTAIN HIGHWAY. WINDOWS DOWN.` |
| 225–345 | 7.5–11.5s | **बारिश का मौसम** | **[flow]** swipe left — scene drags with the finger, releases, roll-board rolls to `वायनाड, केरल`. Rain falls for real (WAAPI-synced). Rail: `MONSOON NIGHT. WET STREETS.` |
| 345–465 | 11.5–15.5s | **पार्टी मोड** | **[flow]** swipe left → `अंजुना बीच, गोवा`. **[flow]** tap shuffle → icon lights to accent. Rail: `GOA SUNSET. BONFIRE ON THE SAND.` |
| 465–585 | 15.5–19.5s | **ग़ज़ल मोड** | **[flow]** swipe left → `आगरा कैंट`. **[flow]** drag the scrub bar; fill follows the finger, timecode counts. Rail: `NIGHT BUS. LAMP-LIT MEHFIL.` |
| 585–640 | 19.5–21.3s | **Feature 1** | **[flow]** four rapid taps on the mode dots; the world changes on each tap. Rail: `SWIPE. THE WORLD CHANGES.` |
| 640–695 | 21.3–23.1s | **Feature 2** | Push in on the NowCard; real Devanagari track names cycle through. Rail: `EVERY TRACK NAMED BY HAND.` |
| 695–750 | 23.1–25.0s | **Feature 3** | **[flow]** tap the now-playing strip → `PlaylistSheet` slides up with real curated rows, current row highlighted. Rail: `THE WHOLE PLAYLIST, ONE TAP.` |
| 750–840 | 25.0–28.0s | **CTA** | Roll-board rolls through all four places and settles blank. Wordmark centers via shirorekha reveal. Rail: `NO SIGN-UP. JUST PRESS PLAY.` `rastaradio.tech` with an underline draw. |

### Claim accuracy

Every marketing claim is verifiable in the codebase:

- *non-stop* — YouTube playlist autoplay, `useYouTubePlayer`
- *four modes* — `modeOrder` in `IndianPlaylist.tsx`
- *named by hand* — the four `tracks.*.ts` curated Devanagari maps
- *swipe to change* — `onSwipeDown`/`onSwipeUp` pointer handlers
- *no sign-up* — static site, no auth

**"No ads" is deliberately not claimed**, because the YouTube iframe can serve them.

---

## 4. Architecture

A new `apps/reel` package. The dependency runs one way — the reel imports the site, never the
reverse — so the reel cannot break rastaradio.tech.

```
apps/reel/
  package.json
  tsconfig.json
  remotion.config.ts          webpack alias @site → ../web/src
  src/
    Root.tsx                  ReelVertical 1080×1920 · ReelSquare 1080×1080 · CoverStill
    Reel.tsx                  master 840-frame timeline
    copy.ts                   ALL English marketing text, single source
    layout.ts                 format-keyed spacing/type scale + safe areas
    fonts.ts                  @remotion/google-fonts loaders
    theme.ts                  re-exports mode accents from @site
    lib/
      useCssAnimationSync.ts  WAAPI per-frame sync (see Risks)
      easing.ts               shared spring/overshoot curves
    scenes/
      SceneLayer.tsx          SceneStage + camera transform + scrims + grain
      ModeBlock.tsx           one 4s mode segment
      RollBoard.tsx           the signature transition
    overlay/
      Wordmark.tsx
      HindiHero.tsx           shirorekha reveal
      Rail.tsx                DM Mono timetable strip
      NowCardVertical.tsx
      PlayerBar.tsx           play/pause, scrub, shuffle, EQ
      PlaylistSheetVertical.tsx
      TouchCue.tsx            gesture indicator
    sequences/
      Hook.tsx · Modes.tsx · Features.tsx · Cta.tsx
```

### What changes in `apps/web`

Exactly one line: `const modes` in `IndianPlaylist.tsx` becomes `export const modes`. No
behaviour change, no visual change to the live site. Everything else needed — `SceneStage`,
`indian-playlist.css`, the four `tracks.*.ts` files, `formatTime` — is already exported.

### Layout and safe areas (vertical)

Instagram's own UI overlays the bottom ~320px and right ~180px of a 1080×1920 reel. All content
sits within `x ∈ [80, 1000]`, `y ∈ [280, 1560]`.

```
 y 0                                  ┌──────────────┐
                                      │   (scene)    │
 y 300   ROLL-BOARD  ▸ लेह, लद्दाख     │              │
 y 420   ─────────────────────────    │              │
                                      │              │
 y 620   ┌────────────┐               │              │
         │  NowCard   │  (tilted)     │              │
 y 950   └────────────┘               │              │
                                      │              │
 y 1000  बादलों के पार,               │              │
 y 1130  सफ़र जारी है                  │              │
                                      │              │
 y 1300  ──────────────────────────   │              │
         MOUNTAIN HIGHWAY. WINDOWS DOWN.
 y 1360  ──────────────────────────   │              │
                                      │              │
 y 1380  [ ◀◀  ▶  ▶▶ ]  ▬▬▬▬▬▬▬▬─── 02:14
 y 1520                               └──────────────┘
 y 1560  ---- IG safe-area floor ----
```

The square (1080×1080) cut is a re-layout, not a crop: the NowCard moves beside the hero line
rather than above it, and the rail sits directly under the player bar.

---

## 5. Deliverables

| File | What |
|---|---|
| `apps/reel/out/rasta-reel-9x16.mp4` | 1080×1920, 30fps, H.264, silent AAC track |
| `apps/reel/out/rasta-reel-1x1.mp4` | 1080×1080 LinkedIn cut |
| `apps/reel/out/cover.png` | Reel cover still |
| `apps/reel/copy/instagram.md` | Caption, hook line, hashtags |
| `apps/reel/copy/linkedin.md` | Post copy |

The silent AAC track is added via `--enforce-audio-track`; some uploaders reject a file with no
audio stream at all.

---

## 6. Risks and mitigations

**Ambient CSS animation renders frozen.** `.rain-drop`, `.rain-mist-band`, `.art-spin` and
`.player-eq i` are CSS keyframe animations, several with per-element inline `animation-delay`.
Remotion renders frame-by-frame with the page paused, so these would come out static.

*Mitigation:* `useCssAnimationSync` walks `document.getAnimations()` each frame and sets
`animation.currentTime = (frame / fps) * 1000`. Using the Web Animations API rather than a CSS
override preserves each drop's individual stagger. It runs inside `delayRender`/`continueRender`
so the sync completes before the frame is captured.

**Fonts silently fall back.** `indian-playlist.css` loads Yatra One / Noto Sans Devanagari / DM
Mono through a remote `@import`, which races the first frame.

*Mitigation:* load all three through `@remotion/google-fonts`, which blocks rendering until the
faces are ready. The CSS `@import` then resolves as a no-op duplicate.

**Render is slow.** The scenes use `feTurbulence` + `feDisplacementMap` wobble filters, which are
expensive per frame. Expect 5–15 minutes for a full render. Mitigation: raise `--concurrency`;
spot-render individual frames to PNG during iteration rather than re-rendering the whole timeline.

**Install size.** Remotion pulls a ~150MB headless Chrome shell on first install.

**Devanagari shaping in headless Chrome.** Conjuncts and matras must render identically to the
browser. Mitigation: the first verification step is a PNG spot-render of a frame containing
`बादलों के पार, सफ़र जारी है`, compared against the live site.

---

## 7. Verification

1. Spot-render one PNG per sequence (6 frames total) and compare against live-site screenshots —
   fonts, conjuncts, colors, scene fidelity.
2. Spot-render three consecutive frames inside the rainy block and confirm the rain drops have
   moved between them (proves the WAAPI sync works).
3. Full render of the vertical master; check duration is 28.0s and the file has an audio stream.
4. Confirm no content crosses the Instagram safe-area boundaries.
5. Full render of the square cut.

No claim of completion is made until the rendered files exist and have been played back.
