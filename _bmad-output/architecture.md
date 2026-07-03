---
project: designMe
status: current
updated: 2026-07-03
derivedFrom:
  - ../CLAUDE.md
  - project-context.md
  - specs/spec-designme/SPEC.md
  - ../docs/avatar-engine.md
  - ../docs/art-bible.md
---

# designMe — Architecture

The lean spine of invariants. Everything built must stay consistent with this; the
full rationale lives in CLAUDE.md and the SPEC. Brownfield: the codebase exists —
no starter template applies.

## 1. System shape

- **One Expo codebase → web + iPad.** React Native 0.74 + Expo ~51, TypeScript strict.
  `Foo.web.tsx` siblings must stay behavior-compatible with `Foo.tsx`.
- **Front-end only.** No backend, no network on the interaction path. AsyncStorage is
  the ONLY persistence. AI exists solely at build time (art generation).
- **Resilience:** `CalmBoundary` wraps the tree — a render crash remounts calmly.

## 2. Runtime components

| Component | Source | Contract |
|---|---|---|
| Catalog | `app/src/dm.ts` | Curated ids + hexes; ids gated by `tools/check-art-ids.mjs` against `docs/art-prompts.md` + registry; scope is a product decision — propose, don't ship |
| Avatar state (`Av`) | `dm.ts` | Persisted shape — additive-only changes, or ship a migration |
| SVG engine (product default) | `src/engine/dmFigure` | Pure fn of state; deterministic fallback whenever PNG coverage is partial |
| PNG engine (lab → product) | `SkiaFigure` via `PngFigure` | Composites full-frame 1024×1536 layers by manifest z-order; NO bust mapping — every asset is full-frame; multiply-tint via ColorMatrix |
| Parts system | `src/parts/{manifest,registry,layers}.ts` | manifest = product contract (slot, z, tintMode); registry = Metro static `require()` wiring, approved art only; layers = state→ordered layers + coverage gate |
| Studio UI | `AvatarStudio.tsx` | Avatar-is-the-menu; engine toggle is a dev lab control (`PNG_LAB_ENABLED`); PNG mode restricts trays to `PNG_SLICE` |
| Second door | `ThisOrThat.tsx` | Binary choice flow; must remain switch-scan operable |
| Theme | `src/theme.ts` | Single token source — never hardcode hex/px/font |

## 3. Determinism invariants

- Same avatar state → same pixels. Downstream of state: never `Math.random()`,
  `Date.now()`, unseeded shuffles, key-order-dependent draws.
- Randomness lives ONLY in shuffle, which writes state.
- `dmFigureV2.runtime.js` mirrors `dmFigureV2.ts` for Node harnesses — edit both or neither.

## 4. Art pipeline (build-time, VERIFIED end-to-end 2026-07-03)

```
docs/art-prompts.md (worksheet: PREFIX + one line per id)
   └─ tools/art-gen/generate.mjs  → gpt-image-1 (OpenAI API)
        · worn categories: greenscreen-worn — item drawn ON refs/base.png with the
          figure painted chroma-green RGB(0,200,80); key.py strips it deterministically
          (hue band 70–175°) and gates registration by measuring the green mannequin
        · face features: ONE complete-face render → face-split.py (head-box affine,
          cluster classification, dark-green nose rescue)
        · direct path: skin/body masters only
   └─ qa.py       — size/alpha/coverage/border/halo/neutral-sat/position checks
   └─ contact-sheet.mjs → HUMAN approval (the only subjective gate)
   └─ ingest-approved.mjs → art-lab/ingest.py (halo clean, canonical canvas)
        → app/assets/parts/ + registry.ts line
```

- **Hard gates:** `check-art-ids.mjs` must pass before any generation; skin/base must
  exist before any worn part; approved = wired in registry.ts (file presence means nothing).
- **Recolor:** neutral near-white masters, multiply tint at runtime — PROVEN on deep
  tones. Per-color bakes only if denim wash/metallics ever fail visually.
- **Frames:** everything 1024×1536 full-frame registered; the worksheet's 1024×1024
  bust frame is RETIRED until SkiaFigure grows a head-box transform.
- **Size budget:** ~5MB full catalog after quantize/WebP pass (hoodie 502KB→42KB proven);
  optimization belongs in ingest, pending visual QA.

## 5. Layer contract

Z-order (manifest): mobility 0 · body 10 · faceShape 14 · bottom 20 · shoes 30 ·
top 40 · makeup 48 · eye 52 · brow 54 · nose 56 · lip 58 · hair 60 · (headwear,
glasses, jewelry, aac, tools above). Eye layer is FIXED color (multiply would tint
sclera); brow/nose/lip fixed baked ink/lip tones; body/faceShape/hair/garments multiply.

## 6. Accessibility invariants (untestable by pixels — enforce in review)

- Every interactive element: `accessibilityRole` + label via `src/ui/Pressable.tsx`;
  web keeps focus ring + full keyboard operation.
- Targets ≥48px, primary ≥64px (`theme.tap`/`theme.tapLg`). Honor `useReducedMotion`.
- Bans (product values, hard): required typing, sign-up/caregiver gates, tutorial
  walls, scores/streaks/timers, flashing, autoplay audio, infinite scroll, per-tap
  latency, "what flatters you" framing, light-skin default.

## 7. Verification recipe (before claiming done)

1. `npm --prefix app run typecheck`
2. `node tools/check-art-ids.mjs` (any catalog/art change)
3. `npm run validate:catalog` (dm.ts data changes)
4. Both targets: web AND iPad — web-only verification is not verification
5. `npm run visual:matrix` (engine changes) — diffs must be intentional
6. Art: `qa.py` green + contact-sheet approval before registry wiring

## 8. Deployment

- Web: static Expo web build (deploy target TBD; GH Pages serves the legacy PoC).
- iPad: Expo dev build required (Skia is not in Expo Go) — accepted constraint.
- App deps only inside `app/`, only via `npx expo install` (SDK 51 range).

## 9. Decisions log (recent, binding)

- 2026-06-26 — Art lane LOCKED: two-tone handcrafted, neutral masters + multiply.
- 2026-07-02 — OpenAI Images API is the PRIMARY art lane; Firefly demoted to fallback.
- 2026-07-03 — Greenscreen-worn is the only worn-part generation path (lone-part
  prompting fails registration). Face lane = one-render split. Bust frame retired.
- 2026-07-03 — Multiply recolor proven on deep tones; recolor question CLOSED.
- 2026-07-03 — `PNG_LAB_ENABLED` re-enabled; registry carries the approved slice;
  `body/balanced` asset is the approved base figure.
