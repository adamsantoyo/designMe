#!/usr/bin/env python3
"""Posterize a neutral two-tone master PNG to exact separable tones, then vtracer it.

Usage: posterize-trace.py <master.png> <out.svg> <ref.png> [downscale]

Emits:
  out.svg  — full 1024x1536 document; paths fill-snapped to the exact tone hexes,
             wrapped in <g transform="translate(x0,y0)"> for 1:1 registration.
             With downscale=2, tracing runs on a half-res posterized master
             (NEAREST — exact tones preserved) and the group carries scale(2):
             fewer/simpler paths for detail-heavy parts that bust the size cap.
  ref.png  — the posterized master at FULL resolution (QA raster reference).
  stdout   — one JSON line: {tones, shares, n_paths, stray, x0, y0}

Run one part per process: vtracer on this build segfaults on ANY keyword arg and
occasionally on odd inputs, so the caller treats a dead process as a failed part.
vtracer is called with positional args ONLY (kwargs -> rc -11), on the alpha-bbox
crop ONLY (full frame with small content also crashes it).
"""
import json
import sys
import tempfile
from pathlib import Path

from PIL import Image

CANVAS_W, CANVAS_H = 1024, 1536
ALPHA_CUT = 128
MERGE_DIST = 26      # RGB distance under which quantized clusters merge into one tone
MIN_TONE_SHARE = 0.01  # tones under 1% of opaque coverage fold into their neighbour


def rgb2hex(c):
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(round(x)))) for x in c)


def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def posterize(im):
    px = im.load()
    w, h = im.size
    opaque = [(x, y) for y in range(h) for x in range(w) if px[x, y][3] >= ALPHA_CUT]
    if not opaque:
        raise SystemExit("no opaque pixels")

    flat = Image.new("RGB", (len(opaque), 1))
    flat.putdata([px[x, y][:3] for x, y in opaque])
    q = flat.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()
    counts = {}
    for v in q.getdata():
        counts[v] = counts.get(v, 0) + 1
    clusters = sorted(
        ([[pal[i * 3], pal[i * 3 + 1], pal[i * 3 + 2]], n] for i, n in counts.items()),
        key=lambda c: -c[1])

    tones = []
    for rgb, n in clusters:
        for t in tones:
            if dist(rgb, t[0]) < MERGE_DIST:
                tot = t[1] + n
                t[0] = [(t[0][i] * t[1] + rgb[i] * n) / tot for i in range(3)]
                t[1] = tot
                break
        else:
            tones.append([list(rgb), n])
    total = sum(t[1] for t in tones)
    kept = [t for t in tones if t[1] / total >= MIN_TONE_SHARE] or tones[:1]
    tones = [tuple(int(round(v)) for v in t[0]) for t in kept]

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    cache = {}
    cnt = {t: 0 for t in tones}
    for (x, y) in opaque:
        c = px[x, y][:3]
        if c not in cache:
            cache[c] = min(tones, key=lambda t: dist(c, t))
        opx[x, y] = cache[c] + (255,)
        cnt[cache[c]] += 1
    despeckle(out, opx)
    shares = {rgb2hex(t): round(n / total, 4) for t, n in cnt.items()}
    return out, tones, shares


MIN_COMPONENT_PX = 24  # sub-half-pixel dust at display sizes; masters carry some


def despeckle(im, px):
    """Drop opaque connected components smaller than MIN_COMPONENT_PX (dust in the
    masters that posterization keeps but vtracer's speckle filter would drop —
    it would skew the QA bbox and, if traced, ship as noise)."""
    w, h = im.size
    seen = bytearray(w * h)
    for sy in range(h):
        for sx in range(w):
            if seen[sy * w + sx] or px[sx, sy][3] == 0:
                continue
            stack = [(sx, sy)]
            seen[sy * w + sx] = 1
            comp = []
            while stack:
                x, y = stack.pop()
                comp.append((x, y))
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] \
                            and px[nx, ny][3] > 0:
                        seen[ny * w + nx] = 1
                        stack.append((nx, ny))
            if len(comp) < MIN_COMPONENT_PX:
                for x, y in comp:
                    px[x, y] = (0, 0, 0, 0)


def main():
    master_path, out_svg, ref_png = sys.argv[1], sys.argv[2], sys.argv[3]
    downscale = int(sys.argv[4]) if len(sys.argv) > 4 else 1
    im = Image.open(master_path).convert("RGBA")
    if im.size != (CANVAS_W, CANVAS_H):
        raise SystemExit(f"master is {im.size}, expected {(CANVAS_W, CANVAS_H)}")

    post, tones, shares = posterize(im)
    post.save(ref_png)

    trace_src = post
    if downscale > 1:
        # NEAREST keeps the exact tone palette (no blended colors for vtracer to chase)
        trace_src = post.resize((CANVAS_W // downscale, CANVAS_H // downscale),
                                Image.NEAREST)
    bbox = trace_src.getbbox()
    x0, y0 = bbox[0] * downscale, bbox[1] * downscale
    with tempfile.TemporaryDirectory() as td:
        crop_png = str(Path(td) / "crop.png")
        raw_svg = str(Path(td) / "raw.svg")
        trace_src.crop(bbox).save(crop_png)
        import vtracer  # positional args ONLY — kwargs segfault this build
        vtracer.convert_image_to_svg_py(crop_png, raw_svg)
        raw = Path(raw_svg).read_text()

    import re
    body = re.sub(r"^.*?<svg[^>]*>", "", raw, flags=re.S).replace("</svg>", "").strip()
    fills = set(re.findall(r'fill="(#[0-9A-Fa-f]{6})"', body))
    stray = 0
    for f in fills:
        rgb = hex2rgb(f)
        nearest = rgb2hex(min(tones, key=lambda t: dist(rgb, t)))
        if dist(rgb, hex2rgb(nearest)) > 1:
            stray += 1
        body = body.replace(f'fill="{f}"', f'fill="{nearest}"')

    tones_hex = sorted((rgb2hex(t) for t in tones),
                       key=lambda h: 0.2126 * hex2rgb(h)[0] + 0.7152 * hex2rgb(h)[1]
                       + 0.0722 * hex2rgb(h)[2])
    tf = (f"translate({x0},{y0})" if downscale == 1
          else f"translate({x0},{y0}) scale({downscale})")
    doc = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS_W} {CANVAS_H}">'
           f'<g transform="{tf}">{body}</g></svg>')
    Path(out_svg).parent.mkdir(parents=True, exist_ok=True)
    Path(out_svg).write_text(doc)

    print(json.dumps({"tones": tones_hex, "shares": shares,
                      "n_paths": body.count("<path"), "stray": stray,
                      "x0": x0, "y0": y0}))


if __name__ == "__main__":
    main()
