---
status: final
updated: 2026-07-03
project: designMe
design: ./DESIGN.md
sources:
  - ../../../CLAUDE.md
  - ../../../_bmad-output/specs/spec-designme/SPEC.md
  - ../../../_bmad-output/project-context.md
  - ../../../app/src/AvatarStudio.tsx
---

# designMe — EXPERIENCE.md

How it works. Visual identity lives in DESIGN.md; tokens referenced as
`{path.to.token}`. Both spines win over any mock or import on conflict.

## Foundation

- **Form factor:** one Expo/React-Native codebase → **iPad (primary, touch)** and
  **web (secondary, mouse + keyboard)**. iPad is the dignity surface — Guided
  Access, Switch Control, eye-tracking, VoiceOver come from the OS; we lean on
  them instead of reinventing.
- **UI system:** internal tokens only (DESIGN.md ↔ `theme.ts`); no external kit.
- **Render engines:** deterministic avatar render (PNG parts stack; SVG fallback
  keeps every state complete). Same state → same pixels, always.
- **Persistence:** local-only (AsyncStorage). No accounts, no network on the
  interaction path.

## Recognition-First Bans (product law, restated for every new surface)

Never: required text input · sign-up or caregiver gates · modal/tutorial walls ·
scores, streaks, timers · flashing or autoplay audio · infinite scroll ·
per-tap latency · "what flatters you" framing · telling the user they're wrong.
The app never initiates; the user does.

## Information Architecture

Three surfaces, one hub:

1. **Studio** (home, always the landing surface) — the avatar IS the menu.
   Region hotspots on the avatar open contextual trays; ActionRow carries
   shuffle/undo/save; doors to This-or-That and Lookbook float on the stage edge.
2. **This-or-That** ("Find my vibe") — the guided second door: full-screen pairs,
   binary choice, a bounded number of rounds, ends applying a starting style.
3. **Lookbook** — the pride gallery of saved looks; tap a look to wear it.

No deeper navigation exists. No settings surface in MVP (engine/dev
toggles remain dev-only chrome, hidden from users).

## Voice and Tone

- The app is nearly wordless; every string is optional assistance, not
  instruction. Reading is never required to operate anything.
- Microcopy is warm, brief, and never evaluative: "Saved to your looks" ·
  "Tap your hair, face, or top" · never "Great choice!" (praise implies judgment).
- No error language directed at the user; failures are the app's fault and
  recover silently (see State Patterns).
- Labels name things plainly for screen readers ("Hair: defined curls") —
  concrete nouns, no jargon, no cuteness.

## Component Patterns (behavior — visuals in DESIGN.md → Components)

- **RegionHotspot:** tap → opens that region's Tray; the active region's chip
  pulses gently once ({DESIGN: Motion} base). Hotspots are always visible —
  discoverability never depends on hover.
- **Tray:** slides up ({DESIGN: Motion} base); one tray at a time; tapping a
  tile live-swaps the part on the avatar instantly with a soft crossfade;
  tapping outside or the region again closes it. Selection persists immediately —
  there is no "apply" step, no confirm, no cancel.
- **OptionTile rows:** finite horizontal rows (a category fits on 1–2 screens of
  tiles); stepped scroll, no momentum-flick requirement, no infinite scroll.
  Color options render as tinted avatar-part previews, not abstract swatches,
  with non-visual labels ("Hair color: espresso").
- **ActionRow:** *Shuffle* proposes (writes state — the only randomness in the
  app); *Undo* restores the prior state exactly (40-step history); *Save* adds
  the current look to the Lookbook with a Toast — never navigates away.
- **LookCard:** tap → wear that look (replaces current state; Undo can restore).
  Long-press or a small affordance offers removal behind a calm confirm
  (deletion is allowed but never prominent).

## State Patterns

- **First-run:** land directly in the Studio with a randomized, non-default
  avatar (never the lightest skins as default). No interstitial of any kind.
  The only onboarding is ambient: hotspots + the one-line hint chip.
- **Partial art coverage:** if a state's PNG art is incomplete, the deterministic
  SVG engine renders the complete figure instead — the user never sees a partial
  or broken avatar, and is never told anything happened.
- **Empty Lookbook:** a calm invitation ("Your looks will live here") with one
  sample slot silhouette — no arrow-pointing tutorial.
- **Saved:** Toast confirmation + the look appears in the Lookbook strip. No
  celebration animation beyond the settle.
- **Crash/restart:** current avatar and all saved looks survive (local
  persistence); reopening resumes exactly where the user was.
- **Errors:** storage or render failures recover to the last good state
  silently; CalmBoundary remounts a crashed tree — never a dead screen, never
  an error dialog asking the user to decide something technical.

## Interaction Primitives

- **Touch (primary):** single tap everywhere; no gesture is required anywhere —
  no swipe, pinch, drag, long-press on the critical path.
- **Keyboard (web):** full operation via Tab/Enter/Esc/arrows; visible
  {DESIGN: colors.focus} ring always; focus order follows visual order;
  tray open moves focus into the tray, close returns it to the hotspot.
- **Switch scanning:** every flow completable with two switches (advance/select);
  This-or-That is the optimized path (exactly two targets per screen).
- **Eye-gaze / dwell:** all targets ≥ {DESIGN: spacing.tap} with ≥ 8px gaps;
  no time-outs anywhere — nothing ever auto-advances or expires.
- **VoiceOver/screen reader:** every element has role + concrete label; avatar
  announces a plain description of the current look on demand, not on every change
  (change announcements are polite/queued, not interruptive).

## Accessibility Floor (behavioral; contrast values in DESIGN.md)

WCAG AA contrast on every text/control pairing · targets ≥ 48px, primary ≥ 64px ·
full keyboard operability with visible focus · honor `prefers-reduced-motion`
(every animation snaps) · no flashing content · screen-reader labels distinguish
every option non-visually · Guided Access mode is first-class: full-bleed Studio
with no chrome traps (see Responsive & Platform).

## Key Flows

### Flow 1 — Sofia's first minute (the north-star journey)

Sofia, 24, communicates primarily through her AAC tablet. Her brother opens
designMe on the family iPad and hands it to her. No sign-in, no tutorial.

1. The Studio opens on a randomized avatar — medium-deep skin, a low bun, a sage
   tee. It isn't her, but it's *somebody*, instantly.
2. She taps the hair. The tray slides up with big hair tiles. She taps the wavy
   one — the avatar's hair swaps softly. She taps the next tile, and back again.
   Nothing asks her to confirm; the avatar just listens.
3. She taps the top, picks the hoodie, then taps the terracotta color tile.
4. She finds Shuffle and taps it three times — the avatar proposes, she reacts.
   The third proposal keeps the hoodie. She smiles.
5. **Climax:** she taps Save. The toast breathes "Saved to your looks," and her
   look appears in the Lookbook — hers, made by her, shown to her brother by
   turning the iPad around. Nobody typed anything. Nobody was told anything.
6. She keeps playing. Every future open resumes exactly here.

### Flow 2 — Rio finds a vibe with two switches

Rio, 15, uses switch scanning (two switches: advance, select) via iPadOS Switch
Control.

1. From the Studio, Rio's scan reaches the "Find my vibe" door and selects it.
2. Full-screen pair: two complete looks, left and right — the only two targets.
   Advance alternates the highlight; select picks. No timer; the pair waits.
3. Rounds continue — each pair responds to what Rio picked so far
   (convergence is deterministic given the same choice sequence).
4. **Climax:** after a bounded set of rounds, "your starting style" appears on
   Rio's avatar — applied, not suggested. One more select returns to the Studio
   wearing it.
5. Rio's support worker never touched the iPad.

## Responsive & Platform

- **iPad:** the reference experience. Landscape and portrait both first-class;
  Guided Access delivers a full-bleed, chrome-free Studio (no external links, no
  exits on the critical path to trap on). Dev toggles hidden outside __DEV__.
- **Web:** the same layout scaled; hover states exist but nothing depends on
  them; keyboard flows per Interaction Primitives. Deploy target is a plain URL —
  nothing to install.
- **Platform splits:** `.web.tsx` siblings must stay behavior-compatible; any
  divergence is rendering-level, never interaction-level.
- **Out of scope for MVP:** dark mode, i18n beyond English labels
  (both are values-compatible later; tokens and wordless design
  make them cheap), phones (small screens compromise the
  avatar-as-menu paradigm; revisit post-MVP).
