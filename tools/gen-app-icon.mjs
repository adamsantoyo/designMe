#!/usr/bin/env node
// Generate the app icon + splash as a typographic mark — deterministic, not AI art.
// Renders the brand wordmark (Newsreader serif) on warm paper via headless Chromium
// and writes static PNGs to app/assets/. Re-run to regenerate:  node tools/gen-app-icon.mjs
//
// icon.png   1024x1024, OPAQUE (iOS rejects alpha) — "dM" monogram, italic terra M.
// splash.png 1024x1024, TRANSPARENT — full "designMe" wordmark, centered on the
//            app.json splash backgroundColor.

import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "app", "assets");
const SIZE = 1024;

const FONT = `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;0,600;1,500;1,600&display=swap" rel="stylesheet">`;

const iconHTML = `<!doctype html><html><head>${FONT}<style>
  html,body{margin:0;padding:0}
  .icon{width:${SIZE}px;height:${SIZE}px;
    background:linear-gradient(135deg,#f4ecdb 0%,#e7d6b8 100%);
    display:flex;align-items:center;justify-content:center;
    font-family:'Newsreader',Georgia,serif}
  .mark{font-size:540px;line-height:1;color:#2f2823;letter-spacing:-20px;font-weight:600}
  .mark em{font-style:italic;color:#bd7a4f;font-weight:600}
</style></head><body><div class="icon"><span class="mark">d<em>M</em></span></div></body></html>`;

const splashHTML = `<!doctype html><html><head>${FONT}<style>
  html,body{margin:0;padding:0;background:transparent}
  .s{width:${SIZE}px;height:${SIZE}px;display:flex;align-items:center;justify-content:center;
    font-family:'Newsreader',Georgia,serif}
  .w{font-size:150px;color:#2f2823;font-weight:500;letter-spacing:-2px}
  .w em{font-style:italic}
</style></head><body><div class="s"><span class="w">design<em>Me</em></span></div></body></html>`;

const browser = await chromium.launch();
try {
  for (const [name, html, omitBackground] of [
    ["icon.png", iconHTML, false],
    ["splash.png", splashHTML, true],
  ]) {
    const context = await browser.newContext({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.waitForTimeout(500); // let the webfont settle
    await page.screenshot({ path: join(OUT, name), omitBackground, clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
    await context.close();
    console.log("wrote", join(OUT, name));
  }
} finally {
  await browser.close();
}
