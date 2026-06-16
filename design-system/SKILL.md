---
name: designme-design
description: Use this skill to generate well-branded interfaces and assets for designMe (Find Your Vibe) — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping a warm, premium-calm, recognition-first avatar & style explorer built for self-expression and autonomy (AAC / multimodal communicators).
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (tokens, components, guidelines, ui_kits, assets).

designMe is a no-typing, **recognition-first** product for people who may not be able to *tell* you what they like, but can *show* you. Honor the hard constraints in the README: no required text input, recognition over recall, broad representation, large touch targets, premium-calm (never clinical or loud), dignity through desirability.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out (`assets/avatar.js`, the token CSS) and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

Key brand cues: warm paper neutrals + sage-green primary + terracotta action; rounded sans (Nunito ≈ SF Pro Rounded) for everything, editorial serif (Newsreader ≈ Georgia) only for the wordmark/headlines; Lucide-style line icons; soft warm-brown shadows; generous rounding; gentle settle motion; the three-tier (name / trend tag / plain note) copy pattern; warm, plain, never-normative voice.

**Outfits are central.** Clothing is a composition system, not an image library — use `assets/figure.js` `dmFigure(...)` to draw full-figure looks from attributes (top sleeve/length/neckline/fit + flags; bottom type + flags; shoes; body; height). See the "Garment design language" section of `readme.md`. Use `assets/avatar.js` `dmAvatar(...)` only for small face/hair-focused busts.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask a few questions, and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.
