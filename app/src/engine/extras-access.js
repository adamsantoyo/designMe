// @ts-nocheck
// dmFigure extension: AAC devices + cane + walker (see extras-contract.md).
// draw(ctx) is the FRONT-MOST layer. Handles:
//  - o.aac: "tablet" | "board" | "letterboard" | "ipad" — held in the right hand
//    (wrist at ctx.K.armPts(1)[2], which hangs near hip level); the device's
//    lower-right corner meets that wrist point so it tracks every body × height.
//    AAC devices are the ONLY items allowed simple generic symbols/letters
//    (plain grid dots / letter marks — no real app UI). Warm consumer-product
//    styling, never clinical.
//  - o.mobility: "cane" (shaft from right hand to K.floor + ergonomic handle),
//    "walker" (modern rollator frame in front of the figure, wheels at K.floor).
//    Wheelchair is NOT here — extras-wheelchair.js owns it.

const FRAME = "#8a8178"; // warm dark gray — device edges + mobility frames
const GRIP = "#5e4334";  // grips / rubber tips / letter marks
// AAC symbol dots — sage / terracotta / sky / mustard / plum / teal (garment palette)
const SYMBOLS = ["#8aa382", "#c47a5a", "#8aa7bd", "#c9a44e", "#8d6a94", "#5f8f8a"];

/* device rect held in the right hand: lower-right corner meets the wrist point */
function deviceBox(ctx) {
  const { K, R } = ctx;
  const w = K.armPts(1)[2], bw = 34, bh = 26;
  const x1 = R(w[0] + 3), y1 = R(w[1] + 5);
  return { x0: R(x1 - bw), y0: R(y1 - bh), x1, y1, bw, bh };
}
// hand hint: fingers wrapping the lower-right corner (drawn over the device)
const handHint = (ctx, b) =>
  `<ellipse cx="${ctx.R(b.x1 - 2)}" cy="${ctx.R(b.y1 - 1.5)}" rx="5" ry="6.4" fill="${ctx.fills.skin}"/>`;

/* cols×rows grid of soft symbol dots inside x0..x0+w / y0..y0+h */
function dotGrid(ctx, x0, y0, w, h, cols, rows, r) {
  const { R } = ctx;
  let s = "";
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++)
    s += `<circle cx="${R(x0 + w * (i + 0.5) / cols)}" cy="${R(y0 + h * (j + 0.5) / rows)}" r="${r}" fill="${SYMBOLS[(j * cols + i) % 6]}" opacity=".85"/>`;
  return s;
}

function drawAac(ctx, kind) {
  const { R, line, shade } = ctx;
  const b = deviceBox(ctx), { x0, y0, x1, y1 } = b;
  let s = "";
  if (kind === "ipad") {
    // sleek dark-bezel tablet, calm empty screen
    s += `<rect x="${x0}" y="${y0}" width="${b.bw}" height="${b.bh}" rx="4" fill="#3c3a38"/>
          <rect x="${R(x0 + 3)}" y="${R(y0 + 3)}" width="${b.bw - 6}" height="${b.bh - 6}" rx="2.4" fill="#8aa7bd"/>`;
    s += line(`M${R(x0 + 7)} ${R(y1 - 8)} L${R(x1 - 13)} ${R(y0 + 8)}`, "#fff", 2.6, .18); // soft screen sheen
  } else if (kind === "board") {
    // low-tech flat matte board: sentence strip on top + 4×3 pictogram dots
    const c = "#e6dcc6";
    s += `<rect x="${x0}" y="${y0}" width="${b.bw}" height="${b.bh}" rx="3" fill="${c}" stroke="${shade(c, -0.16)}" stroke-width="1.2"/>
          <rect x="${R(x0 + 4)}" y="${R(y0 + 3.5)}" width="${b.bw - 8}" height="4.6" rx="1.6" fill="${shade(c, 0.42)}"/>`;
    s += dotGrid(ctx, x0 + 4, y0 + 9.5, b.bw - 8, b.bh - 13, 4, 3, 1.8);
  } else if (kind === "letterboard") {
    // plain letterboard: 5×4 letter marks, "A" and "Z" corner hints
    const c = "#f6f1e7", cols = 5, rows = 4;
    s += `<rect x="${x0}" y="${y0}" width="${b.bw}" height="${b.bh}" rx="3" fill="${c}" stroke="${shade(c, -0.16)}" stroke-width="1.2"/>`;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const gx = R(x0 + 4 + (b.bw - 8) * (i + 0.5) / cols), gy = R(y0 + 3.5 + (b.bh - 7) * (j + 0.5) / rows);
      if (j === 0 && i === 0)
        s += line(`M${R(gx - 1.8)} ${R(gy + 2)} L${gx} ${R(gy - 2)} L${R(gx + 1.8)} ${R(gy + 2)} M${R(gx - 1)} ${R(gy + 0.8)} h2`, GRIP, 0.9, .7);
      else if (j === rows - 1 && i === cols - 1)
        s += line(`M${R(gx - 1.6)} ${R(gy - 2)} h3.2 l-3.2 4 h3.2`, GRIP, 0.9, .7);
      else
        s += line(`M${gx} ${R(gy - 1.4)} v2.8`, GRIP, 1.1, .7);
    }
  } else {
    // "tablet": warm modern speech device — cream body, 3×2 symbol grid
    const c = "#f1e9d8";
    s += `<rect x="${x0}" y="${y0}" width="${b.bw}" height="${b.bh}" rx="4" fill="${c}" stroke="${FRAME}" stroke-width="1.5"/>
          <rect x="${R(x0 + 4)}" y="${R(y0 + 4)}" width="${b.bw - 8}" height="${b.bh - 8}" rx="2.4" fill="${shade(c, 0.45)}"/>`;
    s += dotGrid(ctx, x0 + 4, y0 + 4, b.bw - 8, b.bh - 8, 3, 2, 2.2);
    s += line(`M${R(x0 + 5)} ${R(y0 + 2)} h${b.bw - 10}`, "#fff", 1.1, .4); // top edge light
  }
  return s + handHint(ctx, b);
}

function drawCane(ctx) {
  const { K, R, line } = ctx;
  const w = K.armPts(1)[2];
  const sx = R(w[0] + 1.5), hy = R(w[1] + 12); // shaft top just under the hand
  return (
    line(`M${sx} ${R(K.floor - 2)} L${sx} ${hy}`, FRAME, 3.5) +
    // rounded ergonomic handle arcing back under the palm
    line(`M${R(sx - 10)} ${R(hy + 3)} Q${R(sx - 10)} ${R(hy - 4)} ${R(sx - 4.5)} ${R(hy - 4)} Q${sx} ${R(hy - 4)} ${sx} ${R(hy + 1)}`, FRAME, 3.5) +
    line(`M${R(sx - 1)} ${R(hy + 8)} L${R(sx - 1)} ${R(K.floor - 36)}`, "#fff", 0.8, .28) +
    `<rect x="${R(sx - 2.6)}" y="${R(K.floor - 7)}" width="5.2" height="6" rx="2.2" fill="${GRIP}"/>`
  );
}

function drawWalker(ctx) {
  const { K, cx, R, line, shade } = ctx;
  const fx = K.hp + 10, hy = R(K.waist + 6), wy = R(K.floor - 4);
  const yb = R(hy + (wy - hy) * 0.52); // lower cross bar
  const wheel = (x) =>
    `<circle cx="${x}" cy="${wy}" r="4" fill="${GRIP}"/><circle cx="${x}" cy="${wy}" r="1.5" fill="${shade(GRIP, 0.42)}"/>`;
  let s = "";
  [-1, 1].forEach((sd) => {
    const x = R(cx + sd * fx), xi = R(cx + sd * (fx - 11));
    s += line(`M${x} ${hy} L${x} ${R(wy - 3)}`, FRAME, 3.5);  // outer leg
    s += line(`M${x} ${yb} L${xi} ${R(wy - 3)}`, FRAME, 3.5); // inner leg, slight splay
    s += wheel(x) + wheel(xi);
  });
  s += line(`M${R(cx - fx + 2)} ${yb} L${R(cx + fx - 2)} ${yb}`, FRAME, 3);   // cross bar
  s += line(`M${R(cx - fx)} ${hy} L${R(cx + fx)} ${hy}`, FRAME, 3.5);         // handle bar
  s += line(`M${R(cx - fx + 14)} ${R(hy - 1.2)} L${R(cx + fx - 14)} ${R(hy - 1.2)}`, "#fff", 1, .25);
  s += line(`M${R(cx - fx + 1)} ${hy} h9`, GRIP, 5.5) + line(`M${R(cx + fx - 10)} ${hy} h9`, GRIP, 5.5); // soft grips
  return s;
}

export default {
  draw(ctx) {
    const a = ctx.o.aac, m = ctx.o.mobility;
    let s = "";
    if (a && a !== "none") s += drawAac(ctx, a);
    if (m === "cane") s += drawCane(ctx);
    else if (m === "walker") s += drawWalker(ctx);
    return s; // wheelchair: extras-wheelchair.js owns it
  },
};
