#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { PNG } from "pngjs";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://localhost:8081";
const outDir = resolve(process.env.OUT_DIR || "tools/visual-matrix/out");
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "ipad", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];

mkdirSync(outDir, { recursive: true });

function analyzePng(buffer) {
  const png = PNG.sync.read(buffer);
  let varied = 0;
  let ink = 0;
  const seen = new Set();
  for (let y = 0; y < png.height; y += 2) {
    for (let x = 0; x < png.width; x += 2) {
      const i = (y * png.width + x) * 4;
      const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
      seen.add(`${r >> 4},${g >> 4},${b >> 4}`);
      if (Math.max(r, g, b) - Math.min(r, g, b) > 8) varied++;
      if (r < 235 || g < 235 || b < 235) ink++;
    }
  }
  return { varied, ink, unique: seen.size };
}

async function assertVisualStage(page, label) {
  await page.waitForTimeout(250);
  const leakedPartsChip = await page.getByText(/\d+\/\d+ parts/).count();
  if (leakedPartsChip) throw new Error(`${label}: partial PNG coverage chip leaked into UI`);
  const shot = await page.screenshot({ fullPage: true });
  const stats = analyzePng(shot);
  if (stats.unique < 24 || stats.ink < 1200) {
    throw new Error(`${label}: screenshot appears blank (${JSON.stringify(stats)})`);
  }
}

async function screenshot(page, viewport, label) {
  await page.waitForTimeout(600);
  await assertVisualStage(page, `${viewport.name}/${label}`);
  const path = join(outDir, `${viewport.name}-${viewport.width}x${viewport.height}-${label}.png`);
  await page.screenshot({ path, fullPage: true });
  const scroll = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth - window.innerWidth,
    y: document.documentElement.scrollHeight - window.innerHeight,
  }));
  if (scroll.x > 2 || scroll.y > 2) throw new Error(`${viewport.name}/${label}: page scroll overflow ${JSON.stringify(scroll)}`);
  console.log(path);
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 });
  await screenshot(page, viewport, "studio");

  await page.getByLabel("Change face").click({ force: true });
  await screenshot(page, viewport, "face-tray");
  await page.getByRole("button", { name: "Close options" }).nth(1).click();

  await page.getByLabel("Vibes").click();
  await screenshot(page, viewport, "this-or-that");
  await page.getByLabel("Back to studio").click();

  await page.getByLabel("Save to lookbook").click();
  await page.getByLabel("Looks").click();
  await screenshot(page, viewport, "lookbook");
  await context.close();
}

const browser = await chromium.launch();
try {
  for (const viewport of viewports) await runViewport(browser, viewport);
} finally {
  await browser.close();
}
