# designMe — Build Kickoff

Seed for a **fresh Claude Design session**, and the brief that hands off to **Claude Code**. Paste the relevant parts into each.

## What it is

designMe — a no-typing, **recognition-first** avatar + style explorer for self-expression and autonomy, built for AAC / multimodal communicators (initial user: my sister). The user reacts to visual options instead of describing them. Warm, calm, premium — never clinical. *"A tool for someone who may not be able to tell you what they like, but can show you."*

## Non-negotiables

- Recognition over recall; **no required typing**; no time pressure, scores, streaks, flashing, or autoplay audio.
- Large touch targets (≥48px, primary ≥64px), full keyboard + visible focus ring, honor reduced motion, WCAG AA contrast.
- Warm **premium-calm** look — never loud or clinical. Assistive tech shown as ordinary options. Gender-expansive (every item available to every avatar). Randomized non-default start. No tutorial wall, no sign-up.

## Design system — import, don't reinvent

Use the existing tokens: warm paper neutrals + **sage** primary + **terracotta** action; **Nunito** (rounded sans) for all UI/body, **Newsreader** (serif) for the wordmark/headlines only; soft warm-brown shadows; generous rounding; gentle "settle" motion. Source of truth: `design-system/tokens/` + `design-system/guidelines/`. Import these (and a screenshot of the current `index.html`) into Claude Design so it builds on your palette, not a new one.

## Screens & states

Deliberately small — the *"avatar is the menu"* model collapses every catalog category into in-screen trays, so there's no menu-tree of screens.

**Core screens (MVP)**

1. **Avatar Studio (main)** — the hero (~80% of the app). Pinned live avatar; tap a region → contextual bottom tray of large image tiles → live swap with a soft settle; shuffle, save, undo. All catalog categories (hair, face, skin, body, tops, bottoms, shoes, tools, color) live here as trays, not separate screens.
2. **This-or-that ("Find my vibe")** — propose two looks; tap the preferred; a few rounds → a starting style. The second door for switch / eye-gaze users.
3. **Lookbook** — saved looks as a calm gallery; tap one to wear it again.
4. **Start / entry** — a randomized non-default avatar, straight into play (no tutorial wall, no sign-up). May just be the Studio's first state.

**In-screen states (design these too)**

- Studio: default · region-selected (tray open) · "Saved ✓" confirmation · first-run · undo.
- This-or-that: the pair choice · the result ("your starting style").
- Lookbook: populated · empty ("no saved looks yet").

**Later / optional (not MVP)**

- Inspiration / "more like this" boards (the de-Pinterested collection — the old "Get inspiration" stub).
- Minimal settings (lean on native iPadOS accessibility — Switch Control, Guided Access, reduced motion; maybe just a reset).
- Share / export a look (likely the system share sheet, not a screen).
- Explicitly **no** onboarding/tutorial and **no** sign-up.

## Technical target (for Claude Code)

- **React Native + Expo**, one codebase → web + iPad. **Front-end only** for now (local state; no backend/accounts).
- **Avatar = a layered-PNG compositor:** transparent part images stacked in the z-order from `docs/art-bible.md` §4, with neutral parts tinted at runtime to the palette colors (`react-native-svg` / Image layers). See `art-bible.md` §3a (recolor) and §5 (assets/naming).
- **Catalog data** (ids, categories, vibes) ported from the existing `index.html` / `docs/catalog-bible.md`.
- **Art assets** generated separately in ChatGPT per `docs/art-prompts.md`, dropped into `assets/parts/{category}/{id}.png`. Placeholders are fine until generated.

## Flow

Claude Design (screens + system) → **Export → "Send to Claude Code"** (handoff bundle) → Claude Code scaffolds the Expo app from the bundle, then wires the avatar engine + catalog + assets + local lookbook state. Build and art generation run in parallel.

---

## Kickoff prompt (paste into Claude Design)

First **import** `design-system/` tokens + guidelines, and **attach** this file + a screenshot/web-capture of the current app. Then paste:

```
I'm designing designMe — a no-typing, recognition-first avatar + style explorer
for AAC / multimodal communicators. Use the design system I've imported: warm paper
neutrals, sage primary, terracotta action, Nunito for UI, Newsreader serif for the
wordmark only, soft rounding, soft warm-brown shadows, gentle motion. Calm and
premium — never loud or clinical.

Design the Avatar Studio screen (the main screen), for iPad:

- A large live avatar pinned in the center, on a soft warm-paper "mat" with generous
  whitespace. Small serif "designMe" wordmark, top-left.
- The avatar's body regions are directly tappable — hair, face, top, bottom, shoes,
  and tools/accessories. Tapping a region opens a contextual tray along the bottom: a
  horizontal row of large rounded image tiles (the options for that region). Tapping a
  tile swaps that part on the avatar with a soft settle. Fully visual — no typing, no
  text labels needed to use it.
- A slim action row: Shuffle (randomize a fresh look), Save to lookbook, Undo. Calm
  icon buttons, uncluttered.
- Recognition-first and low-arousal: large touch targets (primary ≥64px), WCAG AA
  contrast, no time pressure, no scores, no required typing, generous spacing, honor
  reduced motion.

This is one screen of a React Native + Expo app. Design just this screen first; we'll
do the others (this-or-that discovery, lookbook, start) after this look is locked.
```

When the Avatar Studio look is locked, prompt the next screens one at a time on the same system: "Now the Lookbook screen…", "Now the This-or-that discovery screen…", "Now the Start screen…".
