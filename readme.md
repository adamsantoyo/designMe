# designMe — Design System

**designMe: Find Your Vibe** — a no-typing, recognition-first avatar & style explorer built for self-expression and autonomy. It is made for people who may not be able to *tell* you what they like, but can *show* you — autistic people, AAC / multimodal communicators, switch-scanning and eye-gaze users, and anyone who'd rather react to options than describe them.

This design system captures designMe's warm, premium-calm, handcrafted brand so you can build new screens, marketing, slides and prototypes that feel like the real product.

> **North star** — *A tool for self-expression and autonomy for someone who may not be able to tell you what they like, but can show you.* When a decision is ambiguous, choose the option that gives the user **more independence, more dignity, and less pressure.** Core principle: **recognition over recall.**

---

## Sources

This system was reverse-engineered from the designMe codebase and product writing. Explore these to go deeper:

- **GitHub repo:** https://github.com/adamsantoyo/designMe — the real, single-file product.
  - `index.html` — the production avatar studio (~3000 lines): inline-SVG avatar engine + full catalog (skin, face, hair, body, ~36 vibe presets, garments, shoes, bags, jewelry, and assistive tech presented as ordinary options).
  - `feel-prototype.html` — a throwaway "feel" prototype that committed the chosen aesthetic direction (avatar-as-menu, warm-calm premium). The visual language here draws from both.
  - `README.md` / `CLAUDE.md` — product brief, hard constraints, and design decisions.
- **Live product:** https://adamsantoyo.github.io/designMe/

> Read the repo for the full catalog and the deterministic SVG avatar engine — far richer than this system's compact `assets/avatar.js` preview generator.

---

## Hard constraints (carry these into any designMe work)

- **No required text input.** Every choice is visual — tap to try it on.
- **Recognition over recall.** React to options; never hold a taxonomy in your head.
- **Representation is a core requirement, with real breadth** — a wide range of skin tones (never a light default), 6+ hair textures incl. coily/curly/locs/braids, assistive tech (wheelchair, cane, AAC tablet/board, hearing aids) and skin features (vitiligo, freckles, scars) as **ordinary** options. **Gender-expansive:** every item available to every avatar, no gendered menus.
- **Accessibility floor:** WCAG AA contrast, touch targets ≥48px (primary ≥66px), full keyboard + visible focus, honor `prefers-reduced-motion`. **No** flashing, autoplay, infinite scroll, per-tap latency, time pressure, scores/streaks.
- **Dignity through desirability.** Make something a non-disabled person would also want to use — so using it carries *taste*, not *diagnosis*. The clinical look IS the stigma.
- **Premium-calm, never loud.** Loud-modern overstimulates the audience. Warm, quiet, generous.

---

## Content fundamentals — how designMe writes

- **Voice: warm, plain, encouraging, never clinical.** Short and concrete. The product talks *with* the user, lightly. "Make a you." "Tap to try it on." "No saved looks yet — tap Save look." "Tap looks you like — we'll build it for you."
- **Recognition-first copy.** Describe things by what they *are*, not by jargon. The signature pattern is a **three-tier label**: a concrete **name** ("Soft Street"), a demoted **trend tag** in a small chip ("oversized"), and a plain-language **note** of the actual pieces ("hoodie, barrel denim, sneakers"). Jargon is allowed but always demoted to the tiny tag.
- **Never normative.** No "what flatters you," no "right/wrong," no grading. Affirm, don't correct. Success is *never told they're wrong, never made to wait.*
- **Casing:** Sentence case for everything human ("Save look", "Find my vibe", "Your lookbook"). UPPERCASE only for tiny eyebrow labels / tags / section kickers. The wordmark is **designMe** (lowercase "design", capital "M").
- **Person:** Addresses the user as **you / your** ("your lookbook", "make a you"). Warm second person, no "the user."
- **Emoji:** Almost never. A single ✨ on the "Find my vibe" CTA is the one playful spark. Emoji is *not* used as data icons.
- **Length:** Microcopy. A label is 1–3 words; a hint is one short sentence. No paragraphs in the UI.

---

## Visual foundations

**Overall vibe:** warm & handcrafted base + a small editorial "pride-spark" + Apple-minimal discipline. Calm, premium, timeless (all-ages, not teen-trendy, not childish).

- **Color:** A warm-neutral *paper* base (`--bg #ece7dc`, surfaces `#fbf8f2`), warm ink text (`--ink #2f2823`). **Sage green** (`--sage #6f8f6a`) is the primary accent (selection, brand); **terracotta** (`--terra #bd7a4f`) is the single warm commit action (Save). Supports are earthy: wood, sky-blue, stone. The garment palette is a 16-color earthy wardrobe. Everything reads warm; nothing is cold or clinical. No bluish-purple gradients, ever.
- **Type:** Two families. A **rounded sans** (Nunito ≈ SF Pro Rounded) carries all UI and body — soft terminals + high x-height = high legibility for the audience. An **editorial serif** (Newsreader ≈ Georgia) is the pride-spark, used *only* for the wordmark (italic "Me") and the occasional gallery/editorial headline. Never body.
- **Backgrounds:** Soft. A gentle radial wash (`radial-gradient(120% 90% at 50% -8%, #f6f0e4, var(--bg), var(--bg-2))`). The avatar sits on a "mat" — a paper card with a radial top highlight. No photos, no busy patterns, no full-bleed imagery; the avatar art is the imagery.
- **Cards:** Soft paper. 18–30px radii, hairline warm borders (`--line`), layered warm-brown shadows (never gray/black). The avatar/sheet cards add `inset 0 1px 0 rgba(255,255,255,.7)` for a lit top edge. No colored left-border accent cards.
- **Corner radii:** Generous — controls 16–18px, cards 22–26px, sheets/dialogs 30px, pills 999px.
- **Shadows:** Soft, warm, diffuse, brown-toned (`rgba(62,42,22,…)` / `rgba(57,43,28,…)`). Layered: a tight contact shadow + a wide soft ambient one. Never hard or neutral-gray.
- **Selection & state:** Selected = a **sage/green ring** (`box-shadow: 0 0 0 3px`) + tinted background (`--sage-wash`) + a small checkmark badge on choice tiles. Primary categories tint sage; sub-tabs fill **ink** when active.
- **Hover:** Gentle lift (`translateY(-1px/-2px)`) + slightly stronger shadow; surfaces deepen one step (`--surface` → `--surface-2`). **Press:** settle/shrink (`scale(.96–.99)`), never a color flash.
- **Motion:** One easing — `cubic-bezier(.22,.61,.36,1)`, a gentle settle with no overshoot. Durations .12–.42s. A soft "settle" scale when the avatar updates; a confirmation pulse on save. Calm fades, no bounces, no infinite decorative loops. Everything respects `prefers-reduced-motion`.
- **Transparency / blur:** Used sparingly — sticky topbar/avatar-pane on mobile use `backdrop-filter: blur()` over a translucent paper; the discover scrim is a warm semi-opaque brown. Not a glassmorphism system.
- **Layout rules:** Avatar is **pinned/sticky** and always visible while you change things. Desktop = avatar left, controls right. Big targets, generous whitespace, never dense. Horizontal scroll rows for galleries (lookbook), grids for choices.
- **Imagery color vibe:** Warm, soft, slightly sunlit. Skin and hair use subtle vertical gradients (lighter top → deeper bottom) and a faint cheek blush. Friendly, rounded, never harsh or photoreal.

---

## Garment design language

Outfits are the soul of designMe, so clothing is a **composition system, not an image library** (`assets/figure.js`). Every look is drawn from a tiny, orthogonal vocabulary, which means new garments come from *combining attributes*, not adding art:

- **A top** = `sleeve` (tank / strap / short / long) × `length` (crop / boxy / hip / long / dress) × `neckline` (crew / scoop / v / collar / high / asym) × `fit` (fitted / relaxed / oversized / boxy / drape), plus detail **flags** that stack: `hood, pocket, zip, rib, placket, chunky, corset, graphic, mesh, satin`, and an optional `pattern` (stripe / plaid) clipped to the garment. A "baby tee" and an "oversized hoodie" are the *same renderer* with different attributes.
- **A bottom** = `type` (barrel / wide / cargo / track / parachute / leggings / shorts / jorts / skirt) plus flags (`maxi, midi, pleated, cargo, ruched`).
- **Shoes** = sneaker / boot / loafer / slide / heel. **Body** = lean / balanced / broad / curvy / full × five heights.
- **An outer layer** is a true second garment slot — open-front jackets (`overshirt / denim / puffer / blazer`) drawn over the top with their own color, collar, pockets, quilting or lapels.
- **Extras**: `carry` (tote / crossbody) and `jewelry` (necklace / earrings) — small, warm accents in the house gold.
- **A vibe** is just a saved bundle of all of the above — one tap dresses the whole figure.

**House illustration style:** front-facing, friendly, slightly stylized fashion croquis. The renderer (`assets/figure.js`) is layered for scale: **anatomy** (5 body presets × 5 heights produce every keypoint; garments never hard-code coordinates) → **primitives** (`tube()` tapered limb/sleeve/pant-leg polygons, waist/hem/cuff bands, contrast `stitch()` topstitching, one shared side-shade overlay) → **garments** (dispatch on the attribute vocabulary above). Every piece gets the same finishing language: a waistband or neckline finish, a hem treatment (band, cuff, rib, fray), seams where real garments have them, and warm vertical-gradient shading from its single base color — never hard black outlines. Denim carries gold topstitch + pockets + fly; knits get rows and ribbing; satin gets sheen. **Adding a new item = a new attribute combo (+ at most a small detail function), never new freehand art.** Determinism: the same parameters always produce the same SVG, so looks are saveable and shareable.

When you need an outfit anywhere (slides, mocks, marketing), call `dmFigure(...)` rather than sourcing clothing images — it keeps everything on-brand and recolorable.

---

- **Style:** Lucide-idiom **line icons** — even stroke (`stroke-width` 1.8–2.2), round caps and joins, no fills, 24px viewBox. The product hand-draws its own inline SVGs in exactly this style (heart, shuffle, undo, check, star, hairstyle/face/body glyphs).
- **For new work:** link **[Lucide](https://lucide.dev)** from CDN to match precisely (e.g. `heart`, `shuffle`, `rotate-ccw`, `check`, `sparkles`, `chevron-left`). The `guidelines/brand-iconography.html` card shows the house set; `ui_kits/avatar-studio/icons.jsx` has ready-made React icon components.
- **No emoji as icons.** A single ✨ appears on the "Find my vibe" CTA as a playful spark — that is the only sanctioned emoji.
- **No icon font / sprite** ships in the product; all icons are inline SVG. There are **no raster/logo image assets** — the brand mark is the text wordmark, and avatars are generated SVG.

> ⚠ **Font substitution:** the product uses the system stacks `ui-rounded`/`ui-serif`. For cross-platform parity this system substitutes **Nunito** (rounded sans) and **Newsreader** (editorial serif) from Google Fonts. If you have the originals (e.g. SF Pro Rounded), drop the binaries in and replace the `@import` in `tokens/fonts.css` with `@font-face`. Flagged for your review.

---

## Index / manifest

**Foundations**
- `styles.css` — the entry point consumers link (a list of `@import`s only).
- `tokens/colors.css` · `tokens/typography.css` · `tokens/spacing.css` · `tokens/fonts.css` · `tokens/base.css`

**Components** (`window.DesignMeDesignSystem_157aab.<Name>`)
- `components/buttons/` — **Button**, **IconButton**
- `components/feedback/` — **Badge**, **Tag**, **Toast**
- `components/selection/` — **Swatch**, **ColorDot**, **Chip**, **SubTab**, **CategoryTile**  *(the recognition-first core)*
- `components/surfaces/` — **Card**
- `components/product/` — **VibeCard**, **DiscoverHero**  *(signature surfaces)*

**Foundation cards** (Design System tab) — `guidelines/*.html` (Colors, Type, Spacing, Brand, **Outfits** groups). The Outfits group (`garment-tops`, `garment-bottoms`, `garment-vibes`) specimens the clothing design language.

**UI kit**
- `ui_kits/avatar-studio/` — interactive recreation of the designMe avatar studio (pick a vibe, dress your avatar, this-or-that discovery, save to lookbook).

**Assets**
- `assets/figure.js` — **the outfit design language.** `dmFigure({...})` → a full-figure fashion-illustration SVG in the house style. Clothing is composed from a small vocabulary so *any* combination renders:
  - `top: { sleeve, len, neck, fit, …flags }` — `sleeve`: tank · strap · short · long · `len`: crop · boxy · hip · long · dress · `neck`: crew · scoop · v · collar · high · asym · `fit`: fitted · relaxed · oversized · boxy · drape · flags: `hood, pocket, zip, rib, placket, chunky, corset, graphic, mesh, satin`.
  - `bottom: { type, …flags }` — `type`: barrel · wide · cargo · track · parachute · legg · shorts · jorts · skirt · flags: `maxi, midi, pleated, cargo, ruched`.
  - `shoes`: sneaker · boot · loafer · slide · heel.
  - `body`: lean · balanced · broad · curvy · full · `height`: shorter…taller · plus `skin, hair, hairColor, topColor, bottomColor, expression`.
  This is the engine behind the studio, the vibe cards, and the Outfits specimen cards. **Composition over assets** — there are no garment images; every look is drawn from these parameters.
- `assets/avatar.js` — `dmAvatar({skin, hairColor, topColor, hair, expression, glasses, hearing, feature, height})` → a compact head-and-shoulders **bust** for face/hair-focused previews, including **assistive tech (glasses, hearing aids, cochlear implants) and skin features (freckles, vitiligo) as ordinary options** — the brand's core representation requirement.

**Other**
- `SKILL.md` — Agent-Skill manifest for downloading/using this system in Claude Code.
