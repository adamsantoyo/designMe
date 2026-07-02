// @ts-nocheck
// dmFigure extension: NEW bags (see extras-contract.md for ctx).
// back(ctx): drawn BEHIND the body (backpack bag body). front(ctx): drawn over the
// outfit (straps, handheld bags). Handles o.carry ids below; crossbody/tote stay in
// dmFigure. Bags tint with ctx.fills.carry / ctx.colors.carryC. Distinct silhouettes
// are the whole point — never differ by color alone.

const ids = new Set([
  "canvasTote", "mini", "backpack", "beltbag", "messenger", "laptopBag", "gymBag",
]);

// rounded-rect path (as a `d` so sideShade can reuse it)
function rrect(R, x, y, w, h, r) {
  return `M${R(x + r)} ${R(y)} h${R(w - 2 * r)} q${r} 0 ${r} ${r} v${R(h - 2 * r)}` +
    ` q0 ${r} ${-r} ${r} h${R(-(w - 2 * r))} q${-r} 0 ${-r} ${-r} v${R(-(h - 2 * r))}` +
    ` q0 ${-r} ${r} ${-r} Z`;
}

export default {
  ids,

  /* backpack body BEHIND the torso — peeks past both shoulders, shoulder→waist */
  back(ctx) {
    if (ctx.o.carry !== "backpack") return "";
    const { K, cx, R, line, shade, sideShade, fills, colors } = ctx;
    const dk = shade(colors.carryC, -0.22);
    const bw = K.sh + 7, y0 = K.shoulder + 6, y1 = K.waist;
    const body = rrect(R, cx - bw, y0, bw * 2, y1 - y0, 14);
    return `<path d="${body}" fill="${fills.carry}"/>` + sideShade(body) +
      line(`M${R(cx - bw + 4)} ${R(y1 - 13)} h${R(bw * 2 - 8)}`, dk, 1.6, .45);
  },

  front(ctx) {
    const t = ctx.o.carry;
    if (!t || !ids.has(t)) return "";
    const { K, cx, R, P, line, tube, shade, sideShade, fills, colors } = ctx;
    const dk = shade(colors.carryC, -0.22);
    const w = K.armPts(1)[2]; // right wrist — hands hang near hip level

    /* backpack front = the two shoulder straps, shoulders → mid-chest */
    if (t === "backpack") {
      let s = "";
      for (const sd of [-1, 1]) {
        const pts = [
          [cx + sd * K.sh * 0.52, K.shoulder - 3],
          [cx + sd * K.sh * 0.46, K.chest - 18],
          [cx + sd * K.sh * 0.4, K.chest + 20],
        ];
        s += `<path d="${tube(pts, [5, 4.6, 4])}" fill="${fills.carry}"/>` +
          line(`M${R(pts[0][0])} ${R(pts[0][1] + 4)} Q${R(pts[1][0])} ${R(pts[1][1])} ${R(pts[2][0])} ${R(pts[2][1] - 2)}`, dk, 1.1, .4);
      }
      return s;
    }

    /* square-ish canvas tote at the right hand: two thin loops + seam */
    if (t === "canvasTote") {
      const body = `M${R(w[0] - 15)} ${R(w[1] + 11)} h30 l-1.5 31 q-0.5 3.5 -4 3.5 h-19 q-3.5 0 -4 -3.5 z`;
      return line(`M${R(w[0] - 8)} ${R(w[1] + 11)} q8 -14 16 0`, dk, 2, .6) +
        `<path d="${body}" fill="${fills.carry}"/>` + sideShade(body) +
        line(`M${R(w[0] - 13.5)} ${R(w[1] + 21)} h27`, dk, 1.2, .5) +
        line(`M${R(w[0] - 5)} ${R(w[1] + 11)} q5 -10 10 0`, dk, 2, .9);
    }

    /* small structured bag, short top handle, held at the right hand */
    if (t === "mini") {
      const body = rrect(R, w[0] - 10, w[1] + 12, 20, 15, 3);
      return line(`M${R(w[0] - 5)} ${R(w[1] + 12)} q5 -9 10 0`, dk, 2.2, .9) +
        `<path d="${body}" fill="${fills.carry}"/>` +
        `<rect x="${R(w[0] - 10)}" y="${R(w[1] + 12)}" width="20" height="6" rx="2.5" fill="${dk}" opacity=".85"/>` +
        `<circle cx="${R(w[0])}" cy="${R(w[1] + 20.5)}" r="1.5" fill="${dk}"/>`;
    }

    /* compact pouch riding diagonally across the chest on its strap */
    if (t === "beltbag") {
      const x0 = cx - (K.sh - 8), y0 = K.shoulder + 2;
      const x1 = cx + K.wa * 0.9, y1 = K.waist + 2;
      const f = (K.chest - 2 - y0) / (y1 - y0);
      const px = x0 + (x1 - x0) * f, py = y0 + (y1 - y0) * f;
      const ang = R(Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI);
      const body = rrect(R, px - 14, py - 6.5, 28, 13, 6);
      return line(`M${R(x0)} ${R(y0)} L${R(x1)} ${R(y1)}`, dk, 4, .9) +
        `<g transform="rotate(${ang} ${R(px)} ${R(py)})">` +
        `<path d="${body}" fill="${fills.carry}"/>` +
        line(`M${R(px - 10)} ${R(py - 2.5)} h20`, dk, 1.2, .55) +
        `</g>`;
    }

    /* rectangular flap bag at the LEFT hip, strap from the right shoulder */
    if (t === "messenger") {
      const bx = cx - (K.hp + 13), by = K.hip + 6, bw = 30;
      const body = rrect(R, bx, by, bw, 26, 3.5);
      return line(`M${P(1, K.sh - 8, K.shoulder + 2)} L${P(-1, K.hp - 2, K.hip + 4)}`, dk, 4, .9) +
        `<path d="${body}" fill="${fills.carry}"/>` + sideShade(body) +
        `<path d="${rrect(R, bx, by, bw, 10, 3.5)}" fill="${dk}" opacity=".9"/>` +
        `<circle cx="${R(bx + bw * 0.32)}" cy="${R(by + 13)}" r="1.6" fill="${dk}"/>` +
        `<circle cx="${R(bx + bw * 0.68)}" cy="${R(by + 13)}" r="1.6" fill="${dk}"/>`;
    }

    /* structured rectangle + short handle at the right hand, zip along the top */
    if (t === "laptopBag") {
      const body = rrect(R, w[0] - 18, w[1] + 11, 36, 25, 3);
      return line(`M${R(w[0] - 6)} ${R(w[1] + 7)} q6 -10 12 0`, dk, 2.6, .9) +
        `<path d="${body}" fill="${fills.carry}"/>` + sideShade(body) +
        line(`M${R(w[0] - 14)} ${R(w[1] + 16)} h28`, dk, 1.2, .7) +
        `<rect x="${R(w[0] + 9)}" y="${R(w[1] + 14.5)}" width="3" height="3" rx="1" fill="${dk}"/>`;
    }

    /* soft duffel carried low at the right side: capsule + handles + end cap */
    if (t === "gymBag") {
      const gx = w[0] + 3, gy = w[1] + 26, hw = 23, hh = 11;
      const body = rrect(R, gx - hw, gy - hh, hw * 2, hh * 2, hh);
      return line(`M${R(gx - 10)} ${R(w[1] + 7)} L${R(gx - 6)} ${R(gy - hh + 2)}`, dk, 2.4, .9) +
        line(`M${R(gx + 4)} ${R(w[1] + 7)} L${R(gx + 6)} ${R(gy - hh + 2)}`, dk, 2.4, .9) +
        `<path d="${body}" fill="${fills.carry}"/>` + sideShade(body) +
        `<ellipse cx="${R(gx + hw - 6)}" cy="${R(gy)}" rx="5" ry="${hh - 1}" fill="${dk}" opacity=".55"/>` +
        line(`M${R(gx - 14)} ${R(gy - hh + 3.5)} h24`, dk, 1.2, .5);
    }

    return "";
  },
};
