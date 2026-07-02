#!/usr/bin/env python3
"""designMe part ingest — turn a Firefly/ChatGPT download into an app-ready part.

    python tools/art-lab/ingest.py <downloaded.png> <category/id> [--key-white] [--svg]

What it does, in order:
  1. Load the download (must have real alpha — use Firefly's transparent/Remove
     background output; --key-white is a fallback for opaque pure-white backgrounds,
     safe ONLY for colored objects like shoes, never for near-white neutral masters).
  2. Strip glow-halo / semi-transparent fringe (alpha threshold + short feather band) —
     the art bible bans glow, and halos both tint badly and explode traces.
  3. Normalize onto the canonical 1024x1536 canvas with ONE fixed rule (scale to
     height, center width, crop/pad symmetrically). The same transform for every part
     is what keeps layers co-registered.
  4. Write app/assets/parts/<category>/<id>.png and print the registry line to paste.
  5. --svg: also auto-trace to tools/art-lab/out/<id>.svg (for the vector runtime).

Setup (once):  python3 -m venv tools/art-lab/.venv
               tools/art-lab/.venv/bin/pip install pillow vtracer
Run with:      tools/art-lab/.venv/bin/python tools/art-lab/ingest.py ...
"""
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
CANVAS = (1024, 1536)
ALPHA_CUT = 140     # below: fully transparent (kills glow halos)
ALPHA_SOLID = 200   # above: fully opaque (keeps a short feather band between)
WHITE_KEY_LUM = 250 # --key-white: only near-pure-white becomes transparent


def key_checker(im: Image.Image) -> Image.Image:
    """--key-checker: rescue images with a BAKED fake-transparency checkerboard
    (a known partner-model failure). Keys out neutral (gray/white) pixels; warm
    figure pixels survive. Warmth = red minus blue, ramped for a soft edge feather.
    Only safe for warm-toned subjects on a neutral checkerboard."""
    from PIL import ImageFilter

    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, _ = px[x, y]
            warmth = r - b
            a = 0 if warmth <= 8 else 255 if warmth >= 24 else round((warmth - 8) / 16 * 255)
            px[x, y] = (r, g, b, a)
    # despeckle stray keyed/kept pixels without softening real edges much
    alpha = im.getchannel("A").filter(ImageFilter.MedianFilter(5))
    im.putalpha(alpha)
    return im


def key_white(im: Image.Image) -> Image.Image:
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if 0.299 * r + 0.587 * g + 0.114 * b >= WHITE_KEY_LUM:
                px[x, y] = (r, g, b, 0)
    return im


def clean_halo(im: Image.Image) -> Image.Image:
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < ALPHA_CUT:
                px[x, y] = (r, g, b, 0)
            elif a > ALPHA_SOLID:
                px[x, y] = (r, g, b, 255)
    return im


def normalize(im: Image.Image) -> Image.Image:
    """One deterministic transform for every part: fit height, center width."""
    w, h = im.size
    scale = CANVAS[1] / h
    im = im.resize((round(w * scale), CANVAS[1]), Image.LANCZOS)
    out = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    out.paste(im, ((CANVAS[0] - im.width) // 2, 0), im)
    return out


def place(im: Image.Image, spec: str) -> Image.Image:
    """Escape hatch for off-frame sources: --place scale,dx,dy (canvas px).

    Scales the source about its top-left, then pastes at (dx, dy) on the canonical
    canvas. Use only to rescue art generated on the wrong frame — to-spec parts
    (full-frame, true position) never need it.
    """
    scale, dx, dy = (float(v) for v in spec.split(","))
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    out = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    out.paste(im, (round(dx), round(dy)), im)
    return out


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a.split("=")[0] for a in sys.argv[1:] if a.startswith("--")}
    opts = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
    if len(args) != 2 or "/" not in args[1]:
        sys.exit(__doc__)
    src, key = Path(args[0]), args[1]

    im = Image.open(src).convert("RGBA")
    alphas = im.getchannel("A").getextrema()
    if alphas[0] == 255:  # no transparency at all
        if "--key-checker" in flags:
            im = key_checker(im)
        elif "--key-white" in flags:
            im = key_white(im)
        else:
            sys.exit(
                "This image has no transparency. Re-generate with a transparent "
                "background, or rescue with --key-checker (baked checkerboard, warm "
                "subject) / --key-white (pure white bg, colored objects only)."
            )

    im = clean_halo(im)
    im = place(im, opts["place"]) if "--place" in flags else normalize(im)

    dest = ROOT / "app" / "assets" / "parts" / (key + ".png")
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest)
    opaque = sum(im.getchannel("A").histogram()[255:]) / (CANVAS[0] * CANVAS[1])
    print(f"wrote {dest.relative_to(ROOT)}  ({opaque:.0%} opaque)")
    print("paste into app/src/parts/registry.ts:")
    print(f'  "{key}": require("../../assets/parts/{key}.png"),')

    if "--svg" in flags:
        import vtracer

        out = ROOT / "tools" / "art-lab" / "out" / (key.split("/")[1] + ".svg")
        out.parent.mkdir(parents=True, exist_ok=True)
        vtracer.convert_image_to_svg_py(str(dest), str(out))
        svg = out.read_text()
        print(f"traced {out.relative_to(ROOT)}  ({len(svg)//1024}KB, {svg.count('<path')} paths)")


if __name__ == "__main__":
    main()
