# Performance notes

How the site stays smooth, and the rules to keep it that way. Most of this is about the
3D helix navigator (`src/components/navigator/`), which runs a WebGL scene alongside a
scroll-driven page.

## Rules of thumb

1. **Never redraw or re-upload textures because of a selection, hover, or pose change.**
   A 1024² label texture costs a canvas redraw plus a GPU upload; ten planes × two faces
   on the same frame is a visible freeze.
2. **Never mount/unmount meshes to show or hide them.** Unmounting disposes materials, and
   three.js then frees their shader programs, so the next show recompiles shaders (100 ms+
   stalls). Keep them mounted and toggle `visible`.
3. **Don't feed new object literals into effect dependencies.** `Navigator` rebuilds
   `textFrontRad`/`textBackRad` every render; depend on their primitive values instead.
4. **Scroll-driven code must not read layout after writing it** in the same frame, and must
   not call `getComputedStyle` per frame. Read first, write after; cache CSS-variable
   values and refresh them on resize.
5. **Clicks and scroll must agree on where a section "rests"**, otherwise the end of a
   click animation snaps to a different state.

## What is in place

### Label textures (`IndividualHelix.jsx`)
- Logos are drawn **once in white** and tinted with the material `color`, so changing the
  selected rug only changes a color uniform.
- The repaint effect depends on `showLabel`, `cap` and the **front** text values only. The
  back face's skew/rotation is applied per frame as a UV transform (`setBackTextUv`), so
  `textBack` is intentionally not a dependency — it changes when the pose reaches the
  hero/rest ends, and used to repaint every label on the last frame of those transitions.
- Outlines and labels fade over a wide facing window (`smoothstep(facing, -0.3, 0.3)`) so
  a rug turning to its back fades gradually rather than in a couple of frames.

### Shader programs
- Selection markers (ring, crosshair, bigger corner dots) stay mounted and are toggled with
  `<group visible={isSel}>`; corner dots scale instead of rebuilding geometry.
- `TipWarmup` (mounted once in `Helix.jsx`) keeps invisible copies of the hover tooltip's
  materials alive, so tooltip shaders compile at load and are never freed between hovers.

### Hover tooltip
- Tooltip textures are cached per section/color (`getTipTexture`) and only redrawn once
  if the web font finishes loading after the first draw.
- During auto-spin, the hovered plane must stay under the pointer for `hoverSettleMs`
  (150 ms, `CanvasScene.jsx`) before the tooltip switches, so planes sweeping past don't
  mount/unmount it repeatedly.

### Scroll, clicks and the helix pose (`Navigator.jsx`)
- `sectionRestY(section)` is the single source of truth for where a section rests: its
  top, minus the sticky portfolio chrome and `--portfolio-stick` for portfolio cards.
  Rug/tab clicks scroll to it, and the helix rotation (`scrollIndexRef`) interpolates
  between rest positions, so rotation is even and lands on whole steps exactly where
  clicks park. The portfolio offset is cached and invalidated on resize/layout changes.
- The click tween owns the scroll until it finishes; nothing unlocks it early (it used to
  hand off ~100 ms early to a slower lerp and the scroll-driven camera).
- The hero → rest pose uses smoothstep on scroll progress, so the stage/helix settle
  instead of stopping dead.
- Portfolio card pinning reads all card positions first, then writes classes.
- The header-name sizing runs on window `resize`, not a `ResizeObserver` on `.content`
  (whose width animates every frame of the hero pose).

### Layout
- Section text columns (`#me > p`, etc.) are sized from the viewport
  (`min(34rem, 100vw - --content-left - 3.5rem)`), not `min(100%, 34rem)`, so they don't
  re-wrap while `.content`'s width animates during the hero pose.

### Slower machines
- The canvas DPR is capped at 1.5 and adjusted at runtime by drei's `PerformanceMonitor`.
- Software WebGL (SwiftShader/llvmpipe) is detected before the canvas is created; it then
  starts at DPR 1 with antialiasing off.

## Measured (production build, Chrome, RTX 2060, 1.67× screen)

| Scenario | Before | After |
| --- | --- | --- |
| Scrolling between sections | 11–12 freezes of 100–250 ms | ~57 fps, 2–4 short hitches |
| Auto-spin start/stop with hover | freezes of 150–300 ms | 60 fps, worst frame 17 ms |
| Rug click ending | 20 label uploads on the last frame | 0 uploads |
| No GPU acceleration (SwiftShader) | ~10 fps scrolling | ~14 fps scrolling, ~20 fps idle |

Known leftover: an occasional ~280 ms stall while scrolling that also happens with the
helix hidden and on the code before these changes — it comes from page content raster,
not the WebGL scene.

## Checking for regressions

- Build and preview the production bundle (`npm run build && npx astro preview`); dev mode
  is much slower and not representative.
- Measure with Chrome **in front** — on Wayland a hidden window gets throttled frames and
  every number looks bad.
- Useful quick checks in DevTools: count `texSubImage2D`/`linkProgram` calls during an
  interaction (should be zero after load), and watch `long-animation-frame` entries.
