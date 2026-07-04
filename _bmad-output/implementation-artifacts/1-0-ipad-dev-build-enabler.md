---
baseline_commit: 820347b319d8ee0fce545a561118ec4b4333bd26
---

# Story 1.0: iPad dev build enabler (environment)

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the maker,
I want an Expo dev build installed and launching on the iPad,
so that every story's both-target definition of done (architecture §7) is satisfiable from the first story instead of deferred to Epic 6.

## Acceptance Criteria

1. **Given** the app/ Expo project, **when** a dev build (Skia included) is installed on the iPad, **then** the app launches and renders the Studio on the device.
2. **And** subsequent stories can run their iPad-side verification against this build (dev client connects to a locally running Metro via `npx expo start --dev-client`; the workflow is documented so any future story can repeat it).
3. **And** full-slice verification remains Story 6.1's scope — this story only establishes the environment (no visual spot-check matrix, no physical touch-target measurement, no Guided Access session; those are 6.1).

## Tasks / Subtasks

- [x] Task 1: Make `app/app.json` native-build-ready (AC: 1)
  - [x] Add `"scheme": "designme"` (dev-client deep-link launcher needs a URL scheme)
  - [x] Add `"ios": { "supportsTablet": true, "bundleIdentifier": "com.adamsantoyo.designme" }` — bundleIdentifier is a hard requirement for iOS signing; keep `supportsTablet: true` exactly as-is
  - [x] Do NOT change `platforms`, `orientation`, `userInterfaceStyle`, or `web` — additive only
  - [x] Icon/splash: not confirmed as blockers for a dev-client build; skip unless the build errors on them, then add minimal placeholders under `app/assets/` (not `app/assets/parts/` — that dir is pipeline-owned and gitignored)
- [x] Task 2: Create `app/eas.json` with a development profile (AC: 1)
  - [x] Exact minimal content (see Dev Notes → eas.json); `developmentClient: true`, `distribution: "internal"`, `ios.simulator: false`
  - [x] Commit `eas.json` (it is project config, not a secret)
- [ ] Task 3: Operator prerequisites — flag to Adam before building (AC: 1) **[BLOCKER — human step]**
  - [ ] Expo account + `npm i -g eas-cli` (or `npx eas-cli`), `eas login`, `eas init` in `app/` to link the project (writes `extra.eas.projectId` into app.json — additive, fine)
  - [ ] **Paid Apple Developer Program membership ($99/yr) is required** for EAS internal distribution (ad hoc provisioning). A free Apple ID does NOT work for the EAS route. If Adam declines the paid account, the only alternative is the local-build fallback (Dev Notes → Fallback), which is expected to FAIL on this machine — surface this tradeoff, don't silently pick
- [ ] Task 4: Register the iPad and run the cloud build (AC: 1)
  - [ ] `cd app && eas device:create` — registers the iPad's UDID via a Safari link opened on the iPad
  - [ ] `eas build --profile development --platform ios` — builds on EAS's SDK 51 image (`macos-sonoma-14.5-xcode-15.4`); do NOT build locally (see Dev Notes → Why not local)
  - [ ] Install on the iPad from the QR/install link EAS prints (Safari-served .ipa, no App Store, no TestFlight)
- [ ] Task 5: Launch and verify the Studio on device (AC: 1, 2)
  - [ ] On the Mac: `cd app && npx expo start --dev-client` (Mac and iPad on the same network)
  - [ ] Open the designMe dev client on the iPad, connect to the Metro server, confirm the Studio renders with an avatar (SVG engine default is fine; PNG parts load from local Metro since `app/assets/parts/` is served by the dev server, not baked into the binary)
  - [ ] Confirm a region tap opens a tray and a swap renders (smoke only — NOT the 6.1 verification matrix)
  - [ ] Record device model + iPadOS version in the Dev Agent Record
- [x] Task 6: Document the repeatable workflow (AC: 2)
  - [x] Add a short "iPad dev build" section to `docs/build-kickoff.md` (or a new `docs/ipad-dev-build.md` if kickoff feels wrong): prerequisites, the three commands (device:create / build / start --dev-client), the 7-day-irrelevance note (ad hoc profiles last ~1 year with paid account), and when a REBUILD is needed (any native dep change — new package via `npx expo install` that has native code — vs. JS-only changes which need only Metro)
  - [x] Add npm script `"ios:dev": "expo start --dev-client"` to `app/package.json` (leave existing scripts untouched)
- [x] Task 7: Verification recipe (architecture §7, scoped to this story)
  - [x] `npm --prefix app run typecheck` — must stay green (config-only story; any TS change is a smell)
  - [x] `node tools/check-art-ids.mjs` — must stay green (no catalog/art changes expected; run to prove it)
  - [x] Web target unaffected: `npx expo start --web` still serves the Studio (app.json additions must not break web)

## Dev Notes

### Scope guardrails (what this story is NOT)

- **No product/src code changes.** This is an environment story: `app/app.json`, `app/eas.json`, `app/package.json` (script only), docs, and cloud/account setup. If you find yourself editing `app/src/**`, stop — wrong story.
- **Do NOT upgrade Expo SDK / React Native to solve Xcode problems.** SDK 51 / RN 0.74.5 is the pinned stack (project-context.md). The Xcode incompatibility below is solved by building in the cloud, not by upgrading.
- **Do NOT run `npx expo prebuild`** unless the fallback path is explicitly chosen. The project is managed-workflow; there is no `ios/` dir and it should stay that way. If prebuild ever runs, add `app/ios/` to `.gitignore` before committing anything.
- `expo-dev-client ~4.0.29` is **already installed** in `app/package.json` — do not reinstall, do not `expo install` it again.
- Full-slice iPad verification (visual parity with web, physical ≥48/64px measurement, Guided Access full-bleed) is **Story 6.1**. Resist scope creep into it.

### Why not local (the critical constraint)

The dev machine runs macOS 26 (Darwin 25.5) with Xcode 26.6. Two stacked incompatibilities make local iOS builds a dead end:

1. **Xcode 16.3+ removed the base template for `std::char_traits`**, breaking RCT-Folly compilation in every RN < 0.77 — including RN 0.74.5. Error signature: `implicit instantiation of undefined template 'std::char_traits<unsigned char>'`. Facebook fixed it only in RN 0.77; Expo backported a patch to SDK 52 but **there is no SDK 51 patch** (out of the active-patch window). [expo/expo#35807, facebook/react-native#50411]
2. Xcode 15.x (the version SDK 51 actually needs) **does not run on macOS 26 Tahoe**. [XcodesApp#763]

So: `eas build` on Expo's cloud image `macos-sonoma-14.5-xcode-15.4` (still offered for SDK 51 per docs.expo.dev/build-reference/infrastructure/) is the only reliable route. Free EAS tier allows 15 iOS builds/month — ample; this story needs 1.

### eas.json (exact content)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    }
  }
}
```

Location: `app/eas.json` (next to `app/package.json` — the Expo project root is `app/`, NOT the repo root; the repo-root package.json is Node tooling only).

### Fallback (only if paid Apple account is refused)

Local path: `npx expo prebuild -p ios` + `npx expo run:ios --device` with free personal-team signing (7-day expiring profile, weekly reinstall). **Expected to fail on this machine** per the Xcode constraint above. Only viable on a second Mac with macOS ≤15 + Xcode 15.4. Document the attempt/decision either way; do not leave the story silently half-done.

### Skia / assets facts relevant to the build

- Skia 1.2.3 peer deps (`react-native >= 0.64`, `react >= 18`) are satisfied; no New Architecture requirement at 1.2.x — SDK 51 default (New Arch off) is correct, don't enable `newArchEnabled`.
- Skia is not in Expo Go — that's the entire reason this story exists (SPEC: "Skia's Expo-dev-build requirement is an accepted distribution constraint").
- `app/assets/parts/` (97 approved P0 PNGs) is **gitignored and machine-local**. This does NOT affect the dev build: a development client loads its JS bundle + assets from the local Metro server at runtime, so the cloud-built native shell never needs them. Never "fix" this by committing parts or adding them to the EAS upload.
- Known SDK 51 + Skia codegen pitfall (local builds only): duplicate `yargs` versions break RN's codegen CLI (`parseSync is not a function`); fix is `"resolutions": {"yargs": "^17"}`. Irrelevant on the EAS path; noted for the fallback.

### Architecture & project-context compliance

- Architecture §8: "iPad: Expo dev build required (Skia is not in Expo Go) — accepted constraint." This story discharges it. [Source: _bmad-output/architecture.md#8-deployment]
- Architecture §7 both-target DoD is the story's *reason to exist* — added by readiness remediation 2026-07-04 (Major finding #1: hidden late dependency on 6.1). [Source: _bmad-output/planning-artifacts/implementation-readiness-report-2026-07-04.md#findings-by-severity]
- Deps rule: anything added to `app/` goes through `npx expo install` inside `app/` (SDK 51 range). This story should add **zero** app dependencies; eas-cli is a global/npx tool, not an app dep. [Source: _bmad-output/project-context.md#dependencies]
- No UX surface is touched; DESIGN.md/EXPERIENCE.md impose nothing on this story beyond "iPad is the dignity surface" — i.e., this environment is the product's primary target, treat it as first-class, not a checkbox.

### Project Structure Notes

- New files: `app/eas.json` (commit), docs section/file (commit). Modified: `app/app.json` (additive keys only), `app/package.json` (one script). `eas init` may add `extra.eas.projectId` to app.json — commit that too.
- No conflicts with the unified structure detected. `.gitignore` already covers `app/.expo/`; add `app/ios/` ONLY if the fallback prebuild path is ever exercised.
- Persistence contract untouched (no `Av`/catalog/storage-key changes). Registry/manifest untouched.

### Testing standards summary

- No unit-test framework exists — do not add Jest/Vitest. Verification = typecheck + tools harnesses + running both targets (project-context.md).
- This story's evidence of done: (a) photo/note of Studio rendering on the physical iPad with device model + iPadOS version recorded below, (b) typecheck green, (c) check-art-ids green, (d) web still boots.

### References

- [Source: _bmad-output/epics.md#Story-1.0 — story statement + ACs (verbatim source)]
- [Source: _bmad-output/architecture.md#7-verification-recipe, #8-deployment]
- [Source: _bmad-output/project-context.md — deps rule, verification recipe, cross-platform rules]
- [Source: _bmad-output/specs/spec-designme/SPEC.md#Constraints — "Skia canvas (Expo dev build) is the render target"; #Assumptions — dev-build constraint accepted]
- [Source: _bmad-output/planning-artifacts/implementation-readiness-report-2026-07-04.md#Remediation-Addendum — why 1.0 exists, 6.1 stays verification-only]
- External (researched 2026-07-04): docs.expo.dev/build/internal-distribution/ (paid Apple account required, 100 devices/yr); docs.expo.dev/build-reference/infrastructure/ (SDK 51 image = macos-sonoma-14.5-xcode-15.4); github.com/expo/expo/issues/35807 + github.com/facebook/react-native/issues/50411 (Xcode 16.3 breaks RN < 0.77, no SDK 51 patch); github.com/XcodesOrg/XcodesApp/issues/763 (old Xcode broken on macOS 26); docs.expo.dev/tutorial/eas/ios-development-build-for-devices/ (device:create → build → install flow)

## Dev Agent Record

### Agent Model Used

Claude Fable 5 (claude-fable-5) via Claude Code

### Debug Log References

- 2026-07-04: `npm --prefix app run typecheck` — green (no output, exit 0).
- 2026-07-04: `node tools/check-art-ids.mjs` — exit 0; "OK: every catalog item has a matching worksheet filename." Pre-existing worksheet-only entries (body/seated, hair/longCurly, skin/base) unchanged — no new mismatches.
- 2026-07-04: Web-target check. `npx expo start --web` stalls at "Starting project" when launched from the sandboxed agent shell (environment limitation, not a config problem — the operator-launched dev server on :8081 runs fine). Verified instead via three signals: (1) `CI=1 npx expo config --type public` parses the new app.json (scheme + ios.bundleIdentifier present, sdkVersion 51.0.0); (2) `CI=1 npx expo export --platform web` completed successfully (full Metro bundle + all part assets emitted); (3) the live dev server on :8081 serves the designMe index and a 4.4 MB web bundle (HTTP 200) with the modified app.json on disk.

### Implementation Plan

Config-only story; no test framework exists (per Dev Notes), so red-green-refactor maps to the story's Task 7 verification recipe: make additive config changes, then prove typecheck / art-id gate / web target all stay green. Automatable tasks (1, 2, 6, 7) executed in order; Tasks 3–5 require the operator (paid Apple Developer decision, `eas login`, physical iPad) and are HALTed on, per Task 3's explicit "[BLOCKER — human step]".

### Completion Notes List

- Story context created 2026-07-04 by create-story workflow (ultimate context engine analysis completed - comprehensive developer guide created). Blocking human step: paid Apple Developer Program decision (Task 3).
- 2026-07-04 (Task 1): `app/app.json` made native-build-ready — added `"scheme": "designme"` and `ios.bundleIdentifier: "com.adamsantoyo.designme"` (kept `supportsTablet: true`). Strictly additive: `platforms`, `orientation`, `userInterfaceStyle`, `web` untouched. Icon/splash skipped per task guidance (not confirmed blockers; revisit only if the EAS build errors on them).
- 2026-07-04 (Task 2): `app/eas.json` created with the exact Dev Notes content (development profile: `developmentClient: true`, `distribution: "internal"`, `ios.simulator: false`). Committed.
- 2026-07-04 (Task 6): New `docs/ipad-dev-build.md` (kickoff doc is a design-handoff brief — an ops runbook didn't fit, so took the story's named alternative) covering prerequisites, the three commands, the ~1-year ad hoc profile lifetime (7-day expiry irrelevant with paid account), rebuild-vs-Metro rules, and the why-cloud constraint. One pointer line added to `docs/build-kickoff.md` → Technical target. `ios:dev` script added to `app/package.json`; existing scripts untouched.
- 2026-07-04 (Task 7): Full verification recipe green — see Debug Log.
- **HALT — Task 3 (operator prerequisites):** paid Apple Developer Program membership ($99/yr) is required for the EAS internal-distribution route; a free Apple ID does not work. The alternative (local build fallback) is expected to FAIL on this machine (macOS 26 / Xcode 26 vs RN 0.74.5 — see Dev Notes → Why not local). Awaiting Adam's decision + interactive steps: `eas login`, `eas init` in `app/`, then Tasks 4–5 (device registration, cloud build, on-device verification).

### File List

- app/app.json (modified — scheme + ios.bundleIdentifier, additive)
- app/eas.json (new — EAS development build profile)
- app/package.json (modified — ios:dev script only)
- docs/ipad-dev-build.md (new — repeatable iPad dev build workflow)
- docs/build-kickoff.md (modified — one pointer line to ipad-dev-build.md)
- _bmad-output/implementation-artifacts/1-0-ipad-dev-build-enabler.md (modified — story tracking)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified — 1-0 → in-progress)

## Change Log

- 2026-07-04: Tasks 1, 2, 6, 7 implemented (Claude Fable 5). App config made native-build-ready, EAS development profile added, iPad dev build workflow documented in docs/ipad-dev-build.md, full verification recipe green (typecheck, check-art-ids, web export + live web serve). Story HALTed at Task 3: paid Apple Developer Program decision + interactive EAS login are operator-only steps; Tasks 4–5 (cloud build, on-device verification) blocked behind them. Status remains in-progress.
