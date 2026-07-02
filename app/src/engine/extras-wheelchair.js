// @ts-nocheck
// dmFigure extension: wheelchair + seated pose (see extras-contract.md for ctx).
// FRONT-FACING chair: two big rear wheels flank the body (a single side-view wheel
// disappears behind the torso), the lap is drawn OVER the shirt hem (a seated
// person's clothes rest on their lap), and dmFigure raises the ground line
// (ctx.floorY) so the chair sits on it and the avatar fills the frame.
// z-order: back() behind everything → seated() (cushion, before torso) →
// lap() (thighs/shins/feet, AFTER the top/outer garments) → front() (rims, frame,
// footrest, casters, armrests) over the figure.
// Everyday manual chair, warm consumer styling — frame #8a8178, tires #5e4334,
// upholstery charcoal #3c3a38 — never chrome, never medical.

const FRAME = "#8a8178"; // warm gray tube frame
const TIRE = "#5e4334";  // warm brown tire / footrest bar
const SEAT = "#3c3a38";  // charcoal upholstery
const SHOE = "#352e28";  // shoe-hint dark (house shoe dk)
const INK = "#2c2118";   // house soft-shadow ink

function geom(ctx) {
  const { K, cx } = ctx;
  const ground = ctx.floorY ?? K.hip + (K.floor - K.hip) * 0.62;
  // wheel-center offset from cx — brought in from +8 to +5 to reduce the splayed
  // read at hero scale.
  const WX_OFF = 5;
  // no-overlap constraint: with wx = cx + sd*(K.hp + WX_OFF), the inner wheel edge
  // is at cx + sd*(K.hp + WX_OFF - rw). Capping rw at (K.hp + WX_OFF - 2) guarantees
  // that edge stays >= cx - 2 for every sd, i.e. the wheels never cross the body
  // midline (with a small 2px margin) for any of the 5 body presets. The 50px and
  // ground-based caps below are the visual/size caps (never bigger than reads
  // "manual chair", never taller than the seated ground clearance).
  const rw = Math.min(50, K.hp + WX_OFF - 2, (ground - K.hip) / 2 - 2);
  return {
    ground,
    rw,
    wy: ground - rw,
    wx: (sd) => cx + sd * (K.hp + WX_OFF),     // wheels flanking the body
    fy: K.hip + (K.floor - K.hip) * 0.44,      // footrest level
    kx: (sd) => cx + sd * (K.thighCx + 5),     // seated knee x
  };
}

export default {
  back(ctx) {
    const { K, cx, R, line, shade } = ctx;
    const g = geom(ctx);
    let s = "";
    // tire stroke scales with wheel radius so hero-scale chairs don't look
    // thin-rimmed; floor is the small-wheel (child-height) case.
    const tireSw = Math.max(5, g.rw * 0.14);
    for (const sd of [-1, 1]) {
      const wx = R(g.wx(sd));
      // tire + soft upper highlight
      s += `<circle cx="${wx}" cy="${R(g.wy)}" r="${R(g.rw)}" fill="none" stroke="${TIRE}" stroke-width="${R(tireSw)}"/>`;
      s += line(`M${R(wx - g.rw * 0.8)} ${R(g.wy - g.rw * 0.55)} A${R(g.rw)} ${R(g.rw)} 0 0 1 ${R(wx + g.rw * 0.3)} ${R(g.wy - g.rw * 0.95)}`, shade(TIRE, 0.32), 1.8, .45);
      // 6 thin spokes + hub
      let sp = "";
      for (let i = 0; i < 6; i++) {
        const a = ((i * 60 - 15) * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
        sp += `M${R(wx + ca * 5)} ${R(g.wy + sa * 5)} L${R(wx + ca * (g.rw - 4))} ${R(g.wy + sa * (g.rw - 4))} `;
      }
      s += line(sp.trim(), FRAME, 1.3, .6);
      s += `<circle cx="${wx}" cy="${R(g.wy)}" r="4.2" fill="${FRAME}"/>`;
    }
    // backrest: rounded panel behind the torso, a touch wider than the hips
    const bw = K.hp + 6, by0 = K.chest + 8, by1 = K.hip + 6;
    s += `<rect x="${R(cx - bw)}" y="${by0}" width="${R(bw * 2)}" height="${R(by1 - by0)}" rx="10" fill="${SEAT}"/>`;
    s += line(`M${R(cx - bw + 8)} ${by0 + 4} h${R(bw * 2 - 16)}`, shade(SEAT, 0.2), 1.5, .5);
    return s;
  },

  // seat cushion only — drawn before the torso; the lap comes later, over the top.
  seated(ctx) {
    const { K, cx, R, line, shade } = ctx;
    const sw = K.hp + 8;
    return `<rect x="${R(cx - sw)}" y="${K.hip + 2}" width="${R(sw * 2)}" height="15" rx="6.5" fill="${SEAT}"/>` +
      line(`M${R(cx - sw + 6)} ${K.hip + 5.5} h${R(sw * 2 - 12)}`, shade(SEAT, 0.18), 1.4, .5);
  },

  // the seated lower body, drawn OVER the shirt/jacket hem: foreshortened thighs,
  // shins to the footrest, shoe hints — all in the bottom-garment color.
  lap(ctx) {
    const { K, cx, R, tube, line, shade, sideShade, fills, colors } = ctx;
    const g = geom(ctx), dkB = shade(colors.botC, -0.22);
    let s = `<ellipse cx="${cx}" cy="${K.hip + 8}" rx="${R(K.hp * 0.85)}" ry="4" fill="${INK}" opacity=".14"/>`;
    // center connecting fill: closes the seated crotch gap between the two thigh
    // tops (raised to 0.9 below, but at hero scale even a narrow gap can show
    // background) with a soft rounded shape spanning the thigh-top rows. Drawn
    // before the thighs/split line so the trouser center-split reads on top of it.
    s += `<path d="M${R(cx - K.thighCx * 0.42)} ${K.hip + 9} Q${cx} ${K.hip + 6} ${R(cx + K.thighCx * 0.42)} ${K.hip + 9} L${R(cx + K.thighCx * 0.36)} ${K.hip + 20} Q${cx} ${K.hip + 24} ${R(cx - K.thighCx * 0.36)} ${K.hip + 20} Z" fill="${fills.bot}"/>`;
    for (const sd of [-1, 1]) {
      const hx = cx + sd * K.thighCx * 0.9, kx = g.kx(sd);
      const thigh = tube([[hx, K.hip + 9], [kx, K.hip + 32]], [K.thW + 2.5, K.thW + 0.5]);
      const shin = tube([[kx, K.hip + 30], [kx, g.fy + 2]], [K.kneeW + 1.5, K.ankW + 1.5]);
      s += `<path d="${shin}" fill="${fills.bot}"/>` + sideShade(shin);
      s += `<path d="${thigh}" fill="${fills.bot}"/>` + sideShade(thigh);
      s += line(`M${R(kx - K.kneeW)} ${K.hip + 33} h${R(K.kneeW * 2)}`, dkB, 1.3, .35);
      s += line(`M${R(kx - K.ankW - 1)} ${R(g.fy - 2)} h${R((K.ankW + 1) * 2)}`, dkB, 1.3, .45);
      s += `<rect x="${R(kx - 8.5)}" y="${R(g.fy + 1)}" width="17" height="8.5" rx="3.4" fill="${SHOE}"/>`;
    }
    // center split so the lap reads as trousers
    s += line(`M${cx} ${K.hip + 16} L${cx} ${K.hip + 30}`, shade(colors.botC, -0.26), 2.2, .3);
    return s;
  },

  front(ctx) {
    const { K, cx, R, line, shade } = ctx;
    const g = geom(ctx);
    let s = "";
    const rimSw = Math.max(2.4, g.rw * 0.07);
    for (const sd of [-1, 1]) {
      const wx = R(g.wx(sd));
      // push rim over the figure
      s += `<circle cx="${wx}" cy="${R(g.wy)}" r="${R(g.rw - 8)}" fill="none" stroke="${FRAME}" stroke-width="${R(rimSw)}" opacity=".9"/>`;
      // armrest: pad above the wheel + support down to the seat edge
      s += `<rect x="${R(cx + sd * (K.hp - 2) - (sd > 0 ? 0 : 20))}" y="${K.hip - 9}" width="20" height="5" rx="2.5" fill="${SEAT}"/>`;
      s += line(`M${R(cx + sd * (K.hp + 6))} ${K.hip - 4} L${R(cx + sd * (K.hp + 6))} ${K.hip + 6}`, FRAME, 3, .95);
      // frame tube: seat front corner down-forward to the footrest bar
      s += line(`M${R(cx + sd * (K.hp - 2))} ${K.hip + 17} L${R(cx + sd * (g.kx(1) - cx + 10))} ${R(g.fy + 10)}`, FRAME, 3.2, .95);
      // caster strut + small front caster at the ground
      s += line(`M${R(cx + sd * (g.kx(1) - cx + 8))} ${R(g.fy + 11)} L${R(cx + sd * (g.kx(1) - cx + 9))} ${R(g.ground - 11)}`, FRAME, 2.4, .9);
      s += `<circle cx="${R(cx + sd * (g.kx(1) - cx + 9))}" cy="${R(g.ground - 6)}" r="5.5" fill="${TIRE}"/>` +
           `<circle cx="${R(cx + sd * (g.kx(1) - cx + 8.2))}" cy="${R(g.ground - 6.8)}" r="1.8" fill="${shade(TIRE, 0.35)}"/>`;
    }
    // footrest bar under both feet
    s += line(`M${R(cx - (g.kx(1) - cx) - 11)} ${R(g.fy + 10)} h${R(((g.kx(1) - cx) + 11) * 2)}`, TIRE, 4);
    return s;
  },
};
