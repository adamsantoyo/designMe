// @ts-nocheck
// dmFigure extension: NEW hairstyles (see extras-contract.md for ctx).
// Owns ids below; dmFigure routes hairBack()/hairFront() here for them.
// Use ctx.hairKit primitives (scalp/braid/pony/bunMass/tie/longFall/hSheen) —
// compose, don't freehand. back() draws behind the body, front() over the head.

const ids = new Set([
  "shortCrop", "pixie", "taperFade", "bob", "curtain",
  "layers", "bigBlowout", "clawClip", "messyBun",
]);

// buzz-style short crown cap (same silhouette dmFigure uses for buzz/shaved) —
// the base every close-crop style layers detail on top of.
function crownCap(ctx) {
  const { K, hairKit, fills } = ctx;
  const { HX, HT } = hairKit;
  return `<path d="M${HX - K.headRx + 1} ${K.headCy - 4} Q${HX - K.headRx - 1} ${HT - 2} ${HX} ${HT - 3} Q${HX + K.headRx + 1} ${HT - 2} ${HX + K.headRx - 1} ${K.headCy - 4} Q${HX + K.headRx - 7} ${K.headCy - 13} ${HX} ${K.headCy - 15} Q${HX - K.headRx + 7} ${K.headCy - 13} ${HX - K.headRx + 1} ${K.headCy - 4} Z" fill="${fills.hair}"/>`;
}

export default {
  ids,

  back(ctx) {
    const { K, hairKit, fills } = ctx;
    const { HX, HT, HEND, dkH } = hairKit;
    const hair = ctx.o.hair;

    if (hair === "bob") {
      // rounded mass crown → chin+6, both sides, extends past the head silhouette
      const bY = K.chin + 6;
      const d = `M${HX - K.headRx - 3} ${K.headCy - 2} Q${HX - K.headRx - 6} ${HT - 2} ${HX} ${HT - 9}` +
        ` Q${HX + K.headRx + 6} ${HT - 2} ${HX + K.headRx + 3} ${K.headCy - 2}` +
        ` L${HX + K.headRx + 2} ${bY - 8} Q${HX + K.headRx - 1} ${bY} ${HX + K.headRx - 8} ${bY - 1}` +
        ` L${HX + K.headRx - 9} ${K.headCy + 3} Q${HX} ${K.headCy - 13} ${HX - K.headRx + 9} ${K.headCy + 3}` +
        ` L${HX - K.headRx + 8} ${bY - 1} Q${HX - K.headRx + 1} ${bY} ${HX - K.headRx - 2} ${bY - 8} Z`;
      return `<path d="${d}" fill="${fills.hair}"/>` + hairKit.hSheen(HX - 3, HT + 3, K.headRx * 0.5);
    }

    if (hair === "curtain") return hairKit.longFall(false);

    if (hair === "layers") {
      let s = hairKit.longFall(false);
      // 2 stepped inner-edge lines per side suggesting cut layers
      for (const sd of [-1, 1]) {
        const x = HX + sd * (K.headRx - 3);
        s += ctx.line(
          `M${x} ${K.headCy + 16} Q${x + sd * 4} ${K.headCy + 44} ${x - sd * 2} ${K.headCy + 70}`,
          dkH, 0.9, .3
        );
        s += ctx.line(
          `M${x - sd * 3} ${K.headCy + 40} Q${x + sd * 3} ${K.headCy + 66} ${x - sd * 1} ${HEND - 6}`,
          dkH, 0.9, .3
        );
      }
      return s;
    }

    if (hair === "bigBlowout") {
      // wide soft rounded mass, ~headRx*1.6 wide, crown to shoulders, outward curve
      const w = K.headRx * 1.6, sY = K.shoulder + 6;
      const d = `M${HX - w} ${K.headCy + 6} Q${HX - w - 4} ${HT - 4} ${HX} ${HT - 11}` +
        ` Q${HX + w + 4} ${HT - 4} ${HX + w} ${K.headCy + 6}` +
        ` Q${HX + w + 6} ${(K.headCy + sY) / 2} ${HX + w - 6} ${sY}` +
        ` Q${HX} ${sY + 10} ${HX - w + 6} ${sY}` +
        ` Q${HX - w - 6} ${(K.headCy + sY) / 2} ${HX - w} ${K.headCy + 6} Z`;
      return `<path d="${d}" fill="${fills.hair}"/>` + hairKit.hSheen(HX - 4, HT + 2, K.headRx * 0.62);
    }

    if (hair === "clawClip") {
      // small vertical folded mass at the back of the crown
      const fx = HX + 4, fy = HT + 6;
      const d = `M${fx - 6} ${fy - 9} Q${fx - 9} ${fy + 7} ${fx - 3} ${fy + 16} Q${fx} ${fy + 18} ${fx + 3} ${fy + 16} Q${fx + 9} ${fy + 7} ${fx + 6} ${fy - 9} Q${fx} ${fy - 13} ${fx - 6} ${fy - 9} Z`;
      return `<path d="${d}" fill="${fills.hair}"/>` +
        ctx.line(`M${fx - 3} ${fy - 6} Q${fx - 5} ${fy + 6} ${fx - 1} ${fy + 13}`, dkH, 0.9, .35) +
        ctx.line(`M${fx + 3} ${fy - 6} Q${fx + 5} ${fy + 6} ${fx + 1} ${fy + 13}`, dkH, 0.9, .35);
    }

    if (hair === "messyBun") {
      let s = hairKit.bunMass(HX, HT - 2, 11);
      // 3 loose wisp lines at temples/nape
      s += ctx.line(`M${HX - K.headRx + 2} ${K.headCy - 6} q-4 6 -2 13`, dkH, 0.9, .4);
      s += ctx.line(`M${HX + K.headRx - 2} ${K.headCy - 4} q4 7 1 14`, dkH, 0.9, .4);
      s += ctx.line(`M${HX + 2} ${K.chin + 2} q3 5 0 9`, dkH, 0.9, .35);
      return s;
    }

    return "";
  },

  front(ctx) {
    const { K, hairKit, fills } = ctx;
    const { HX, HT, dkH, ltH, scalp, hSheen } = hairKit;
    const hair = ctx.o.hair;

    if (hair === "shortCrop") {
      let s = crownCap(ctx);
      // slightly thicker crown mass
      s += `<ellipse cx="${HX}" cy="${HT + 3}" rx="${K.headRx - 3}" ry="7" fill="${fills.hair}"/>`;
      // 3-4 soft texture ticks
      const ticks = [[-9, -1], [-2, -4], [5, -2], [11, 1]];
      for (const [dx, dy] of ticks)
        s += ctx.line(`M${HX + dx} ${HT + 5 + dy} l1.5 4`, dkH, 1, .4);
      return s + hSheen(HX - 3, HT + 3, K.headRx * 0.42);
    }

    if (hair === "pixie") {
      let s = crownCap(ctx);
      // clear side sweep point over the right temple
      const tx = HX + K.headRx - 9, ty = K.headCy - 10;
      s += `<path d="M${tx - 5} ${ty - 4} Q${tx + 6} ${ty - 2} ${tx + 4} ${ty + 7} Q${tx - 2} ${ty + 6} ${tx - 6} ${ty + 1} Z" fill="${fills.hair}"/>`;
      s += ctx.line(`M${tx - 3} ${ty - 1} Q${tx + 3} ${ty + 1} ${tx + 1} ${ty + 6}`, dkH, 0.9, .4);
      return s + hSheen(HX - 3, HT + 2, K.headRx * 0.4);
    }

    if (hair === "taperFade") {
      // fuller top mass
      let s = `<ellipse cx="${HX}" cy="${HT + 2}" rx="${K.headRx - 2}" ry="8" fill="${fills.hair}"/>`;
      s += crownCap(ctx);
      // tapered sides: lighter opacity strips fading in near the ears
      for (const sd of [-1, 1]) {
        const ex = HX + sd * (K.headRx - 3);
        s += `<path d="M${ex - sd * 4} ${K.headCy - 12} Q${ex + sd * 3} ${K.headCy - 2} ${ex - sd * 1} ${K.headCy + 6} Q${ex - sd * 5} ${K.headCy - 2} ${ex - sd * 4} ${K.headCy - 12} Z" fill="${fills.hair}" opacity=".45"/>`;
      }
      return s + hSheen(HX - 3, HT + 2, K.headRx * 0.42);
    }

    if (hair === "bob") {
      let s = scalp("center");
      // inward curve tips at the jaw, both sides
      const jy = K.chin + 4;
      for (const sd of [-1, 1]) {
        const ex = HX + sd * (K.headRx - 8);
        s += `<path d="M${ex + sd * 2} ${jy - 9} Q${ex + sd * 5} ${jy - 1} ${ex - sd * 1} ${jy + 3} Q${ex - sd * 4} ${jy - 3} ${ex + sd * 2} ${jy - 9} Z" fill="${fills.hair}"/>`;
      }
      return s;
    }

    if (hair === "curtain") {
      // scalp cap parted at center, plus soft comma-shaped bangs sweeping out to
      // the temples — stays above brow level (headCy-13) so it never dips to the
      // eye row (headCy-3).
      let s = scalp("center");
      const topY = HT + 1, tipY = K.headCy - 13, innerY = K.headCy - 15;
      for (const sd of [-1, 1]) {
        const bx = HX + sd * 3;
        const tipX = HX + sd * (K.headRx - 2), innerX = HX + sd * 9;
        const d = `M${bx} ${topY} Q${bx + sd * 14} ${topY + 1} ${tipX} ${tipY}` +
          ` Q${HX + sd * 16} ${tipY + 7} ${innerX} ${innerY}` +
          ` Q${bx + sd * 5} ${topY + 3} ${bx} ${topY} Z`;
        s += `<path d="${d}" fill="${fills.hair}"/>`;
        s += ctx.line(`M${bx + sd * 4} ${topY + 3} Q${HX + sd * 14} ${tipY - 1} ${tipX - sd * 2} ${tipY + 3}`, dkH, 0.9, .35);
      }
      return s + hSheen(HX - 3, HT + 3, K.headRx * 0.4);
    }

    if (hair === "layers") return scalp("center");

    if (hair === "bigBlowout") {
      let s = scalp("back");
      // volume sheen
      return s + hSheen(HX - 4, HT, K.headRx * 0.7) +
        `<ellipse cx="${HX - 2}" cy="${HT + 6}" rx="${K.headRx * 0.5}" ry="4" fill="${ltH}" opacity=".22"/>`;
    }

    if (hair === "clawClip") {
      let s = scalp("back");
      // small warm-tortoise clip on the fold at the crown-back, slightly right of center
      const cx0 = HX + 4, cy0 = HT + 6;
      s += `<rect x="${cx0 - 2.4}" y="${cy0 - 8}" width="4.8" height="17" rx="2.2" fill="#8a5a34"/>`;
      // 2 teeth
      s += `<rect x="${cx0 - 1.1}" y="${cy0 + 7}" width="1.1" height="4" fill="#6f4426"/>`;
      s += `<rect x="${cx0 + 0.6}" y="${cy0 + 7}" width="1.1" height="4" fill="#6f4426"/>`;
      s += `<ellipse cx="${cx0 - 0.8}" cy="${cy0 - 5}" rx="1.1" ry="2.6" fill="#c79868" opacity=".55"/>`;
      return s;
    }

    if (hair === "messyBun") {
      return scalp("back");
    }

    return "";
  },
};
