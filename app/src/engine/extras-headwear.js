// @ts-nocheck
// dmFigure extension: headwear + head-level audio (see extras-contract.md).
// draw(ctx) renders o.headwear (headscarf/beanie/baseballCap/bucketHat) and
// o.tool when it's headphones/noiseHeadphones. Drawn AFTER hairFront — hats sit
// over hair. The headscarf covers ALL hair (dmFigure suppresses hair when
// coversHair() is true) and must read respectful and soft — it tints with
// ctx.fills.top so it coordinates with the outfit. Head: center (cx, K.headCy),
// radii K.headRx/K.headRy.

// soft crown sheen shared by all hats (matches the hair hSheen language)
function sheen(ctx, y, w) {
  const { cx } = ctx;
  return `<path d="M${cx - w} ${y + 4} Q${cx} ${y - 4} ${cx + w} ${y + 3}" stroke="#fff" stroke-width="3.2" fill="none" opacity=".15" stroke-linecap="round"/>`;
}

// hijab: smooth dome over the whole crown + soft drape down both sides of the
// neck to the shoulders, meeting under the chin. The face stays fully visible
// from brow to chin through an inner-edge oval (even-odd hole in one calm shape).
function headscarf(ctx) {
  const { K, P, line, shade, fills, colors, id } = ctx;
  const hcy = K.headCy, rx = K.headRx, HT = hcy - K.headRy;
  const dk = shade(colors.topC, -0.2);
  const RX = rx + 5;                       // dome extends a little past the head
  const dW = rx + 8, dY = K.shoulder + 8;  // drape reaches the shoulders
  const fx = 18.5, fy = 22.5, fcy = hcy + 7; // face opening: brow → chin
  const outer =
    `M${P(-1, RX, hcy)} Q${P(-1, RX + 1, HT - 5)} ${P(0, 0, HT - 7)} Q${P(1, RX + 1, HT - 5)} ${P(1, RX, hcy)}` +
    ` C${P(1, RX + 2, hcy + 24)} ${P(1, dW + 3, K.shoulder - 8)} ${P(1, dW, dY)}` +
    ` Q${P(0, 0, dY + 12)} ${P(-1, dW, dY)}` +
    ` C${P(-1, dW + 3, K.shoulder - 8)} ${P(-1, RX + 2, hcy + 24)} ${P(-1, RX, hcy)} Z`;
  const hole = `M${P(-1, fx, fcy)} A${fx} ${fy} 0 0 1 ${P(1, fx, fcy)} A${fx} ${fy} 0 0 1 ${P(-1, fx, fcy)} Z`;
  let s = `<path d="${outer} ${hole}" fill="${fills.top}" fill-rule="evenodd"/>` +
    `<path d="${outer} ${hole}" fill="url(#sx_${id})" fill-rule="evenodd"/>`;
  // folded inner edge framing the face
  s += `<ellipse cx="${ctx.cx}" cy="${fcy}" rx="${fx + 1.4}" ry="${fy + 1.2}" fill="none" stroke="${dk}" stroke-width="2" opacity=".4"/>`;
  // one soft fold line down each side of the drape
  for (const sd of [-1, 1])
    s += line(`M${P(sd, RX - 2, hcy + 16)} Q${P(sd, dW - 1, K.shoulder - 6)} ${P(sd, dW - 6, dY + 5)}`, dk, 1.2, .35);
  s += sheen(ctx, HT + 1, 12);
  return s;
}

// soft dome down to K.headCy-8 with a folded darker band; slight slouch top back
function beanie(ctx) {
  const { K, cx, P, R, line, shade, fills, colors, sideShade } = ctx;
  const hcy = K.headCy, rx = K.headRx, HT = hcy - K.headRy;
  const topC = colors.topC, dk = shade(topC, -0.2);
  const bY = hcy - 8;
  const dome =
    `M${P(-1, rx + 1.5, bY)}` +
    ` C${P(-1, rx + 5, HT - 8)} ${P(-1, 17, HT - 15)} ${P(-1, 5, HT - 12)}` +
    ` Q${P(1, rx + 5, HT - 9)} ${P(1, rx + 1.5, bY)}` +
    ` Q${P(0, 0, bY - 6)} ${P(-1, rx + 1.5, bY)} Z`;
  let s = `<path d="${dome}" fill="${fills.top}"/>` + sideShade(dome);
  // slouch fold at the top back
  s += line(`M${P(-1, 12, HT - 10)} q-3 4 -1.5 8`, dk, 1.2, .4);
  // folded band
  const band = `M${P(-1, rx + 2.5, bY - 9)} Q${P(0, 0, bY - 15)} ${P(1, rx + 2.5, bY - 9)}` +
    ` L${P(1, rx + 2.5, bY + 0.5)} Q${P(0, 0, bY - 6)} ${P(-1, rx + 2.5, bY + 0.5)} Z`;
  s += `<path d="${band}" fill="${dk}"/>`;
  // tiny fold lines across the band
  for (const f of [-0.66, -0.22, 0.22, 0.66]) {
    const x = R(cx + f * (rx + 1)), lift = 5 * (1 - f * f);
    s += line(`M${x} ${R(bY - 7.5 - lift)} v7`, shade(topC, -0.36), 1, .5);
  }
  s += sheen(ctx, HT - 7, 11);
  return s;
}

// crown dome to K.headCy-10 + curved brim sweeping right + button on top
function baseballCap(ctx) {
  const { K, cx, P, R, line, shade, fills, colors, sideShade } = ctx;
  const hcy = K.headCy, rx = K.headRx, HT = hcy - K.headRy;
  const topC = colors.topC, dk = shade(topC, -0.2);
  const cB = hcy - 10;
  const crown =
    `M${P(-1, rx + 1.5, cB)} Q${P(-1, rx + 3, HT - 7)} ${P(0, 0, HT - 9)}` +
    ` Q${P(1, rx + 3, HT - 7)} ${P(1, rx + 1.5, cB)} Q${P(0, 0, cB - 7)} ${P(-1, rx + 1.5, cB)} Z`;
  let s = `<path d="${crown}" fill="${fills.top}"/>` + sideShade(crown);
  // panel seams meeting at the button
  s += line(`M${P(0, 0, HT - 8)} Q${P(-1, 9, (HT + cB) / 2 - 6)} ${P(-1, 11, cB - 4)}`, dk, 1, .3);
  s += line(`M${P(0, 0, HT - 8)} Q${P(1, 9, (HT + cB) / 2 - 6)} ${P(1, 11, cB - 4)}`, dk, 1, .3);
  // curved brim sweeping right over the forehead
  const brim =
    `M${P(-1, 7, cB - 4)} Q${P(1, 13, cB - 13)} ${P(1, rx + 16, cB - 3)}` +
    ` Q${P(1, rx + 11, cB + 5)} ${P(1, 11, cB + 3)} Q${P(-1, 1, cB + 2)} ${P(-1, 7, cB - 4)} Z`;
  s += `<path d="${brim}" fill="${shade(topC, -0.14)}"/>`;
  s += line(`M${P(-1, 6, cB - 4)} Q${P(1, 13, cB - 12.5)} ${P(1, rx + 15, cB - 3)}`, shade(topC, 0.18), 1.2, .45);
  s += `<circle cx="${cx}" cy="${R(HT - 9)}" r="2.1" fill="${dk}"/>`;
  s += sheen(ctx, HT - 6, 10);
  return s;
}

// soft dome + downward-sloping brim ring all around at brow level
function bucketHat(ctx) {
  const { K, P, line, stitch, shade, fills, colors, sideShade } = ctx;
  const hcy = K.headCy, rx = K.headRx, HT = hcy - K.headRy;
  const topC = colors.topC, dk = shade(topC, -0.2);
  const bB = hcy - 12;                    // crown meets brim
  const tipX = rx + 12, tipY = hcy - 8;   // brim tips flare past the head
  const crown =
    `M${P(-1, rx + 1, bB)} Q${P(-1, rx + 3, HT - 6)} ${P(0, 0, HT - 8)}` +
    ` Q${P(1, rx + 3, HT - 6)} ${P(1, rx + 1, bB)} Q${P(0, 0, bB - 5)} ${P(-1, rx + 1, bB)} Z`;
  let s = `<path d="${crown}" fill="${fills.top}"/>` + sideShade(crown);
  const brim =
    `M${P(-1, tipX, tipY)} Q${P(-1, rx + 4, bB - 2)} ${P(-1, rx - 3, bB - 3)}` +
    ` Q${P(0, 0, bB - 8)} ${P(1, rx - 3, bB - 3)} Q${P(1, rx + 4, bB - 2)} ${P(1, tipX, tipY)}` +
    ` Q${P(0, 0, hcy - 7)} ${P(-1, tipX, tipY)} Z`;
  s += `<path d="${brim}" fill="${shade(topC, -0.08)}"/>` + sideShade(brim);
  // crown seam + one quiet stitch row on the brim
  s += line(`M${P(-1, rx - 1, bB - 1)} Q${P(0, 0, bB - 6)} ${P(1, rx - 1, bB - 1)}`, dk, 1.3, .4);
  s += stitch(`M${P(-1, tipX - 3, tipY - 3)} Q${P(0, 0, hcy - 10)} ${P(1, tipX - 3, tipY - 3)}`, shade(topC, -0.3), .45);
  s += sheen(ctx, HT - 5, 10);
  return s;
}

// calm over-ear headphones: headband arc over the crown + soft cups at the ears.
// slim=false → muted sage cups / warm brown band; slim=true → charcoal, thinner.
function phones(ctx, slim) {
  const { K, cx, P, R, line, shade } = ctx;
  const hcy = K.headCy, rx = K.headRx, HT = hcy - K.headRy;
  const bandC = slim ? "#3c3a38" : "#5e4334";
  const cupC = slim ? "#3c3a38" : "#8aa382";
  const cupX = rx + 3, cupY = hcy + 4;
  const cw = slim ? 10 : 13.5, ch = slim ? 17 : 22, cr = slim ? 4.5 : 6.5;
  const bandD =
    `M${P(-1, cupX, cupY - ch / 2 + 3)} Q${P(-1, cupX + 3, HT - 8)} ${P(0, 0, HT - 7)}` +
    ` Q${P(1, cupX + 3, HT - 8)} ${P(1, cupX, cupY - ch / 2 + 3)}`;
  let s = line(bandD, bandC, slim ? 3.2 : 5);
  s += line(`M${P(-1, cupX - 1, cupY - ch / 2 + 2)} Q${P(-1, cupX + 2, HT - 6)} ${P(0, 0, HT - 5)}`, shade(bandC, 0.3), 1.2, .35);
  for (const sd of [-1, 1]) {
    s += `<rect x="${R(cx + sd * cupX - cw / 2)}" y="${R(cupY - ch / 2)}" width="${cw}" height="${ch}" rx="${cr}" fill="${cupC}"/>` +
      `<ellipse cx="${R(cx + sd * cupX - cw * 0.14)}" cy="${R(cupY - ch * 0.24)}" rx="${R(cw * 0.26)}" ry="${R(ch * 0.2)}" fill="${shade(cupC, 0.32)}" opacity=".5"/>` +
      `<ellipse cx="${R(cx + sd * cupX)}" cy="${R(cupY + ch * 0.16)}" rx="${R(cw * 0.3)}" ry="${R(ch * 0.26)}" fill="${shade(cupC, -0.24)}" opacity=".35"/>`;
  }
  return s;
}

export default {
  coversHair(headwearId) {
    return headwearId === "headscarf";
  },
  draw(ctx) {
    let s = "";
    const hw = ctx.o.headwear;
    if (hw === "headscarf") s += headscarf(ctx);
    else if (hw === "beanie") s += beanie(ctx);
    else if (hw === "baseballCap") s += baseballCap(ctx);
    else if (hw === "bucketHat") s += bucketHat(ctx);
    const t = ctx.o.tool;
    if (t === "noiseHeadphones") s += phones(ctx, false);
    else if (t === "headphones") s += phones(ctx, true);
    // medicalBracelet is drawn by extras-identity
    return s;
  },
};
