/* ============================================================================
   dmFigure v2 — designMe full-figure avatar + garment design language.

   ARCHITECTURE (scalable by design):
     1) ANATOMY    — anatomy(body, height) → keypoints K (all coordinates
                     derive from 5 body presets × 5 heights; garments never
                     hard-code positions, they read K).
     2) PRIMITIVES — tube() tapered limb/leg/sleeve polygons, band() waist/hem/
                     cuff strips, stitch() contrast topstitching, sideShade()
                     one shared light-from-above-right overlay. Every garment
                     is composed from these, so all clothing shares one
                     rendering language.
     3) GARMENTS   — drawBottom/drawTop/drawShoes dispatch on catalog
                     attributes (type / sleeve / len / neck / fit / flags).
                     A new garment = a new attribute combo (+ optionally a
                     small detail function), never new freehand art.
   Deterministic: same options → same SVG.

   dmFigure({ skin, hair, hairColor, body, height, expression,
              glasses, hearing, feature,
              top:{sleeve,len,neck,fit,...flags}, topColor,
              bottom:{type,...flags}, bottomColor, shoes })
   ============================================================================ */
(function () {
  let UID = 0;
  const R = (n) => Math.round(n * 10) / 10;

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  const isLight = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 152;
  };
  const STITCH = "#d9b97a"; // denim topstitch gold

  /* ---------------- geometry primitives ---------------- */
  // tapered tube polygon through pts with half-widths ws
  function tube(pts, ws) {
    const n = pts.length, Lp = [], Rp = [];
    for (let i = 0; i < n; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)];
      let dx = p1[0] - p0[0], dy = p1[1] - p0[1];
      const len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      Lp.push([pts[i][0] + nx * ws[i], pts[i][1] + ny * ws[i]]);
      Rp.push([pts[i][0] - nx * ws[i], pts[i][1] - ny * ws[i]]);
    }
    const seg = (P) => {
      let d = "";
      if (P.length === 2) d = ` L${R(P[1][0])} ${R(P[1][1])}`;
      else {
        for (let i = 1; i < P.length - 1; i++) {
          const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2;
          d += ` Q${R(P[i][0])} ${R(P[i][1])} ${R(i === P.length - 2 ? P[i + 1][0] : mx)} ${R(i === P.length - 2 ? P[i + 1][1] : my)}`;
        }
      }
      return d;
    };
    return `M${R(Lp[0][0])} ${R(Lp[0][1])}${seg(Lp)} L${R(Rp[n - 1][0])} ${R(Rp[n - 1][1])}${seg([...Rp].reverse())} Z`;
  }
  // point at fraction t along polyline + width interpolation
  function along(pts, ws, t) {
    const segs = []; let total = 0;
    for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); segs.push(l); total += l; }
    let d = t * total;
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i] || i === segs.length - 1) {
        const f = Math.min(1, d / segs[i]);
        const wA = ws[i], wB = ws[i + 1];
        return { p: [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f], w: wA + (wB - wA) * f };
      }
      d -= segs[i];
    }
  }
  // sub-tube from 0..f of a polyline (for sleeves)
  function subTube(pts, ws, f) {
    const m = along(pts, ws, f * 0.55), e = along(pts, ws, f);
    return tube([pts[0], m.p, e.p], [ws[0], m.w, e.w]);
  }
  const stitch = (d, c, op) => `<path d="${d}" fill="none" stroke="${c || STITCH}" stroke-width="1.3" stroke-dasharray="3.2 2.2" stroke-linecap="round" opacity="${op || .9}"/>`;
  const line = (d, c, w, op) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w || 1.4}" stroke-linecap="round" opacity="${op || 1}"/>`;

  /* ---------------- anatomy ---------------- */
  const BODIES = {
    lean:     { sh: 40, ch: 33, wa: 28, hp: 35, arm: 8,  leg: 14 },
    balanced: { sh: 45, ch: 38, wa: 33, hp: 43, arm: 9.5, leg: 17 },
    broad:    { sh: 53, ch: 45, wa: 40, hp: 46, arm: 11.5, leg: 19 },
    curvy:    { sh: 45, ch: 42, wa: 37, hp: 54, arm: 10.5, leg: 21 },
    full:     { sh: 53, ch: 53, wa: 51, hp: 58, arm: 13.5, leg: 24 },
  };
  const HEIGHTS = { shorter: 0.9, short: 0.95, medium: 1, tall: 1.06, taller: 1.12 };

  function anatomy(bodyId, heightId) {
    const B = BODIES[bodyId] || BODIES.balanced;
    const hf = HEIGHTS[heightId] || 1;
    const cx = 120;
    const hip = 246;
    const lo = (y) => hip + (y - hip) * hf;
    const K = {
      cx, hf, ...B,
      headCy: 56, headRx: 25, headRy: 29, chin: 85,
      neckW: 11.5, neckTop: 82, neckBot: 104,
      shoulder: 114, chest: 158, waist: 204, hip,
      crotch: hip + 22, knee: lo(356), ankle: lo(452), floor: lo(452) + 30,
      elbow: 196, wrist: lo(254),
    };
    K.thighCx = B.hp * 0.52; K.kneeCx = B.hp * 0.46; K.ankCx = B.hp * 0.42;
    K.thW = B.leg; K.kneeW = B.leg * 0.68; K.ankW = Math.max(5.5, B.leg * 0.4);
    K.legPts = (s) => [[cx + s * K.thighCx, K.hip + 6], [cx + s * K.kneeCx, K.knee], [cx + s * K.ankCx, K.ankle]];
    K.legWs = [K.thW, K.kneeW, K.ankW];
    K.armPts = (s) => [[cx + s * (B.sh - 2), K.shoulder + 9], [cx + s * Math.max(B.wa + 12, B.sh + 2), K.elbow + 8], [cx + s * (B.hp + 9), K.wrist]];
    K.armWs = [B.arm, B.arm * 0.82, B.arm * 0.58];
    return K;
  }

  /* ============================================================ */
  window.dmFigure = function dmFigure(o) {
    o = o || {};
    const id = "f" + ++UID;
    const skin = o.skin || "#c99a6e", hairC = o.hairColor || "#2e221b", hair = o.hair || "waves";
    const top = o.top || { sleeve: "short", len: "hip", neck: "crew", fit: "relaxed" };
    const bottom = o.bottom || { type: "wide" };
    const topC = o.topColor || "#8aa382", botC = o.bottomColor || "#5a6f8c";
    const shoes = o.shoes || "sneaker", expr = o.expression || "smile";
    const K = anatomy(o.body, o.height);
    const cx = K.cx;
    const P = (s, x, y) => `${R(cx + s * x)} ${R(y)}`;

    const grad = (gid, c, lift = 0.15, drop = 0.15) =>
      `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, lift)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -drop)}"/></linearGradient>`;
    const fSkin = `url(#sk_${id})`, fTop = `url(#tp_${id})`, fBot = `url(#bt_${id})`, fHair = `url(#hr_${id})`;
    const sideShade = (d) => `<path d="${d}" fill="url(#sx_${id})"/>`;

    /* ---------------- person ---------------- */
    const torsoPath = () =>
      `M${P(-1, K.sh, K.shoulder)} C${P(-1, K.ch + 3, K.chest - 14)} ${P(-1, K.ch, K.chest)} ${P(-1, K.wa + 1, K.waist - 10)}` +
      ` C${P(-1, K.wa, K.waist)} ${P(-1, K.hp - 3, K.hip - 16)} ${P(-1, K.hp, K.hip + 2)} L${P(1, K.hp, K.hip + 2)}` +
      ` C${P(1, K.hp - 3, K.hip - 16)} ${P(1, K.wa, K.waist)} ${P(1, K.wa + 1, K.waist - 10)}` +
      ` C${P(1, K.ch, K.chest)} ${P(1, K.ch + 3, K.chest - 14)} ${P(1, K.sh, K.shoulder)}` +
      ` C${P(1, K.sh - 7, K.shoulder - 9)} ${P(1, K.neckW + 5, K.neckBot)} ${P(1, K.neckW, K.neckBot - 2)}` +
      ` L${P(-1, K.neckW, K.neckBot - 2)} C${P(-1, K.neckW + 5, K.neckBot)} ${P(-1, K.sh - 7, K.shoulder - 9)} ${P(-1, K.sh, K.shoulder)} Z`;

    const footSkin = (s) => {
      const ax = cx + s * K.ankCx;
      return `<path d="M${ax - 9} ${K.ankle - 4} h18 q3 14 1 22 h-20 q-2 -8 1 -22 z" fill="${fSkin}"/>`;
    };

    /* ---------------- SHOES ---------------- */
    function drawShoes() {
      const dk = "#352e28", crm = "#f6f1e7";
      const one = (s) => {
        const ax = cx + s * K.ankCx, fl = K.floor;
        if (shoes === "boot")
          return `<path d="M${ax - 11} ${K.ankle - 12} h22 v22 q0 8 -8 8 h-14 q-8 0 -8 -7 q0 -4 8 -5 z" fill="url(#sh_${id})"/>
                  <path d="M${ax - 19} ${fl - 6} h30 q4 0 4 3 t-4 3 h-30 q-4 0 -4 -3 t4 -3 z" fill="${dk}"/>
                  ${line(`M${ax - 11} ${K.ankle - 2} h22`, shade(dk, 0.25), 1.2, .8)}`;
        if (shoes === "heel")
          return `<path d="M${ax - 8} ${K.ankle - 2} q8 -3 16 0 l6 18 q1 4 -3 4 h-8 l-4 -8 -3 8 h-8 q-3 0 -2 -4 z" fill="url(#sh_${id})"/>
                  <rect x="${ax + 7}" y="${fl - 12}" width="3.4" height="12" rx="1.4" fill="${dk}"/>
                  ${line(`M${ax - 8} ${K.ankle + 1} q8 -3 16 0`, shade(dk, 0.3), 1.2, .7)}`;
        if (shoes === "loafer")
          return footSkin(s) + `<path d="M${ax - 10} ${fl - 16} q10 -5 20 0 l1 8 q0 8 -8 8 h-12 q-7 0 -7 -7 q0 -5 6 -9 z" fill="url(#sh_${id})"/>
                  <path d="M${ax - 5} ${fl - 14} q5 -2.6 10 0 l-1 4 q-4 -2 -8 0 z" fill="${shade("#473b30", 0.18)}"/>
                  <path d="M${ax - 12} ${fl - 4} h25 q3 0 3 2 t-3 2 h-25 q-3 0 -3 -2 t3 -2 z" fill="${dk}"/>`;
        if (shoes === "slide")
          return footSkin(s) + `<path d="M${ax - 12} ${fl - 15} q12 6 24 0 l-2 7 h-20 z" fill="${shade(botC, -0.18)}"/>
                  <path d="M${ax - 13} ${fl - 6} h26 q3 0 3 3 t-3 3 h-26 q-3 0 -3 -3 t3 -3 z" fill="#cdbfae"/>`;
        // sneaker
        return `<path d="M${ax - 11} ${K.ankle - 6} q11 -4 22 0 l1 16 h-24 z" fill="${crm}"/>
                <path d="M${ax - 12} ${K.ankle + 8} h25 q5 0 6 4 l0 2 q0 5 -6 5 h-25 q-6 0 -6 -5 l0 -1 q0 -4 6 -5 z" fill="#fff" stroke="#d8cfc0" stroke-width="1"/>
                ${line(`M${ax - 8} ${K.ankle - 1} q8 -3 16 0`, "#bfb4a4", 1.4, .9)}
                ${line(`M${ax - 8} ${K.ankle + 3.5} q8 -3 16 0`, "#bfb4a4", 1.4, .9)}
                <path d="M${ax + s * 4 - 4} ${K.ankle - 7} l8 3" stroke="#8a8178" stroke-width="2.2" stroke-linecap="round"/>`;
      };
      return one(-1) + one(1);
    }

    /* ---------------- BOTTOM ---------------- */
    function drawBottom() {
      const t = bottom.type || "wide";
      const dk = shade(botC, -0.2), lt = shade(botC, 0.25);
      const denim = !!bottom.denim;
      const e = { wide: 9, barrel: 7, cargo: 8, track: 6, parachute: 11, legg: 1, shorts: 7, jorts: 9, skirt: 0 }[t] ?? 7;
      const wbTop = K.waist + 2, wbBot = K.waist + 13, hpe = K.hp + Math.max(2, e - 2);
      let s = "";

      // waistband (shared by everything)
      const wb = `M${P(-1, hpe * 0.92, wbTop)} Q${cx} ${wbTop - 4} ${P(1, hpe * 0.92, wbTop)} L${P(1, hpe * 0.96, wbBot)} Q${cx} ${wbBot + 3} ${P(-1, hpe * 0.96, wbBot)} Z`;

      if (t === "skirt") {
        const hemY = bottom.maxi ? K.ankle + 4 : bottom.midi ? (K.knee + (K.ankle - K.knee) * 0.35) : K.knee - 10;
        const hemW = hpe + (bottom.maxi ? 16 : 22) + (bottom.pleated ? 4 : 0);
        const body = `M${P(-1, hpe * 0.94, wbBot - 2)} C${P(-1, K.hp + 4, K.hip)} ${P(-1, hemW * 0.86, hemY - (hemY - K.hip) * 0.4)} ${P(-1, hemW, hemY - 4)} Q${cx} ${hemY + 12} ${P(1, hemW, hemY - 4)} C${P(1, hemW * 0.86, hemY - (hemY - K.hip) * 0.4)} ${P(1, K.hp + 4, K.hip)} ${P(1, hpe * 0.94, wbBot - 2)} Z`;
        s += `<path d="${body}" fill="${fBot}"/>` + sideShade(body);
        if (bottom.pleated) {
          for (let i = -3; i <= 3; i++) {
            const x0 = cx + i * (hpe * 0.27), x1 = cx + i * (hemW / 3.6);
            s += line(`M${x0} ${wbBot + 4} L${x1} ${hemY + (Math.abs(i) === 3 ? 0 : 6)}`, i % 2 ? dk : lt, 1.3, .45);
          }
        }
        if (bottom.cargo) {
          const px = hemW * 0.62, py = K.hip + 30;
          [[-1], [1]].forEach(([sd]) => {
            s += `<path d="M${P(sd, px + 11, py)} h${-sd * 22} v26 q0 4 ${sd * 4} 4 h${sd * 14} q${sd * 4} 0 ${sd * 4} -4 z" fill="${dk}" opacity=".85"/>
                  <path d="M${P(sd, px + 11, py + 8)} h${-sd * 22}" stroke="${shade(botC, -0.34)}" stroke-width="1.4"/>`;
          });
        }
        s += line(`M${P(-1, hemW - 2, hemY - 4)} Q${cx} ${hemY + 11} ${P(1, hemW - 2, hemY - 4)}`, dk, 1.6, .5);
        s += `<path d="${wb}" fill="${shade(botC, -0.12)}"/>`;
        return s;
      }

      /* trouser family */
      const hemYs = { shorts: K.hip + (K.knee - K.hip) * 0.42, jorts: K.knee + 6 };
      const hemY = hemYs[t] != null ? hemYs[t] : (t === "track" || t === "parachute" ? K.ankle - 2 : K.ankle + 8);
      const thE = K.thW + e, kneeE = K.kneeW + e + (t === "wide" ? 6 : t === "parachute" ? 10 : t === "barrel" ? 9 : t === "jorts" ? 4 : 2);
      const hemW = { wide: thE + 4, barrel: K.ankW + 6, cargo: K.kneeW + 6, track: K.ankW + 4, parachute: K.ankW + 4.5, legg: K.ankW + 1.5, shorts: thE + 2, jorts: thE + 3 }[t] ?? K.kneeW + 5;

      const legPath = (sd) => {
        let pts, ws;
        const hx = K.thighCx, kx = t === "wide" || t === "parachute" ? K.thighCx : K.kneeCx, ax = t === "wide" ? K.thighCx : K.ankCx + 1;
        if (t === "shorts" || t === "jorts") {
          pts = [[cx + sd * hx, K.hip + 2], [cx + sd * (hx + 1), hemY]];
          ws = [thE, hemW];
        } else if (t === "barrel") {
          pts = [[cx + sd * hx, K.hip + 2], [cx + sd * (kx + 2), K.hip + (K.knee - K.hip) * 0.52], [cx + sd * K.kneeCx, K.knee + 14], [cx + sd * ax, hemY]];
          ws = [thE, kneeE, K.kneeW + 4, hemW];
        } else {
          pts = [[cx + sd * hx, K.hip + 2], [cx + sd * kx, K.knee], [cx + sd * ax, hemY]];
          ws = [thE, kneeE, hemW];
        }
        return { d: tube(pts, ws), pts, ws };
      };

      // seat panel joins legs under the waistband
      const seat = `M${P(-1, hpe * 0.96, wbBot - 2)} L${P(-1, hpe, K.hip - 2)} Q${P(-1, hpe * 0.8, K.crotch + 4)} ${P(-1, K.thighCx * 0.4, K.crotch + 8)} Q${cx} ${K.crotch + 12} ${P(1, K.thighCx * 0.4, K.crotch + 8)} Q${P(1, hpe * 0.8, K.crotch + 4)} ${P(1, hpe, K.hip - 2)} L${P(1, hpe * 0.96, wbBot - 2)} Z`;
      const Lg = legPath(-1), Rg = legPath(1);
      s += `<path d="${seat}" fill="${fBot}"/><path d="${Lg.d}" fill="${fBot}"/><path d="${Rg.d}" fill="${fBot}"/>`;
      s += sideShade(seat) + sideShade(Lg.d) + sideShade(Rg.d);
      // inseam: when wide legs overlap at center, draw the split crease so it reads as pants
      s += line(`M${cx} ${K.crotch + 10} L${cx} ${K.crotch + 16}`, dk, 2, .3);
      if (thE > K.thighCx - 2 && t !== "shorts" && t !== "jorts")
        s += line(`M${cx} ${K.crotch + 14} L${cx} ${hemY - 5}`, shade(botC, -0.26), 2.4, .35);

      /* ---- shared garment-language details ---- */
      // hem treatment
      if (t === "track" || t === "parachute") {
        [Lg, Rg].forEach((g, i) => {
          const sd = i === 0 ? -1 : 1, ex = g.pts[g.pts.length - 1][0];
          s += `<rect x="${ex - hemW}" y="${hemY - 9}" width="${hemW * 2}" height="11" rx="4" fill="${dk}"/>`;
          for (let k = -2; k <= 2; k++) s += line(`M${ex + k * (hemW / 3)} ${hemY - 8} v9`, shade(botC, -0.34), 1, .5);
          if (t === "parachute") for (let r = 1; r <= 3; r++)
            s += line(`M${ex - hemW * 1.02} ${hemY - 9 - r * 9} Q${ex} ${hemY - 4 - r * 9} ${ex + hemW * 1.02} ${hemY - 9 - r * 9}`, dk, 1.2, .35);
        });
      } else if (t === "jorts") {
        [Lg, Rg].forEach((g) => {
          const ex = g.pts[g.pts.length - 1][0];
          s += line(`M${ex - hemW + 2} ${hemY - 1} h${hemW * 2 - 4}`, shade(botC, 0.3), 2.2, .8);
          for (let k = -3; k <= 3; k++) s += line(`M${ex + k * (hemW / 3.6)} ${hemY} v3.4`, shade(botC, 0.32), 1.1, .75);
        });
      } else if (t !== "legg") {
        [Lg, Rg].forEach((g) => {
          const ex = g.pts[g.pts.length - 1][0];
          s += line(`M${ex - hemW + 2} ${hemY - 2} h${hemW * 2 - 4}`, dk, 1.5, .5);
        });
      }
      // side seams
      if (t !== "legg" && t !== "shorts") {
        [[-1, Lg], [1, Rg]].forEach(([sd, g]) => {
          const o = g.pts.map((p, i) => [p[0] + sd * (g.ws[i] - 1.5), p[1]]);
          let d = `M${o[0][0]} ${o[0][1] + 6}`;
          for (let i = 1; i < o.length; i++) d += ` L${o[i][0]} ${o[i][1] - (i === o.length - 1 ? 4 : 0)}`;
          s += t === "track"
            ? line(d, shade(botC, 0.45), 2.6, .9)
            : line(d, dk, 1.1, .35);
        });
      }
      // denim package: jeans get gold topstitch, pockets, fly, belt loops
      if (denim) {
        s += stitch(`M${P(-1, hpe * 0.9, wbBot + 2)} Q${cx} ${wbBot + 6} ${P(1, hpe * 0.9, wbBot + 2)}`);
        s += stitch(`M${cx - 1} ${wbBot + 2} q-5 10 -1 22`); // fly J
        [[-1], [1]].forEach(([sd]) => {
          s += stitch(`M${P(sd, hpe * 0.82, wbBot + 3)} Q${P(sd, hpe * 0.45, K.hip - 6)} ${P(sd, K.thighCx * 0.55, K.hip + 1)}`); // hip pocket curve
        });
        [-0.6, 0, 0.6].forEach((f) => s += `<rect x="${cx + f * hpe * 0.9 - 2}" y="${wbTop + 1}" width="4" height="10" rx="1.4" fill="${dk}"/>`);
      }
      // cargo pockets
      if (t === "cargo" || bottom.cargo) {
        [[-1, Lg], [1, Rg]].forEach(([sd, g]) => {
          const m = along(g.pts, g.ws, 0.42);
          s += `<path d="M${m.p[0] - 13} ${m.p[1] - 4} h26 v4 h-26 z" fill="${dk}"/>
                <path d="M${m.p[0] - 12} ${m.p[1]} h24 v20 q0 4 -4 4 h-16 q-4 0 -4 -4 z" fill="${shade(botC, -0.1)}"/>` +
            stitch(`M${m.p[0] - 9} ${m.p[1] + 4} v14`, shade(botC, -0.4), .6) +
            stitch(`M${m.p[0] + 9} ${m.p[1] + 4} v14`, shade(botC, -0.4), .6);
        });
      }
      // waistband on top
      s += `<path d="${wb}" fill="${shade(botC, -0.12)}"/>`;
      if (t === "track" || t === "parachute") s += line(`M${cx - 10} ${wbTop + 6} h7 M${cx + 3} ${wbTop + 6} h7`, shade(botC, 0.4), 1.6, .9) + `<circle cx="${cx - 1}" cy="${wbTop + 6}" r="1.3" fill="${shade(botC, 0.4)}"/><circle cx="${cx + 1.6}" cy="${wbTop + 6}" r="1.3" fill="${shade(botC, 0.4)}"/>`;
      return s;
    }

    /* ---------------- TOP ---------------- */
    function drawTop() {
      const sleeve = top.sleeve || "short", len = top.len || "hip", neck = top.neck || "crew", fit = top.fit || "relaxed";
      const dk = shade(topC, -0.18), lt = shade(topC, 0.26);
      const eS = { fitted: 2, relaxed: 7, oversized: 13, boxy: 11, drape: 5 }[fit] ?? 7;
      const straight = fit === "oversized" || fit === "boxy";
      const hemY = { crop: K.waist - 8, boxy: K.hip, hip: K.hip + 16, long: K.hip + 50, dress: K.knee + 16 }[len] ?? K.hip + 14;
      const shE = K.sh + eS * 0.7, nk = 12.5, nckY = K.neckBot - 3;
      const chE = straight ? shE + 1 : K.ch + eS;
      const hemW = len === "dress" || fit === "drape" ? K.hp + eS + 12 : straight ? shE + 1.5 : Math.max(K.wa, len === "crop" ? K.wa : K.hp) + eS;
      const sleeveless = sleeve === "tank" || sleeve === "strap";
      const shTipX = sleeveless ? K.sh - 9 : shE;

      // neckline (closing edge, right → left)
      let neckEdge; // closing edge: we arrive at the LEFT neck point, curve back to the RIGHT neck start
      if (neck === "v") neckEdge = `L${cx} ${nckY + 27} Z`;
      else if (neck === "scoop") neckEdge = `Q${cx} ${nckY + 24} ${P(1, nk, nckY + 3)} Z`;
      else if (neck === "high") neckEdge = `Q${cx} ${nckY + 6} ${P(1, nk - 3, nckY)} Z`;
      else neckEdge = `Q${cx} ${nckY + 12} ${P(1, nk, nckY + 1)} Z`;
      const neckStartR = neck === "v" ? `M${P(1, nk, nckY + 1)}` : neck === "scoop" ? `M${P(1, nk, nckY + 3)}` : neck === "high" ? `M${P(1, nk - 3, nckY)}` : `M${P(1, nk, nckY + 1)}`;

      // bodice: right neck → right shoulder → right side → hem → left side → left shoulder → neckline
      const side = (sd) => straight
        ? `C${P(sd, shE + 0.5, K.chest)} ${P(sd, hemW, (K.chest + hemY) / 2)} ${P(sd, hemW, hemY - 6)}`
        : fit === "drape"
          ? `C${P(sd, chE, K.chest)} ${P(sd, hemW * 0.9, (K.chest + hemY) / 2)} ${P(sd, hemW, hemY - 8)}`
          : `C${P(sd, chE, K.chest)} ${P(sd, (fit === "fitted" ? K.wa + eS : K.wa + eS + 3), K.waist)} ${P(sd, hemW, hemY - 6)}`;
      const hemCurve = `Q${cx} ${hemY + (len === "dress" || fit === "drape" ? 10 : 5)} ${P(-1, hemW, hemY - 6)}`;

      let bodice;
      if (sleeve === "strap") {
        const bustY = K.chest - 16;
        // right top edge → right side → hem → left side → sweetheart top edge
        bodice = `M${P(1, K.ch + 2, bustY)} ${side(1)} ${hemCurve} ${revSide(-1, bustY)} Q${cx} ${bustY + 6} ${P(1, K.ch + 2, bustY)} Z`;
      } else {
        const shoulderEdge = (sd) => `Q${P(sd, nk + (shTipX - nk) * 0.45, nckY - 2)} ${P(sd, shTipX, K.shoulder + (sleeveless ? 3 : 1))}`;
        const armhole = sleeveless ? (sd) => ` C${P(sd, K.ch * 0.93, K.shoulder + 16)} ${P(sd, K.ch * 0.9, K.chest - 8)} ${P(sd, K.ch * 0.94, K.chest)}` : () => "";
        bodice = `${neckStartR} ${shoulderEdge(1)} ${armhole(1)} ${sleeveless ? sideFrom(1) : side(1)} ${hemCurve} ${sleeveless ? sideTo(-1) : revSideFull(-1)} ${armholeRev(-1)} ${shoulderEdgeBack(-1)} ${neckEdge}`;
      }

      // --- helper closures for path assembly (kept tiny & local) ---
      function revSide(sd, bustY) {
        return straight
          ? `C${P(sd, hemW, (K.chest + hemY) / 2)} ${P(sd, chE, K.chest + 6)} ${P(sd, K.ch + 2, bustY)}`
          : `C${P(sd, (fit === "fitted" ? K.wa + eS : K.wa + eS + 3), K.waist)} ${P(sd, chE, K.chest + 4)} ${P(sd, K.ch + 2, bustY)}`;
      }
      function sideFrom(sd) {
        return `C${P(sd, K.ch * 0.96 + eS * 0.4, K.chest + 20)} ${P(sd, (fit === "fitted" ? K.wa + 2 : K.wa + eS), K.waist)} ${P(sd, hemW, hemY - 6)}`;
      }
      function sideTo(sd) {
        return `C${P(sd, (fit === "fitted" ? K.wa + 2 : K.wa + eS), K.waist)} ${P(sd, K.ch * 0.96 + eS * 0.4, K.chest + 20)} ${P(sd, K.ch * 0.94, K.chest)}`;
      }
      function armholeRev(sd) {
        return sleeveless ? ` C${P(sd, K.ch * 0.9, K.chest - 8)} ${P(sd, K.ch * 0.93, K.shoulder + 16)} ${P(sd, shTipX, K.shoulder + 3)}` : "";
      }
      function revSideFull(sd) {
        return straight
          ? `C${P(sd, hemW, (K.chest + hemY) / 2)} ${P(sd, shE + 0.5, K.chest)} ${P(sd, shTipX, K.shoulder + 1)}`
          : fit === "drape"
            ? `C${P(sd, hemW * 0.9, (K.chest + hemY) / 2)} ${P(sd, chE, K.chest)} ${P(sd, shTipX, K.shoulder + 1)}`
            : `C${P(sd, (fit === "fitted" ? K.wa + eS : K.wa + eS + 3), K.waist)} ${P(sd, chE, K.chest)} ${P(sd, shTipX, K.shoulder + 1)}`;
      }
      function shoulderEdgeBack(sd) {
        return `Q${P(sd, nk + (shTipX - nk) * 0.45, nckY - 2)} ${P(sd, nk + (neck === "asym" ? 8 : 0), nckY + 1)}`;
      }

      let s = "";
      const sleeveDs = [];
      // hood (behind shoulders, before bodice)
      if (top.hood) s += `<path d="M${P(-1, 24, K.shoulder + 4)} Q${cx} ${K.chest + 10} ${P(1, 24, K.shoulder + 4)} Q${P(1, 30, K.neckTop - 4)} ${cx} ${K.neckTop - 10} Q${P(-1, 30, K.neckTop - 4)} ${P(-1, 24, K.shoulder + 4)} Z" fill="${dk}"/>` +
        `<path d="M${P(-1, 16, K.shoulder + 2)} Q${cx} ${K.chest} ${P(1, 16, K.shoulder + 2)} Q${cx} ${K.neckBot - 4} ${P(-1, 16, K.shoulder + 2)} Z" fill="${shade(topC, -0.32)}"/>`;

      // under-hem contact shadow (sits on the bottom garment)
      if (len !== "dress") s += `<ellipse cx="${cx}" cy="${hemY + 2}" rx="${hemW - 8}" ry="5.5" fill="#2c2118" opacity=".10"/>`;

      s += `<path d="${bodice}" fill="${fTop}"/>` + sideShade(bodice);

      // straps
      if (sleeve === "strap") {
        s += line(`M${P(-1, nk + 2, K.shoulder - 4)} L${P(-1, K.ch - 4, K.chest - 15)}`, topC, 4.6) +
             line(`M${P(1, nk + 2, K.shoulder - 4)} L${P(1, K.ch - 4, K.chest - 15)}`, topC, 4.6);
      }

      // sleeves
      const fr = { short: 0.42, long: 0.97 }[sleeve];
      if (fr) {
        [[-1], [1]].forEach(([sd]) => {
          const pts = K.armPts(sd), ws = K.armWs.map((w) => w + eS * 0.45 + 1.5);
          const d = subTube(pts, ws, fr);
          sleeveDs.push(d);
          s += `<path d="${d}" fill="${fTop}"/>`;
          // rounded shoulder cap: a soft deltoid over the bodice→sleeve seam removes the
          // flat tube-cap step so the shoulder reads as one continuous curve.
          const a0x = pts[0][0], a0y = pts[0][1], w0 = ws[0];
          const tipX = cx + sd * shTipX, tipY = K.shoulder + 1;
          const outX = a0x + sd * w0 * 0.96, outY = a0y - w0 * 0.12;
          const lowX = a0x + sd * w0 * 0.7, lowY = a0y + w0 * 0.9;
          const inX = cx + sd * (K.ch * 0.9), inY = K.chest - 6;
          const capD = `M${R(tipX)} ${R(tipY)} Q${R(tipX + sd * w0 * 0.5)} ${R(tipY - 1)} ${R(outX)} ${R(outY)} Q${R(a0x + sd * w0 * 1.04)} ${R(a0y + w0 * 0.35)} ${R(lowX)} ${R(lowY)} L${R(inX)} ${R(inY)} Z`;
          s += `<path d="${capD}" fill="${fTop}"/>`;
          const end = along(pts, ws, fr);
          if (sleeve === "long") {
            const cuff = subTube(pts, ws.map((w) => w - 0.4), fr);
            if (top.rib) {
              const c0 = along(pts, ws, fr - 0.1);
              s += `<path d="${tube([c0.p, end.p], [c0.w - 0.3, end.w - 0.5])}" fill="${dk}" opacity=".75"/>`;
            } else {
              s += line(`M${end.p[0] - end.w + 1} ${end.p[1]} L${end.p[0] + end.w - 1} ${end.p[1]}`, dk, 1.4, .45);
            }
          } else {
            s += line(`M${end.p[0] - end.w + 1.5} ${end.p[1] + 1} L${end.p[0] + end.w - 1} ${end.p[1] - 1}`, dk, 1.3, .4);
          }
        });
      }


      /* ---- shared top details ---- */
      // neck finishes
      if (neck === "crew") s += line(`M${P(-1, nk - 1, nckY + 2.5)} Q${cx} ${nckY + 14.5} ${P(1, nk - 1, nckY + 2.5)}`, dk, 2.6, .5);
      if (neck === "scoop") s += line(`M${P(-1, nk - 1, nckY + 4.5)} Q${cx} ${nckY + 26} ${P(1, nk - 1, nckY + 4.5)}`, dk, 2.2, .4);
      if (neck === "v") s += line(`M${P(-1, nk - 1, nckY + 2.5)} L${cx} ${nckY + 28.5} L${P(1, nk - 1, nckY + 2.5)}`, dk, 2.2, .45);
      if (neck === "high") {
        s += `<path d="M${P(-1, 14, K.chin + 1)} q${-1} 16 1 20 L${P(1, 15, K.chin + 21)} q2 -4 1 -20 q-15 -5 -30 0 z" fill="${fTop}"/>` +
          line(`M${P(-1, 13.4, K.chin + 12)} q14.6 4 29.2 0`, dk, 1.3, .4);
        for (let i = -2; i <= 2; i++) s += line(`M${cx + i * 6} ${K.chin + 3} v16`, dk, 1.1, .3);
      }
      if (neck === "collar") {
        s += `<path d="M${P(-1, nk + 1, nckY)} L${cx - 2.5} ${nckY + 17} L${P(-1, nk + 11, K.shoulder + 9)} Q${P(-1, nk + 13, nckY + 3)} ${P(-1, nk + 1, nckY)} Z" fill="${shade(topC, 0.08)}" stroke="${dk}" stroke-width="1" stroke-opacity=".4"/>
              <path d="M${P(1, nk + 1, nckY)} L${cx + 2.5} ${nckY + 17} L${P(1, nk + 11, K.shoulder + 9)} Q${P(1, nk + 13, nckY + 3)} ${P(1, nk + 1, nckY)} Z" fill="${shade(topC, 0.08)}" stroke="${dk}" stroke-width="1" stroke-opacity=".4"/>
              <path d="M${P(-1, nk, nckY - 1)} Q${cx} ${nckY + 7} ${P(1, nk, nckY - 1)} l0 3 Q${cx} ${nckY + 10} ${P(-1, nk, nckY + 2)} z" fill="${shade(topC, -0.08)}"/>`;
      }
      // placket + buttons / zip
      if (top.placket || top.zip) {
        const y0 = neck === "collar" ? nckY + 16 : nckY + 14, y1 = hemY - 8;
        if (top.zip) {
          s += line(`M${cx} ${y0} L${cx} ${y1}`, shade(topC, -0.3), 3, .8) + line(`M${cx} ${y0} L${cx} ${y1}`, lt, 1.1, .9) +
            `<rect x="${cx - 1.6}" y="${y0 + 6}" width="3.2" height="7" rx="1.4" fill="${shade(topC, -0.42)}"/>`;
        } else {
          s += line(`M${cx + (top.placket ? 0 : 0)} ${y0} L${cx} ${y1}`, dk, 1.2, .5);
          const n = Math.max(3, Math.floor((y1 - y0) / 24));
          for (let i = 0; i <= n; i++) s += `<circle cx="${cx}" cy="${y0 + 6 + i * ((y1 - y0 - 10) / n)}" r="1.9" fill="${dk}"/>`;
        }
      }
      // kangaroo pocket
      if (top.pocket) s += `<path d="M${cx - 23} ${hemY - 42} h46 l-4 28 q-19 7 -38 0 z" fill="${shade(topC, -0.08)}"/>` +
        line(`M${cx - 23} ${hemY - 42} l5 26 M${cx + 23} ${hemY - 42} l-5 26`, dk, 1.2, .5);
      // hem rib
      if (top.rib && len !== "dress") {
        s += `<path d="M${P(-1, hemW - 1, hemY - 12)} Q${cx} ${hemY - 7} ${P(1, hemW - 1, hemY - 12)} L${P(1, hemW - 0.5, hemY - 5)} Q${cx} ${hemY + 1} ${P(-1, hemW - 0.5, hemY - 5)} Z" fill="${dk}" opacity=".6"/>`;
        for (let x = -hemW + 8; x < hemW - 6; x += 6) s += line(`M${cx + x} ${hemY - 11} v7`, dk, 1, .35);
      }
      // chunky knit rows
      if (top.chunky) for (let y = K.chest + 8; y < hemY - 12; y += 12)
        s += line(`M${P(-1, chE - 5, y)} Q${cx} ${y + 5} ${P(1, chE - 5, y)}`, dk, 1.2, .22);
      // graphic print
      if (top.graphic) s += `<rect x="${cx - 13}" y="${K.chest - 4}" width="26" height="19" rx="3.5" fill="${isLight(topC) ? "#3a342e" : "#efe7d9"}" opacity=".85"/>
        <rect x="${cx - 9}" y="${K.chest}" width="18" height="3" rx="1.5" fill="${isLight(topC) ? "#efe7d9" : "#3a342e"}" opacity=".7"/>
        <rect x="${cx - 9}" y="${K.chest + 6}" width="12" height="3" rx="1.5" fill="${isLight(topC) ? "#efe7d9" : "#3a342e"}" opacity=".5"/>`;
      // corset seams
      if (top.corset) {
        [-0.62, -0.21, 0.21, 0.62].forEach((f) => s += line(`M${cx + f * K.ch} ${K.chest - 10} L${cx + f * K.wa * 1.05} ${hemY - 6}`, dk, 1.2, .5));
        s += line(`M${P(-1, K.ch + 1, K.chest - 14)} Q${cx} ${K.chest - 4} ${P(1, K.ch + 1, K.chest - 14)}`, dk, 1.6, .5);
      }
      // mesh grid
      if (top.mesh) {
        for (let y = K.chest - 6; y < hemY - 6; y += 9) s += line(`M${P(-1, chE - 6, y)} L${P(1, chE - 6, y)}`, lt, 0.8, .35);
        for (let x = -chE + 10; x < chE - 8; x += 9) s += line(`M${cx + x} ${K.shoulder + 12} L${cx + x} ${hemY - 8}`, lt, 0.8, .25);
      }
      // satin sheen
      if (top.satin) s += `<path d="M${P(-1, K.ch * 0.5, K.chest - 12)} q10 ${(hemY - K.chest) * 0.5} -4 ${(hemY - K.chest) * 0.92}" stroke="#fff" stroke-width="7" fill="none" opacity=".18" stroke-linecap="round"/>
        <path d="M${P(1, K.ch * 0.35, K.chest)} q8 ${(hemY - K.chest) * 0.4} -3 ${(hemY - K.chest) * 0.78}" stroke="#fff" stroke-width="4" fill="none" opacity=".14" stroke-linecap="round"/>`;
      // hood drawstrings
      if (top.hood) s += line(`M${cx - 7} ${K.neckBot + 14} q-1.5 10 1 16 M${cx + 7} ${K.neckBot + 14} q1.5 10 -1 16`, dk, 2, .8) +
        `<circle cx="${cx - 6}" cy="${K.neckBot + 31}" r="1.6" fill="${dk}"/><circle cx="${cx + 6}" cy="${K.neckBot + 31}" r="1.6" fill="${dk}"/>`;
      // patterns (clipped to bodice + sleeves)
      if (top.pattern && top.pattern !== "none") {
        const pc = isLight(topC) ? shade(topC, -0.32) : shade(topC, 0.32);
        let pl = "";
        const x0 = cx - (shE + 16), x1 = cx + (shE + 16);
        if (top.pattern === "stripe") {
          for (let y = nckY + 14; y < hemY; y += 11) pl += line(`M${x0} ${y} L${x1} ${y}`, pc, 3.6, .42);
        } else if (top.pattern === "plaid") {
          for (let y = nckY + 12; y < hemY; y += 14) pl += line(`M${x0} ${y} L${x1} ${y}`, pc, 2.6, .38);
          for (let x = -shE - 4; x <= shE + 4; x += 14) pl += line(`M${cx + x} ${nckY - 4} L${cx + x} ${hemY}`, pc, 2.6, .28);
        }
        s += `<clipPath id="tc_${id}"><path d="${bodice}"/>${sleeveDs.map((d) => `<path d="${d}"/>`).join("")}</clipPath><g clip-path="url(#tc_${id})">${pl}</g>`;
      }
      return s;
    }

    /* ---------------- OUTER LAYER (open jackets) ---------------- */
    function drawOuter() {
      const L = o.layer || {};
      if (!L.style || L.style === "none") return "";
      const c = o.layerColor || "#5a6f8c";
      const dk = shade(c, -0.2);
      const st = L.style;
      const eL = st === "puffer" ? 15 : st === "blazer" ? 8 : 11;
      const hemY = st === "denim" ? K.hip + 4 : st === "blazer" ? K.hip + 36 : K.hip + 30;
      const shL = K.sh + eL * 0.8, hemWL = shL + 2, inX = 8.5;
      const fLy = `url(#ly_${id})`;
      let s = `<ellipse cx="${cx}" cy="${K.shoulder + 18}" rx="${K.sh}" ry="10" fill="#2c2118" opacity=".07"/>`;
      const panel = (sd) =>
        `M${P(sd, 11, K.neckBot - 1)} Q${P(sd, (11 + shL) / 2, K.neckBot - 4)} ${P(sd, shL, K.shoulder + 2)}` +
        ` C${P(sd, shL + 1, K.chest)} ${P(sd, hemWL, (K.chest + hemY) / 2)} ${P(sd, hemWL, hemY - 5)}` +
        ` Q${P(sd, hemWL - 1, hemY)} ${P(sd, hemWL - 5, hemY)} L${P(sd, inX, hemY)} L${P(sd, inX, K.chest - 16)} Z`;
      const pL = panel(-1), pR = panel(1);
      s += `<path d="${pL}" fill="${fLy}"/><path d="${pR}" fill="${fLy}"/>` + sideShade(pL) + sideShade(pR);
      [[-1], [1]].forEach(([sd]) => {
        const pts = K.armPts(sd), ws = K.armWs.map((w) => w + eL * 0.5 + 2.5);
        const d = subTube(pts, ws, 0.97);
        s += `<path d="${d}" fill="${fLy}"/>`;
        const end = along(pts, ws, 0.97), c0 = along(pts, ws, 0.87);
        if (st === "puffer" || st === "denim") s += `<path d="${tube([c0.p, end.p], [c0.w - 0.3, end.w - 0.5])}" fill="${dk}" opacity=".7"/>`;
        else s += line(`M${end.p[0] - end.w + 1} ${end.p[1]} L${end.p[0] + end.w - 1} ${end.p[1]}`, dk, 1.4, .45);
      });
      // open-front inner edges
      s += line(`M${P(-1, inX, K.chest - 14)} L${P(-1, inX, hemY - 2)}`, dk, 1.4, .4) +
           line(`M${P(1, inX, K.chest - 14)} L${P(1, inX, hemY - 2)}`, dk, 1.4, .4);
      if (st === "denim") {
        s += `<path d="M${P(-1, 12, K.neckBot - 2)} L${P(-1, 4, K.chest - 24)} L${P(-1, 20, K.chest - 26)} Z" fill="${dk}"/>
              <path d="M${P(1, 12, K.neckBot - 2)} L${P(1, 4, K.chest - 24)} L${P(1, 20, K.chest - 26)} Z" fill="${dk}"/>`;
        [[-1], [1]].forEach(([sd]) => {
          s += `<path d="M${P(sd, shL * 0.55 + 8, K.chest - 4)} h${-sd * 16} v3.4 h${sd * 16} z" fill="${dk}"/>` +
            stitch(`M${P(sd, shL * 0.55 + 6, K.chest + 3)} h${-sd * 13}`) +
            stitch(`M${P(sd, hemWL - 4, hemY - 7)} L${P(sd, inX + 4, hemY - 7)}`);
        });
        s += `<circle cx="${cx - inX - 2}" cy="${K.chest + 14}" r="1.8" fill="${dk}"/><circle cx="${cx - inX - 2}" cy="${K.chest + 36}" r="1.8" fill="${dk}"/>`;
      }
      if (st === "puffer") {
        [[pL, 0], [pR, 1]].forEach(([pp, i]) => {
          let q = "";
          for (let y = K.chest - 12; y < hemY - 4; y += 13) q += line(`M${cx - hemWL} ${y} L${cx + hemWL} ${y}`, dk, 1.6, .32);
          s += `<clipPath id="pf${i}_${id}"><path d="${pp}"/></clipPath><g clip-path="url(#pf${i}_${id})">${q}</g>`;
        });
        s += `<path d="M${P(-1, 13, K.neckBot - 2)} q13 -8 26 0 l-2.5 9 q-10.5 -6 -21 0 z" fill="${dk}"/>`;
      }
      if (st === "blazer") {
        [[-1], [1]].forEach(([sd]) => {
          s += `<path d="M${P(sd, 11, K.neckBot - 1)} L${P(sd, 19, K.chest + 2)} L${P(sd, 7.5, K.chest + 8)} Z" fill="${shade(c, 0.12)}" stroke="${dk}" stroke-width="0.8" stroke-opacity=".4"/>
                <path d="M${P(sd, hemWL * 0.62, K.waist + 8)} h${-sd * 15} v2.6 h${sd * 15} z" fill="${dk}" opacity=".6"/>`;
        });
        s += `<circle cx="${cx - inX + 0.5}" cy="${K.waist + 2}" r="2" fill="${dk}"/>`;
      }
      if (st === "overshirt") {
        s += `<path d="M${P(-1, 12, K.neckBot - 2)} L${P(-1, 5, K.chest - 26)} L${P(-1, 19, K.chest - 27)} Z" fill="${shade(c, 0.1)}"/>
              <path d="M${P(1, 12, K.neckBot - 2)} L${P(1, 5, K.chest - 26)} L${P(1, 19, K.chest - 27)} Z" fill="${shade(c, 0.1)}"/>`;
        [[-1], [1]].forEach(([sd]) => {
          s += `<path d="M${P(sd, hemWL * 0.6, hemY - 26)} h${-sd * 18} v18 q0 3 ${sd * 3} 3 h${sd * 12} q${sd * 3} 0 ${sd * 3} -3 z" fill="${shade(c, -0.08)}"/>`;
        });
        s += `<circle cx="${cx - inX - 2}" cy="${K.chest}" r="1.7" fill="${dk}"/><circle cx="${cx - inX - 2}" cy="${K.chest + 22}" r="1.7" fill="${dk}"/><circle cx="${cx - inX - 2}" cy="${K.chest + 44}" r="1.7" fill="${dk}"/>`;
      }
      return s;
    }

    /* ---------------- carry & jewelry ---------------- */
    function drawCarry(which) {
      const t = o.carry;
      if (!t || t === "none" || t !== which) return "";
      const c = o.carryColor || "#8a5a3f";
      const dk = shade(c, -0.22);
      if (t === "crossbody") {
        return line(`M${P(-1, K.sh - 8, K.shoulder + 2)} L${P(1, K.hp - 2, K.hip + 4)}`, dk, 4, .95) +
          `<path d="M${P(1, K.hp + 12, K.hip + 8)} h-24 q-3 0 -3 4 v12 q0 4 4 4 h22 q4 0 4 -4 v-12 q0 -4 -3 -4 z" fill="url(#cr_${id})"/>
           <path d="M${P(1, K.hp + 12, K.hip + 8)} h-24 q-3 0 -3 4 v2.6 h31 v-2.6 q0 -4 -3 -4 z" fill="${dk}"/>`;
      }
      const w = K.armPts(1)[2];
      return `<path d="M${w[0] - 6} ${w[1] + 7} q6 -11 12 0" fill="none" stroke="${dk}" stroke-width="2.6"/>
        <path d="M${w[0] - 14} ${w[1] + 10} h28 l-3.5 34 q-0.5 4 -4.5 4 h-12 q-4 0 -4.5 -4 z" fill="url(#cr_${id})"/>
        ${line(`M${w[0] - 12} ${w[1] + 16} h24`, dk, 1.2, .4)}`;
    }
    function drawJewelry() {
      const j = o.jewelry;
      if (!j || j === "none") return "";
      const g = "#cda14e";
      if (j === "earrings")
        return `<circle cx="${cx - K.headRx - 1.5}" cy="${K.headCy + 10}" r="1.9" fill="${g}"/><circle cx="${cx + K.headRx + 1.5}" cy="${K.headCy + 10}" r="1.9" fill="${g}"/>`;
      return line(`M${cx - 9} ${K.neckBot + 2} Q${cx} ${K.neckBot + 13} ${cx + 9} ${K.neckBot + 2}`, g, 1.6, .95) +
        `<circle cx="${cx}" cy="${K.neckBot + 13}" r="2.2" fill="${g}"/>`;
    }

    /* ---------------- head & hair ---------------- */
    function head() {
      const eyeY = K.headCy - 3, hx = cx;
      const mouth = expr === "calm"
        ? line(`M${hx - 7} ${K.headCy + 14} h14`, shade(skin, -0.3), 2.2)
        : expr === "soft"
        ? line(`M${hx - 7} ${K.headCy + 13} q7 4 14 0`, shade(skin, -0.3), 2.2)
        : line(`M${hx - 8} ${K.headCy + 12} q8 7.5 16 0`, shade(skin, -0.32), 2.5);
      let f = `<ellipse cx="${hx}" cy="${K.headCy}" rx="${K.headRx}" ry="${K.headRy}" fill="${fSkin}"/>
        <ellipse cx="${hx - K.headRx}" cy="${K.headCy + 4}" rx="5" ry="6" fill="${fSkin}"/>
        <ellipse cx="${hx + K.headRx}" cy="${K.headCy + 4}" rx="5" ry="6" fill="${fSkin}"/>
        <ellipse cx="${hx - 12}" cy="${K.headCy + 9}" rx="6.5" ry="4" fill="#d98b76" opacity=".3"/>
        <ellipse cx="${hx + 12}" cy="${K.headCy + 9}" rx="6.5" ry="4" fill="#d98b76" opacity=".3"/>
        <circle cx="${hx - 10}" cy="${eyeY}" r="3.1" fill="#372a20"/><circle cx="${hx + 10}" cy="${eyeY}" r="3.1" fill="#372a20"/>
        <circle cx="${hx - 9}" cy="${eyeY - 1}" r="1" fill="#fff" opacity=".85"/><circle cx="${hx + 11}" cy="${eyeY - 1}" r="1" fill="#fff" opacity=".85"/>
        ${line(`M${hx - 15} ${eyeY - 8} q5 -3 10 -0.5`, shade(hairC, -0.05), 2)}
        ${line(`M${hx + 5} ${eyeY - 8.5} q5 -2.5 10 0.5`, shade(hairC, -0.05), 2)}
        ${line(`M${hx} ${K.headCy + 1} q2.5 5 -1 7.5`, shade(skin, -0.2), 1.8)}
        ${mouth}`;
      /* identity extras carried over from the bust language */
      if (o.feature === "freckles") {
        f += `<g fill="${shade(skin, -0.2)}" opacity=".5">` +
          [[-13, 8], [-9, 11], [-5, 8.5], [5, 8.5], [9, 11], [13, 8], [0, 13]].map((p) => `<circle cx="${hx + p[0]}" cy="${K.headCy + p[1]}" r="1.1"/>`).join("") + `</g>`;
      }
      if (o.feature === "vitiligo") f += `<g fill="${shade(skin, 0.55)}" opacity=".85"><path d="M${hx - 16} ${K.headCy + 6} q6 -2 5 6 q-5 4 -8 -1 q-1 -3 3 -5 z"/><circle cx="${hx + 13}" cy="${K.headCy + 13}" r="4"/></g>`;
      if (o.glasses && o.glasses !== "none") {
        const gs = "#3a3330";
        const lens = (gx) => o.glasses === "rect"
          ? `<rect x="${gx - 8}" y="${eyeY - 6.5}" width="16" height="13" rx="3.5" fill="#fff" fill-opacity=".09" stroke="${gs}" stroke-width="2.2"/>`
          : o.glasses === "cat"
          ? `<path d="M${gx - 8} ${eyeY - 3} q0 -5 8 -4.5 q8 0.5 8 6 q0 7 -8 7 q-8 0 -8 -8.5 z" fill="#fff" fill-opacity=".09" stroke="${gs}" stroke-width="2.2"/>`
          : `<circle cx="${gx}" cy="${eyeY}" r="8" fill="#fff" fill-opacity=".09" stroke="${gs}" stroke-width="2.2"/>`;
        f += lens(hx - 10) + lens(hx + 10) + line(`M${hx - 2} ${eyeY - 1.5} h4`, gs, 2.2) +
          line(`M${hx - 18} ${eyeY - 2} l-6 -1.5 M${hx + 18} ${eyeY - 2} l6 -1.5`, gs, 2.2);
      }
      if (o.hearing && o.hearing !== "none") {
        const hc = o.hearing === "cochlear" ? "#6f8a9b" : "#cdbfb0";
        f += `<circle cx="${hx - K.headRx - 2}" cy="${K.headCy + 5}" r="3" fill="${hc}"/>` +
          (o.hearing === "cochlear" ? `<circle cx="${hx - K.headRx + 1}" cy="${K.headCy - 9}" r="3.4" fill="${hc}"/>` + line(`M${hx - K.headRx + 1} ${K.headCy - 6} q-3 5 -3 8`, hc, 1.6) : "");
      }
      return f;
    }

    function hairBack() {
      const hx = cx, t = K.headCy - K.headRy, longEnd = K.chest + 10;
      switch (hair) {
        case "bald": return "";
        case "buzz": case "shaved":
          return `<path d="M${hx - K.headRx - 1} ${K.headCy - 2} Q${hx - K.headRx - 2} ${t - 6} ${hx} ${t - 7} Q${hx + K.headRx + 2} ${t - 6} ${hx + K.headRx + 1} ${K.headCy - 2} Q${hx + K.headRx - 4} ${K.headCy - 14} ${hx} ${K.headCy - 16} Q${hx - K.headRx + 4} ${K.headCy - 14} ${hx - K.headRx - 1} ${K.headCy - 2} Z" fill="${fHair}" opacity="${hair === "shaved" ? 0.75 : 1}"/>`;
        case "long": case "waves": case "straight":
          return `<path d="M${hx - K.headRx - 4} ${K.headCy} Q${hx - K.headRx - 5} ${t - 8} ${hx} ${t - 9} Q${hx + K.headRx + 5} ${t - 8} ${hx + K.headRx + 4} ${K.headCy} L${hx + K.headRx + 6} ${longEnd} Q${hx + K.headRx - 2} ${longEnd + 10} ${hx + K.headRx - 7} ${longEnd} L${hx + K.headRx - 8} ${K.headCy + 10} Q${hx} ${K.headCy - 22} ${hx - K.headRx + 8} ${K.headCy + 10} L${hx - K.headRx + 7} ${longEnd} Q${hx - K.headRx + 2} ${longEnd + 10} ${hx - K.headRx - 6} ${longEnd} Z" fill="${fHair}"/>`;
        case "bun":
          return `<circle cx="${hx}" cy="${t - 8}" r="11" fill="${fHair}"/><path d="M${hx - K.headRx - 2} ${K.headCy} Q${hx - K.headRx - 3} ${t - 7} ${hx} ${t - 8} Q${hx + K.headRx + 3} ${t - 7} ${hx + K.headRx + 2} ${K.headCy} Q${hx + K.headRx - 4} ${K.headCy - 16} ${hx} ${K.headCy - 18} Q${hx - K.headRx + 4} ${K.headCy - 16} ${hx - K.headRx - 2} ${K.headCy} Z" fill="${fHair}"/>`;
        case "braids":
          return `<path d="M${hx - K.headRx - 3} ${K.headCy} Q${hx - K.headRx - 4} ${t - 8} ${hx} ${t - 9} Q${hx + K.headRx + 4} ${t - 8} ${hx + K.headRx + 3} ${K.headCy} Q${hx + K.headRx - 4} ${K.headCy - 16} ${hx} ${K.headCy - 18} Q${hx - K.headRx + 4} ${K.headCy - 16} ${hx - K.headRx - 3} ${K.headCy} Z" fill="${fHair}"/>` +
            [-1, 1].map((sd) => {
              const bx = hx + sd * (K.headRx + 4);
              let d = `<path d="M${bx - 4} ${K.headCy - 2} q-2 ${(longEnd - K.headCy) / 2} 0 ${longEnd - K.headCy + 14} q4 6 8 0 q2 -${(longEnd - K.headCy) / 2} 0 -${longEnd - K.headCy + 14} z" fill="${fHair}"/>`;
              for (let y = K.headCy + 10; y < longEnd + 6; y += 11) d += `<ellipse cx="${bx}" cy="${y}" rx="4.6" ry="3.4" fill="${shade(hairC, 0.12)}" opacity=".5"/>`;
              return d;
            }).join("");
        case "curly": {
          let s = `<g fill="${fHair}">`;
          const rr = 13;
          [[-17, -22, rr], [0, -27, rr + 2], [17, -22, rr], [-25, -6, rr - 2], [25, -6, rr - 2], [-21, 9, rr - 4], [21, 9, rr - 4]]
            .forEach((p) => s += `<circle cx="${hx + p[0]}" cy="${K.headCy + p[1]}" r="${p[2]}"/>`);
          return s + "</g>";
        }
        default:
          return `<path d="M${hx - K.headRx - 2} ${K.headCy} Q${hx - K.headRx - 3} ${t - 7} ${hx} ${t - 8} Q${hx + K.headRx + 3} ${t - 7} ${hx + K.headRx + 2} ${K.headCy} Q${hx + K.headRx - 4} ${K.headCy - 15} ${hx} ${K.headCy - 17} Q${hx - K.headRx + 4} ${K.headCy - 15} ${hx - K.headRx - 2} ${K.headCy} Z" fill="${fHair}"/>`;
      }
    }
    function hairFront() {
      if (hair === "bald" || hair === "buzz" || hair === "shaved") return "";
      const hx = cx, t = K.headCy - K.headRy;
      return `<path d="M${hx - K.headRx + 1} ${K.headCy - 8} Q${hx - K.headRx + 3} ${t - 2} ${hx} ${t - 1} Q${hx + K.headRx - 3} ${t - 2} ${hx + K.headRx - 1} ${K.headCy - 8} Q${hx + K.headRx - 8} ${K.headCy - 15} ${hx} ${K.headCy - 16} Q${hx - K.headRx + 8} ${K.headCy - 15} ${hx - K.headRx + 1} ${K.headCy - 8} Z" fill="${fHair}"/>`;
    }

    /* ---------------- assemble ---------------- */
    const legSkinL = tube(K.legPts(-1), K.legWs), legSkinR = tube(K.legPts(1), K.legWs);
    const armL = tube(K.armPts(-1), K.armWs), armR = tube(K.armPts(1), K.armWs);
    const wL = K.armPts(-1)[2], wR = K.armPts(1)[2];

    return `<svg viewBox="0 0 240 ${Math.round(K.floor + 8)}" width="100%" preserveAspectRatio="xMidYMax meet" style="display:block;overflow:visible" role="img" aria-label="avatar">
  <defs>
    ${grad(`sk_${id}`, skin)}${grad(`tp_${id}`, topC)}${grad(`bt_${id}`, botC)}${grad(`hr_${id}`, hairC, 0.24, 0.15)}
    ${grad(`sh_${id}`, o.shoeColor || "#473b30", 0.12, 0.2)}${grad(`ly_${id}`, o.layerColor || "#5a6f8c")}${grad(`cr_${id}`, o.carryColor || "#8a5a3f", 0.12, 0.18)}
    <linearGradient id="sx_${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2c2118" stop-opacity=".14"/><stop offset=".28" stop-color="#2c2118" stop-opacity="0"/>
      <stop offset=".78" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".10"/>
    </linearGradient>
  </defs>
  ${hairBack()}
  <path d="M${P(-1, K.neckW, K.chin - 6)} L${P(-1, K.neckW + 0.5, K.neckBot + 2)} L${P(1, K.neckW + 0.5, K.neckBot + 2)} L${P(1, K.neckW, K.chin - 6)} Z" fill="${shade(skin, -0.07)}"/>
  <path d="${legSkinL}" fill="${fSkin}"/><path d="${legSkinR}" fill="${fSkin}"/>
  ${footSkin(-1)}${footSkin(1)}
  ${drawShoes()}
  ${drawBottom()}
  <path d="${armL}" fill="${fSkin}"/><path d="${armR}" fill="${fSkin}"/>
  <ellipse cx="${wL[0]}" cy="${wL[1] + 6}" rx="${K.armWs[2] + 1.2}" ry="${K.armWs[2] + 3.5}" fill="${fSkin}"/>
  <ellipse cx="${wR[0]}" cy="${wR[1] + 6}" rx="${K.armWs[2] + 1.2}" ry="${K.armWs[2] + 3.5}" fill="${fSkin}"/>
  <path d="${torsoPath()}" fill="${fSkin}"/>
  ${drawTop()}
  ${drawCarry("crossbody")}
  ${drawOuter()}
  ${drawCarry("tote")}
  ${head()}
  ${hairFront()}
  ${drawJewelry()}
</svg>`;
  };
})();
