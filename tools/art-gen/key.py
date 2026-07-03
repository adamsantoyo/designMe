#!/usr/bin/env python3
"""designMe chroma key — deterministically remove the technical green mannequin
from a worn-composite render, leaving the part pixel-registered in place.

    tools/art-lab/.venv/bin/python tools/art-gen/key.py <worn.png> <part_out.png>

The generator renders worn parts on a figure painted solid saturated green
(a technical matte the prompt demands). This keys out every green-dominant
pixel by hue band, feathers the boundary, and despeckles. Pure function —
same input, same output.
"""
import sys
import colorsys
from pathlib import Path

from PIL import Image, ImageFilter

HUE_LO, HUE_HI = 55, 175   # degrees — green band incl. sage AND olive drift
MIN_SAT = 0.10             # below this it's neutral/cream, keep it
# warm creams are safe from the wider band: they have r >= g, which is_green rejects

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
im = Image.open(src).convert("RGBA")
px = im.load()

# Registration gate BEFORE keying: the green mannequin itself proves whether the
# model kept the base figure's framing. If it zoomed in (portrait bias — seen on
# hair) or cropped the body, the part is misregistered no matter how good it looks.
BASE = Path(__file__).resolve().parent / "refs" / "base.png"
if BASE.exists():
    def is_green(r, g, b):
        mx = max(r, g, b)
        sat = (mx - min(r, g, b)) / mx if mx else 0
        if sat < MIN_SAT or g < r or g < b:
            return False
        return HUE_LO <= colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)[0] * 360 <= HUE_HI

    green_cols, green_rows = set(), set()
    for y in range(0, im.height, 4):          # sample grid — plenty for a bbox
        for x in range(0, im.width, 4):
            r, g, b, a = px[x, y]
            if a > 128 and is_green(r, g, b):
                green_cols.add(x); green_rows.add(y)
    base_alpha = Image.open(BASE).convert("RGBA").getchannel("A").point(lambda v: 255 if v >= 140 else 0)
    bb = base_alpha.getbbox()
    if green_cols and bb:
        gw = max(green_cols) - min(green_cols)
        gh = max(green_rows) - min(green_rows)
        width_ratio = gw / (bb[2] - bb[0])
        height_cover = gh / (bb[3] - bb[1])
        print(f"registration: width_ratio={width_ratio:.2f} height_cover={height_cover:.2f} "
              f"green_top={min(green_rows)} green_bottom={max(green_rows)} base_bbox={bb}")
        if width_ratio > 1.3:
            sys.exit(f"REGISTRATION FAIL: figure drawn {width_ratio:.1f}x too wide — model zoomed in / recomposed")
        if height_cover < 0.6:
            sys.exit(f"REGISTRATION FAIL: figure covers only {height_cover:.0%} of base height — body cropped")
        # the base figure never touches the frame; green at an edge = the model
        # enlarged the figure until it cropped (slips past the ratio checks above)
        if min(green_rows) < 8 or max(green_rows) > im.height - 9 or \
           min(green_cols) < 8 or max(green_cols) > im.width - 9:
            sys.exit("REGISTRATION FAIL: figure touches the frame edge — model cropped/enlarged the body")
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if a == 0:
            continue
        mx = max(r, g, b)
        sat = (mx - min(r, g, b)) / mx if mx else 0
        if sat < MIN_SAT or g < r or g < b:
            continue
        hue = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)[0] * 360
        if HUE_LO <= hue <= HUE_HI:
            px[x, y] = (r, g, b, 0)

alpha = im.getchannel("A").filter(ImageFilter.MedianFilter(5))
im.putalpha(alpha)
dst.parent.mkdir(parents=True, exist_ok=True)
im.save(dst)
print(f"keyed {src.name} -> {dst}")
