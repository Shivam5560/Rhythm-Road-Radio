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
  `SceneStage`.** Remotion captures frames with the page paused, so without it
  the rain and the EQ bars come out frozen.

  Seeking the CSS-declared animations through `Animation.currentTime` alone is
  not enough: the seek reads back correctly, but Chromium then silently swaps
  in a fresh un-seeked animation, because `animation-play-state` is still
  `running` in the stylesheet. `cssAnimationSync` therefore neutralises the
  declarative animation and re-creates it as a JS-owned `Element.animate()`,
  preserving each element's own `animation-delay`. Verified by rendering three
  frames and diffing the rain.

- **Fonts load through `@remotion/google-fonts`, not the site's CSS
  `@import`.** The remote import races the first frame and silently falls back
  to a non-Devanagari face.

- **`remotion.config.ts` must derive paths from `process.cwd()`, not
  `import.meta.url`.** Remotion's CLI bundles the config to CJS and `eval()`s
  it, leaving `import.meta.url` empty.

- **Marketing copy lives only in `src/copy.ts`** and is constrained by
  `copy.test.ts`. Never claim the product is ad-free — the site embeds a
  YouTube iframe that can serve ads.

- **Renders take 10–20 minutes** because the scenes use SVG `feTurbulence` and
  `feDisplacementMap` filters. Run them from a shell that outlives the caller;
  a render backgrounded inside a short-lived process gets killed with it.

## Layout

`src/layout.ts` is the single source of geometry for both formats. The vertical
cut keeps all content within `x ∈ [80, 1000]`, `y ∈ [280, 1560]` so Instagram's
own UI never covers it. The square cut is a re-layout, not a crop.
