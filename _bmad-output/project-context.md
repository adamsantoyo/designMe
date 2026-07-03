---
project_name: 'designMe'
user_name: 'Adam'
date: '2026-07-02'
sections_completed:
  [
    'technology_stack',
    'product_values',
    'accessibility',
    'cross_platform',
    'avatar_engine',
    'parts_registry',
    'catalog',
    'persistence',
    'design_tokens',
    'resilience',
    'dependencies',
    'verification',
  ]
existing_patterns_found: 7
elicitation_passes: ['pre-mortem', 'inversion', 'critique-and-refine']
status: 'complete'
rule_count: 34
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **React Native 0.74.5 + Expo ~51.0.28**, one codebase → **web + iPad** (`platforms: ["ios","web"]`, `supportsTablet: true`). Every change must work on both.
- **TypeScript ~5.3.3** `strict`, extends `expo/tsconfig.base`. **React 18.2.0**, react-native-web ~0.19.10.
- Rendering: react-native-svg 15.2.0, @shopify/react-native-skia 1.2.3, expo-linear-gradient.
- Persistence: AsyncStorage 1.23.1 — the ONLY persistence layer. No backend; no network on the interaction path.
- App code in `app/` (entry `index.ts` → `App.tsx`). Root `package.json` is Node tooling only.
- No unit-test framework — don't assume Jest/Vitest. Verification = typecheck + `tools/` harnesses + running both targets.

## Critical Implementation Rules

### Product values are hard constraints (CLAUDE.md governs)

- **Recognition over recall** — users react to visuals, never type. NEVER add: required text input, sign-up/caregiver gates, modal/tutorial walls, scores, streaks, timers, infinite scroll.
- **Representation** — never a light skin default; randomized non-default start; every item available to every avatar (no gendered menus). Never "what flatters you" framing; never tell the user they're wrong.
- **The calm test** — before adding any toast/dialog/prompt/badge/animation ask: does it interrupt, evaluate, or pressure the user? If yes, don't. The app never initiates; the user does. No flashing, no autoplay audio, no per-tap latency.

### Accessibility invariants (not guidelines — no visual test catches violations)

- Every interactive element keeps `accessibilityRole` + meaningful label (use `src/ui/Pressable.tsx`). Web keeps visible focus ring + full keyboard operation.
- Touch targets ≥48px / primary ≥64px — use `theme.tap` / `theme.tapLg`.
- Honor reduced motion (`useReducedMotion`). Color options keep screen-reader labels distinguishable non-visually.

### Cross-platform

- `Foo.web.tsx` beside `Foo.tsx` = Metro picks per platform (`PngFigure`, `SvgString`, `loadFonts`). Change one sibling → update the other; they must stay behavior-compatible. `Platform.OS` only when a split file is overkill.

### Avatar engine

- **Determinism**: same avatar state → same render. Downstream of avatar state NEVER: `Math.random()`, `Date.now()`, unseeded shuffles, key-order-dependent draw order. Randomness lives only in shuffle, which mutates state.
- No AI / no network on the interaction hot path — art is pre-generated, composited locally.
- **Art lane LOCKED: two-tone handcrafted** (neutral masters + multiply-tint recolor). Never switch lanes.
- `src/engine/dmFigureV2.runtime.js` mirrors `dmFigureV2.ts` for Node QA harnesses (`tools/engine-smoke.mjs`, `tools/visual-matrix.mjs`). Never edit or consolidate one without the other.

### Parts registry (`src/parts/registry.ts`)

- Metro cannot dynamic-`require()` — every PNG needs a static `require` line here, keyed `"{category}/{id}"`.
- The registry is intentionally EMPTY: quarantined. Only approved art enters, via `tools/art-lab/ingest.py`. Never bulk-wire PNGs from `assets/parts/`, even if present.

### Catalog

- Ids in `src/dm.ts` must match `docs/catalog-bible.md` AND `docs/art-prompts.md` filenames exactly — gated by `node tools/check-art-ids.mjs`.
- Catalog scope is a product decision — the set is deliberately curated. Don't add, rename, or "diversify" items unilaterally. Propose; don't ship.

### Persistence contract

- Catalog ids and the saved-look (`Av`) shape are persisted in AsyncStorage. NEVER rename/remove an id, storage key, or `Av` field — additive only, or ship an explicit migration. A broken saved look breaks the product's core promise.

### Design tokens

- `src/theme.ts` is the single source of truth (color, radius, `space(n)=n*4`, type scale). Never hardcode hex/px/font strings. Serif = wordmark/editorial only, never body.

### Resilience

- `CalmBoundary` (App.tsx) keeps wrapping the tree — render crash → calm remount, never a dead screen.

### Dependencies

- App deps only inside `app/`, only via `npx expo install` (stays in Expo SDK 51's compatible range).

### Verification recipe (before claiming done)

1. `npm --prefix app run typecheck`
2. `node tools/check-art-ids.mjs` — must pass for any catalog/art-id change (known mismatches exist; never add new ones)
3. `npm run validate:catalog` when `dm.ts` catalog data changed
4. Both targets: `expo start --web` AND iOS/iPad — web-only verification is not verification
5. `npm run visual:matrix` when engine/renderer changed — diffs must be intentional

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option (this app serves users who cannot route around a bad UX)
- CLAUDE.md holds the full product rationale; this file is the implementation distillate

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when the stack, art pipeline, or catalog gates change
- Remove rules that become obvious or obsolete (e.g., once the parts registry un-quarantines)

Last Updated: 2026-07-02
