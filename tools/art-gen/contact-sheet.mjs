#!/usr/bin/env node
// designMe contact sheet — one HTML page to art-direct a staged batch.
//
//   node tools/art-gen/contact-sheet.mjs
//   open _art_staging/contact-sheet.html
//
// Shows every staged part at working size AND at ~64px (the art-bible
// recognizability test), over both paper and dark backgrounds, with its QA
// verdict. Approve/reject each part (saved in localStorage), then "Export
// approvals" downloads approvals.json for tools/art-gen/ingest-approved.mjs.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const STAGING = join(root, "_art_staging");

const qaPath = join(STAGING, "qa-report.json");
const qa = existsSync(qaPath)
  ? Object.fromEntries(JSON.parse(readFileSync(qaPath, "utf8")).map((r) => [r.key, r]))
  : {};

const parts = [];
for (const cat of readdirSync(STAGING)) {
  const dir = join(STAGING, cat);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".png"))) {
    parts.push({ key: `${cat}/${f.replace(".png", "")}`, rel: `${cat}/${f}` });
  }
}
parts.sort((a, b) => a.key.localeCompare(b.key));
if (!parts.length) {
  console.error("no PNGs in _art_staging/ — run generate.mjs first");
  process.exit(1);
}

const card = (p) => {
  const r = qa[p.key];
  const badge = !r
    ? `<span class="badge unknown">no QA</span>`
    : r.pass
      ? `<span class="badge pass">QA pass</span>`
      : `<span class="badge fail" title="${Object.values(r.fails).join("; ").replaceAll('"', "&quot;")}">QA FAIL</span>`;
  const warn = r?.warnings?.length ? `<div class="warn">${r.warnings.join("; ")}</div>` : "";
  return `
  <div class="card" data-key="${p.key}">
    <div class="head"><code>${p.key}</code>${badge}</div>
    <div class="imgs">
      <div class="paper"><img src="${p.rel}" loading="lazy"></div>
      <div class="dark"><img src="${p.rel}" loading="lazy"></div>
      <div class="tiny"><img src="${p.rel}" loading="lazy" title="recognizable at 64px?"></div>
    </div>
    ${warn}
    <div class="actions">
      <button class="approve" onclick="setState('${p.key}','approved')">Approve</button>
      <button class="reject" onclick="setState('${p.key}','rejected')">Reject</button>
    </div>
  </div>`;
};

const html = `<!doctype html><meta charset="utf-8"><title>designMe — staged art review</title>
<style>
  :root { color-scheme: light; }
  body { font: 14px/1.45 -apple-system, system-ui, sans-serif; margin: 24px; background: #faf6f0; color: #3a332c; }
  h1 { font-family: Georgia, serif; font-weight: 500; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
  .card { background: #fff; border: 1px solid #e7ded2; border-radius: 12px; padding: 12px; }
  .card.approved { outline: 3px solid #7a9b76; }
  .card.rejected { opacity: .45; outline: 3px solid #c4756b; }
  .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .badge { border-radius: 99px; padding: 2px 10px; font-size: 12px; }
  .badge.pass { background: #e4eee2; color: #40603c; }
  .badge.fail { background: #f6ddda; color: #7c3a32; cursor: help; }
  .badge.unknown { background: #eee7db; color: #6d6455; }
  .imgs { display: grid; grid-template-columns: 1fr 1fr 72px; gap: 8px; align-items: center; }
  .imgs > div { border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .paper { background: #f3ead9; } .dark { background: #2e2a25; }
  .paper img, .dark img { width: 100%; height: 220px; object-fit: contain; }
  .tiny { background: repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 / 16px 16px; }
  .tiny img { width: 64px; height: 64px; object-fit: contain; }
  .warn { color: #8a6d3b; font-size: 12px; margin-top: 6px; }
  .actions { display: flex; gap: 8px; margin-top: 10px; }
  button { border: 1px solid #d8cdbc; background: #fff; border-radius: 8px; padding: 8px 16px; font-size: 14px; cursor: pointer; min-height: 40px; }
  .approve:hover { background: #e4eee2; } .reject:hover { background: #f6ddda; }
  .toolbar { position: sticky; top: 0; background: #faf6f0ee; padding: 12px 0; display: flex; gap: 12px; align-items: center; z-index: 2; }
  .toolbar button { background: #3a332c; color: #fff; border: 0; }
</style>
<h1>designMe — staged art review <small>(${parts.length} parts)</small></h1>
<div class="toolbar">
  <button onclick="exportApprovals()">Export approvals.json</button>
  <span id="tally"></span>
</div>
<div class="grid">${parts.map(card).join("\n")}</div>
<script>
  const KEY = "designme-art-approvals";
  const state = JSON.parse(localStorage.getItem(KEY) || "{}");
  function paint() {
    let a = 0, r = 0;
    document.querySelectorAll(".card").forEach((c) => {
      c.classList.remove("approved", "rejected");
      const s = state[c.dataset.key];
      if (s) c.classList.add(s);
      if (s === "approved") a++; if (s === "rejected") r++;
    });
    document.getElementById("tally").textContent =
      a + " approved · " + r + " rejected · " + (${parts.length} - a - r) + " undecided";
  }
  function setState(key, s) { state[key] = state[key] === s ? undefined : s; localStorage.setItem(KEY, JSON.stringify(state)); paint(); }
  function exportApprovals() {
    const approved = Object.entries(state).filter(([, s]) => s === "approved").map(([k]) => k);
    const blob = new Blob([JSON.stringify({ approved }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "approvals.json"; a.click();
  }
  paint();
</script>`;

writeFileSync(join(STAGING, "contact-sheet.html"), html);
console.log(`wrote ${join(STAGING, "contact-sheet.html")} (${parts.length} parts)`);
console.log("open it, approve/reject, Export approvals.json into _art_staging/, then:");
console.log("  node tools/art-gen/ingest-approved.mjs");
