# iPad dev build — the repeatable workflow

How to get (and keep) the designMe dev client running on the iPad. Established by Story 1.0; every later story's iPad-side verification assumes this build is installed.

## Why a dev build (and why cloud-built)

- **Skia is not in Expo Go** — the app needs a custom dev client (`expo-dev-client` is already in `app/package.json`).
- **Local iOS builds are a dead end on this machine.** macOS 26 + Xcode 26 can't compile RN 0.74.5 (Xcode 16.3+ broke RCT-Folly for every RN < 0.77; there is no SDK 51 patch), and Xcode 15.x won't run on macOS 26. Build in the cloud: EAS still offers the SDK 51 image (`macos-sonoma-14.5-xcode-15.4`). Do **not** upgrade the SDK and do **not** run `npx expo prebuild` to work around this.

## Prerequisites (one-time)

- Expo account, logged in: `npx eas-cli login`
- Project linked: `eas init` run once inside `app/` (writes `extra.eas.projectId` into `app.json` — commit it)
- **Paid Apple Developer Program membership ($99/yr)** — required for EAS internal distribution (ad hoc provisioning). A free Apple ID does not work for this route.
- Mac and iPad on the same Wi-Fi network for day-to-day dev.

## The three commands

All from `app/` (the Expo project root — not the repo root):

1. **Register the iPad** (once per device): `eas device:create` — opens a link you visit in Safari *on the iPad* to capture its UDID.
2. **Build in the cloud**: `eas build --profile development --platform ios` — uses `app/eas.json`'s `development` profile (dev client, internal distribution, real device). Install on the iPad from the QR/install link EAS prints (Safari-served .ipa — no App Store, no TestFlight). Free tier allows 15 iOS builds/month.
3. **Daily dev loop**: `npm run ios:dev` (= `expo start --dev-client`) on the Mac, then open the designMe dev client on the iPad and connect to the Metro server.

Note: PNG part assets (`app/assets/parts/`, gitignored and machine-local) are served by Metro at runtime — the cloud-built native shell never contains them. Never "fix" a missing part by committing it into the build.

## Profile lifetime

With a paid Apple account, ad hoc provisioning profiles last **~1 year** — the free-account 7-day expiry is irrelevant on this route. Rebuild-for-expiry is a once-a-year event, not a weekly one.

## When do I need a REBUILD?

- **Rebuild** (`eas build ...`) only when the **native layer changes**: adding/upgrading a package with native code (anything installed via `npx expo install` that isn't pure JS), changing `app.json` native config (scheme, bundleIdentifier, plugins), or Expo SDK changes.
- **No rebuild** for JS/TS-only changes — components, engine, catalog, assets. Metro (`npm run ios:dev`) hot-serves all of it to the installed client.
