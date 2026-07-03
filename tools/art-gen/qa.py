#!/usr/bin/env python3
"""designMe staged-art QA — programmatic checks from art-bible §8, no AI involved.

    tools/art-lab/.venv/bin/python tools/art-gen/qa.py [category/id ...]

Checks every PNG in _art_staging/ (or just the ids given):
  size        exact canvas: 1024x1536 full-figure, 1024x1024 bust
  alpha       real transparency exists AND opaque content exists (a baked
              background / fake checkerboard shows up as near-total coverage)
  coverage    opaque share of the frame is sane for a registered part
  border      the outer 8px stays transparent (full-frame = never cropped to
              the item; bust items may touch the bottom edge — shoulders do)
  neutral     parts the worksheet marks "neutral tone for recoloring" are
              actually near-neutral warm (low saturation) so multiply tint works
  center      content bbox midline vs x=512 (registration drift report)

Writes _art_staging/qa-report.json (consumed by contact-sheet.mjs) and exits 1
if any part fails a hard check.
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
STAGING = ROOT / "_art_staging"
WORKSHEET = ROOT / "docs" / "art-prompts.md"

# bust frame retired until the renderer maps head-box scope — everything is full-frame
BUST = set()

# category → ((top_min, top_max), (bottom_min, bottom_max)) on the 1536 canvas;
# None = don't constrain that edge. Deliberately loose — only gross errors fail.
POSITION = {
    "hair":      ((30, 320), (260, 1080)),  # longest hair ~waist; content at the legs = unkeyed figure residue
    "accessory": ((30, 300), None),
    "top":       ((60, 620), (580, 1250)),   # hoods reach the head; crop tops end high
    "bottom":    ((580, 980), (880, 1500)),
    "shoe":      ((1100, 1420), (1300, 1536)),
    "skin":      ((40, 220), (1250, 1500)),
    "body":      ((40, 220), (1250, 1500)),
    # face parts live on the head (base head spans y≈98–320)
    "faceShape": ((60, 200), (240, 460)),
    "brow":      ((120, 300), (140, 340)),
    "eye":       ((130, 310), (160, 360)),
    "nose":      ((160, 330), (190, 380)),
    "lip":       ((200, 360), (220, 400)),
}
BORDER = 8

# art-bible §3 — palette lock (paper/brand + skin + hair + garment + eyes + makeup)
PALETTE = [
    "#ece7dc", "#fbf8f2", "#2f2823", "#6b5f53", "#6f8f6a", "#3f5c3b", "#bd7a4f", "#8a5430",
    "#3b2a21", "#4a3328", "#5c3f30", "#6d4733", "#7c5a45", "#8a5a3f", "#9c6f4e", "#a87c58",
    "#bd8a5f", "#c99a6e", "#bca079", "#d3b48f", "#e3c4a2", "#efd4b8",
    "#211c1a", "#2e221b", "#3f2b1f", "#5a3b27", "#6f4a2f", "#8a5a34", "#a87f4e", "#c8a968",
    "#dcc07a", "#e7ddc4", "#9a958d", "#cfcac3", "#9a4a36", "#c0673a", "#6f4a72", "#3f6f8a",
    "#3f8a78", "#c0708f",
    "#e6dcc6", "#c08457", "#a8553a", "#7d8254", "#8aa382", "#46604b", "#3f8a86", "#8aa7bd",
    "#5a6f8c", "#7a5570", "#d39aa3", "#cda14e", "#5e4334", "#3c3a38", "#f1e9d8", "#bd6f4f",
    "#47321e", "#705436", "#4b6348", "#608694", "#7c858a", "#644b7a",
    "#c4607a", "#b23b43", "#8a3a5e", "#d9745e", "#b07b66", "#a86b3f", "#7a5fb0",
]
MAX_SAT_NEUTRAL = 0.30   # mean saturation ceiling for recolor masters
MAX_COVERAGE = 0.85      # more opaque than this = background almost certainly baked
MIN_COVERAGE = 0.005     # less than this = generation came back essentially empty
# single facial features are legitimately tiny on the full frame
MIN_COVERAGE_BY_CAT = {"brow": 0.0001, "eye": 0.0002, "nose": 0.00005, "lip": 0.0002,
                       "makeup": 0.0002, "feature": 0.0001, "jewelry": 0.0001, "hearing": 0.0001}
CENTER_TOL = 40          # px of bbox-midline drift off x=512 before we warn

# Which categories are neutral recolor masters, straight from the worksheet notes.
neutral_cats = set()
section_neutral = False
for line in WORKSHEET.read_text().splitlines():
    if line.startswith("### "):
        section_neutral = "neutral tone for recoloring" in line or "tint to" in line
        continue
    m = re.match(r"^- \[.\] `([a-zA-Z]+)/", line)
    if m and section_neutral:
        neutral_cats.add(m.group(1))

targets = sys.argv[1:]
pngs = sorted(p for p in STAGING.rglob("*.png")
              if "_worn" not in p.parts and (not targets or f"{p.parent.name}/{p.stem}" in targets))
if not pngs:
    print("nothing to QA in _art_staging/")
    sys.exit(0)

report = []
for p in pngs:
    cat, pid = p.parent.name, p.stem
    key = f"{cat}/{pid}"
    im = Image.open(p).convert("RGBA")
    w, h = im.size
    expect = (1024, 1024) if cat in BUST else (1024, 1536)
    checks = {}
    checks["size"] = (w, h) == expect or f"{w}x{h}, expected {expect[0]}x{expect[1]}"

    alpha = im.getchannel("A")
    lo, hi = alpha.getextrema()
    hist = alpha.histogram()
    opaque = sum(hist[200:])
    coverage = opaque / (w * h)
    checks["alpha"] = (lo == 0 and opaque > 0) or f"alpha range {lo}-{hi} — no real transparency"
    min_cov = MIN_COVERAGE_BY_CAT.get(cat, MIN_COVERAGE)
    checks["coverage"] = (min_cov <= coverage <= MAX_COVERAGE) or \
        f"{coverage:.2%} opaque — {'baked background?' if coverage > MAX_COVERAGE else 'empty frame?'}"

    # border: sample the 4 edge bands; bust parts may legitimately touch the bottom
    def band_opaque(box):
        a = alpha.crop(box)
        return sum(a.histogram()[200:])
    edges = {
        "top": (0, 0, w, BORDER), "left": (0, 0, BORDER, h),
        "right": (w - BORDER, 0, w, h), "bottom": (0, h - BORDER, w, h),
    }
    if cat in BUST:
        edges.pop("bottom")
    dirty = [name for name, box in edges.items() if band_opaque(box) > 50]
    checks["border"] = not dirty or f"content touches frame edge: {', '.join(dirty)} — cropped-to-item?"

    # halo: a crisp part has only a thin anti-alias band; a soft outer glow shows
    # up as lots of semi-transparent pixels relative to opaque ones. Thin-stroke
    # face features are mostly edge by nature, so their band is far looser.
    semi = sum(hist[10:200])
    halo_ratio = semi / opaque if opaque else 0
    halo_max = 1.5 if cat == "nose" else 0.8 if cat in MIN_COVERAGE_BY_CAT else 0.10
    checks["halo"] = halo_ratio <= halo_max or \
        f"semi-transparent fringe is {halo_ratio:.0%} of opaque area — outer glow/halo (art-bible bans glow)"

    # neutral master: mean HSV saturation over opaque pixels
    if cat in neutral_cats:
        from PIL import ImageStat
        sat = im.convert("RGB").convert("HSV").getchannel("S")
        mask = alpha.point(lambda v: 255 if v >= 200 else 0)
        mean_sat = (ImageStat.Stat(sat, mask=mask).mean[0] / 255) if opaque else 0
        checks["neutral"] = mean_sat <= MAX_SAT_NEUTRAL or \
            f"mean saturation {mean_sat:.2f} > {MAX_SAT_NEUTRAL} — too colored to be a recolor master"

    # position: loose vertical bands on the 1536 canvas (head crown ~110, shoulders
    # ~400, hips ~850, feet ~1460) — catches gross misregistration like hair drawn
    # at torso height, which every other check would pass. bbox is computed on
    # solid alpha only (≥140, the ingest clean_halo cut) so stray near-invisible
    # pixels don't widen it.
    # palette proximity (art-bible §8 "on-palette"): fixed-color items should stay
    # near §3 values. Warning-level — neutral masters are covered by the sat check,
    # and per-color judgment stays human (contact sheet).
    if cat not in neutral_cats and cat not in {"skin", "body"}:
        from PIL import ImageStat
        mask = alpha.point(lambda v: 255 if v >= 200 else 0)
        if opaque:
            mr, mg, mb = ImageStat.Stat(im.convert("RGB"), mask=mask).mean
            def dist(hx):
                r2, g2, b2 = int(hx[1:3], 16), int(hx[3:5], 16), int(hx[5:7], 16)
                return ((mr - r2) ** 2 + (mg - g2) ** 2 + (mb - b2) ** 2) ** 0.5
            nearest = min(PALETTE, key=dist)
            if dist(nearest) > 90:
                warn_palette = f"mean color ({mr:.0f},{mg:.0f},{mb:.0f}) is {dist(nearest):.0f} from nearest §3 hex {nearest}"
            else:
                warn_palette = None
        else:
            warn_palette = None
    else:
        warn_palette = None

    bbox = alpha.point(lambda v: 255 if v >= 140 else 0).getbbox()
    if bbox and cat in POSITION and (w, h) == (1024, 1536):
        rule_top, rule_bottom = POSITION[cat]
        pos_errs = []
        if rule_top and not (rule_top[0] <= bbox[1] <= rule_top[1]):
            pos_errs.append(f"content starts at y={bbox[1]}, expected {rule_top[0]}–{rule_top[1]}")
        if rule_bottom and not (rule_bottom[0] <= bbox[3] <= rule_bottom[1]):
            pos_errs.append(f"content ends at y={bbox[3]}, expected {rule_bottom[0]}–{rule_bottom[1]}")
        checks["position"] = not pos_errs or f"misregistered for {cat}: {'; '.join(pos_errs)}"

    center_dx = ((bbox[0] + bbox[2]) / 2 - w / 2) if bbox else 0
    warn = []
    if abs(center_dx) > CENTER_TOL:
        warn.append(f"bbox midline {center_dx:+.0f}px off center")
    if warn_palette:
        warn.append(warn_palette)

    fails = {k: v for k, v in checks.items() if v is not True}
    report.append({
        "key": key, "pass": not fails, "fails": fails, "warnings": warn,
        "coverage": round(coverage, 4), "bbox": bbox, "size": [w, h],
    })
    mark = "✓" if not fails else "✗"
    detail = "; ".join(fails.values()) if fails else (warn[0] if warn else "")
    print(f"  {mark} {key:28s} {detail}")

(STAGING / "qa-report.json").write_text(json.dumps(report, indent=2))
failed = [r for r in report if not r["pass"]]
print(f"\n{len(report) - len(failed)}/{len(report)} pass → {STAGING / 'qa-report.json'}")
if failed:
    print("regenerate failures with:  node tools/art-gen/generate.mjs --force --only " +
          ",".join(r["key"] for r in failed))
    sys.exit(1)
