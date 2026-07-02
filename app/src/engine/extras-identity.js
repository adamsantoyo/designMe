// @ts-nocheck
// dmFigure extension: identity extras (see extras-contract.md for ctx).
// draw(ctx) is called after head/hair/jewelry and handles:
//  - glasses: "thickFrame" (bold frames), "tinted" (soft tinted lenses) — eyes at
//    (cx ± 10, K.headCy - 3); match head()'s glasses weight/geometry.
//  - jewelry: "hoops", "pearl" (ears at cx ± (K.headRx+1.5), K.headCy+10),
//    "watch", "rings" (wrist/hand at K.armPts(s)[2]).
//  - hearing: "ha_r" / "ha_l" (behind-the-ear aid, side-specific — the side carries
//    meaning) and "ci_both" (cochlear coil + processor both sides). Ordinary,
//    modern, warm — never clinical.
//  - features: "birthmark", "scar", "blush" — subtle face overlays, tone-aware via
//    ctx.colors.skin + ctx.shade.
//  - tool: "medicalBracelet" — small wrist band, calm not alarmist.
// head() already owns round/rect/cat glasses, studs, chain, freckles, vitiligo.

const FRAME = "#3a3330"; // glasses acetate
const GOLD = "#cda14e"; // jewelry gold
const CREAM = "#f1e9d8"; // pearl / watch face
const DEV = "#cdbfb0"; // warm device gray
const DEV_DK = "#8a8178"; // warm dark gray
const TECH = "#6f8a9b"; // calm tech blue
const STRAP = "#5e4334"; // straps / watch band

export default {
  draw(ctx) {
    const { o, K, cx, R, line, shade, colors } = ctx;
    const eyeY = K.headCy - 3;
    let s = "";

    // wrist crossing direction (perpendicular to the forearm, tracks every body)
    const wristBand = (sd, c, w, pad, op) => {
      const a = K.armPts(sd), wp = a[2], el = a[1];
      const dx = wp[0] - el[0], dy = wp[1] - el[1], l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l, ny = dx / l, hw = K.armWs[2] + pad;
      return {
        wp,
        band: line(`M${R(wp[0] - nx * hw)} ${R(wp[1] - ny * hw)} L${R(wp[0] + nx * hw)} ${R(wp[1] + ny * hw)}`, c, w, op),
      };
    };

    /* ---------------- glasses (head() owns round/rect/cat) ---------------- */
    if (o.glasses === "thickFrame") {
      // head()'s rect lens geometry, bold acetate: heavier stroke + rounder corners
      const lens = (gx) => `<rect x="${gx - 8}" y="${R(eyeY - 6.5)}" width="16" height="13" rx="4.5" fill="#fff" fill-opacity=".09" stroke="${FRAME}" stroke-width="3.6"/>`;
      s += lens(cx - 10) + lens(cx + 10) +
        line(`M${cx - 2} ${R(eyeY - 1.5)} h4`, FRAME, 3.6) +
        line(`M${cx - 18} ${eyeY - 2} l-6 -1.5 M${cx + 18} ${eyeY - 2} l6 -1.5`, FRAME, 3.6);
    }
    if (o.glasses === "tinted") {
      // round lens geometry, warm tint, thin wire frame
      const lens = (gx) => `<circle cx="${gx}" cy="${eyeY}" r="8" fill="#c08457" fill-opacity=".28" stroke="${FRAME}" stroke-width="1.8"/>`;
      s += lens(cx - 10) + lens(cx + 10) +
        line(`M${cx - 2} ${R(eyeY - 1.5)} h4`, FRAME, 1.8) +
        line(`M${cx - 18} ${eyeY - 2} l-6 -1.5 M${cx + 18} ${eyeY - 2} l6 -1.5`, FRAME, 1.8);
    }

    /* ---------------- jewelry (drawJewelry owns studs/chain) ---------------- */
    const earX = (sd) => R(cx + sd * (K.headRx + 1.5));
    if (o.jewelry === "hoops") {
      for (const sd of [-1, 1])
        s += `<circle cx="${earX(sd)}" cy="${R(K.headCy + 13)}" r="4" fill="none" stroke="${GOLD}" stroke-width="1.8"/>`;
    }
    if (o.jewelry === "pearl") {
      for (const sd of [-1, 1]) {
        const ex = earX(sd), ey = K.headCy + 10;
        s += `<circle cx="${ex}" cy="${R(ey)}" r="1.5" fill="${GOLD}"/>
        <circle cx="${ex}" cy="${R(ey + 4)}" r="2.4" fill="${CREAM}" stroke="${shade(CREAM, -0.16)}" stroke-width="0.7"/>
        <circle cx="${R(ex - 0.8)}" cy="${R(ey + 3.2)}" r="0.8" fill="#fff" opacity=".8"/>`;
      }
    }
    if (o.jewelry === "watch") {
      const { wp, band } = wristBand(-1, STRAP, 5, 1.6);
      s += band +
        `<circle cx="${R(wp[0])}" cy="${R(wp[1])}" r="4" fill="${CREAM}" stroke="${DEV_DK}" stroke-width="1.3"/>` +
        line(`M${R(wp[0])} ${R(wp[1])} v-2.2`, DEV_DK, 1, .85);
    }
    if (o.jewelry === "rings") {
      const wp = K.armPts(1)[2];
      s += line(`M${R(wp[0] - 4.2)} ${R(wp[1] + 8)} q1.5 2.2 3 0`, GOLD, 1.4, .9) +
        line(`M${R(wp[0] + 1.2)} ${R(wp[1] + 8.6)} q1.5 2.2 3 0`, GOLD, 1.4, .9);
    }

    /* ---------------- hearing (side carries meaning; viewer mirror) ---------------- */
    // behind-the-ear body: soft comma hugging the top-back of the ear
    const bteBody = (sd) => {
      const ax = cx + sd * (K.headRx + 1), ay = K.headCy + 1;
      return `<path d="M${R(ax - sd)} ${R(ay - 8)} q${sd * 6.5} .5 ${sd * 6} 8.5 q-.5 6.5 ${sd * -4.5} 7 q${sd * -3.5} .5 ${sd * -3.8} -3.5 q1.8 -6.5 ${sd * 2.3} -12 z" fill="${DEV}"/>
        <circle cx="${R(ax + sd * 0.5)}" cy="${R(ay + 6.2)}" r="1.8" fill="${DEV_DK}" opacity=".9"/>` +
        line(`M${R(ax + sd * 0.2)} ${R(ay - 6.8)} q${sd * 3.6} .8 ${sd * 3.9} 4.6`, shade(DEV, 0.28), 1.2, .85);
    };
    // thin tube arcing over the ear top down to a small dome at the ear front
    const bteTube = (sd) => {
      const ax = cx + sd * (K.headRx + 1), ay = K.headCy + 1;
      return line(`M${R(ax + sd * 0.5)} ${R(ay - 7.8)} q${sd * -4.5} -3.6 ${sd * -8} -.8 q${sd * -1.8} 2.4 ${sd * -1.4} 5.4`, DEV, 1.2, .9) +
        `<circle cx="${R(ax - sd * 9.4)}" cy="${R(ay - 3.2)}" r="1.4" fill="${DEV}"/>`;
    };
    if (o.hearing === "ha_r" || o.hearing === "ha_l") {
      const sd = o.hearing === "ha_r" ? 1 : -1;
      s += bteBody(sd) + bteTube(sd);
    }
    if (o.hearing === "ci_both") {
      for (const sd of [-1, 1]) {
        const ax = cx + sd * (K.headRx + 1), ay = K.headCy + 1;
        const kx = R(cx + sd * (K.headRx - 5)), ky = R(K.headCy - 10);
        // slim processor comma at the ear
        s += `<path d="M${R(ax - sd)} ${R(ay - 7)} q${sd * 5} .4 ${sd * 4.6} 7 q-.4 5.4 ${sd * -3.6} 5.6 q${sd * -2.6} .3 ${sd * -2.9} -2.8 q1.5 -5.2 ${sd * 1.9} -9.8 z" fill="${DEV}"/>` +
          // coil disc on the skull, slightly above/behind the ear
          `<circle cx="${kx}" cy="${ky}" r="3.6" fill="${TECH}"/>
          <circle cx="${kx}" cy="${ky}" r="1.1" fill="${shade(TECH, -0.35)}"/>` +
          // slim connecting wire
          line(`M${kx} ${R(K.headCy - 6.6)} Q${R(cx + sd * (K.headRx - 3.5))} ${R(K.headCy - 4)} ${R(ax + sd * 0.5)} ${R(ay - 7)}`, DEV_DK, 1, .8);
      }
    }

    /* ---------------- features (head() owns freckles/vitiligo) ---------------- */
    if (o.feature === "birthmark")
      s += `<ellipse cx="${cx - 13}" cy="${R(K.headCy + 7)}" rx="3" ry="2.2" fill="${shade(colors.skin, -0.18)}" opacity=".8"/>`;
    if (o.feature === "scar") {
      const sc = shade(colors.skin, -0.25);
      s += line(`M${cx + 13} ${R(K.headCy - 12)} l5 5`, sc, 1.6, .6);
      for (const f of [1.7, 3.4])
        s += line(`M${R(cx + 13 + f - 1.1)} ${R(K.headCy - 12 + f + 1.1)} l2.2 -2.2`, sc, 1.1, .35);
    }
    if (o.feature === "blush")
      for (const sd of [-1, 1])
        s += `<ellipse cx="${cx + sd * 12}" cy="${R(K.headCy + 9)}" rx="6.5" ry="4" fill="#d98b76" opacity=".45"/>`;

    /* ---------------- tools ---------------- */
    if (o.tool === "medicalBracelet") {
      const { wp, band } = wristBand(1, DEV, 3.4, 1.4, .95);
      s += band + `<rect x="${R(wp[0] - 2)}" y="${R(wp[1] - 1.5)}" width="4" height="3" rx="1" fill="${DEV_DK}"/>`;
    }

    return s;
  },
};
