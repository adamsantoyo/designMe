#!/usr/bin/env python3
"""designMe face splitter — ONE complete-face greenscreen render (any zoom) ->
separate, canonically-registered feature layers (eye/brow/nose/lip).

    tools/art-lab/.venv/bin/python tools/art-gen/face-split.py \
        _art_staging/_worn/face/full.png eye/almond brow/soft nose/rounded lip/soft

How: key the green mannequin; measure ITS head box (top of green to shoulder
flare) and the base figure's head box the same way; affine-map every non-green
feature pixel from render-head space into base-head space. The model may zoom
into a bust freely — more feature resolution — because the green head anchors
the transform. Features are then classified into brow/eye/nose/lip by vertical
clusters (top pair, next pair, central singles). Fails loudly on ambiguity.
"""
import sys
import colorsys
from collections import deque
from pathlib import Path

from PIL import Image

HUE_LO, HUE_HI, MIN_SAT = 55, 175, 0.10  # keep in sync with key.py (olive drift included)
ALPHA_MIN = 60
MIN_AREA = 12

def is_green(r, g, b):
    mx = max(r, g, b)
    sat = (mx - min(r, g, b)) / mx if mx else 0
    if sat < MIN_SAT or g < r or g < b:
        return False
    return HUE_LO <= colorsys.rgb_to_hsv(r/255, g/255, b/255)[0]*360 <= HUE_HI

def head_box(width_by_row):
    """rows -> (y_top, y_bottom) of the head. The head widens from the crown to
    its peak width, then narrows into the neck: head bottom = first row after
    the peak where width drops below 55% of peak (the chin/neck line)."""
    rows = sorted(width_by_row)
    if not rows:
        return None
    top = rows[0]
    peak_w, peak_y = 0, top
    for y in rows:
        w = width_by_row[y]
        if w > peak_w:
            peak_w, peak_y = w, y
        elif w < 0.55 * peak_w and y > peak_y:
            return top, y
        if w > 2.5 * peak_w and peak_w > 40:  # shoulders reached without a neck dip
            return top, y
    return None

def measure(img, test):
    """(min_x,max_x per row) profile for pixels passing `test` -> head box + x range."""
    px = img.load()
    width_by_row, x_by_row = {}, {}
    for y in range(img.height):
        lo = hi = None
        for x in range(img.width):
            if test(px, x, y):
                if lo is None: lo = x
                hi = x
        if lo is not None:
            width_by_row[y] = hi - lo
            x_by_row[y] = (lo, hi)
    hb = head_box(width_by_row)
    if not hb:
        return None
    y0, y1 = hb
    xs = [x_by_row[y] for y in x_by_row if y0 <= y <= y1]
    return y0, y1, min(x[0] for x in xs), max(x[1] for x in xs)

src = Path(sys.argv[1])
# --whole cat/id: the render carries ONE overlay (makeup, skin feature) — extract
# every non-green head component as a single layer, no classification.
WHOLE = len(sys.argv) > 2 and sys.argv[2] == "--whole"
targets = {}
if WHOLE:
    targets["whole"] = sys.argv[3]
else:
    for t in sys.argv[2:]:
        targets[t.split("/")[0]] = t

im = Image.open(src).convert("RGBA")
px = im.load()

green_head = measure(im, lambda p, x, y: p[x, y][3] >= ALPHA_MIN and is_green(*p[x, y][:3]))
base = Image.open(Path(__file__).resolve().parent / "refs" / "base.png").convert("RGBA")
base_head = measure(base, lambda p, x, y: p[x, y][3] >= 140)
if not green_head or not base_head:
    sys.exit("FACE SPLIT FAIL: could not measure green or base head box")
gy0, gy1, gx0, gx1 = green_head
by0, by1, bx0, bx1 = base_head
s = (by1 - by0) / (gy1 - gy0)
print(f"green head y {gy0}-{gy1} x {gx0}-{gx1} -> base head y {by0}-{by1} x {bx0}-{bx1} (scale {s:.3f})")

# feature pixels: non-green, opaque, inside the green head box (pad a little)
pad = int((gy1 - gy0) * 0.15)
seen = set()
comps = []
for yy in range(max(0, gy0 - pad), min(im.height, gy1 + pad)):
    for xx in range(max(0, gx0 - pad), min(im.width, gx1 + pad)):
        if (xx, yy) in seen:
            continue
        r, g, b, a = px[xx, yy]
        if a < ALPHA_MIN or is_green(r, g, b):
            continue
        q = deque([(xx, yy)]); seen.add((xx, yy)); pts = []
        while q:
            cx, cy = q.popleft(); pts.append((cx, cy))
            for dx in (-2, -1, 0, 1, 2):
                for dy in (-2, -1, 0, 1, 2):
                    nx, ny = cx + dx, cy + dy
                    if (nx, ny) in seen or not (0 <= nx < im.width and 0 <= ny < im.height):
                        continue
                    r2, g2, b2, a2 = px[nx, ny]
                    if a2 >= ALPHA_MIN and not is_green(r2, g2, b2):
                        seen.add((nx, ny)); q.append((nx, ny))
        if len(pts) >= MIN_AREA:
            xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
            comps.append({"pts": pts, "cx": sum(xs)/len(xs), "cy": sum(ys)/len(ys), "area": len(pts)})

if WHOLE:
    if not comps:
        sys.exit("FACE SPLIT FAIL: no overlay content found in the head")
    assign = {"whole": comps}
elif len(comps) < 3:
    sys.exit(f"FACE SPLIT FAIL: only {len(comps)} feature components found in the head")

# cluster by cy (gap > 4% of head height starts a new row), top -> bottom
comps.sort(key=lambda c: c["cy"])
gap = (gy1 - gy0) * 0.04
rows = [[comps[0]]]
for c in comps[1:]:
    (rows[-1] if c["cy"] - rows[-1][-1]["cy"] <= gap else rows.append([]) or rows[-1]).append(c)

mid = (gx0 + gx1) / 2
assign = {"whole": comps} if WHOLE else {}
pairs = [] if WHOLE else [r for r in rows if len(r) >= 2 and any(c["cx"] < mid for c in r) and any(c["cx"] >= mid for c in r)]
singles = [c for r in rows for c in r if not any(r is p for p in pairs)]
if not WHOLE:
    if len(pairs) >= 2:
        assign["brow"], assign["eye"] = pairs[0], pairs[1]
    elif len(pairs) == 1:
        assign["eye"] = pairs[0]
    central = sorted([c for c in singles if abs(c["cx"] - mid) < (gx1 - gx0) * 0.2], key=lambda c: c["cy"])
    central = [c for c in central if "eye" not in assign or c["cy"] > max(e["cy"] for e in assign["eye"])]
    if len(central) >= 2:
        assign["nose"], assign["lip"] = [central[0]], [central[-1]]
    elif len(central) == 1:
        assign["lip"] = [central[0]]

# Nose rescue: the model tends to draw the nose line as DARK green ink
# harmonized to the green face (bright matte green has value ~0.78; line art
# ~0.35), so it gets keyed with the mannequin. Recover central dark-green
# strokes between the eyes and lips and recolor them to the soft-ink the
# manifest bakes for noses anyway.
if "nose" in targets and "nose" not in assign and "eye" in assign:
    eye_bottom = max(e["cy"] for e in assign["eye"])
    lip_top = min(l["cy"] for l in assign["lip"]) if "lip" in assign else gy1
    INK = (74, 63, 53)
    dark_seen = set()
    dark_comps = []
    for yy in range(int(eye_bottom), int(lip_top)):
        for xx in range(int(mid - (gx1 - gx0) * 0.2), int(mid + (gx1 - gx0) * 0.2)):
            if (xx, yy) in dark_seen:
                continue
            r, g, b, a = px[xx, yy]
            if a < ALPHA_MIN or not is_green(r, g, b) or max(r, g, b) > 128:
                continue
            q = deque([(xx, yy)]); dark_seen.add((xx, yy)); pts = []
            while q:
                cx, cy = q.popleft(); pts.append((cx, cy))
                for dx in (-2, -1, 0, 1, 2):
                    for dy in (-2, -1, 0, 1, 2):
                        nx, ny = cx + dx, cy + dy
                        if (nx, ny) in dark_seen or not (0 <= nx < im.width and 0 <= ny < im.height):
                            continue
                        r2, g2, b2, a2 = px[nx, ny]
                        if a2 >= ALPHA_MIN and is_green(r2, g2, b2) and max(r2, g2, b2) <= 128:
                            dark_seen.add((nx, ny)); q.append((nx, ny))
            if len(pts) >= MIN_AREA:
                xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
                dark_comps.append({"pts": pts, "cx": sum(xs)/len(xs), "cy": sum(ys)/len(ys), "area": len(pts)})
    if dark_comps:
        for c in dark_comps:
            for (cx, cy) in c["pts"]:
                a = px[cx, cy][3]
                px[cx, cy] = (INK[0], INK[1], INK[2], a)
        assign["nose"] = dark_comps
        print(f"  nose rescued from dark-green ink: {sum(c['area'] for c in dark_comps)}px, recolored to soft ink")

missing = [k for k in targets if k not in assign]
if missing:
    sys.exit(f"FACE SPLIT FAIL: could not isolate {missing} — rows: "
             f"{[[(round(c['cx']), round(c['cy']), c['area']) for c in r] for r in rows]}")

for kind, t in targets.items():
    out = Image.new("RGBA", (1024, 1536), (0, 0, 0, 0))
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    lpx = layer.load()
    xs, ys = [], []
    for c in assign[kind]:
        for (cx, cy) in c["pts"]:
            lpx[cx, cy] = px[cx, cy]
            xs.append(cx); ys.append(cy)
    bbox = (min(xs), min(ys), max(xs) + 1, max(ys) + 1)
    piece = layer.crop(bbox)
    nw, nh = max(1, round(piece.width * s)), max(1, round(piece.height * s))
    piece = piece.resize((nw, nh), Image.LANCZOS)
    # downscaling thin strokes smears them into semi-transparency; re-solidify
    # the core so the feature reads at composite scale
    piece.putalpha(piece.getchannel("A").point(lambda a: min(255, int(a * 1.7)) if a > 30 else 0))
    # map bbox origin through the head-space affine
    ox = round(bx0 + (bbox[0] - gx0) * s)
    oy = round(by0 + (bbox[1] - gy0) * s)
    out.alpha_composite(piece, (ox, oy))
    dst = Path("_art_staging") / f"{t}.png"
    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst)
    print(f"  {t}: {sum(c['area'] for c in assign[kind])}px -> pasted at ({ox},{oy}) scale {s:.2f}")
print("face split ok")
