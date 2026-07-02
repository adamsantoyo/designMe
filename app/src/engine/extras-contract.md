# dmFigure extension contract (`extras-*.js`)

Every new-category renderer lives in its own `extras-*.js` module so modules can be
authored independently. `dmFigure.js` owns anatomy, z-order, and dispatch; it calls
your module with a `ctx` object at a fixed z-slot. Your module returns an SVG string
(no `<svg>` wrapper — inner elements only) or `""`.

## Coordinate system

- Canvas: `viewBox="0 0 240 H"`, `H ≈ K.floor + 8` (≈480–520 depending on height).
- `cx = 120` is the body's vertical midline. `P(s, x, y)` returns `"X Y"` where
  `X = cx + s*x` — use `s = -1 | 1` to mirror left/right, `s = 0` for center.
- Key rows (already height/body-scaled — NEVER hardcode, always read `K`):
  `K.headCy≈56` (head center) · `K.headRx≈25, K.headRy≈29` · `K.chin≈85` ·
  `K.neckBot≈104` · `K.shoulder≈114` · `K.chest≈158` · `K.waist≈204` · `K.hip≈246` ·
  `K.crotch` · `K.knee` · `K.ankle` · `K.floor` (ground line).
- Arms: `K.armPts(s)` → 3 points shoulder→elbow→wrist; widths `K.armWs`.
  The wrist/hand is at `K.armPts(s)[2]` (hands hang near hip level).
- Legs: `K.legPts(s)`, widths `K.legWs`.

## ctx reference

```
ctx = {
  o,            // raw options: o.headwear, o.aac, o.mobility, o.tool, o.hearing,
                //   o.glasses, o.jewelry, o.carry, o.feature, o.shoes, o.hair, ...
  id,           // unique per-render suffix for gradient/clip ids: `myclip_${ctx.id}`
  K, cx,        // anatomy keypoints + midline
  R,            // R(n) round to 0.1 — use for computed coords
  P,            // P(s, x, y) -> "X Y" mirrored coordinate helper
  line,         // line(d, color, width=1.4, opacity=1) -> stroked <path>
  stitch,       // stitch(d, color?, opacity?) -> dashed topstitch <path>
  tube,         // tube(points, halfWidths) -> tapered closed path `d` (limbs, straps)
  subTube,      // subTube(points, widths, fraction) -> partial tube `d`
  along,        // along(points, widths, t) -> {p:[x,y], w} point along a polyline
  shade,        // shade(hex, amt) -> lighten (amt>0) / darken (amt<0)
  isLight,      // isLight(hex) -> boolean
  sideShade,    // sideShade(d) -> soft left-shadow/right-light overlay for a path
  fills,        // gradient fills: fills.skin, .top, .bot, .hair, .layer, .carry, .shoe
  colors,       // raw hexes:     colors.skin, .topC, .botC, .hairC, .layerC, .carryC
  hairKit,      // ONLY for extras-hair: { HX, HT, HEND, dkH, ltH,
                //   scalp(part), braid(x,y0,y1,w,taper), pony(x0,y0,dir,len,w0),
                //   bunMass(x,y,r), tie(x,y), longFall(wave), hSheen(x,y,w) }
  shoesId, expr // convenience copies of o.shoes / o.expression
}
```

## Style law (non-negotiable — matches the app's art bible)

- **Two-tone flat**:每 shape = one flat fill + at most one soft shadow tone + one soft
  highlight. Use `ctx.fills.*` gradients for user-colored parts; `shade(c,±0.2)` for
  details. **No hard black outlines, no gradients beyond the provided fills, no
  photorealism.**
- **Calm + dignified**: assistive tech (AAC, mobility, hearing) is drawn like a warm
  consumer product — modern, neat, ordinary. NEVER clinical, alarmist, or toy-like.
  Fixed device palette: body `#cdbfb0` (warm device gray), accents `#6f8a9b`
  (calm tech blue), `#8a8178` (warm dark gray), straps `#5e4334`.
- **Recognition at 64px**: silhouettes first; interior detail = 2–4 lines max.
- Opacity for detail lines ≤ 0.9; soft shadows 0.1–0.4.
- Deterministic: no randomness, no Date, nothing non-pure.

## Testing your module

```
node tools/engine-smoke.mjs            # renders every catalog id, checks output
```
Your ids must render with zero FAIL lines (no exception, no "NaN"/"undefined" in the
SVG, non-empty output where required). Iterate until clean.
