// @ts-nocheck
// dmFigure extension: NEW outer layers (see extras-contract.md for ctx).
// draw(ctx, style) for style "utility" (sleeveless utility vest with pockets, worn
// open over the top) and "shell" (lightweight trail/rain jacket, zip + chest line).
// Same open-front two-panel construction as dmFigure.drawOuter(): a panel per side
// from the neck over the shoulder down the side to the hem, inner edge at x≈±8.5;
// shell adds sleeves via subTube of the widened K.armPts. Tinted with fills.layer.

export default {
  draw(ctx, style) {
    const { K, cx, P, R, line, shade, sideShade, subTube, along } = ctx;
    const c = ctx.colors.layerC;
    const dk = shade(c, -0.2), lt = shade(c, 0.2);
    const fLy = ctx.fills.layer;

    const eL = 11;
    const hemY = style === "utility" ? K.hip + 18 : K.hip + 26;
    const shL = K.sh + eL * 0.8, hemWL = shL + 2, inX = 8.5;

    // open-front panel: neck → over the shoulder → down the side → hem → inner edge
    const panel = (sd) =>
      `M${P(sd, 11, K.neckBot - 1)} Q${P(sd, (11 + shL) / 2, K.neckBot - 4)} ${P(sd, shL, K.shoulder + 2)}` +
      ` C${P(sd, shL + 1, K.chest)} ${P(sd, hemWL, (K.chest + hemY) / 2)} ${P(sd, hemWL, hemY - 5)}` +
      ` Q${P(sd, hemWL - 1, hemY)} ${P(sd, hemWL - 5, hemY)} L${P(sd, inX, hemY)} L${P(sd, inX, K.chest - 16)} Z`;
    const pL = panel(-1), pR = panel(1);

    // contact shadow at the shoulders first (sits on the top underneath)
    let s = `<ellipse cx="${cx}" cy="${K.shoulder + 18}" rx="${K.sh}" ry="10" fill="#2c2118" opacity=".07"/>`;

    if (style === "shell") {
      // soft hood bump behind the neck, peeking above the shoulders behind the collar
      s += `<path d="M${P(-1, 24, K.shoulder + 4)} Q${P(-1, 30, K.neckTop - 2)} ${cx} ${K.neckTop - 8} Q${P(1, 30, K.neckTop - 2)} ${P(1, 24, K.shoulder + 4)} Q${cx} ${K.shoulder + 14} ${P(-1, 24, K.shoulder + 4)} Z" fill="${shade(c, -0.2)}"/>`;
    }

    s += `<path d="${pL}" fill="${fLy}"/><path d="${pR}" fill="${fLy}"/>` + sideShade(pL) + sideShade(pR);

    if (style === "shell") {
      // sleeves (same widened-arm subTube as the default outer)
      [[-1], [1]].forEach(([sd]) => {
        const pts = K.armPts(sd), ws = K.armWs.map((w) => w + eL * 0.5 + 2.5);
        s += `<path d="${subTube(pts, ws, 0.97)}" fill="${fLy}"/>`;
        const end = along(pts, ws, 0.97);
        s += line(`M${R(end.p[0] - end.w + 1)} ${R(end.p[1])} L${R(end.p[0] + end.w - 1)} ${R(end.p[1])}`, dk, 1.4, .45);
      });
    }

    // open-front inner edges
    s += line(`M${P(-1, inX, K.chest - 14)} L${P(-1, inX, hemY - 2)}`, dk, 1.4, .4) +
         line(`M${P(1, inX, K.chest - 14)} L${P(1, inX, hemY - 2)}`, dk, 1.4, .4);

    if (style === "utility") {
      const pkC = shade(c, -0.12);
      [[-1], [1]].forEach(([sd]) => {
        // armhole edge line down each outer edge
        s += line(`M${P(sd, shL - 2.5, K.shoulder + 5)} C${P(sd, shL - 1.5, K.chest - 18)} ${P(sd, shL - 1, K.chest - 4)} ${P(sd, shL - 0.5, K.chest + 8)}`, dk, 1.3, .45);
        // small chest pocket line
        s += line(`M${P(sd, hemWL * 0.55 + 5, K.chest + 6)} h${-sd * 11}`, dk, 1.3, .5);
        // big patch pocket on the lower panel, flap band on top
        const px = R(cx + sd * hemWL * 0.55 - 8);
        s += `<rect x="${px}" y="${hemY - 26}" width="16" height="18" rx="2.5" fill="${pkC}"/>
              <rect x="${px}" y="${hemY - 26}" width="16" height="5" rx="2" fill="${dk}" opacity=".85"/>`;
      });
      // 3 center-gap button dots on the right inner edge
      for (let i = 0; i < 3; i++)
        s += `<circle cx="${R(cx + inX + 2)}" cy="${K.chest + 8 + i * 22}" r="1.8" fill="${dk}"/>`;
    }

    if (style === "shell") {
      // horizontal chest seam across both panels
      s += line(`M${P(-1, shL - 1, K.chest + 2)} L${P(-1, inX + 1, K.chest + 2)}`, dk, 1.2, .4) +
           line(`M${P(1, shL - 1, K.chest + 2)} L${P(1, inX + 1, K.chest + 2)}`, dk, 1.2, .4);
      // center zip down the inner gap (dark + light double line, like drawTop's zip)
      const zy0 = K.neckBot + 4, zy1 = hemY - 6;
      s += line(`M${cx} ${zy0} L${cx} ${zy1}`, shade(c, -0.3), 3, .8) +
           line(`M${cx} ${zy0} L${cx} ${zy1}`, lt, 1.1, .9) +
           `<rect x="${R(cx - 1.6)}" y="${zy0 + 6}" width="3.2" height="7" rx="1.4" fill="${shade(c, -0.42)}"/>`;
      // small zip chest pocket tick on the right panel
      s += line(`M${P(1, hemWL * 0.55, K.chest + 10)} L${P(1, hemWL * 0.55, K.chest + 24)}`, dk, 1.6, .6) +
           `<circle cx="${R(cx + hemWL * 0.55)}" cy="${K.chest + 26.5}" r="1.4" fill="${dk}"/>`;
    }

    return s;
  },
};
