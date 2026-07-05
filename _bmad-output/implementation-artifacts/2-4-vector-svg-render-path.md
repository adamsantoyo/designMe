---
baseline_commit: af18fa6
epic: 2
story: 2.4
story_key: 2-4-vector-svg-render-path
---

# Story 2.4: Vector (SVG) avatar render path

Status: ready-for-dev

<!-- Reshapes Epic 2. Epic 2's premise ("PNG is the product; SVG is fallback only") is inverted by this
story: an SVG-parts engine becomes the premium render path. 2.1 (manifest coverage) and 2.2 (crop/height/
crossfade) are renderer-agnostic and still apply; 2.3 (default-engine flip to PNG) is superseded. FR5/CAP-5
(PNG-first-with-SVG-fallback) will need a rewrite once this ships — flagged in Task 9, decided by the owner. -->

## Story

As the maker (product owner),
I want the avatar composited from per-part **SVG** assets — auto-traced from the existing two-tone PNG masters and recolored at runtime — as a real, toggleable render engine,
so that avatars render crisp, scalable, and stylistically cohesive (clothing + face in one vector space), **bypassing the `SkiaFigure` PNG compositor whose `fit="fill"` distortion made the catalog look broken**, while preserving determinism, the locked two-tone art lane, the full recolor matrix, and every shipped catalog id.

**Proven basis (this session, 2026-07-04):** all 157 PNG parts were auto-traced 1:1 to SVG (`tools/art-lab/out/svg/<cat>/<id>.svg`), and three composited avatars (Sage layers / Rust bomber / Soft dress) confirmed the look is premium and coheres across every category. Two gaps remain before it's a real engine — **recolor** and **size** — and this story closes them and wires the engine. See Dev Notes → Proven basis.

## Acceptance Criteria

**AC1 — Engine exists and dispatches with a complete fallback.**
**Given** the SVG-parts engine is registered and an avatar state whose every wanted slot has a traced SVG part,
**When** `AvatarCanvas` receives `engine="svgparts"`,
**Then** it renders `SvgPartsFigure` (pure SVG through the existing `SvgString`/`SvgString.web` path) on **both** web and iPad,
**And** when any wanted slot lacks a traced part, it falls back to the **complete** procedural SVG engine (`dmFigure`) — never a partial stack — exactly mirroring the current `"png"` branch (`AvatarCanvas.tsx:39-53`).

**AC2 — Recolor contract preserved (the gate).**
**Given** a `multiply` tintMode part (top, hair, body, bottom, faceShape, makeup, headwear) traced from its **neutral near-white master**,
**When** its tint hex is swept across the full palette (all 14 skins / 18 hair / 16 garment colors),
**Then** the part recolors correctly with two-tone shading intact (base takes the hue, shadow stays proportionally darker, highlight lighter),
**And** deep tones and the denim-wash / metallic hard cases hold (per-color bake fallback allowed **only** where `architecture.md §4` already permits it),
**And** `fixed` tintMode parts (eye, brow, nose, lip, shoe, hearing, feature, aac, glasses, carry, mobility) render their baked colors unchanged.

**AC3 — Determinism.**
**Given** any avatar state, **When** `SvgPartsFigure` renders it twice, **Then** output is byte-identical after uid-stripping (no `Math.random`/`Date.now`/unseeded order),
**And** an `engine-smoke` twin renders **every** catalog id through the SVG-parts path and passes the same determinism + well-formedness checks `tools/engine-smoke.mjs` applies to `dmFigure` today.

**AC4 — Registration, z-order, height, crop.**
**Given** parts authored in the canonical 1024×1536 full-frame space,
**Then** they composite at 1:1 with **zero per-part offset** and the exact `manifest.ts` z-order (`manifest.ts` is **not** modified),
**And** `heightScaleY` renders all five heights without seam artifacts,
**And** tray-tile region crops map to the correct sub-region.

**AC5 — Size budget.**
**Given** the 157 parts run through the optimization pipeline (posterize-to-two-tone → trace → SVGO),
**Then** the total registered SVG payload is **≤ ~2 MB** (comparable to the 1.7 MB PNG catalog) with **no single part > ~60 KB**.
**And** the raw 13.4 MB unoptimized trace is explicitly NOT what ships (a before/after size report is produced).

**AC6 — Ids, persistence, registry, gates.**
**Given** the SVG assets, **Then** each uses the **exact existing catalog id** as its key (never renamed — saved looks must not break),
**And** they are wired via a static `svgRegistry` (Metro-safe string modules; **no** new `react-native-svg-transformer` or `metro.config.js`),
**And** only trace-QA-passed parts are registered,
**And** `check-art-ids` (extended to validate SVG keys), `npm run typecheck`, and `npm run validate:catalog` all pass.

**AC7 — Both-target + visual.**
**Then** `npm run visual:matrix` passes across desktop/ipad/mobile with no `/\d+\/\d+ parts/` partial-stack leak,
**And** the render is verified on **both** web **and** an iPad Expo dev build (`architecture.md §7` recipe — web-only is not verification).

**AC8 — Toggle + zero regression.**
**Given** `__DEV__`, **Then** the engine toggle cycles `svg → png → svgparts` (+ `foundry`) cleanly,
**And** the `"svg"` product default and `"png"` lab path are unchanged,
**And** This-or-that remains on the procedural `"svg"` engine (`ThisOrThat.tsx:159`) unless explicitly extended.

## Tasks / Subtasks

- [ ] **Task 1 — SPIKE: prove recolor in vector (highest risk; gates everything). (AC2, AC3)**
  - [ ] Pick 3 representative `multiply` parts: `top/hoodie`, `hair/straightL`, `body/balanced`. Use their **neutral masters** in `app/assets/parts/**` (already near-white — do NOT pre-tint).
  - [ ] Posterize each master to its ~3-tone palette (base + warm shadow + soft highlight) *before* tracing so shading survives as separable regions; trace with `vtracer` **default params only** (see Dev Notes → vtracer gotcha).
  - [ ] Apply recolor two ways and compare on **both** web and native: (a) `<feColorMatrix>` multiply filter — port the exact matrix from `SkiaFigure.tsx:38-50 tintMatrix()`; (b) per-tone base-fill swap (like `dmFigure.js` `fSkin`/`fTop`). Sweep the hex across the palette and confirm two-tone shading holds.
  - [ ] **Verify `react-native-svg@15.2.0` `<filter>`/`<feColorMatrix>` support on native** — this is the platform risk. If native filters are partial/broken, adopt fill-swap as the tint mechanism.
  - [ ] Verify denim-wash + metallic hard cases; if vector multiply crushes them, define a per-color bake path (mirror `assets/parts/{cat}/{id}__{colorId}` from `docs/avatar-engine.md`).
  - [ ] **GATE:** if recolor cannot hold in vector across the palette on both targets, STOP and report — the pivot is not viable as-is; the fallback is fixing `SkiaFigure` instead (see Dev Notes).
- [ ] **Task 2 — Optimization pipeline + size proof. (AC5)**
  - [ ] Build `tools/art-gen/trace-svg.mjs` (or extend `tools/art-lab/ingest.py --svg`): posterize neutral master → `vtracer` → SVGO. Emit `tools/art-lab/out/svg/<cat>/<id>.svg` + a before/after size report.
  - [ ] Run all 157; prove ≤ ~2 MB total, ≤ ~60 KB/part. Confirm the heavy parts (`top/flannel` 1.1 MB, `mobility/wheelchair`, `shoe/hikingShoe`, `top/bomber`) drop into budget.
- [ ] **Task 3 — SVG registry. (AC6)**
  - [ ] Generate `app/src/parts/svgRegistry.ts`: `PARTS_SVG: Record<string,string>` of inner `<g>…</g>` markup in 1024×1536 space, keyed by `"{category}/{id}"` = catalog id. Export `hasSvgPart`, `svgPartRef`, `svgPartCount` mirroring `registry.ts:174-179`. Only QA-passed parts.
- [ ] **Task 4 — Generalize `layers.ts` (shared, do not fork). (AC4)**
  - [ ] Add a `PartSource = { hasPart, partRef }` param to `resolveLayers(av, ov, source = pngSource)` and `coverage(av, ov, source = pngSource)` — default preserves every existing zero-arg caller with no behavior change. Widen `Layer.ref` to `number | string`. **`manifest.ts` stays untouched** (single z-order/tint source for both engines).
- [ ] **Task 5 — `SvgPartsFigure.tsx` compositor. (AC1, AC2, AC4)**
  - [ ] Signature `{ av, ov?, crop? }` (mirror `SkiaFigure`). `resolveLayers(av, ov, svgSource)` → per-part markup → tint (Task 1 mechanism) → concat into one `<svg viewBox="0 0 1024 1536" preserveAspectRatio="xMidYMax meet">` → feed existing `<SvgString xml=… />`.
  - [ ] `heightScaleY(av.height)` via `<g transform="scale(1,h)">` (SVG-native, not a View transform). `crop` remap: reuse `SkiaFigure.tsx:26-36 sourceRect()` ratio math to map 240×490-authored crop strings into 1024×1536.
  - [ ] Expose the `coverage()`-based fallback so `AvatarCanvas` degrades to `dmFigure` on any untraced slot.
- [ ] **Task 6 — Dispatch + toggle. (AC1, AC8)**
  - [ ] `AvatarCanvas.tsx`: widen union to `"svg" | "png" | "foundry" | "svgparts"`; add a branch structurally identical to `"png"` (coverage-gate → `SvgPartsFigure` or SVG fallback).
  - [ ] `AvatarStudio.tsx`: add `SVGPARTS_LAB_ENABLED` flag + push `"svgparts"` into `ENGINE_LAB_MODES` (lines 55-61). The `__DEV__` toggle (776-796) then cycles it automatically. Reconsider the PNG-specific tab nudge at 783-788.
  - [ ] `OptionTile.tsx`: no change (generic `engine` prop). `ThisOrThat.tsx`: leave `"svg"` unless the owner wants svgparts previews.
- [ ] **Task 7 — Determinism + gates green. (AC3, AC6, AC7)**
  - [ ] Add an `engine-smoke` twin (or parameterize `tools/engine-smoke.mjs`) that renders every id through `SvgPartsFigure` and asserts the same determinism/well-formedness checks. Needs a Node-runnable path (no RN) — a pure string builder, like `dmFigureV2.runtime.js` mirrors `dmFigureV2.ts`.
  - [ ] Extend `tools/check-art-ids.mjs` to validate svg keys (id == catalog id == registry key). `typecheck`, `validate:catalog`, `visual:matrix` green (no partial-stack leak).
- [ ] **Task 8 — Both-target verification. (AC7)**
  - [ ] Verify the live render on web **and** an iPad dev build (Story 1.0's build). Confirm the 1:1 premium look holds in both.
- [ ] **Task 9 — Reconcile docs + tracking. (owner decision)**
  - [ ] Update FR5/CAP-5 (PNG-first → engine-neutral), Epic 2 (2.1 reshaped, 2.2 reshaped, **2.3 superseded**), and `architecture.md §9` decisions log. Record the `SkiaFigure` `fit="fill"` finding. sprint-status updated.

## Dev Notes

### Proven basis (do not re-do — build on it)
- **157/157 PNG parts already traced 1:1** → `tools/art-lab/out/svg/<cat>/<id>.svg`, each `<svg viewBox="0 0 1024 1536"><g transform="translate(x0,y0)">…</g></svg>`. These are traces of the **neutral masters** (the correct basis for recolor). Scripts in `scratchpad`: `batch-trace.py` (the batch), `svg-test2.py` (per-look composite), `build-gallery.py` (3 tinted looks).
- **Look is proven premium + cohesive** across hair/faces/tops/dress/jackets/bottoms/shoes/glasses/jewelry (gallery artifact, this session).
- **Two open gaps this story closes:** (1) recolor — the gallery *tinted before tracing*, baking one color per part; the real engine must trace the neutral master and tint at composite time (AC2/Task 1); (2) size — raw traces are **13.4 MB** (avg 85 KB/part; `top/flannel` 1.1 MB / 819 paths) vs the 1.7 MB PNG catalog; posterize+SVGO fixes this (AC5/Task 2).

### Why we're pivoting: the SkiaFigure distortion (motivation, not this story's work)
- `SkiaFigure.tsx:54-62` draws **every** layer with `<SkiaImage … width={1024} height={1536} fit="fill" />`. `fit="fill"` is a **non-uniform stretch** with **no per-asset aspect/registration check** — any part not pixel-identical in size/registration to the canonical frame distorts here (the reported boxy/floating jacket). A raw 1:1 PIL composite of the same parts renders perfectly, confirming the art is fine and the compositor is the fault. This story routes around it via SVG rather than fixing it; the fallback if Task 1 fails is to fix `SkiaFigure` instead.

### Render architecture (from source analysis — cite when implementing)
- **Dispatcher:** `AvatarCanvas.tsx` — `AvatarEngine = "svg"|"png"|"foundry"` (line 19); `"png"` branch gates on `coverage()` and falls back to SVG (39-53); `"svg"` default renders `SvgCanvas`/`CrossfadeCanvas` (54-55). SVG core is pure: `dmFigure(buildOpts(av,ov))` → `applyCrop` → `fillSvg` → `<SvgString>` (69-85). Add `"svgparts"` as a 4th branch shaped like `"png"`.
- **Cross-platform SVG is already solved — reuse it:** `SvgString.tsx` = `react-native-svg` `SvgXml` (native); `SvgString.web.tsx` = `dangerouslySetInnerHTML` (web, full filter support). **No new native module, no metro transformer needed** — there is no `metro.config.js` and no svg-transformer in `app/package.json`; storing parts as **markup strings** keeps everything on this proven path.
- **Tint today:** `SkiaFigure.tintMatrix(hex)` (38-50) = diagonal per-channel multiply ColorMatrix, applied when `layer.tint` set (65-71). `resolveLayers` (`layers.ts:34`) sets `tint` only for `tintMode:"multiply"` parts with a `tintFrom` Av field. `dmFigure.js` instead recolors procedurally (flat fill `url(#sk_${id})` + one shared `sideShade` overlay). **For SVG parts: port `tintMatrix` into an `<feColorMatrix>` filter** (option A, closest to today) **or** swap base-shape fills (option B, safer on native) — decided in Task 1.
- **Consumers of `engine` (already generic):** `OptionTile.tsx:14,45` (default `"svg"`, forwarded), `AvatarStudio.tsx` main stage 715 / MiniLookStrip 756,1045 / tiles 878 (all thread `engineMode`). `ThisOrThat.tsx:159` hardcodes `"svg"`.

### Hard constraints this MUST honor (from SPEC/architecture/CLAUDE/project-context)
- **Determinism** (NFR4 / `architecture §3` / SPEC): pure function of `Av`; `engine-smoke` double-render diff must pass; needs a Node-runnable twin.
- **Art lane LOCKED — two-tone handcrafted** (CLAUDE.md #5, NFR6/7): tracing already-approved two-tone masters is a **format transcode, not a re-roll** — allowed. But the **neutral-master + multiply recolor** structure is load-bearing (NFR7): a naïve single-flatten trace that bakes color would silently convert a `multiply` part into a `fixed` one and break the 14/18/16 recolor matrix. Posterize-to-tones preserves separability.
- **Stable ids** (SPEC / project-context "Persistence contract"): svg keys == catalog ids, **never renamed**; persisted keys `designMe.lookbook.v3` / `currentAv.v3` / `explored.v1` and the `Av` shape are untouched. A renamed id breaks every saved look.
- **Z-order + 1024×1536 registration** (`architecture §4/§5`, `docs/avatar-engine.md`): preserve the manifest z-order exactly and the full-frame canvas so stacking aligns with zero offset. Bust 1024×1024 frame is retired.
- **tintMode split** (`manifest.ts`): `fixed` vs `multiply` per category — preserve; multiply parts need the neutral+tintable structure.
- **Metro static registry** (project-context): explicit static `svgRegistry`; approval gates registration ("file presence means nothing").
- **No AI/network on the hot path**: tracing is build-time only (like the art pipeline).
- **Both-target DoD, WCAG AA, reduced-motion (crossfade snaps), representation breadth** all still apply.

### Epic 2 relationship (for Task 9)
- **2.1 (manifest coverage)** — reshaped; the manifest/coverage machinery is renderer-agnostic and reused verbatim.
- **2.2 (height/crop/tray, crossfade)** — reshaped; same ACs apply to the new engine (crop remap + heightScaleY + reduced-motion snap).
- **2.3 (default-engine flip to PNG)** — **superseded**; its "PNG is default, SVG is fallback" premise is inverted. FR5/CAP-5 ("composites transparent PNG parts … missing asset → SVG fallback") are written PNG-first and need a rewrite once svgparts is the premium path.

### vtracer gotcha (will crash the dev if unknown)
`vtracer` (installed in `tools/art-lab/.venv`) **segfaults (rc -11) on this build when passed ANY keyword arg** (`mode=`, `filter_speckle=`, `path_precision=`, etc.). Call **positionally only**: `vtracer.convert_image_to_svg_py(in_path, out_path)`. Also crashes on the full 1024×1536 frame with tiny content — **crop to alpha bbox first**, then wrap the traced `<g>` in `transform="translate(x0,y0)"` inside a 1024×1536 viewBox for 1:1 registration. (Both learned this session.) Do all vtracer calls in a subprocess so a crash is isolated.

### Project Structure Notes
- ADD: `app/src/parts/svgRegistry.ts`, `app/src/SvgPartsFigure.tsx`, `tools/art-gen/trace-svg.mjs` (or extend `tools/art-lab/ingest.py --svg`), an `engine-smoke` svgparts twin.
- EDIT: `app/src/parts/layers.ts` (PartSource param + `Layer.ref` widen), `app/src/AvatarCanvas.tsx` (union + branch), `app/src/AvatarStudio.tsx` (flag + ENGINE_LAB_MODES).
- UNTOUCHED (shared contract): `app/src/parts/manifest.ts`, `app/src/parts/registry.ts` (PNG stays), `app/src/dm.ts`, `theme.ts`, storage keys, the `Av` shape.
- Assets: `app/assets/parts/**` are gitignored (registry-wired only) — the svg asset delivery + registry must follow the same convention; decide commit strategy (the raw traces live in `tools/art-lab/out/svg/`).

### References
- Render: `app/src/AvatarCanvas.tsx:19,31-56,58-131` · `app/src/SkiaFigure.tsx:16-19,26-36,38-50,54-72,90,97-103` · `app/src/PngFigure*.tsx` · `app/src/SvgString*.tsx` · `app/src/engine/dmFigure.js:163-166,882,886-889` · `app/src/parts/layers.ts:6,12,34,63-66` · `app/src/parts/manifest.ts` · `app/src/parts/registry.ts:174-179` · `app/src/AvatarStudio.tsx:55-61,715,776-796,878` · `app/src/ui/OptionTile.tsx:9,14,45` · `app/src/ThisOrThat.tsx:159`
- Gates: `tools/check-art-ids.mjs` · `tools/engine-smoke.mjs` · `tools/visual-matrix.mjs` · `tools/validate-catalog.js` · `npm --prefix app run typecheck`
- Docs: `docs/avatar-engine.md` (z-order, recolor, registration) · `docs/art-bible.md` · `_bmad-output/architecture.md §3/§4/§5/§7/§9` · `_bmad-output/specs/spec-designme/SPEC.md` (CAP-5/6, Constraints) · `CLAUDE.md` decision #5
- Session artifacts: `scratchpad/batch-trace.py`, `svg-test2.py`, `build-gallery.py`; traces in `tools/art-lab/out/svg/`; gallery/finding artifacts.

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
