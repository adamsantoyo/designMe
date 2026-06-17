# designMe

A personal-style explorer / avatar creator for **self-expression and autonomy**, built for people who may not be able to *tell* you what they like — but can *show* you.

**Audience:** autistic people, AAC / multimodal communicators, and others who benefit from communication support.
**Platform target:** eventually a native **iPad app** (currently a self-contained HTML proof-of-concept).
**The why:** built so someone like the maker's sister can use it with *pride* — "not just another ACC app."

---

## North star

> A tool for self-expression and autonomy for someone who may not be able to *tell* you what they like, but can *show* you. When any design decision is ambiguous, choose the option that gives the user more **independence, more dignity, and less pressure.**

Core principle: **recognition over recall.** The user reacts to visual options instead of describing them. Success = a brand-new user, no instructions, no typing, can in ~1 minute (1) make an avatar that resembles themselves and (2) dress it in a vibe they like, then save it — never told they're wrong, never made to wait.

---

## Files

- **`index.html`** — the main/original app and **the product**. Single self-contained file (~3100 lines): inline-SVG avatar engine + full catalog (skin, face parts, hair, body, height, tops, bottoms, color palettes, ~36 "vibe" presets, shoes, bags, jewelry, and assistive tech — glasses, wheelchair, cane, AAC tablet/board, hearing aids — presented as ordinary options). State is memory-only (no storage). This is the real project.
- **`feel-prototype.html`** — a **throwaway** direction test. Tests a *different interaction paradigm and aesthetic* (see below). NOT a replacement for `index.html`.
- **`design-system/`** — a later design-pass bundle (the "Codex design" overhaul): `tokens/` (CSS design tokens), `guidelines/` (HTML design-language docs), `components/` (inline-style React components), `styles.css` + `_ds_bundle.js` (compiled design system), `assets/` (`avatar.js`/`figure.js` preview engines), and `ui_kits/avatar-studio/` (a React **mockup** of the product screen — a cosmetic recreation on a CDN-React stack, *not* shippable under the hard constraints). `SKILL.md` packages it as a Codex design skill. **Reference/spec only — the product loads none of it.**

This is a git repo (GitHub Pages serves `index.html` from `main` root). The product ships as a single self-contained file.

---

## Hard constraints (from the original brief — do not violate)

- **One self-contained file**, inline SVG only — no external images / icon CDNs for avatar parts, no photos, no real people.
- **Deterministic** — same choices always produce the same avatar. **No live AI generation** in this version.
- **State in memory only** — no browser storage, no accounts, no network on the interaction hot path.
- **Representation is a core requirement, with real breadth:** ~14 skin tones (never a light default), 6+ hair textures incl. coily/curly/locs/braids + shaved/bald, 5+ options each for eye/nose/lip/brow/face combining freely, 4+ body shapes + height range, assistive tech + skin features (vitiligo, freckles, scars) as ordinary options, cultural/religious expression (e.g. hijab). **Gender-expansive** — every item available to every avatar, no gendered menus. **Randomized non-default start.**
- **Accessibility:** WCAG AA contrast, touch targets ≥48px (primary ≥64px), full keyboard operation + visible focus ring, honor `prefers-reduced-motion`. **No** flashing, autoplay audio, infinite scroll, per-tap latency, time pressure, scores/streaks.
- **Never:** normative "what flatters you" framing, required text input, modal/tutorial walls, sign-up before play, caregiver gate.

---

## Design decisions made this session

### 1. Vibe fashion review (applied to `index.html`)
Refined the `CAT.vibe` presets for 2026. **Key insight: don't chase 2026 micro-trends** — they're too niche for this audience and churn fast. Keep the *clothes* timeless; strip the dated trend *terminology*. The three-tier `label` (concrete) + `tag` (trend word) + `note` (plain description) pattern is good for the audience — keep it; jargon stays demoted to the small tag chip.
- Reworked the genuinely dated ones: `Y2K pop`→**Downtown night**, `Future casual`→**Tech utility**, `Pop-stage casual`→**Metallic night** (all swapped out parachute pants / neon hyperpop styling).
- Retagged dead trend words: `quiet luxury`→refined neutral, `coquette`→soft romantic, `balletcore`→soft wrap, `gorpcore`→outdoor utility.
- Accessibility language pass: made vague/figurative `note`s concrete (recognition-first) — e.g. "easy confidence"→"hoodie, barrel denim, sneakers" — while keeping useful *sensory/social* cues ("low pressure", "vacation calm").

### 2. Pinterest / boards idea (explored, not yet built)
- The **board / collection** ("showing not telling") aligns perfectly with the north star — a board is the artifact of recognition-over-recall.
- A recommendation **engine** is risky: it adds unpredictability (autistic users need consistency), it *models* the user (tension with autonomy), and it imports Pinterest's engagement-loop DNA (opposite of calm/low-arousal). 
- If ever built: **de-Pinterest it** — deterministic, user-*pulled* not auto-pushed, a fixed small "more like this" peek (not a feed), always paired with a "try something different" escape hatch, no counts/streaks. Could fill the existing stubbed "Get inspiration ✨" button *without* AI.

### 3. UI/UX reassessment (the big direction shift)
- **Diagnosis of the grid-of-grids** (status-quo ACC apps): it's recognition at the *leaf* but **recall + executive function at the *navigation*** (holding a taxonomy tree in your head). The "busyness" isn't the boxes — it's the tree.
- **Proposed paradigm: "the avatar IS the menu."** Direct manipulation — tap the region you want to change (hair / face / top) → a small contextual tray appears → live swap. Deletes the taxonomy.
- **A second door is required:** direct manipulation assumes you can point and know what you want. Add a guided **"this-or-that"** path (the app proposes two, you react) for cold-start and especially for **switch-scanning** users (big grids are brutal to scan; binary this-or-that is the gold standard). Eye-gaze can point-and-dwell, so direct manipulation serves it.
- **Continuous controls** (sliders/gradients) for continuous attributes (skin tone, height, body, color) instead of grids of swatches — with stepped fallbacks for switch users.
- **Lean on native iPadOS accessibility** rather than reinventing: Switch Control, eye-tracking, AssistiveTouch, VoiceOver, Dynamic Type, and especially **Guided Access** (lock to one app → full-bleed calm canvas, no chrome).

### 4. Aesthetic direction
- **Strategic thesis — "dignity through desirability":** the way to escape "just another ACC app" is to make something a non-disabled person would also want to use. Then using it carries *taste*, not *diagnosis*. (Cf. hearing aids → AirPods, OXO grips, Memoji.) **The clinical look IS the stigma.**
- Resolve the fresh-vs-calm tension as **"premium-calm,"** not loud-modern (loud = overstimulating for the audience).
- **Chosen direction:** **Warm & handcrafted base** (calmest + most timeless) **+ editorial pride-spark** used only in the moments that carry it (the avatar art, the lookbook-as-gallery) **+ Apple-minimal discipline** (whitespace, legibility) so it never gets busy.
- **Audience tuning:** all-ages / timeless (not teen-trendy, not childish).

---

## `feel-prototype.html` — what it is

A tiny, deliberately-incomplete artifact to *feel* the chosen paradigm + aesthetic. It demonstrates:
- **Avatar-as-menu** direct manipulation: tap hair / face / top → contextual bottom-sheet tray → instant live update with a gentle "settle" motion.
- **Warm-calm premium** look: serif "designMe" pride-mark, soft material depth, generous space, reduced-motion-safe.
- **Saved gallery** (the "something to show" artifact) + **shuffle** (the propose-door, lightly).
- Scope: a **portrait bust** avatar, 6 hairstyles, 5 tops, 8 skin tones, color rows. Real `<button>`s, focus rings, keyboard, ARIA, `prefers-reduced-motion`.

**Known limitation:** the avatar SVG art was drawn by hand *without rendering it first* — proportions and hair shapes are a first pass and need a polish round. Judge the **feel and interaction paradigm**, not the pixel-level art, at this stage.

---

## Open questions / next steps

- Polish the prototype avatar art (needs a visual iteration round).
- Decide: evolve `index.html` toward the avatar-as-menu paradigm, or keep the prototype as a separate track?
- Build the **"this-or-that" second door** as a first-class path (critical for switch / eye-gaze users).
- Decide whether to build the de-Pinterested board / collection layer (the existing "Get inspiration ✨" stub is its home).
- Eventually: plan the path from HTML PoC → native iPad app.
