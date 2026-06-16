/* @ds-bundle: {"format":3,"namespace":"DesignMeDesignSystem_157aab","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Tag","sourcePath":"components/feedback/Tag.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"DiscoverHero","sourcePath":"components/product/DiscoverHero.jsx"},{"name":"VibeCard","sourcePath":"components/product/VibeCard.jsx"},{"name":"CategoryTile","sourcePath":"components/selection/CategoryTile.jsx"},{"name":"Chip","sourcePath":"components/selection/Chip.jsx"},{"name":"ColorDot","sourcePath":"components/selection/ColorDot.jsx"},{"name":"SubTab","sourcePath":"components/selection/SubTab.jsx"},{"name":"Swatch","sourcePath":"components/selection/Swatch.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"}],"sourceHashes":{"assets/avatar.js":"2bdff918a3a8","assets/figure.js":"7cdf7ea34451","components/buttons/Button.jsx":"93fd173899e1","components/buttons/IconButton.jsx":"77a5c5b36975","components/feedback/Badge.jsx":"9663526d9277","components/feedback/Tag.jsx":"e10e2f7ac80d","components/feedback/Toast.jsx":"54f6232f8cab","components/product/DiscoverHero.jsx":"ad6b776c5c5e","components/product/VibeCard.jsx":"618fa05c271e","components/selection/CategoryTile.jsx":"f4fa7a686a6c","components/selection/Chip.jsx":"7537f9a5d549","components/selection/ColorDot.jsx":"608a5c331308","components/selection/SubTab.jsx":"12925e1ba83c","components/selection/Swatch.jsx":"2985653910b3","components/surfaces/Card.jsx":"c46afe059ef0","ui_kits/avatar-studio/AvatarStudio.jsx":"1bcc513935c6","ui_kits/avatar-studio/catalog.js":"389e8a0bc0f6","ui_kits/avatar-studio/icons.jsx":"d9fb10ef75b3"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignMeDesignSystem_157aab = window.DesignMeDesignSystem_157aab || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/avatar.js
try { (() => {
/* ============================================================
   dmAvatar — a compact, deterministic portrait-bust generator in the
   designMe house style (warm, soft, friendly). A simplified take on
   the product's full inline-SVG avatar engine, for previews & kits.
   Usage:  element.innerHTML = dmAvatar({ skin, hairColor, topColor,
           hair, expression, height })
   ============================================================ */
(function () {
  let UID = 0;
  function shade(hex, amt) {
    // amt -1..1 ; + toward white, - toward black
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16 & 255,
      g = n >> 8 & 255,
      b = n & 255;
    const t = amt < 0 ? 0 : 255,
      p = Math.abs(amt);
    r = Math.round((t - r) * p + r);
    g = Math.round((t - g) * p + g);
    b = Math.round((t - b) * p + b);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function hairShape(style, hc, id) {
    const f = `fill="url(#hair_${id})"`;
    switch (style) {
      case "bun":
        return `<circle cx="100" cy="36" r="15" ${f}/>
                <path ${f} d="M52 92 C52 52 70 36 100 36 C130 36 148 52 148 92 C140 70 122 60 100 60 C78 60 60 70 52 92 Z"/>`;
      case "crop":
        return `<path ${f} d="M56 86 C56 50 76 40 100 40 C124 40 144 50 144 86 C136 66 120 58 100 58 C80 58 64 66 56 86 Z"/>`;
      case "curls":
        {
          let c = `<g ${f}>`;
          [[62, 60, 24], [82, 44, 25], [100, 38, 27], [118, 44, 25], [138, 60, 24], [54, 90, 22], [146, 90, 22]].forEach(p => c += `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}"/>`);
          return c + `</g>`;
        }
      case "coily":
        {
          let c = `<g ${f}>`;
          [[60, 56, 26], [82, 40, 26], [100, 34, 29], [118, 40, 26], [140, 56, 26], [50, 88, 24], [150, 88, 24], [58, 116, 20], [142, 116, 20]].forEach(p => c += `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}"/>`);
          return c + `</g>`;
        }
      case "braids":
        return `<path ${f} d="M52 92 C50 54 70 40 100 40 C130 40 150 54 148 92 C140 70 122 60 100 60 C78 60 60 70 52 92 Z"/>
                <g ${f}><rect x="44" y="78" width="14" height="120" rx="7"/><rect x="142" y="78" width="14" height="120" rx="7"/></g>`;
      case "long":
        return `<path ${f} d="M48 96 C44 56 66 38 100 38 C134 38 156 56 152 96 C152 150 150 190 146 210 L132 210 C140 170 138 120 130 96 C122 74 116 64 100 64 C84 64 78 74 70 96 C62 120 60 170 68 210 L54 210 C50 190 48 150 48 96 Z"/>`;
      default:
        // waves
        return `<path ${f} d="M50 96 C48 54 68 38 100 38 C132 38 152 54 150 96 C150 130 144 160 138 184 L124 184 C134 150 132 118 126 96 C118 74 114 64 100 64 C86 64 82 74 74 96 C68 118 66 150 76 184 L62 184 C56 160 50 130 50 96 Z"/>`;
    }
  }
  function glassesSvg(style) {
    if (!style || style === "none") return "";
    const st = "#3a3330";
    const lens = cx => {
      if (style === "round") return `<circle cx="${cx}" cy="122" r="11" fill="#fff" fill-opacity=".10" stroke="${st}" stroke-width="3"/>`;
      if (style === "cat") return `<path d="M${cx - 11} 119 Q${cx - 11} 113 ${cx} 114 Q${cx + 11} 115 ${cx + 11} 122 Q${cx + 11} 131 ${cx} 131 Q${cx - 11} 131 ${cx - 11} 119 Z" fill="#fff" fill-opacity=".10" stroke="${st}" stroke-width="3"/>`;
      return `<rect x="${cx - 11}" y="113" width="22" height="18" rx="5" fill="#fff" fill-opacity=".10" stroke="${st}" stroke-width="3"/>`;
    };
    return `<g>${lens(88)}${lens(112)}<path d="M99 121 H101" stroke="${st}" stroke-width="3"/><path d="M77 119 L70 117M123 119 L130 117" stroke="${st}" stroke-width="3" stroke-linecap="round"/></g>`;
  }
  function hearingSvg(style) {
    if (!style || style === "none") return "";
    const c = style === "cochlear" ? "#6f8a9b" : "#cdbfb0";
    const cd = style === "cochlear" ? "#4f6678" : "#a89a86";
    const ear = (x, dir) => {
      const o = dir * 7; // outward offset
      return `<g><path d="M${x + o - dir * 1} 112 Q${x + o + dir * 5} 112 ${x + o + dir * 5} 120 Q${x + o + dir * 5} 128 ${x + o} 128" fill="none" stroke="${c}" stroke-width="3.6" stroke-linecap="round"/><circle cx="${x + o + dir * 3}" cy="120" r="3.2" fill="${cd}"/>${style === "cochlear" ? `<circle cx="${x + o + dir * 2}" cy="104" r="4.2" fill="${c}"/><circle cx="${x + o + dir * 2}" cy="104" r="1.6" fill="${cd}"/><path d="M${x + o + dir * 2} 108 V115" stroke="${c}" stroke-width="2"/>` : ""}</g>`;
    };
    return ear(68, -1) + ear(132, 1);
  }
  function featureSvg(style, skin) {
    if (!style || style === "none") return "";
    if (style === "freckles") {
      let s = `<g fill="${shade(skin, -0.18)}" opacity=".5">`;
      [[80, 133], [84, 137], [88, 132], [112, 132], [116, 137], [120, 133], [100, 141], [95, 138], [105, 138]].forEach(p => s += `<circle cx="${p[0]}" cy="${p[1]}" r="1.5"/>`);
      return s + `</g>`;
    }
    if (style === "vitiligo") {
      const v = shade(skin, 0.55);
      return `<g fill="${v}" opacity=".85"><path d="M82 126 Q91 124 89 137 Q82 142 78 135 Q78 129 82 126 Z"/><circle cx="119" cy="139" r="6.5"/><path d="M106 108 Q113 107 112 116 Q107 120 103 116 Q103 110 106 108 Z"/></g>`;
    }
    return "";
  }
  window.dmAvatar = function dmAvatar(opts) {
    opts = opts || {};
    const skin = opts.skin || "#e0a877";
    const hc = opts.hairColor || "#2e221b";
    const tc = opts.topColor || "#6f8f6a";
    const hair = opts.hair || "waves";
    const expr = opts.expression || "smile";
    const glasses = opts.glasses || "none";
    const hearing = opts.hearing || "none";
    const feature = opts.feature || "none";
    const h = opts.height || 200;
    const id = "a" + ++UID;
    const mouth = expr === "soft" ? `<path d="M88 150 Q100 156 112 150" fill="none" stroke="${shade(skin, -0.32)}" stroke-width="3" stroke-linecap="round"/>` : expr === "calm" ? `<path d="M90 151 H110" fill="none" stroke="${shade(skin, -0.3)}" stroke-width="3" stroke-linecap="round"/>` : `<path d="M86 148 Q100 160 114 148" fill="none" stroke="${shade(skin, -0.34)}" stroke-width="3.4" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 200 230" height="${h}" width="100%" preserveAspectRatio="xMidYMax meet" style="display:block;overflow:visible" role="img" aria-label="avatar">
  <defs>
    <linearGradient id="skin_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${shade(skin, 0.16)}"/>
      <stop offset=".55" stop-color="${skin}"/>
      <stop offset="1" stop-color="${shade(skin, -0.15)}"/>
    </linearGradient>
    <linearGradient id="hair_${id}" x1="0" y1="0" x2=".25" y2="1">
      <stop offset="0" stop-color="${shade(hc, 0.28)}"/>
      <stop offset=".5" stop-color="${hc}"/>
      <stop offset="1" stop-color="${shade(hc, -0.16)}"/>
    </linearGradient>
    <linearGradient id="top_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${shade(tc, 0.14)}"/>
      <stop offset="1" stop-color="${shade(tc, -0.18)}"/>
    </linearGradient>
    <radialGradient id="blush_${id}" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#d98b76" stop-opacity=".4"/>
      <stop offset="1" stop-color="#d98b76" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- hair back -->
  ${hairShape(hair, hc, id)}
  <!-- shoulders / top -->
  <path fill="url(#top_${id})" d="M42 230 C42 196 64 178 100 178 C136 178 158 196 158 230 Z"/>
  <path fill="${shade(skin, -0.06)}" d="M88 168 H112 V184 C112 192 88 192 88 184 Z"/>
  <!-- head -->
  <path fill="url(#skin_${id})" d="M68 110 C68 78 80 60 100 60 C120 60 132 78 132 110 C132 142 118 162 100 162 C82 162 68 142 68 110 Z"/>
  <!-- ears -->
  <circle cx="68" cy="118" r="8" fill="url(#skin_${id})"/>
  <circle cx="132" cy="118" r="8" fill="url(#skin_${id})"/>
  <!-- blush -->
  <ellipse cx="83" cy="134" rx="9" ry="6" fill="url(#blush_${id})"/>
  <ellipse cx="117" cy="134" rx="9" ry="6" fill="url(#blush_${id})"/>
  <!-- skin feature -->
  ${featureSvg(feature, skin)}
  <!-- hearing tech -->
  ${hearingSvg(hearing)}
  <!-- brows -->
  <path d="M80 112 Q88 108 96 112" fill="none" stroke="${shade(hc, -0.1)}" stroke-width="3" stroke-linecap="round"/>
  <path d="M104 112 Q112 108 120 112" fill="none" stroke="${shade(hc, -0.1)}" stroke-width="3" stroke-linecap="round"/>
  <!-- eyes -->
  <circle cx="88" cy="122" r="4.4" fill="${shade("#3a2c22", 0)}"/>
  <circle cx="112" cy="122" r="4.4" fill="${shade("#3a2c22", 0)}"/>
  <circle cx="89.4" cy="120.6" r="1.4" fill="#fff" opacity=".85"/>
  <circle cx="113.4" cy="120.6" r="1.4" fill="#fff" opacity=".85"/>
  <!-- nose -->
  <path d="M100 126 Q103 134 99 138" fill="none" stroke="${shade(skin, -0.22)}" stroke-width="2.4" stroke-linecap="round"/>
  ${mouth}
  <!-- glasses -->
  ${glassesSvg(glasses)}
  <!-- hair front fringe -->
  <path fill="url(#hair_${id})" d="M70 96 C74 74 86 60 100 60 C114 60 126 74 130 96 C122 84 112 80 100 80 C88 80 78 84 70 96 Z"/>
</svg>`;
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/avatar.js", error: String((e && e.message) || e) }); }

// assets/figure.js
try { (() => {
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
  const R = n => Math.round(n * 10) / 10;
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16 & 255,
      g = n >> 8 & 255,
      b = n & 255;
    const t = amt < 0 ? 0 : 255,
      p = Math.abs(amt);
    r = Math.round((t - r) * p + r);
    g = Math.round((t - g) * p + g);
    b = Math.round((t - b) * p + b);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  const isLight = hex => {
    const n = parseInt(hex.slice(1), 16);
    return 0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255) > 152;
  };
  const STITCH = "#d9b97a"; // denim topstitch gold

  /* ---------------- geometry primitives ---------------- */
  // tapered tube polygon through pts with half-widths ws
  function tube(pts, ws) {
    const n = pts.length,
      Lp = [],
      Rp = [];
    for (let i = 0; i < n; i++) {
      const p0 = pts[Math.max(0, i - 1)],
        p1 = pts[Math.min(n - 1, i + 1)];
      let dx = p1[0] - p0[0],
        dy = p1[1] - p0[1];
      const len = Math.hypot(dx, dy) || 1,
        nx = -dy / len,
        ny = dx / len;
      Lp.push([pts[i][0] + nx * ws[i], pts[i][1] + ny * ws[i]]);
      Rp.push([pts[i][0] - nx * ws[i], pts[i][1] - ny * ws[i]]);
    }
    const seg = P => {
      let d = "";
      if (P.length === 2) d = ` L${R(P[1][0])} ${R(P[1][1])}`;else {
        for (let i = 1; i < P.length - 1; i++) {
          const mx = (P[i][0] + P[i + 1][0]) / 2,
            my = (P[i][1] + P[i + 1][1]) / 2;
          d += ` Q${R(P[i][0])} ${R(P[i][1])} ${R(i === P.length - 2 ? P[i + 1][0] : mx)} ${R(i === P.length - 2 ? P[i + 1][1] : my)}`;
        }
      }
      return d;
    };
    return `M${R(Lp[0][0])} ${R(Lp[0][1])}${seg(Lp)} L${R(Rp[n - 1][0])} ${R(Rp[n - 1][1])}${seg([...Rp].reverse())} Z`;
  }
  // point at fraction t along polyline + width interpolation
  function along(pts, ws, t) {
    const segs = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      segs.push(l);
      total += l;
    }
    let d = t * total;
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i] || i === segs.length - 1) {
        const f = Math.min(1, d / segs[i]);
        const wA = ws[i],
          wB = ws[i + 1];
        return {
          p: [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f],
          w: wA + (wB - wA) * f
        };
      }
      d -= segs[i];
    }
  }
  // sub-tube from 0..f of a polyline (for sleeves)
  function subTube(pts, ws, f) {
    const m = along(pts, ws, f * 0.55),
      e = along(pts, ws, f);
    return tube([pts[0], m.p, e.p], [ws[0], m.w, e.w]);
  }
  const stitch = (d, c, op) => `<path d="${d}" fill="none" stroke="${c || STITCH}" stroke-width="1.3" stroke-dasharray="3.2 2.2" stroke-linecap="round" opacity="${op || .9}"/>`;
  const line = (d, c, w, op) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w || 1.4}" stroke-linecap="round" opacity="${op || 1}"/>`;

  /* ---------------- anatomy ---------------- */
  const BODIES = {
    lean: {
      sh: 40,
      ch: 33,
      wa: 28,
      hp: 35,
      arm: 8,
      leg: 14
    },
    balanced: {
      sh: 45,
      ch: 38,
      wa: 33,
      hp: 43,
      arm: 9.5,
      leg: 17
    },
    broad: {
      sh: 53,
      ch: 45,
      wa: 40,
      hp: 46,
      arm: 11.5,
      leg: 19
    },
    curvy: {
      sh: 45,
      ch: 42,
      wa: 37,
      hp: 54,
      arm: 10.5,
      leg: 21
    },
    full: {
      sh: 53,
      ch: 53,
      wa: 51,
      hp: 58,
      arm: 13.5,
      leg: 24
    }
  };
  const HEIGHTS = {
    shorter: 0.9,
    short: 0.95,
    medium: 1,
    tall: 1.06,
    taller: 1.12
  };
  function anatomy(bodyId, heightId) {
    const B = BODIES[bodyId] || BODIES.balanced;
    const hf = HEIGHTS[heightId] || 1;
    const cx = 120;
    const hip = 246;
    const lo = y => hip + (y - hip) * hf;
    const K = {
      cx,
      hf,
      ...B,
      headCy: 56,
      headRx: 25,
      headRy: 29,
      chin: 85,
      neckW: 11.5,
      neckTop: 82,
      neckBot: 104,
      shoulder: 114,
      chest: 158,
      waist: 204,
      hip,
      crotch: hip + 22,
      knee: lo(356),
      ankle: lo(452),
      floor: lo(452) + 30,
      elbow: 196,
      wrist: lo(254)
    };
    K.thighCx = B.hp * 0.52;
    K.kneeCx = B.hp * 0.46;
    K.ankCx = B.hp * 0.42;
    K.thW = B.leg;
    K.kneeW = B.leg * 0.68;
    K.ankW = Math.max(5.5, B.leg * 0.4);
    K.legPts = s => [[cx + s * K.thighCx, K.hip + 6], [cx + s * K.kneeCx, K.knee], [cx + s * K.ankCx, K.ankle]];
    K.legWs = [K.thW, K.kneeW, K.ankW];
    K.armPts = s => [[cx + s * (B.sh - 2), K.shoulder + 9], [cx + s * Math.max(B.wa + 12, B.sh + 2), K.elbow + 8], [cx + s * (B.hp + 9), K.wrist]];
    K.armWs = [B.arm, B.arm * 0.82, B.arm * 0.58];
    return K;
  }

  /* ============================================================ */
  window.dmFigure = function dmFigure(o) {
    o = o || {};
    const id = "f" + ++UID;
    const skin = o.skin || "#c99a6e",
      hairC = o.hairColor || "#2e221b",
      hair = o.hair || "waves";
    const top = o.top || {
      sleeve: "short",
      len: "hip",
      neck: "crew",
      fit: "relaxed"
    };
    const bottom = o.bottom || {
      type: "wide"
    };
    const topC = o.topColor || "#8aa382",
      botC = o.bottomColor || "#5a6f8c";
    const shoes = o.shoes || "sneaker",
      expr = o.expression || "smile";
    const K = anatomy(o.body, o.height);
    const cx = K.cx;
    const P = (s, x, y) => `${R(cx + s * x)} ${R(y)}`;
    const grad = (gid, c, lift = 0.15, drop = 0.15) => `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, lift)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -drop)}"/></linearGradient>`;
    const fSkin = `url(#sk_${id})`,
      fTop = `url(#tp_${id})`,
      fBot = `url(#bt_${id})`,
      fHair = `url(#hr_${id})`;
    const sideShade = d => `<path d="${d}" fill="url(#sx_${id})"/>`;

    /* ---------------- person ---------------- */
    const torsoPath = () => `M${P(-1, K.sh, K.shoulder)} C${P(-1, K.ch + 3, K.chest - 14)} ${P(-1, K.ch, K.chest)} ${P(-1, K.wa + 1, K.waist - 10)}` + ` C${P(-1, K.wa, K.waist)} ${P(-1, K.hp - 3, K.hip - 16)} ${P(-1, K.hp, K.hip + 2)} L${P(1, K.hp, K.hip + 2)}` + ` C${P(1, K.hp - 3, K.hip - 16)} ${P(1, K.wa, K.waist)} ${P(1, K.wa + 1, K.waist - 10)}` + ` C${P(1, K.ch, K.chest)} ${P(1, K.ch + 3, K.chest - 14)} ${P(1, K.sh, K.shoulder)}` + ` C${P(1, K.sh - 7, K.shoulder - 9)} ${P(1, K.neckW + 5, K.neckBot)} ${P(1, K.neckW, K.neckBot - 2)}` + ` L${P(-1, K.neckW, K.neckBot - 2)} C${P(-1, K.neckW + 5, K.neckBot)} ${P(-1, K.sh - 7, K.shoulder - 9)} ${P(-1, K.sh, K.shoulder)} Z`;
    const footSkin = s => {
      const ax = cx + s * K.ankCx;
      return `<path d="M${ax - 9} ${K.ankle - 4} h18 q3 14 1 22 h-20 q-2 -8 1 -22 z" fill="${fSkin}"/>`;
    };

    /* ---------------- SHOES ---------------- */
    function drawShoes() {
      const dk = "#352e28",
        crm = "#f6f1e7";
      const one = s => {
        const ax = cx + s * K.ankCx,
          fl = K.floor;
        if (shoes === "boot") return `<path d="M${ax - 11} ${K.ankle - 12} h22 v22 q0 8 -8 8 h-14 q-8 0 -8 -7 q0 -4 8 -5 z" fill="url(#sh_${id})"/>
                  <path d="M${ax - 19} ${fl - 6} h30 q4 0 4 3 t-4 3 h-30 q-4 0 -4 -3 t4 -3 z" fill="${dk}"/>
                  ${line(`M${ax - 11} ${K.ankle - 2} h22`, shade(dk, 0.25), 1.2, .8)}`;
        if (shoes === "heel") return `<path d="M${ax - 8} ${K.ankle - 2} q8 -3 16 0 l6 18 q1 4 -3 4 h-8 l-4 -8 -3 8 h-8 q-3 0 -2 -4 z" fill="url(#sh_${id})"/>
                  <rect x="${ax + 7}" y="${fl - 12}" width="3.4" height="12" rx="1.4" fill="${dk}"/>
                  ${line(`M${ax - 8} ${K.ankle + 1} q8 -3 16 0`, shade(dk, 0.3), 1.2, .7)}`;
        if (shoes === "loafer") return footSkin(s) + `<path d="M${ax - 10} ${fl - 16} q10 -5 20 0 l1 8 q0 8 -8 8 h-12 q-7 0 -7 -7 q0 -5 6 -9 z" fill="url(#sh_${id})"/>
                  <path d="M${ax - 5} ${fl - 14} q5 -2.6 10 0 l-1 4 q-4 -2 -8 0 z" fill="${shade("#473b30", 0.18)}"/>
                  <path d="M${ax - 12} ${fl - 4} h25 q3 0 3 2 t-3 2 h-25 q-3 0 -3 -2 t3 -2 z" fill="${dk}"/>`;
        if (shoes === "slide") return footSkin(s) + `<path d="M${ax - 12} ${fl - 15} q12 6 24 0 l-2 7 h-20 z" fill="${shade(botC, -0.18)}"/>
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
      const dk = shade(botC, -0.2),
        lt = shade(botC, 0.25);
      const denim = !!bottom.denim;
      const e = {
        wide: 9,
        barrel: 7,
        cargo: 8,
        track: 6,
        parachute: 11,
        legg: 1,
        shorts: 7,
        jorts: 9,
        skirt: 0
      }[t] ?? 7;
      const wbTop = K.waist + 2,
        wbBot = K.waist + 13,
        hpe = K.hp + Math.max(2, e - 2);
      let s = "";

      // waistband (shared by everything)
      const wb = `M${P(-1, hpe * 0.92, wbTop)} Q${cx} ${wbTop - 4} ${P(1, hpe * 0.92, wbTop)} L${P(1, hpe * 0.96, wbBot)} Q${cx} ${wbBot + 3} ${P(-1, hpe * 0.96, wbBot)} Z`;
      if (t === "skirt") {
        const hemY = bottom.maxi ? K.ankle + 4 : bottom.midi ? K.knee + (K.ankle - K.knee) * 0.35 : K.knee - 10;
        const hemW = hpe + (bottom.maxi ? 16 : 22) + (bottom.pleated ? 4 : 0);
        const body = `M${P(-1, hpe * 0.94, wbBot - 2)} C${P(-1, K.hp + 4, K.hip)} ${P(-1, hemW * 0.86, hemY - (hemY - K.hip) * 0.4)} ${P(-1, hemW, hemY - 4)} Q${cx} ${hemY + 12} ${P(1, hemW, hemY - 4)} C${P(1, hemW * 0.86, hemY - (hemY - K.hip) * 0.4)} ${P(1, K.hp + 4, K.hip)} ${P(1, hpe * 0.94, wbBot - 2)} Z`;
        s += `<path d="${body}" fill="${fBot}"/>` + sideShade(body);
        if (bottom.pleated) {
          for (let i = -3; i <= 3; i++) {
            const x0 = cx + i * (hpe * 0.27),
              x1 = cx + i * (hemW / 3.6);
            s += line(`M${x0} ${wbBot + 4} L${x1} ${hemY + (Math.abs(i) === 3 ? 0 : 6)}`, i % 2 ? dk : lt, 1.3, .45);
          }
        }
        if (bottom.cargo) {
          const px = hemW * 0.62,
            py = K.hip + 30;
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
      const hemYs = {
        shorts: K.hip + (K.knee - K.hip) * 0.42,
        jorts: K.knee + 6
      };
      const hemY = hemYs[t] != null ? hemYs[t] : t === "track" || t === "parachute" ? K.ankle - 2 : K.ankle + 8;
      const thE = K.thW + e,
        kneeE = K.kneeW + e + (t === "wide" ? 6 : t === "parachute" ? 10 : t === "barrel" ? 9 : t === "jorts" ? 4 : 2);
      const hemW = {
        wide: thE + 4,
        barrel: K.ankW + 6,
        cargo: K.kneeW + 6,
        track: K.ankW + 4,
        parachute: K.ankW + 4.5,
        legg: K.ankW + 1.5,
        shorts: thE + 2,
        jorts: thE + 3
      }[t] ?? K.kneeW + 5;
      const legPath = sd => {
        let pts, ws;
        const hx = K.thighCx,
          kx = t === "wide" || t === "parachute" ? K.thighCx : K.kneeCx,
          ax = t === "wide" ? K.thighCx : K.ankCx + 1;
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
        return {
          d: tube(pts, ws),
          pts,
          ws
        };
      };

      // seat panel joins legs under the waistband
      const seat = `M${P(-1, hpe * 0.96, wbBot - 2)} L${P(-1, hpe, K.hip - 2)} Q${P(-1, hpe * 0.8, K.crotch + 4)} ${P(-1, K.thighCx * 0.4, K.crotch + 8)} Q${cx} ${K.crotch + 12} ${P(1, K.thighCx * 0.4, K.crotch + 8)} Q${P(1, hpe * 0.8, K.crotch + 4)} ${P(1, hpe, K.hip - 2)} L${P(1, hpe * 0.96, wbBot - 2)} Z`;
      const Lg = legPath(-1),
        Rg = legPath(1);
      s += `<path d="${seat}" fill="${fBot}"/><path d="${Lg.d}" fill="${fBot}"/><path d="${Rg.d}" fill="${fBot}"/>`;
      s += sideShade(seat) + sideShade(Lg.d) + sideShade(Rg.d);
      // inseam: when wide legs overlap at center, draw the split crease so it reads as pants
      s += line(`M${cx} ${K.crotch + 10} L${cx} ${K.crotch + 16}`, dk, 2, .3);
      if (thE > K.thighCx - 2 && t !== "shorts" && t !== "jorts") s += line(`M${cx} ${K.crotch + 14} L${cx} ${hemY - 5}`, shade(botC, -0.26), 2.4, .35);

      /* ---- shared garment-language details ---- */
      // hem treatment
      if (t === "track" || t === "parachute") {
        [Lg, Rg].forEach((g, i) => {
          const sd = i === 0 ? -1 : 1,
            ex = g.pts[g.pts.length - 1][0];
          s += `<rect x="${ex - hemW}" y="${hemY - 9}" width="${hemW * 2}" height="11" rx="4" fill="${dk}"/>`;
          for (let k = -2; k <= 2; k++) s += line(`M${ex + k * (hemW / 3)} ${hemY - 8} v9`, shade(botC, -0.34), 1, .5);
          if (t === "parachute") for (let r = 1; r <= 3; r++) s += line(`M${ex - hemW * 1.02} ${hemY - 9 - r * 9} Q${ex} ${hemY - 4 - r * 9} ${ex + hemW * 1.02} ${hemY - 9 - r * 9}`, dk, 1.2, .35);
        });
      } else if (t === "jorts") {
        [Lg, Rg].forEach(g => {
          const ex = g.pts[g.pts.length - 1][0];
          s += line(`M${ex - hemW + 2} ${hemY - 1} h${hemW * 2 - 4}`, shade(botC, 0.3), 2.2, .8);
          for (let k = -3; k <= 3; k++) s += line(`M${ex + k * (hemW / 3.6)} ${hemY} v3.4`, shade(botC, 0.32), 1.1, .75);
        });
      } else if (t !== "legg") {
        [Lg, Rg].forEach(g => {
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
          s += t === "track" ? line(d, shade(botC, 0.45), 2.6, .9) : line(d, dk, 1.1, .35);
        });
      }
      // denim package: jeans get gold topstitch, pockets, fly, belt loops
      if (denim) {
        s += stitch(`M${P(-1, hpe * 0.9, wbBot + 2)} Q${cx} ${wbBot + 6} ${P(1, hpe * 0.9, wbBot + 2)}`);
        s += stitch(`M${cx - 1} ${wbBot + 2} q-5 10 -1 22`); // fly J
        [[-1], [1]].forEach(([sd]) => {
          s += stitch(`M${P(sd, hpe * 0.82, wbBot + 3)} Q${P(sd, hpe * 0.45, K.hip - 6)} ${P(sd, K.thighCx * 0.55, K.hip + 1)}`); // hip pocket curve
        });
        [-0.6, 0, 0.6].forEach(f => s += `<rect x="${cx + f * hpe * 0.9 - 2}" y="${wbTop + 1}" width="4" height="10" rx="1.4" fill="${dk}"/>`);
      }
      // cargo pockets
      if (t === "cargo" || bottom.cargo) {
        [[-1, Lg], [1, Rg]].forEach(([sd, g]) => {
          const m = along(g.pts, g.ws, 0.42);
          s += `<path d="M${m.p[0] - 13} ${m.p[1] - 4} h26 v4 h-26 z" fill="${dk}"/>
                <path d="M${m.p[0] - 12} ${m.p[1]} h24 v20 q0 4 -4 4 h-16 q-4 0 -4 -4 z" fill="${shade(botC, -0.1)}"/>` + stitch(`M${m.p[0] - 9} ${m.p[1] + 4} v14`, shade(botC, -0.4), .6) + stitch(`M${m.p[0] + 9} ${m.p[1] + 4} v14`, shade(botC, -0.4), .6);
        });
      }
      // waistband on top
      s += `<path d="${wb}" fill="${shade(botC, -0.12)}"/>`;
      if (t === "track" || t === "parachute") s += line(`M${cx - 10} ${wbTop + 6} h7 M${cx + 3} ${wbTop + 6} h7`, shade(botC, 0.4), 1.6, .9) + `<circle cx="${cx - 1}" cy="${wbTop + 6}" r="1.3" fill="${shade(botC, 0.4)}"/><circle cx="${cx + 1.6}" cy="${wbTop + 6}" r="1.3" fill="${shade(botC, 0.4)}"/>`;
      return s;
    }

    /* ---------------- TOP ---------------- */
    function drawTop() {
      const sleeve = top.sleeve || "short",
        len = top.len || "hip",
        neck = top.neck || "crew",
        fit = top.fit || "relaxed";
      const dk = shade(topC, -0.18),
        lt = shade(topC, 0.26);
      const eS = {
        fitted: 2,
        relaxed: 7,
        oversized: 13,
        boxy: 11,
        drape: 5
      }[fit] ?? 7;
      const straight = fit === "oversized" || fit === "boxy";
      const hemY = {
        crop: K.waist - 8,
        boxy: K.hip,
        hip: K.hip + 16,
        long: K.hip + 50,
        dress: K.knee + 16
      }[len] ?? K.hip + 14;
      const shE = K.sh + eS * 0.7,
        nk = 12.5,
        nckY = K.neckBot - 3;
      const chE = straight ? shE + 1 : K.ch + eS;
      const hemW = len === "dress" || fit === "drape" ? K.hp + eS + 12 : straight ? shE + 1.5 : Math.max(K.wa, len === "crop" ? K.wa : K.hp) + eS;
      const sleeveless = sleeve === "tank" || sleeve === "strap";
      const shTipX = sleeveless ? K.sh - 9 : shE;

      // neckline (closing edge, right → left)
      let neckEdge; // closing edge: we arrive at the LEFT neck point, curve back to the RIGHT neck start
      if (neck === "v") neckEdge = `L${cx} ${nckY + 27} Z`;else if (neck === "scoop") neckEdge = `Q${cx} ${nckY + 24} ${P(1, nk, nckY + 3)} Z`;else if (neck === "high") neckEdge = `Q${cx} ${nckY + 6} ${P(1, nk - 3, nckY)} Z`;else neckEdge = `Q${cx} ${nckY + 12} ${P(1, nk, nckY + 1)} Z`;
      const neckStartR = neck === "v" ? `M${P(1, nk, nckY + 1)}` : neck === "scoop" ? `M${P(1, nk, nckY + 3)}` : neck === "high" ? `M${P(1, nk - 3, nckY)}` : `M${P(1, nk, nckY + 1)}`;

      // bodice: right neck → right shoulder → right side → hem → left side → left shoulder → neckline
      const side = sd => straight ? `C${P(sd, shE + 0.5, K.chest)} ${P(sd, hemW, (K.chest + hemY) / 2)} ${P(sd, hemW, hemY - 6)}` : fit === "drape" ? `C${P(sd, chE, K.chest)} ${P(sd, hemW * 0.9, (K.chest + hemY) / 2)} ${P(sd, hemW, hemY - 8)}` : `C${P(sd, chE, K.chest)} ${P(sd, fit === "fitted" ? K.wa + eS : K.wa + eS + 3, K.waist)} ${P(sd, hemW, hemY - 6)}`;
      const hemCurve = `Q${cx} ${hemY + (len === "dress" || fit === "drape" ? 10 : 5)} ${P(-1, hemW, hemY - 6)}`;
      let bodice;
      if (sleeve === "strap") {
        const bustY = K.chest - 16;
        // right top edge → right side → hem → left side → sweetheart top edge
        bodice = `M${P(1, K.ch + 2, bustY)} ${side(1)} ${hemCurve} ${revSide(-1, bustY)} Q${cx} ${bustY + 6} ${P(1, K.ch + 2, bustY)} Z`;
      } else {
        const shoulderEdge = sd => `Q${P(sd, nk + (shTipX - nk) * 0.45, nckY - 2)} ${P(sd, shTipX, K.shoulder + (sleeveless ? 3 : 1))}`;
        const armhole = sleeveless ? sd => ` C${P(sd, K.ch * 0.93, K.shoulder + 16)} ${P(sd, K.ch * 0.9, K.chest - 8)} ${P(sd, K.ch * 0.94, K.chest)}` : () => "";
        bodice = `${neckStartR} ${shoulderEdge(1)} ${armhole(1)} ${sleeveless ? sideFrom(1) : side(1)} ${hemCurve} ${sleeveless ? sideTo(-1) : revSideFull(-1)} ${armholeRev(-1)} ${shoulderEdgeBack(-1)} ${neckEdge}`;
      }

      // --- helper closures for path assembly (kept tiny & local) ---
      function revSide(sd, bustY) {
        return straight ? `C${P(sd, hemW, (K.chest + hemY) / 2)} ${P(sd, chE, K.chest + 6)} ${P(sd, K.ch + 2, bustY)}` : `C${P(sd, fit === "fitted" ? K.wa + eS : K.wa + eS + 3, K.waist)} ${P(sd, chE, K.chest + 4)} ${P(sd, K.ch + 2, bustY)}`;
      }
      function sideFrom(sd) {
        return `C${P(sd, K.ch * 0.96 + eS * 0.4, K.chest + 20)} ${P(sd, fit === "fitted" ? K.wa + 2 : K.wa + eS, K.waist)} ${P(sd, hemW, hemY - 6)}`;
      }
      function sideTo(sd) {
        return `C${P(sd, fit === "fitted" ? K.wa + 2 : K.wa + eS, K.waist)} ${P(sd, K.ch * 0.96 + eS * 0.4, K.chest + 20)} ${P(sd, K.ch * 0.94, K.chest)}`;
      }
      function armholeRev(sd) {
        return sleeveless ? ` C${P(sd, K.ch * 0.9, K.chest - 8)} ${P(sd, K.ch * 0.93, K.shoulder + 16)} ${P(sd, shTipX, K.shoulder + 3)}` : "";
      }
      function revSideFull(sd) {
        return straight ? `C${P(sd, hemW, (K.chest + hemY) / 2)} ${P(sd, shE + 0.5, K.chest)} ${P(sd, shTipX, K.shoulder + 1)}` : fit === "drape" ? `C${P(sd, hemW * 0.9, (K.chest + hemY) / 2)} ${P(sd, chE, K.chest)} ${P(sd, shTipX, K.shoulder + 1)}` : `C${P(sd, fit === "fitted" ? K.wa + eS : K.wa + eS + 3, K.waist)} ${P(sd, chE, K.chest)} ${P(sd, shTipX, K.shoulder + 1)}`;
      }
      function shoulderEdgeBack(sd) {
        return `Q${P(sd, nk + (shTipX - nk) * 0.45, nckY - 2)} ${P(sd, nk + (neck === "asym" ? 8 : 0), nckY + 1)}`;
      }
      let s = "";
      const sleeveDs = [];
      // hood (behind shoulders, before bodice)
      if (top.hood) s += `<path d="M${P(-1, 24, K.shoulder + 4)} Q${cx} ${K.chest + 10} ${P(1, 24, K.shoulder + 4)} Q${P(1, 30, K.neckTop - 4)} ${cx} ${K.neckTop - 10} Q${P(-1, 30, K.neckTop - 4)} ${P(-1, 24, K.shoulder + 4)} Z" fill="${dk}"/>` + `<path d="M${P(-1, 16, K.shoulder + 2)} Q${cx} ${K.chest} ${P(1, 16, K.shoulder + 2)} Q${cx} ${K.neckBot - 4} ${P(-1, 16, K.shoulder + 2)} Z" fill="${shade(topC, -0.32)}"/>`;

      // under-hem contact shadow (sits on the bottom garment)
      if (len !== "dress") s += `<ellipse cx="${cx}" cy="${hemY + 2}" rx="${hemW - 8}" ry="5.5" fill="#2c2118" opacity=".10"/>`;
      s += `<path d="${bodice}" fill="${fTop}"/>` + sideShade(bodice);

      // straps
      if (sleeve === "strap") {
        s += line(`M${P(-1, nk + 2, K.shoulder - 4)} L${P(-1, K.ch - 4, K.chest - 15)}`, topC, 4.6) + line(`M${P(1, nk + 2, K.shoulder - 4)} L${P(1, K.ch - 4, K.chest - 15)}`, topC, 4.6);
      }

      // sleeves
      const fr = {
        short: 0.42,
        long: 0.97
      }[sleeve];
      if (fr) {
        [[-1], [1]].forEach(([sd]) => {
          const pts = K.armPts(sd),
            ws = K.armWs.map(w => w + eS * 0.45 + 1.5);
          const d = subTube(pts, ws, fr);
          sleeveDs.push(d);
          s += `<path d="${d}" fill="${fTop}"/>`;
          const end = along(pts, ws, fr);
          if (sleeve === "long") {
            const cuff = subTube(pts, ws.map(w => w - 0.4), fr);
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
        s += `<path d="M${P(-1, 14, K.chin + 1)} q${-1} 16 1 20 L${P(1, 15, K.chin + 21)} q2 -4 1 -20 q-15 -5 -30 0 z" fill="${fTop}"/>` + line(`M${P(-1, 13.4, K.chin + 12)} q14.6 4 29.2 0`, dk, 1.3, .4);
        for (let i = -2; i <= 2; i++) s += line(`M${cx + i * 6} ${K.chin + 3} v16`, dk, 1.1, .3);
      }
      if (neck === "collar") {
        s += `<path d="M${P(-1, nk + 1, nckY)} L${cx - 2.5} ${nckY + 17} L${P(-1, nk + 11, K.shoulder + 9)} Q${P(-1, nk + 13, nckY + 3)} ${P(-1, nk + 1, nckY)} Z" fill="${shade(topC, 0.08)}" stroke="${dk}" stroke-width="1" stroke-opacity=".4"/>
              <path d="M${P(1, nk + 1, nckY)} L${cx + 2.5} ${nckY + 17} L${P(1, nk + 11, K.shoulder + 9)} Q${P(1, nk + 13, nckY + 3)} ${P(1, nk + 1, nckY)} Z" fill="${shade(topC, 0.08)}" stroke="${dk}" stroke-width="1" stroke-opacity=".4"/>
              <path d="M${P(-1, nk, nckY - 1)} Q${cx} ${nckY + 7} ${P(1, nk, nckY - 1)} l0 3 Q${cx} ${nckY + 10} ${P(-1, nk, nckY + 2)} z" fill="${shade(topC, -0.08)}"/>`;
      }
      // placket + buttons / zip
      if (top.placket || top.zip) {
        const y0 = neck === "collar" ? nckY + 16 : nckY + 14,
          y1 = hemY - 8;
        if (top.zip) {
          s += line(`M${cx} ${y0} L${cx} ${y1}`, shade(topC, -0.3), 3, .8) + line(`M${cx} ${y0} L${cx} ${y1}`, lt, 1.1, .9) + `<rect x="${cx - 1.6}" y="${y0 + 6}" width="3.2" height="7" rx="1.4" fill="${shade(topC, -0.42)}"/>`;
        } else {
          s += line(`M${cx + (top.placket ? 0 : 0)} ${y0} L${cx} ${y1}`, dk, 1.2, .5);
          const n = Math.max(3, Math.floor((y1 - y0) / 24));
          for (let i = 0; i <= n; i++) s += `<circle cx="${cx}" cy="${y0 + 6 + i * ((y1 - y0 - 10) / n)}" r="1.9" fill="${dk}"/>`;
        }
      }
      // kangaroo pocket
      if (top.pocket) s += `<path d="M${cx - 23} ${hemY - 42} h46 l-4 28 q-19 7 -38 0 z" fill="${shade(topC, -0.08)}"/>` + line(`M${cx - 23} ${hemY - 42} l5 26 M${cx + 23} ${hemY - 42} l-5 26`, dk, 1.2, .5);
      // hem rib
      if (top.rib && len !== "dress") {
        s += `<path d="M${P(-1, hemW - 1, hemY - 12)} Q${cx} ${hemY - 7} ${P(1, hemW - 1, hemY - 12)} L${P(1, hemW - 0.5, hemY - 5)} Q${cx} ${hemY + 1} ${P(-1, hemW - 0.5, hemY - 5)} Z" fill="${dk}" opacity=".6"/>`;
        for (let x = -hemW + 8; x < hemW - 6; x += 6) s += line(`M${cx + x} ${hemY - 11} v7`, dk, 1, .35);
      }
      // chunky knit rows
      if (top.chunky) for (let y = K.chest + 8; y < hemY - 12; y += 12) s += line(`M${P(-1, chE - 5, y)} Q${cx} ${y + 5} ${P(1, chE - 5, y)}`, dk, 1.2, .22);
      // graphic print
      if (top.graphic) s += `<rect x="${cx - 13}" y="${K.chest - 4}" width="26" height="19" rx="3.5" fill="${isLight(topC) ? "#3a342e" : "#efe7d9"}" opacity=".85"/>
        <rect x="${cx - 9}" y="${K.chest}" width="18" height="3" rx="1.5" fill="${isLight(topC) ? "#efe7d9" : "#3a342e"}" opacity=".7"/>
        <rect x="${cx - 9}" y="${K.chest + 6}" width="12" height="3" rx="1.5" fill="${isLight(topC) ? "#efe7d9" : "#3a342e"}" opacity=".5"/>`;
      // corset seams
      if (top.corset) {
        [-0.62, -0.21, 0.21, 0.62].forEach(f => s += line(`M${cx + f * K.ch} ${K.chest - 10} L${cx + f * K.wa * 1.05} ${hemY - 6}`, dk, 1.2, .5));
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
      if (top.hood) s += line(`M${cx - 7} ${K.neckBot + 14} q-1.5 10 1 16 M${cx + 7} ${K.neckBot + 14} q1.5 10 -1 16`, dk, 2, .8) + `<circle cx="${cx - 6}" cy="${K.neckBot + 31}" r="1.6" fill="${dk}"/><circle cx="${cx + 6}" cy="${K.neckBot + 31}" r="1.6" fill="${dk}"/>`;
      // patterns (clipped to bodice + sleeves)
      if (top.pattern && top.pattern !== "none") {
        const pc = isLight(topC) ? shade(topC, -0.32) : shade(topC, 0.32);
        let pl = "";
        const x0 = cx - (shE + 16),
          x1 = cx + (shE + 16);
        if (top.pattern === "stripe") {
          for (let y = nckY + 14; y < hemY; y += 11) pl += line(`M${x0} ${y} L${x1} ${y}`, pc, 3.6, .42);
        } else if (top.pattern === "plaid") {
          for (let y = nckY + 12; y < hemY; y += 14) pl += line(`M${x0} ${y} L${x1} ${y}`, pc, 2.6, .38);
          for (let x = -shE - 4; x <= shE + 4; x += 14) pl += line(`M${cx + x} ${nckY - 4} L${cx + x} ${hemY}`, pc, 2.6, .28);
        }
        s += `<clipPath id="tc_${id}"><path d="${bodice}"/>${sleeveDs.map(d => `<path d="${d}"/>`).join("")}</clipPath><g clip-path="url(#tc_${id})">${pl}</g>`;
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
      const shL = K.sh + eL * 0.8,
        hemWL = shL + 2,
        inX = 8.5;
      const fLy = `url(#ly_${id})`;
      let s = `<ellipse cx="${cx}" cy="${K.shoulder + 18}" rx="${K.sh}" ry="10" fill="#2c2118" opacity=".07"/>`;
      const panel = sd => `M${P(sd, 11, K.neckBot - 1)} Q${P(sd, (11 + shL) / 2, K.neckBot - 4)} ${P(sd, shL, K.shoulder + 2)}` + ` C${P(sd, shL + 1, K.chest)} ${P(sd, hemWL, (K.chest + hemY) / 2)} ${P(sd, hemWL, hemY - 5)}` + ` Q${P(sd, hemWL - 1, hemY)} ${P(sd, hemWL - 5, hemY)} L${P(sd, inX, hemY)} L${P(sd, inX, K.chest - 16)} Z`;
      const pL = panel(-1),
        pR = panel(1);
      s += `<path d="${pL}" fill="${fLy}"/><path d="${pR}" fill="${fLy}"/>` + sideShade(pL) + sideShade(pR);
      [[-1], [1]].forEach(([sd]) => {
        const pts = K.armPts(sd),
          ws = K.armWs.map(w => w + eL * 0.5 + 2.5);
        const d = subTube(pts, ws, 0.97);
        s += `<path d="${d}" fill="${fLy}"/>`;
        const end = along(pts, ws, 0.97),
          c0 = along(pts, ws, 0.87);
        if (st === "puffer" || st === "denim") s += `<path d="${tube([c0.p, end.p], [c0.w - 0.3, end.w - 0.5])}" fill="${dk}" opacity=".7"/>`;else s += line(`M${end.p[0] - end.w + 1} ${end.p[1]} L${end.p[0] + end.w - 1} ${end.p[1]}`, dk, 1.4, .45);
      });
      // open-front inner edges
      s += line(`M${P(-1, inX, K.chest - 14)} L${P(-1, inX, hemY - 2)}`, dk, 1.4, .4) + line(`M${P(1, inX, K.chest - 14)} L${P(1, inX, hemY - 2)}`, dk, 1.4, .4);
      if (st === "denim") {
        s += `<path d="M${P(-1, 12, K.neckBot - 2)} L${P(-1, 4, K.chest - 24)} L${P(-1, 20, K.chest - 26)} Z" fill="${dk}"/>
              <path d="M${P(1, 12, K.neckBot - 2)} L${P(1, 4, K.chest - 24)} L${P(1, 20, K.chest - 26)} Z" fill="${dk}"/>`;
        [[-1], [1]].forEach(([sd]) => {
          s += `<path d="M${P(sd, shL * 0.55 + 8, K.chest - 4)} h${-sd * 16} v3.4 h${sd * 16} z" fill="${dk}"/>` + stitch(`M${P(sd, shL * 0.55 + 6, K.chest + 3)} h${-sd * 13}`) + stitch(`M${P(sd, hemWL - 4, hemY - 7)} L${P(sd, inX + 4, hemY - 7)}`);
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
        return line(`M${P(-1, K.sh - 8, K.shoulder + 2)} L${P(1, K.hp - 2, K.hip + 4)}`, dk, 4, .95) + `<path d="M${P(1, K.hp + 12, K.hip + 8)} h-24 q-3 0 -3 4 v12 q0 4 4 4 h22 q4 0 4 -4 v-12 q0 -4 -3 -4 z" fill="url(#cr_${id})"/>
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
      if (j === "earrings") return `<circle cx="${cx - K.headRx - 1.5}" cy="${K.headCy + 10}" r="1.9" fill="${g}"/><circle cx="${cx + K.headRx + 1.5}" cy="${K.headCy + 10}" r="1.9" fill="${g}"/>`;
      return line(`M${cx - 9} ${K.neckBot + 2} Q${cx} ${K.neckBot + 13} ${cx + 9} ${K.neckBot + 2}`, g, 1.6, .95) + `<circle cx="${cx}" cy="${K.neckBot + 13}" r="2.2" fill="${g}"/>`;
    }

    /* ---------------- head & hair ---------------- */
    function head() {
      const eyeY = K.headCy - 3,
        hx = cx;
      const mouth = expr === "calm" ? line(`M${hx - 7} ${K.headCy + 14} h14`, shade(skin, -0.3), 2.2) : expr === "soft" ? line(`M${hx - 7} ${K.headCy + 13} q7 4 14 0`, shade(skin, -0.3), 2.2) : line(`M${hx - 8} ${K.headCy + 12} q8 7.5 16 0`, shade(skin, -0.32), 2.5);
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
        f += `<g fill="${shade(skin, -0.2)}" opacity=".5">` + [[-13, 8], [-9, 11], [-5, 8.5], [5, 8.5], [9, 11], [13, 8], [0, 13]].map(p => `<circle cx="${hx + p[0]}" cy="${K.headCy + p[1]}" r="1.1"/>`).join("") + `</g>`;
      }
      if (o.feature === "vitiligo") f += `<g fill="${shade(skin, 0.55)}" opacity=".85"><path d="M${hx - 16} ${K.headCy + 6} q6 -2 5 6 q-5 4 -8 -1 q-1 -3 3 -5 z"/><circle cx="${hx + 13}" cy="${K.headCy + 13}" r="4"/></g>`;
      if (o.glasses && o.glasses !== "none") {
        const gs = "#3a3330";
        const lens = gx => o.glasses === "rect" ? `<rect x="${gx - 8}" y="${eyeY - 6.5}" width="16" height="13" rx="3.5" fill="#fff" fill-opacity=".09" stroke="${gs}" stroke-width="2.2"/>` : o.glasses === "cat" ? `<path d="M${gx - 8} ${eyeY - 3} q0 -5 8 -4.5 q8 0.5 8 6 q0 7 -8 7 q-8 0 -8 -8.5 z" fill="#fff" fill-opacity=".09" stroke="${gs}" stroke-width="2.2"/>` : `<circle cx="${gx}" cy="${eyeY}" r="8" fill="#fff" fill-opacity=".09" stroke="${gs}" stroke-width="2.2"/>`;
        f += lens(hx - 10) + lens(hx + 10) + line(`M${hx - 2} ${eyeY - 1.5} h4`, gs, 2.2) + line(`M${hx - 18} ${eyeY - 2} l-6 -1.5 M${hx + 18} ${eyeY - 2} l6 -1.5`, gs, 2.2);
      }
      if (o.hearing && o.hearing !== "none") {
        const hc = o.hearing === "cochlear" ? "#6f8a9b" : "#cdbfb0";
        f += `<circle cx="${hx - K.headRx - 2}" cy="${K.headCy + 5}" r="3" fill="${hc}"/>` + (o.hearing === "cochlear" ? `<circle cx="${hx - K.headRx + 1}" cy="${K.headCy - 9}" r="3.4" fill="${hc}"/>` + line(`M${hx - K.headRx + 1} ${K.headCy - 6} q-3 5 -3 8`, hc, 1.6) : "");
      }
      return f;
    }
    function hairBack() {
      const hx = cx,
        t = K.headCy - K.headRy,
        longEnd = K.chest + 10;
      switch (hair) {
        case "bald":
          return "";
        case "buzz":
        case "shaved":
          return `<path d="M${hx - K.headRx - 1} ${K.headCy - 2} Q${hx - K.headRx - 2} ${t - 6} ${hx} ${t - 7} Q${hx + K.headRx + 2} ${t - 6} ${hx + K.headRx + 1} ${K.headCy - 2} Q${hx + K.headRx - 4} ${K.headCy - 14} ${hx} ${K.headCy - 16} Q${hx - K.headRx + 4} ${K.headCy - 14} ${hx - K.headRx - 1} ${K.headCy - 2} Z" fill="${fHair}" opacity="${hair === "shaved" ? 0.75 : 1}"/>`;
        case "long":
        case "waves":
        case "straight":
          return `<path d="M${hx - K.headRx - 4} ${K.headCy} Q${hx - K.headRx - 5} ${t - 8} ${hx} ${t - 9} Q${hx + K.headRx + 5} ${t - 8} ${hx + K.headRx + 4} ${K.headCy} L${hx + K.headRx + 6} ${longEnd} Q${hx + K.headRx - 2} ${longEnd + 10} ${hx + K.headRx - 7} ${longEnd} L${hx + K.headRx - 8} ${K.headCy + 10} Q${hx} ${K.headCy - 22} ${hx - K.headRx + 8} ${K.headCy + 10} L${hx - K.headRx + 7} ${longEnd} Q${hx - K.headRx + 2} ${longEnd + 10} ${hx - K.headRx - 6} ${longEnd} Z" fill="${fHair}"/>`;
        case "bun":
          return `<circle cx="${hx}" cy="${t - 8}" r="11" fill="${fHair}"/><path d="M${hx - K.headRx - 2} ${K.headCy} Q${hx - K.headRx - 3} ${t - 7} ${hx} ${t - 8} Q${hx + K.headRx + 3} ${t - 7} ${hx + K.headRx + 2} ${K.headCy} Q${hx + K.headRx - 4} ${K.headCy - 16} ${hx} ${K.headCy - 18} Q${hx - K.headRx + 4} ${K.headCy - 16} ${hx - K.headRx - 2} ${K.headCy} Z" fill="${fHair}"/>`;
        case "braids":
          return `<path d="M${hx - K.headRx - 3} ${K.headCy} Q${hx - K.headRx - 4} ${t - 8} ${hx} ${t - 9} Q${hx + K.headRx + 4} ${t - 8} ${hx + K.headRx + 3} ${K.headCy} Q${hx + K.headRx - 4} ${K.headCy - 16} ${hx} ${K.headCy - 18} Q${hx - K.headRx + 4} ${K.headCy - 16} ${hx - K.headRx - 3} ${K.headCy} Z" fill="${fHair}"/>` + [-1, 1].map(sd => {
            const bx = hx + sd * (K.headRx + 4);
            let d = `<path d="M${bx - 4} ${K.headCy - 2} q-2 ${(longEnd - K.headCy) / 2} 0 ${longEnd - K.headCy + 14} q4 6 8 0 q2 -${(longEnd - K.headCy) / 2} 0 -${longEnd - K.headCy + 14} z" fill="${fHair}"/>`;
            for (let y = K.headCy + 10; y < longEnd + 6; y += 11) d += `<ellipse cx="${bx}" cy="${y}" rx="4.6" ry="3.4" fill="${shade(hairC, 0.12)}" opacity=".5"/>`;
            return d;
          }).join("");
        case "coily":
        case "curly":
          {
            let s = `<g fill="${fHair}">`;
            const rr = hair === "coily" ? 15 : 13;
            [[-17, -22, rr], [0, -27, rr + 2], [17, -22, rr], [-25, -6, rr - 2], [25, -6, rr - 2], [-21, 9, rr - 4], [21, 9, rr - 4]].forEach(p => s += `<circle cx="${hx + p[0]}" cy="${K.headCy + p[1]}" r="${p[2]}"/>`);
            return s + "</g>";
          }
        case "locs":
          return `<path d="M${hx - K.headRx - 2} ${K.headCy} Q${hx - K.headRx - 3} ${t - 8} ${hx} ${t - 9} Q${hx + K.headRx + 3} ${t - 8} ${hx + K.headRx + 2} ${K.headCy} Q${hx} ${K.headCy - 20} ${hx - K.headRx - 2} ${K.headCy} Z" fill="${fHair}"/>` + [-26, -19, 19, 26].map(dx => `<path d="M${hx + dx} ${K.headCy - 4} q${dx < 0 ? -2 : 2} ${(K.chest - K.headCy) / 2} 0 ${K.chest - K.headCy} q3.5 5 7 0" fill="none" stroke="${fHair}" stroke-width="7" stroke-linecap="round"/>`).join("");
        default:
          return `<path d="M${hx - K.headRx - 2} ${K.headCy} Q${hx - K.headRx - 3} ${t - 7} ${hx} ${t - 8} Q${hx + K.headRx + 3} ${t - 7} ${hx + K.headRx + 2} ${K.headCy} Q${hx + K.headRx - 4} ${K.headCy - 15} ${hx} ${K.headCy - 17} Q${hx - K.headRx + 4} ${K.headCy - 15} ${hx - K.headRx - 2} ${K.headCy} Z" fill="${fHair}"/>`;
      }
    }
    function hairFront() {
      if (hair === "bald" || hair === "buzz" || hair === "shaved") return "";
      const hx = cx,
        t = K.headCy - K.headRy;
      return `<path d="M${hx - K.headRx + 1} ${K.headCy - 8} Q${hx - K.headRx + 3} ${t - 2} ${hx} ${t - 1} Q${hx + K.headRx - 3} ${t - 2} ${hx + K.headRx - 1} ${K.headCy - 8} Q${hx + K.headRx - 8} ${K.headCy - 15} ${hx} ${K.headCy - 16} Q${hx - K.headRx + 8} ${K.headCy - 15} ${hx - K.headRx + 1} ${K.headCy - 8} Z" fill="${fHair}"/>`;
    }

    /* ---------------- assemble ---------------- */
    const legSkinL = tube(K.legPts(-1), K.legWs),
      legSkinR = tube(K.legPts(1), K.legWs);
    const armL = tube(K.armPts(-1), K.armWs),
      armR = tube(K.armPts(1), K.armWs);
    const wL = K.armPts(-1)[2],
      wR = K.armPts(1)[2];
    return `<svg viewBox="0 0 240 ${Math.round(K.floor + 8)}" width="100%" preserveAspectRatio="xMidYMax meet" style="display:block;overflow:visible" role="img" aria-label="avatar">
  <defs>
    ${grad(`sk_${id}`, skin)}${grad(`tp_${id}`, topC)}${grad(`bt_${id}`, botC)}${grad(`hr_${id}`, hairC, 0.24, 0.15)}
    ${grad(`sh_${id}`, "#473b30", 0.12, 0.2)}${grad(`ly_${id}`, o.layerColor || "#5a6f8c")}${grad(`cr_${id}`, o.carryColor || "#8a5a3f", 0.12, 0.18)}
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/figure.js", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe Button — a rounded pill action.
 * Variants: "primary" (terracotta filled, the warm commit action),
 * "secondary" (paper surface + hairline border, the default), and
 * "ghost" (transparent). Large rounded targets, gentle press settle.
 */
function Button({
  children,
  variant = "secondary",
  size = "md",
  icon = null,
  disabled = false,
  type = "button",
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      minHeight: 44,
      padding: "7px 14px",
      font: "var(--text-md)"
    },
    md: {
      minHeight: "var(--tap)",
      padding: "8px 18px",
      font: "var(--text-md)"
    },
    lg: {
      minHeight: 56,
      padding: "12px 24px",
      font: "var(--text-lg)"
    }
  };
  const variants = {
    primary: {
      background: "var(--terra)",
      borderColor: "var(--terra)",
      color: "var(--on-accent)",
      boxShadow: "var(--shadow-sm)"
    },
    secondary: {
      background: "var(--surface)",
      borderColor: "var(--line-2)",
      color: "var(--ink)",
      boxShadow: "var(--shadow-md)"
    },
    ghost: {
      background: "transparent",
      borderColor: "transparent",
      color: "var(--ink)",
      boxShadow: "none"
    }
  };
  const sz = sizes[size] || sizes.md;
  const vr = variants[variant] || variants.secondary;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: sz.minHeight,
      padding: sz.padding,
      border: "1.5px solid",
      borderColor: vr.borderColor,
      background: vr.background,
      color: vr.color,
      boxShadow: vr.boxShadow,
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-rounded)",
      fontSize: sz.font,
      fontWeight: "var(--weight-bold)",
      lineHeight: 1,
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: "transform var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease)",
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex"
    },
    "aria-hidden": "true"
  }, icon) : null, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe IconButton — a circular or pill icon-only control.
 * Soft paper material with a subtle gradient + warm shadow, gentle
 * hover lift and press settle. Always pass an accessible `label`.
 */
function IconButton({
  children,
  label,
  shape = "circle",
  variant = "surface",
  size = 56,
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const variants = {
    surface: {
      background: "linear-gradient(180deg,#fff,var(--surface-2))",
      border: "1px solid var(--line)",
      color: "var(--ink)"
    },
    primary: {
      background: "var(--terra)",
      border: "1px solid var(--terra)",
      color: "var(--on-accent)"
    },
    ghost: {
      background: "transparent",
      border: "1px solid transparent",
      color: "var(--ink)"
    }
  };
  const vr = variants[variant] || variants.surface;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    style: {
      width: size,
      height: size,
      display: "grid",
      placeItems: "center",
      borderRadius: shape === "circle" ? "50%" : "var(--radius-md)",
      background: vr.background,
      border: vr.border,
      color: vr.color,
      boxShadow: variant === "ghost" ? "none" : "var(--shadow-sm)",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: "transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex"
    },
    "aria-hidden": "true"
  }, children));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe Badge — a small rounded status/count pill on a tinted
 * surface. Use for soft labels like "New" or a saved count.
 */
function Badge({
  children,
  tone = "neutral",
  style,
  ...rest
}) {
  const tones = {
    neutral: {
      background: "var(--bg-2)",
      color: "var(--ink-soft)",
      border: "var(--line-2)"
    },
    sage: {
      background: "var(--sage-wash)",
      color: "var(--sage-deep)",
      border: "var(--sage)"
    },
    terra: {
      background: "rgba(189,122,79,.14)",
      color: "var(--terra-deep)",
      border: "var(--terra)"
    },
    ink: {
      background: "var(--ink)",
      color: "var(--on-accent)",
      border: "var(--ink)"
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 9px",
      borderRadius: "var(--radius-pill)",
      background: t.background,
      color: t.color,
      border: `1px solid ${t.border}`,
      fontFamily: "var(--font-rounded)",
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--weight-extra)",
      letterSpacing: ".4px",
      textTransform: "uppercase",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe Tag — an editorial eyebrow chip used to demote trend/
 * jargon words (e.g. "monochrome", "soft romantic"). Tiny, uppercase,
 * low-contrast so the concrete label stays primary.
 */
function Tag({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 8px",
      borderRadius: "var(--radius-pill)",
      background: "rgba(41,35,31,.08)",
      color: "var(--ink-soft)",
      fontFamily: "var(--font-rounded)",
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--weight-black)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe Toast — a gentle, low-arousal confirmation pill. Two tones:
 * "ink" (dark, neutral confirmation, as in the prototype) and "sage"
 * (the in-card "Saved" affirmation). No auto-stacking, no urgency.
 */
function Toast({
  children,
  tone = "ink",
  icon = null,
  show = true,
  style,
  ...rest
}) {
  const tones = {
    ink: {
      background: "var(--ink)",
      color: "var(--on-accent)"
    },
    sage: {
      background: "var(--sage-deep)",
      color: "var(--on-accent)"
    }
  };
  const t = tones[tone] || tones.ink;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "11px 20px",
      borderRadius: "var(--radius-pill)",
      background: t.background,
      color: t.color,
      fontFamily: "var(--font-rounded)",
      fontSize: "var(--text-md)",
      fontWeight: "var(--weight-bold)",
      boxShadow: "var(--shadow-xl)",
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(-8px)",
      transition: "opacity var(--dur-base) var(--ease), transform var(--dur-base) var(--ease)",
      pointerEvents: "none",
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex"
    },
    "aria-hidden": "true"
  }, icon) : null, children);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/product/DiscoverHero.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe DiscoverHero — the "Find my vibe" call to action. A warm
 * terracotta gradient panel that opens the this-or-that discovery flow
 * (the second door for switch / eye-gaze users). One per screen.
 */
function DiscoverHero({
  title = "Find my vibe",
  subtitle = "Tap looks you like — we'll build it for you",
  icon = "✨",
  onClick,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": title + " — " + subtitle,
    onClick: onClick,
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "16px 18px",
      borderRadius: "var(--radius-lg)",
      border: "1px solid rgba(126,63,42,.30)",
      background: "linear-gradient(135deg, #b86c4d, #8f4730)",
      color: "#fff",
      textAlign: "left",
      fontFamily: "var(--font-rounded)",
      cursor: "pointer",
      boxShadow: "0 14px 30px rgba(95,48,28,.28), inset 0 1px 0 rgba(255,255,255,.25)",
      transition: "transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "1.6rem",
      lineHeight: 1
    },
    "aria-hidden": "true"
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-black)",
      fontSize: "var(--text-lg)"
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 650,
      opacity: 0.92,
      fontSize: "var(--text-sm)"
    }
  }, subtitle)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "1.4rem",
      fontWeight: "var(--weight-black)"
    },
    "aria-hidden": "true"
  }, "\u2192"));
}
Object.assign(__ds_scope, { DiscoverHero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/DiscoverHero.jsx", error: String((e && e.message) || e) }); }

// components/product/VibeCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe VibeCard — the signature "look" card. A tinted paper tile
 * holding a look preview, a demoted trend `tag`, a concrete `name`,
 * the two garment color chips, and a plain-language `note`. Selecting
 * shows the sage selection ring. The three-tier label (tag / name /
 * note) is the product's recognition-first copy pattern.
 */
function VibeCard({
  preview = null,
  tag,
  name,
  note,
  colors = [],
  selected = false,
  onClick,
  style,
  ...rest
}) {
  const top = colors[0] || "#e6dcc6";
  const bottom = colors[1] || top;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-pressed": selected,
    "aria-label": name + " vibe",
    onClick: onClick,
    style: {
      position: "relative",
      display: "grid",
      gridTemplateRows: "minmax(184px, 1fr) auto",
      gap: 8,
      width: 220,
      padding: 10,
      border: "1.5px solid",
      borderColor: selected ? "var(--selected)" : "var(--line)",
      borderRadius: "var(--radius-xl)",
      background: `linear-gradient(160deg, color-mix(in srgb, ${top} 24%, #fff), color-mix(in srgb, ${bottom} 14%, #fff)), var(--surface-2)`,
      boxShadow: selected ? "0 0 0 3px rgba(31,79,53,.18), 0 16px 38px rgba(57,43,28,.14)" : "inset 0 1px 0 rgba(255,255,255,.72), 0 12px 30px rgba(57,43,28,.10)",
      cursor: "pointer",
      color: "var(--ink)",
      fontFamily: "var(--font-rounded)",
      textAlign: "left",
      overflow: "hidden",
      transition: "transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 184,
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      background: "radial-gradient(80% 64% at 50% 14%, rgba(255,255,255,.82), rgba(255,255,255,0)), linear-gradient(180deg, rgba(255,255,255,.55), rgba(205,191,176,.22))"
    }
  }, preview), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "grid",
      gap: 6
    }
  }, tag ? /*#__PURE__*/React.createElement("span", {
    style: {
      justifySelf: "start",
      padding: "3px 8px",
      borderRadius: "var(--radius-pill)",
      background: "rgba(41,35,31,.08)",
      color: "var(--ink-soft)",
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--weight-black)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase"
    }
  }, tag) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-black)",
      fontSize: "var(--text-md)"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, colors.slice(0, 2).map((c, i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    style: {
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: c,
      border: "1px solid rgba(0,0,0,.12)",
      display: "block"
    }
  })), note ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink-soft)",
      fontSize: "var(--text-xs)",
      fontWeight: 700
    }
  }, note) : null)));
}
Object.assign(__ds_scope, { VibeCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/VibeCard.jsx", error: String((e && e.message) || e) }); }

// components/selection/CategoryTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe CategoryTile — a vertical icon + label tile for the primary
 * "what do you want to change" navigation (Vibe / Fit / Hair / …).
 * Selected uses a sage tint + ring. Pass a Lucide-style `icon` node.
 */
function CategoryTile({
  icon = null,
  label,
  selected = false,
  onClick,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-pressed": selected,
    "aria-label": label,
    onClick: onClick,
    style: {
      minHeight: "var(--tap-lg)",
      minWidth: 70,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      padding: "8px 6px",
      border: "1.5px solid",
      borderColor: selected ? "var(--sage)" : "var(--line-2)",
      background: selected ? "var(--sage-wash)" : "var(--surface)",
      borderRadius: "var(--radius-md)",
      color: selected ? "var(--sage-deep)" : "var(--ink-soft)",
      boxShadow: selected ? "var(--ring-sage-glow)" : "none",
      cursor: "pointer",
      fontFamily: "var(--font-rounded)",
      transition: "transform var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease)",
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 26,
      height: 26
    },
    "aria-hidden": "true"
  }, icon) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-bold)"
    }
  }, label));
}
Object.assign(__ds_scope, { CategoryTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/CategoryTile.jsx", error: String((e && e.message) || e) }); }

// components/selection/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe Chip — a rounded filter/toggle pill (e.g. the vibe "style
 * world" filters). aria-pressed selected state fills sage.
 */
function Chip({
  children,
  selected = false,
  onClick,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-pressed": selected,
    onClick: onClick,
    style: {
      minHeight: 40,
      padding: "8px 16px",
      borderRadius: "var(--radius-pill)",
      border: "1.5px solid",
      borderColor: selected ? "var(--sage)" : "var(--line-2)",
      background: selected ? "var(--sage)" : "var(--surface)",
      color: selected ? "var(--on-accent)" : "var(--ink-soft)",
      fontFamily: "var(--font-rounded)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-extra)",
      cursor: "pointer",
      boxShadow: selected ? "var(--ring-sage-glow)" : "none",
      transition: "background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/Chip.jsx", error: String((e && e.message) || e) }); }

// components/selection/ColorDot.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe ColorDot — a round color choice. Used for skin tones, hair
 * color, garment color. Selected state shows a sage ring + lift. The
 * `color` may be any CSS color or gradient string.
 */
function ColorDot({
  color = "#cdbfb0",
  label,
  selected = false,
  size = 56,
  onClick,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-pressed": selected,
    "aria-label": label,
    title: label,
    onClick: onClick,
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      border: "2px solid rgba(255,255,255,.85)",
      boxShadow: selected ? "0 0 0 3px var(--sage), var(--shadow-sm)" : "var(--shadow-sm), inset 0 0 0 1px rgba(0,0,0,.06)",
      transform: selected ? "scale(1.04)" : "scale(1)",
      cursor: "pointer",
      transition: "transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease)",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { ColorDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/ColorDot.jsx", error: String((e && e.message) || e) }); }

// components/selection/SubTab.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe SubTab — a pill tab for switching sub-views (e.g. Eyes /
 * Nose / Lips within Face). Selected fills ink for strong contrast.
 */
function SubTab({
  children,
  selected = false,
  onClick,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-pressed": selected,
    onClick: onClick,
    style: {
      minHeight: "var(--tap)",
      padding: "6px 14px",
      borderRadius: "var(--radius-pill)",
      border: "1.5px solid",
      borderColor: selected ? "var(--ink)" : "var(--line-2)",
      background: selected ? "var(--ink)" : "var(--surface-2)",
      color: selected ? "var(--on-accent)" : "var(--ink-soft)",
      fontFamily: "var(--font-rounded)",
      fontSize: "var(--text-md)",
      fontWeight: "var(--weight-bold)",
      cursor: "pointer",
      transition: "background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { SubTab });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/SubTab.jsx", error: String((e && e.message) || e) }); }

// components/selection/Swatch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe Swatch — the core recognition-first choice tile. Holds a
 * visual preview (mini avatar, color dot, garment) plus a label, and
 * shows a clear selected ring + checkmark. Large target, no text input.
 */
function Swatch({
  children,
  label,
  selected = false,
  size = "md",
  onClick,
  style,
  ...rest
}) {
  const minH = size === "lg" ? "var(--tap-lg)" : "var(--tap)";
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-pressed": selected,
    "aria-label": label,
    onClick: onClick,
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      minHeight: minH,
      padding: 6,
      border: "2px solid",
      borderColor: selected ? "var(--selected)" : "var(--line-2)",
      background: selected ? "var(--sage-wash)" : "var(--surface-2)",
      borderRadius: 16,
      boxShadow: selected ? "var(--ring-selected-glow)" : "none",
      cursor: "pointer",
      fontFamily: "var(--font-rounded)",
      color: "var(--ink)",
      transition: "transform var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      top: -8,
      right: -8,
      width: 22,
      height: 22,
      borderRadius: "50%",
      background: "var(--selected)",
      color: "#fff",
      display: selected ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      boxShadow: "0 1px 4px rgba(0,0,0,.25)"
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      pointerEvents: "none"
    }
  }, children), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-bold)",
      color: selected ? "var(--sage-deep)" : "var(--ink-soft)",
      textAlign: "center",
      lineHeight: 1.1
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Swatch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/Swatch.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * designMe Card — a soft paper panel with warm shadow and hairline
 * border. The default surface for grouping controls and content.
 * `tone="raised"` adds the radial highlight used by the avatar card.
 */
function Card({
  children,
  tone = "flat",
  padding = 12,
  style,
  ...rest
}) {
  const tones = {
    flat: {
      background: "var(--surface)"
    },
    raised: {
      background: "radial-gradient(120% 80% at 50% 12%, #fcf9f4 0%, var(--surface) 55%, var(--surface-2) 100%)"
    },
    inset: {
      background: "var(--surface-2)"
    }
  };
  const t = tones[tone] || tones.flat;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: t.background,
      border: "1.5px solid var(--line)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-md)",
      padding,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// ui_kits/avatar-studio/AvatarStudio.jsx
try { (() => {
/* designMe — Avatar Studio (UI kit recreation, outfit-first) */
const NS = window.DesignMeDesignSystem_157aab;
const {
  Button,
  IconButton,
  CategoryTile,
  Swatch,
  ColorDot,
  Chip,
  SubTab,
  VibeCard,
  DiscoverHero,
  Card,
  Toast,
  Badge
} = NS;
const {
  useState,
  useRef
} = React;
const DM = window.DM;

/* ---- resolve studio state into dmFigure options ---- */
function figOpts(s) {
  const top = DM.tops.find(t => t.id === s.top) || DM.tops[0];
  const bottom = DM.bottoms.find(b => b.id === s.bottom) || DM.bottoms[0];
  const layer = DM.layers.find(l => l.id === s.layer) || DM.layers[0];
  return {
    skin: s.skin,
    hair: s.hair,
    hairColor: s.hairColor,
    body: s.body,
    height: s.height,
    expression: s.expression,
    glasses: s.glasses,
    hearing: s.hearing,
    feature: s.feature,
    top: {
      ...top.attrs,
      pattern: s.pattern
    },
    topColor: s.topColor,
    bottom: bottom.attrs,
    bottomColor: s.bottomColor,
    shoes: s.shoes,
    layer: layer.attrs,
    layerColor: s.layerColor,
    carry: s.carry,
    jewelry: s.jewelry
  };
}
function Figure({
  state,
  box
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "figfit",
    style: {
      width: "100%",
      height: "100%",
      ...box
    },
    dangerouslySetInnerHTML: {
      __html: window.dmFigure({
        ...figOpts(state),
        height: state.height
      })
    }
  });
}
/* small head-and-shoulders bust for face/hair-focused trays */
function Bust({
  state
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "bustfit",
    style: {
      width: "100%",
      height: "100%"
    },
    dangerouslySetInnerHTML: {
      __html: window.dmAvatar({
        skin: state.skin,
        hairColor: state.hairColor,
        hair: state.hair === "buzz" || state.hair === "bald" ? "crop" : state.hair,
        topColor: state.topColor,
        expression: state.expression,
        glasses: state.glasses,
        hearing: state.hearing,
        feature: state.feature,
        height: 120
      })
    }
  });
}
const CATS = [{
  id: "vibe",
  label: "Vibe",
  icon: "star"
}, {
  id: "top",
  label: "Top",
  icon: "top"
}, {
  id: "bottom",
  label: "Bottom",
  icon: "bottom"
}, {
  id: "layer",
  label: "Layer",
  icon: "layer"
}, {
  id: "shoes",
  label: "Shoes",
  icon: "shoe"
}, {
  id: "color",
  label: "Color",
  icon: "palette"
}, {
  id: "extras",
  label: "Extras",
  icon: "bag"
}, {
  id: "hair",
  label: "Hair",
  icon: "hair"
}, {
  id: "face",
  label: "Face",
  icon: "face"
}, {
  id: "body",
  label: "Body",
  icon: "body"
}, {
  id: "tools",
  label: "Tools",
  icon: "tools"
}];
const CAT_TITLE = {
  vibe: "Pick a vibe",
  top: "Tops",
  bottom: "Bottoms",
  layer: "Layers",
  shoes: "Shoes",
  color: "Palette & colors",
  extras: "Bags & jewelry",
  hair: "Hair",
  face: "Face & expression",
  body: "Skin & shape",
  tools: "Tools & access"
};
const Eyebrow = ({
  children
}) => /*#__PURE__*/React.createElement("h3", {
  style: {
    margin: "0 0 9px",
    fontSize: "var(--text-2xs)",
    fontWeight: 800,
    letterSpacing: "var(--tracking-eyebrow)",
    textTransform: "uppercase",
    color: "var(--ink-soft)"
  }
}, children);

/* a garment preview chip: small mannequin showing just this piece on the current body */
function GarmentSwatch({
  label,
  selected,
  onClick,
  render
}) {
  return /*#__PURE__*/React.createElement(Swatch, {
    label: label,
    selected: selected,
    onClick: onClick,
    size: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    className: "figfit",
    style: {
      width: 92,
      height: 122
    }
  }, render));
}
function AvatarStudio() {
  const [state, setState] = useState({
    skin: "#a87c58",
    body: "balanced",
    height: "medium",
    hair: "curly",
    hairColor: "#2e221b",
    expression: "smile",
    glasses: "none",
    hearing: "none",
    feature: "none",
    top: "hoodie",
    topColor: "#3c3a38",
    bottom: "barrelJean",
    bottomColor: "#5a6f8c",
    shoes: "sneaker",
    layer: "none",
    layerColor: "#5a6f8c",
    pattern: "none",
    carry: "none",
    jewelry: "none",
    vibe: null
  });
  const [cat, setCat] = useState("vibe");
  const [vibeFilter, setVibeFilter] = useState("All");
  const [colorTarget, setColorTarget] = useState("top");
  const [looks, setLooks] = useState([]);
  const [saved, setSaved] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [discover, setDiscover] = useState(null);
  const histRef = useRef([]);
  const set = patch => {
    histRef.current.push(state);
    setState(s => ({
      ...s,
      ...patch
    }));
  };
  const undo = () => {
    const h = histRef.current;
    if (h.length) setState(h.pop());
  };
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const randomLook = () => ({
    skin: rnd(DM.skins).v,
    body: rnd(DM.bodies).id,
    height: rnd(DM.heights).id,
    hair: rnd(DM.hairStyles).id,
    hairColor: rnd(DM.hairColors).v,
    expression: rnd(DM.expressions).id,
    top: rnd(DM.tops).id,
    topColor: rnd(DM.garmentColors).v,
    bottom: rnd(DM.bottoms).id,
    bottomColor: rnd(DM.garmentColors).v,
    shoes: rnd(DM.shoes).id
  });
  const shuffle = () => {
    const maybe = (a, p) => Math.random() < p ? rnd(a.slice(1)).id : "none";
    set({
      ...randomLook(),
      glasses: maybe(DM.glasses, 0.35),
      hearing: maybe(DM.hearing, 0.2),
      feature: maybe(DM.features, 0.3),
      layer: maybe(DM.layers, 0.3),
      layerColor: rnd(DM.garmentColors).v,
      pattern: maybe(DM.patterns, 0.22),
      carry: maybe(DM.carries, 0.3),
      jewelry: maybe(DM.jewelry, 0.25),
      vibe: null
    });
  };
  const saveLook = () => {
    setLooks(l => [{
      ...state
    }, ...l].slice(0, 12));
    setSaved(true);
    setPulse(true);
    setTimeout(() => setSaved(false), 1600);
    setTimeout(() => setPulse(false), 500);
  };
  const applyVibe = v => set({
    layer: "none",
    pattern: "none",
    carry: "none",
    jewelry: "none",
    ...v.set,
    vibe: v.id
  });
  const vibePreview = v => ({
    ...state,
    layer: "none",
    pattern: "none",
    carry: "none",
    jewelry: "none",
    ...v.set
  });
  const startDiscover = () => setDiscover({
    a: {
      ...randomLook()
    },
    b: {
      ...randomLook()
    },
    round: 1
  });
  const pick = which => {
    const chosen = discover[which];
    set({
      ...chosen,
      vibe: null
    });
    if (discover.round >= 4) {
      setDiscover(null);
      return;
    }
    setDiscover({
      a: chosen,
      b: {
        ...randomLook()
      },
      round: discover.round + 1
    });
  };
  const visibleVibes = vibeFilter === "All" ? DM.vibes : DM.vibes.filter(v => v.moods.includes(vibeFilter));
  function Panel() {
    if (cat === "vibe") return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(DiscoverHero, {
      onClick: startDiscover
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Tap a style world"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 14
      }
    }, DM.vibeFilters.map(f => /*#__PURE__*/React.createElement(Chip, {
      key: f,
      selected: vibeFilter === f,
      onClick: () => setVibeFilter(f)
    }, f))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))",
        gap: 14
      }
    }, visibleVibes.map(v => /*#__PURE__*/React.createElement(VibeCard, {
      key: v.id,
      name: v.name,
      tag: v.tag,
      note: v.note,
      colors: [v.set.topColor, v.set.bottomColor],
      selected: state.vibe === v.id,
      onClick: () => applyVibe(v),
      style: {
        width: "100%"
      },
      preview: /*#__PURE__*/React.createElement("span", {
        className: "figfit",
        style: {
          width: "100%",
          height: 188
        }
      }, /*#__PURE__*/React.createElement(Figure, {
        state: vibePreview(v)
      }))
    })))));
    if (cat === "top") return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Top"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))",
        gap: 12
      }
    }, DM.tops.map(t => /*#__PURE__*/React.createElement(GarmentSwatch, {
      key: t.id,
      label: t.label,
      selected: state.top === t.id,
      onClick: () => set({
        top: t.id,
        vibe: null
      }),
      render: /*#__PURE__*/React.createElement(Figure, {
        state: {
          ...state,
          top: t.id
        }
      })
    })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Pattern"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, DM.patterns.map(p => /*#__PURE__*/React.createElement(Chip, {
      key: p.id,
      selected: state.pattern === p.id,
      onClick: () => set({
        pattern: p.id,
        vibe: null
      })
    }, p.label)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Top color"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 9,
        flexWrap: "wrap"
      }
    }, DM.garmentColors.map(c => /*#__PURE__*/React.createElement(ColorDot, {
      key: c.v,
      color: c.v,
      label: c.label,
      selected: state.topColor === c.v,
      onClick: () => set({
        topColor: c.v,
        vibe: null
      }),
      size: 44
    })))));
    if (cat === "bottom") return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Bottom"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))",
        gap: 12
      }
    }, DM.bottoms.map(b => /*#__PURE__*/React.createElement(GarmentSwatch, {
      key: b.id,
      label: b.label,
      selected: state.bottom === b.id,
      onClick: () => set({
        bottom: b.id,
        vibe: null
      }),
      render: /*#__PURE__*/React.createElement(Figure, {
        state: {
          ...state,
          bottom: b.id
        }
      })
    })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Bottom color"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 9,
        flexWrap: "wrap"
      }
    }, DM.garmentColors.map(c => /*#__PURE__*/React.createElement(ColorDot, {
      key: c.v,
      color: c.v,
      label: c.label,
      selected: state.bottomColor === c.v,
      onClick: () => set({
        bottomColor: c.v,
        vibe: null
      }),
      size: 44
    })))));
    if (cat === "layer") return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Layer"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))",
        gap: 12
      }
    }, DM.layers.map(l => /*#__PURE__*/React.createElement(GarmentSwatch, {
      key: l.id,
      label: l.label,
      selected: state.layer === l.id,
      onClick: () => set({
        layer: l.id,
        vibe: null
      }),
      render: /*#__PURE__*/React.createElement(Figure, {
        state: {
          ...state,
          layer: l.id
        }
      })
    })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Layer color"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 9,
        flexWrap: "wrap"
      }
    }, DM.garmentColors.map(c => /*#__PURE__*/React.createElement(ColorDot, {
      key: c.v,
      color: c.v,
      label: c.label,
      selected: state.layerColor === c.v,
      onClick: () => set({
        layerColor: c.v,
        vibe: null
      }),
      size: 44
    })))));
    if (cat === "extras") return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Bags"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))",
        gap: 12
      }
    }, DM.carries.map(c => /*#__PURE__*/React.createElement(GarmentSwatch, {
      key: c.id,
      label: c.label,
      selected: state.carry === c.id,
      onClick: () => set({
        carry: c.id,
        vibe: null
      }),
      render: /*#__PURE__*/React.createElement(Figure, {
        state: {
          ...state,
          carry: c.id
        }
      })
    })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Jewelry"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))",
        gap: 12
      }
    }, DM.jewelry.map(j => /*#__PURE__*/React.createElement(GarmentSwatch, {
      key: j.id,
      label: j.label,
      selected: state.jewelry === j.id,
      onClick: () => set({
        jewelry: j.id,
        vibe: null
      }),
      render: /*#__PURE__*/React.createElement(Figure, {
        state: {
          ...state,
          jewelry: j.id
        }
      })
    })))));
    if (cat === "shoes") return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Shoes"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))",
        gap: 12
      }
    }, DM.shoes.map(sh => /*#__PURE__*/React.createElement(GarmentSwatch, {
      key: sh.id,
      label: sh.label,
      selected: state.shoes === sh.id,
      onClick: () => set({
        shoes: sh.id,
        vibe: null
      }),
      render: /*#__PURE__*/React.createElement(Figure, {
        state: {
          ...state,
          shoes: sh.id
        }
      })
    }))));
    if (cat === "color") return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Coordinated palettes"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 12
      }
    }, DM.palettes.map(p => /*#__PURE__*/React.createElement(Swatch, {
      key: p.id,
      label: p.label,
      selected: state.topColor === p.top && state.bottomColor === p.bottom,
      onClick: () => set({
        topColor: p.top,
        bottomColor: p.bottom,
        vibe: null
      }),
      size: "lg"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 46,
        borderRadius: 9,
        background: p.top,
        border: "1px solid rgba(0,0,0,.1)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 46,
        borderRadius: 9,
        background: p.bottom,
        border: "1px solid rgba(0,0,0,.1)"
      }
    })))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(SubTab, {
      selected: colorTarget === "top",
      onClick: () => setColorTarget("top")
    }, "Top"), /*#__PURE__*/React.createElement(SubTab, {
      selected: colorTarget === "bottom",
      onClick: () => setColorTarget("bottom")
    }, "Bottom")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 9,
        flexWrap: "wrap"
      }
    }, DM.garmentColors.map(c => /*#__PURE__*/React.createElement(ColorDot, {
      key: c.v,
      color: c.v,
      label: c.label,
      selected: (colorTarget === "top" ? state.topColor : state.bottomColor) === c.v,
      onClick: () => set(colorTarget === "top" ? {
        topColor: c.v,
        vibe: null
      } : {
        bottomColor: c.v,
        vibe: null
      }),
      size: 44
    })))));
    if (cat === "hair") return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Hairstyle"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
        gap: 10
      }
    }, DM.hairStyles.map(o => /*#__PURE__*/React.createElement(Swatch, {
      key: o.id,
      label: o.label,
      selected: state.hair === o.id,
      onClick: () => set({
        hair: o.id
      }),
      size: "lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bustfit",
      style: {
        width: 78,
        height: 78
      }
    }, /*#__PURE__*/React.createElement(Bust, {
      state: {
        ...state,
        hair: o.id
      }
    })))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Hair color"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 9,
        flexWrap: "wrap"
      }
    }, DM.hairColors.map(o => /*#__PURE__*/React.createElement(ColorDot, {
      key: o.v,
      color: o.v,
      label: o.label,
      selected: state.hairColor === o.v,
      onClick: () => set({
        hairColor: o.v
      }),
      size: 44
    })))));
    if (cat === "face") return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Expression"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
        gap: 10
      }
    }, DM.expressions.map(o => /*#__PURE__*/React.createElement(Swatch, {
      key: o.id,
      label: o.label,
      selected: state.expression === o.id,
      onClick: () => set({
        expression: o.id
      }),
      size: "lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bustfit",
      style: {
        width: 78,
        height: 78
      }
    }, /*#__PURE__*/React.createElement(Bust, {
      state: {
        ...state,
        expression: o.id
      }
    })))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Skin features"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
        gap: 10
      }
    }, DM.features.map(o => /*#__PURE__*/React.createElement(Swatch, {
      key: o.id,
      label: o.label,
      selected: state.feature === o.id,
      onClick: () => set({
        feature: o.id
      }),
      size: "lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bustfit",
      style: {
        width: 78,
        height: 78
      }
    }, /*#__PURE__*/React.createElement(Bust, {
      state: {
        ...state,
        feature: o.id
      }
    })))))));
    if (cat === "body") return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Body"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))",
        gap: 12
      }
    }, DM.bodies.map(o => /*#__PURE__*/React.createElement(GarmentSwatch, {
      key: o.id,
      label: o.label,
      selected: state.body === o.id,
      onClick: () => set({
        body: o.id
      }),
      render: /*#__PURE__*/React.createElement(Figure, {
        state: {
          ...state,
          body: o.id
        }
      })
    })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Height"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
      }
    }, DM.heights.map(o => /*#__PURE__*/React.createElement(SubTab, {
      key: o.id,
      selected: state.height === o.id,
      onClick: () => set({
        height: o.id
      })
    }, o.label)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Skin tone"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 9,
        flexWrap: "wrap"
      }
    }, DM.skins.map(o => /*#__PURE__*/React.createElement(ColorDot, {
      key: o.v,
      color: o.v,
      selected: state.skin === o.v,
      onClick: () => set({
        skin: o.v
      }),
      size: 44
    })))));

    // tools
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "-2px 0 0",
        color: "var(--ink-soft)",
        fontSize: "var(--text-sm)",
        fontWeight: 650
      }
    }, "Glasses, hearing tech and more \u2014 everyday options, available to every avatar."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Glasses"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
        gap: 10
      }
    }, DM.glasses.map(o => /*#__PURE__*/React.createElement(Swatch, {
      key: o.id,
      label: o.label,
      selected: state.glasses === o.id,
      onClick: () => set({
        glasses: o.id
      }),
      size: "lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bustfit",
      style: {
        width: 78,
        height: 78
      }
    }, /*#__PURE__*/React.createElement(Bust, {
      state: {
        ...state,
        glasses: o.id
      }
    })))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Hearing tech"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
        gap: 10
      }
    }, DM.hearing.map(o => /*#__PURE__*/React.createElement(Swatch, {
      key: o.id,
      label: o.label,
      selected: state.hearing === o.id,
      onClick: () => set({
        hearing: o.id
      }),
      size: "lg"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bustfit",
      style: {
        width: 78,
        height: 78
      }
    }, /*#__PURE__*/React.createElement(Bust, {
      state: {
        ...state,
        hearing: o.id
      }
    })))))));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "0 14px 24px",
      fontFamily: "var(--font-rounded)"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "16px 4px 10px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8,
      marginRight: "auto"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: 28,
      fontWeight: 500,
      color: "var(--ink)"
    }
  }, "design", /*#__PURE__*/React.createElement("b", {
    style: {
      fontStyle: "italic",
      fontWeight: 600
    }
  }, "Me")), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink-soft)",
      fontSize: "var(--text-sm)",
      fontWeight: 700,
      whiteSpace: "nowrap"
    }
  }, "Find Your Vibe")), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        display: "block"
      }
    }, /*#__PURE__*/React.createElement(window.Icons.shuffle, null)),
    onClick: shuffle
  }, "Shuffle"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        display: "block"
      }
    }, /*#__PURE__*/React.createElement(window.Icons.heart, null)),
    onClick: saveLook
  }, "Save look")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(300px, 380px) minmax(0, 1fr)",
      gap: 24,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      position: "sticky",
      top: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "raised",
    padding: 10,
    style: {
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-lg)",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "figfit",
    style: {
      transform: pulse ? "scale(1.03)" : "scale(1)",
      transition: "transform var(--dur-slow) var(--ease)",
      height: "min(68vh, 600px)"
    }
  }, /*#__PURE__*/React.createElement(Figure, {
    state: state
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      bottom: 14,
      transform: "translateX(-50%)"
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "sage",
    show: saved,
    icon: /*#__PURE__*/React.createElement("span", {
      style: {
        width: 16,
        height: 16,
        display: "block"
      }
    }, /*#__PURE__*/React.createElement(window.Icons.check, null))
  }, "Saved")))), /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "grid",
      gridAutoFlow: "column",
      gridAutoColumns: "minmax(64px, 1fr)",
      gap: 8,
      overflowX: "auto",
      paddingBottom: 4
    }
  }, CATS.map(c => /*#__PURE__*/React.createElement(CategoryTile, {
    key: c.id,
    label: c.label,
    selected: cat === c.id,
    onClick: () => setCat(c.id),
    icon: /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 26,
        display: "block"
      }
    }, React.createElement(window.Icons[c.icon]))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    disabled: !histRef.current.length,
    onClick: undo,
    icon: /*#__PURE__*/React.createElement("span", {
      style: {
        width: 18,
        height: 18,
        display: "block"
      }
    }, /*#__PURE__*/React.createElement(window.Icons.undo, null))
  }, "Undo"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      color: "var(--ink-soft)",
      fontSize: "var(--text-sm)",
      fontWeight: 700
    }
  }, "Tap to try it on")), /*#__PURE__*/React.createElement(Card, {
    padding: 14,
    style: {
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-lg)",
      minHeight: 280
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 14px",
      fontSize: "var(--text-lg)",
      fontWeight: 800,
      color: "var(--ink)"
    }
  }, CAT_TITLE[cat]), /*#__PURE__*/React.createElement(Panel, null)), /*#__PURE__*/React.createElement(Card, {
    padding: 12,
    style: {
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 10px",
      fontSize: "var(--text-2xs)",
      fontWeight: 800,
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--ink-soft)",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      display: "block",
      color: "var(--ink-soft)"
    }
  }, /*#__PURE__*/React.createElement(window.Icons.heart, null)), "Your lookbook ", looks.length ? /*#__PURE__*/React.createElement(Badge, {
    tone: "sage",
    style: {
      marginLeft: 4
    }
  }, looks.length) : null), looks.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: "var(--ink-soft)",
      fontSize: "var(--text-sm)",
      fontWeight: 650
    }
  }, "No saved looks yet \u2014 tap \u201CSave look\u201D.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      overflowX: "auto",
      paddingBottom: 4
    }
  }, looks.map((lk, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => set(lk),
    "aria-label": "Saved look " + (i + 1),
    style: {
      flex: "0 0 auto",
      width: 86,
      height: 124,
      padding: 3,
      borderRadius: 14,
      cursor: "pointer",
      border: "1.5px solid var(--line-2)",
      background: "var(--surface-2)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "figfit",
    style: {
      width: "100%",
      height: "100%"
    }
  }, /*#__PURE__*/React.createElement(Figure, {
    state: lk
  })))))))), discover ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      background: "rgba(40,32,26,.62)"
    },
    onClick: () => setDiscover(null)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "min(820px, 96vw)",
      background: "var(--surface)",
      borderRadius: "var(--radius-2xl)",
      border: "1px solid var(--line)",
      boxShadow: "var(--shadow-xl)",
      padding: "24px 24px 20px",
      position: "relative",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 14,
      right: 16
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Close",
    size: 44,
    onClick: () => setDiscover(null)
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      display: "block"
    }
  }, /*#__PURE__*/React.createElement(window.Icons.close, null)))), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-serif)",
      margin: "4px 0 2px",
      fontSize: 30,
      fontWeight: 500,
      color: "var(--ink)"
    }
  }, "Find my vibe"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 16px",
      color: "var(--ink-soft)",
      fontWeight: 650
    }
  }, "Tap the one you like \u2014 no wrong answers \xB7 ", discover.round, " of 4"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 16
    }
  }, ["a", "b"].map((k, idx) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: k
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => pick(k),
    style: {
      flex: "1 1 0",
      minWidth: 0,
      border: "2px solid var(--line)",
      borderRadius: "var(--radius-xl)",
      background: "radial-gradient(80% 60% at 50% 12%, rgba(255,255,255,.92), rgba(255,255,255,0) 60%), linear-gradient(180deg, rgba(255,255,255,.6), rgba(205,191,176,.26))",
      padding: 8,
      cursor: "pointer",
      transition: "transform var(--dur-base) var(--ease)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "figfit",
    style: {
      width: "100%",
      height: 320
    }
  }, /*#__PURE__*/React.createElement(Figure, {
    state: discover[k]
  }))), idx === 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      color: "var(--ink-soft)"
    }
  }, "or") : null))))) : null);
}
window.AvatarStudio = AvatarStudio;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/avatar-studio/AvatarStudio.jsx", error: String((e && e.message) || e) }); }

// ui_kits/avatar-studio/catalog.js
try { (() => {
/* designMe Avatar Studio — catalog data (faithful subset of the product) */
window.DM = {
  /* ---- person ---- */
  skins: [{
    id: "s1",
    v: "#3b2a21"
  }, {
    id: "s2",
    v: "#5c3f30"
  }, {
    id: "s3",
    v: "#7c5a45"
  }, {
    id: "s4",
    v: "#8a5a3f"
  }, {
    id: "s5",
    v: "#a87c58"
  }, {
    id: "s6",
    v: "#bd8a5f"
  }, {
    id: "s7",
    v: "#c99a6e"
  }, {
    id: "s8",
    v: "#d3b48f"
  }, {
    id: "s9",
    v: "#e3c4a2"
  }, {
    id: "s10",
    v: "#efd4b8"
  }],
  bodies: [{
    id: "lean",
    label: "Lean"
  }, {
    id: "balanced",
    label: "Balanced"
  }, {
    id: "broad",
    label: "Broad"
  }, {
    id: "curvy",
    label: "Curves"
  }, {
    id: "full",
    label: "Full"
  }],
  heights: [{
    id: "shorter",
    label: "Shorter"
  }, {
    id: "short",
    label: "Short"
  }, {
    id: "medium",
    label: "Medium"
  }, {
    id: "tall",
    label: "Tall"
  }, {
    id: "taller",
    label: "Taller"
  }],
  hairStyles: [{
    id: "waves",
    label: "Waves"
  }, {
    id: "long",
    label: "Long"
  }, {
    id: "curly",
    label: "Curls"
  }, {
    id: "coily",
    label: "Coily"
  }, {
    id: "bun",
    label: "Bun"
  }, {
    id: "braids",
    label: "Braids"
  }, {
    id: "locs",
    label: "Locs"
  }, {
    id: "buzz",
    label: "Crop"
  }, {
    id: "bald",
    label: "Bald"
  }],
  hairColors: [{
    v: "#211c1a",
    label: "Black"
  }, {
    v: "#3f2b1f",
    label: "Dark brown"
  }, {
    v: "#6f4a2f",
    label: "Brown"
  }, {
    v: "#8a5a34",
    label: "Light brown"
  }, {
    v: "#c8a968",
    label: "Blonde"
  }, {
    v: "#cfcac3",
    label: "Silver"
  }, {
    v: "#9a4a36",
    label: "Auburn"
  }, {
    v: "#c0673a",
    label: "Ginger"
  }, {
    v: "#6f4a72",
    label: "Plum"
  }, {
    v: "#3f6f8a",
    label: "Ocean"
  }, {
    v: "#3f8a78",
    label: "Teal"
  }, {
    v: "#c0708f",
    label: "Rose"
  }],
  expressions: [{
    id: "smile",
    label: "Smile"
  }, {
    id: "soft",
    label: "Soft"
  }, {
    id: "calm",
    label: "Calm"
  }],
  features: [{
    id: "none",
    label: "None"
  }, {
    id: "freckles",
    label: "Freckles"
  }, {
    id: "vitiligo",
    label: "Vitiligo"
  }],
  glasses: [{
    id: "none",
    label: "None"
  }, {
    id: "round",
    label: "Round"
  }, {
    id: "rect",
    label: "Rectangle"
  }, {
    id: "cat",
    label: "Cat-eye"
  }],
  hearing: [{
    id: "none",
    label: "None"
  }, {
    id: "aid",
    label: "Hearing aid"
  }, {
    id: "cochlear",
    label: "Cochlear"
  }],
  /* ---- garments: each carries the design-language attributes the engine reads ---- */
  tops: [{
    id: "boxyTee",
    label: "Boxy tee",
    attrs: {
      sleeve: "short",
      len: "boxy",
      neck: "crew",
      fit: "oversized",
      graphic: true
    }
  }, {
    id: "babyTee",
    label: "Baby tee",
    attrs: {
      sleeve: "short",
      len: "crop",
      neck: "crew",
      fit: "fitted"
    }
  }, {
    id: "ribTank",
    label: "Rib tank",
    attrs: {
      sleeve: "tank",
      len: "crop",
      neck: "scoop",
      fit: "fitted",
      rib: true
    }
  }, {
    id: "hoodie",
    label: "Oversized hoodie",
    attrs: {
      sleeve: "long",
      len: "long",
      neck: "crew",
      fit: "oversized",
      hood: true,
      pocket: true
    }
  }, {
    id: "bomber",
    label: "Bomber jacket",
    attrs: {
      sleeve: "long",
      len: "boxy",
      neck: "crew",
      fit: "oversized",
      zip: true,
      rib: true
    }
  }, {
    id: "cardigan",
    label: "Soft cardigan",
    attrs: {
      sleeve: "long",
      len: "hip",
      neck: "v",
      fit: "relaxed",
      placket: true,
      chunky: true
    }
  }, {
    id: "sweater",
    label: "Chunky knit",
    attrs: {
      sleeve: "long",
      len: "hip",
      neck: "crew",
      fit: "relaxed",
      chunky: true
    }
  }, {
    id: "turtle",
    label: "Turtleneck",
    attrs: {
      sleeve: "long",
      len: "hip",
      neck: "high",
      fit: "fitted",
      chunky: true
    }
  }, {
    id: "button",
    label: "Relaxed shirt",
    attrs: {
      sleeve: "long",
      len: "long",
      neck: "collar",
      fit: "relaxed",
      placket: true
    }
  }, {
    id: "henley",
    label: "Henley",
    attrs: {
      sleeve: "long",
      len: "hip",
      neck: "crew",
      fit: "fitted",
      placket: true
    }
  }, {
    id: "corset",
    label: "Crop corset",
    attrs: {
      sleeve: "tank",
      len: "crop",
      neck: "scoop",
      fit: "fitted",
      corset: true
    }
  }, {
    id: "slipDress",
    label: "Slip dress",
    attrs: {
      sleeve: "strap",
      len: "dress",
      neck: "scoop",
      fit: "drape",
      satin: true
    }
  }],
  bottoms: [{
    id: "barrelJean",
    label: "Barrel denim",
    attrs: {
      type: "barrel",
      denim: true
    }
  }, {
    id: "wideTrouser",
    label: "Wide trouser",
    attrs: {
      type: "wide"
    }
  }, {
    id: "cargo",
    label: "Cargo pant",
    attrs: {
      type: "cargo"
    }
  }, {
    id: "track",
    label: "Track pant",
    attrs: {
      type: "track"
    }
  }, {
    id: "parachute",
    label: "Parachute",
    attrs: {
      type: "parachute",
      ruched: true
    }
  }, {
    id: "leggings",
    label: "Leggings",
    attrs: {
      type: "legg"
    }
  }, {
    id: "shorts",
    label: "Relaxed shorts",
    attrs: {
      type: "shorts"
    }
  }, {
    id: "jorts",
    label: "Baggy jorts",
    attrs: {
      type: "jorts",
      denim: true
    }
  }, {
    id: "midiSkirt",
    label: "Midi skirt",
    attrs: {
      type: "skirt",
      midi: true
    }
  }, {
    id: "pleatedSkirt",
    label: "Pleated skirt",
    attrs: {
      type: "skirt",
      midi: true,
      pleated: true
    }
  }, {
    id: "maxiSkirt",
    label: "Cargo maxi",
    attrs: {
      type: "skirt",
      maxi: true,
      cargo: true
    }
  }],
  layers: [{
    id: "none",
    label: "None",
    attrs: {
      style: "none"
    }
  }, {
    id: "overshirt",
    label: "Open overshirt",
    attrs: {
      style: "overshirt"
    }
  }, {
    id: "denimJacket",
    label: "Denim jacket",
    attrs: {
      style: "denim"
    }
  }, {
    id: "puffer",
    label: "Puffer",
    attrs: {
      style: "puffer"
    }
  }, {
    id: "blazer",
    label: "Relaxed blazer",
    attrs: {
      style: "blazer"
    }
  }],
  patterns: [{
    id: "none",
    label: "Plain"
  }, {
    id: "stripe",
    label: "Stripes"
  }, {
    id: "plaid",
    label: "Plaid"
  }],
  carries: [{
    id: "none",
    label: "None"
  }, {
    id: "tote",
    label: "Tote"
  }, {
    id: "crossbody",
    label: "Crossbody"
  }],
  jewelry: [{
    id: "none",
    label: "None"
  }, {
    id: "necklace",
    label: "Necklace"
  }, {
    id: "earrings",
    label: "Earrings"
  }],
  shoes: [{
    id: "sneaker",
    label: "Sneakers"
  }, {
    id: "boot",
    label: "Boots"
  }, {
    id: "loafer",
    label: "Loafers"
  }, {
    id: "slide",
    label: "Slides"
  }, {
    id: "heel",
    label: "Heels"
  }],
  garmentColors: [{
    v: "#e6dcc6",
    label: "Oat"
  }, {
    v: "#f1e9d8",
    label: "Cream"
  }, {
    v: "#c08457",
    label: "Clay"
  }, {
    v: "#a8553a",
    label: "Rust"
  }, {
    v: "#bd6f4f",
    label: "Terracotta"
  }, {
    v: "#7d8254",
    label: "Olive"
  }, {
    v: "#8aa382",
    label: "Sage"
  }, {
    v: "#46604b",
    label: "Pine"
  }, {
    v: "#3f8a86",
    label: "Teal"
  }, {
    v: "#8aa7bd",
    label: "Sky"
  }, {
    v: "#5a6f8c",
    label: "Denim"
  }, {
    v: "#7a5570",
    label: "Plum"
  }, {
    v: "#d39aa3",
    label: "Rose"
  }, {
    v: "#cda14e",
    label: "Mustard"
  }, {
    v: "#5e4334",
    label: "Cocoa"
  }, {
    v: "#3c3a38",
    label: "Charcoal"
  }],
  palettes: [{
    id: "p1",
    label: "Oat + graphite",
    top: "#f1e9d8",
    bottom: "#3c3a38"
  }, {
    id: "p2",
    label: "Moss + denim",
    top: "#8aa382",
    bottom: "#5a6f8c"
  }, {
    id: "p3",
    label: "Cocoa tonal",
    top: "#a9764f",
    bottom: "#5e4334"
  }, {
    id: "p4",
    label: "Cherry accent",
    top: "#b23b43",
    bottom: "#3c3a38"
  }, {
    id: "p5",
    label: "Washed blue",
    top: "#8aa7bd",
    bottom: "#3f6f7a"
  }, {
    id: "p6",
    label: "Honey black",
    top: "#cda14e",
    bottom: "#29231f"
  }],
  /* ---- vibes: one tap sets a whole outfit (top + bottom + colors + shoes) ---- */
  vibeFilters: ["All", "Everyday", "Soft", "Polished", "Streetwear", "Active", "Night"],
  vibes: [{
    id: "v_weekend",
    name: "Weekend Easy",
    tag: "easy casual",
    moods: ["Everyday"],
    note: "boxy tee, barrel denim, sneakers",
    set: {
      top: "boxyTee",
      bottom: "barrelJean",
      topColor: "#e6dcc6",
      bottomColor: "#5a6f8c",
      shoes: "sneaker",
      hair: "waves",
      carry: "crossbody"
    }
  }, {
    id: "v_campus",
    name: "Campus Layer",
    tag: "layered casual",
    moods: ["Everyday", "Streetwear"],
    note: "striped tee, denim jacket, wide trouser",
    set: {
      top: "boxyTee",
      pattern: "stripe",
      bottom: "wideTrouser",
      topColor: "#f1e9d8",
      bottomColor: "#3c3a38",
      shoes: "sneaker",
      hair: "coily",
      layer: "denimJacket",
      layerColor: "#5a6f8c"
    }
  }, {
    id: "v_cozy",
    name: "Cozy Knit",
    tag: "cozy neutral",
    moods: ["Everyday", "Soft"],
    note: "chunky knit, barrel denim, loafers",
    set: {
      top: "sweater",
      bottom: "barrelJean",
      topColor: "#c08457",
      bottomColor: "#5a6f8c",
      shoes: "loafer",
      hair: "bun",
      carry: "tote"
    }
  }, {
    id: "v_romantic",
    name: "Soft Romantic",
    tag: "soft romantic",
    moods: ["Soft"],
    note: "cardigan, pleated skirt, loafers",
    set: {
      top: "cardigan",
      bottom: "pleatedSkirt",
      topColor: "#d39aa3",
      bottomColor: "#f1e9d8",
      shoes: "loafer",
      hair: "long"
    }
  }, {
    id: "v_tailoring",
    name: "Quiet Tailoring",
    tag: "refined neutral",
    moods: ["Polished"],
    note: "turtleneck, wide trouser, loafers",
    set: {
      top: "turtle",
      bottom: "wideTrouser",
      topColor: "#5a6f8c",
      bottomColor: "#3c3a38",
      shoes: "loafer",
      hair: "buzz"
    }
  }, {
    id: "v_mono",
    name: "Monochrome",
    tag: "monochrome",
    moods: ["Polished"],
    note: "boxy tee, wide trouser, boots",
    set: {
      top: "boxyTee",
      bottom: "wideTrouser",
      topColor: "#f1e9d8",
      bottomColor: "#29231f",
      shoes: "boot",
      hair: "coily"
    }
  }, {
    id: "v_street",
    name: "Soft Street",
    tag: "oversized",
    moods: ["Streetwear"],
    note: "hoodie, barrel denim, sneakers",
    set: {
      top: "hoodie",
      bottom: "barrelJean",
      topColor: "#3c3a38",
      bottomColor: "#5a6f8c",
      shoes: "sneaker",
      hair: "curly"
    }
  }, {
    id: "v_utility",
    name: "Utility Street",
    tag: "utility",
    moods: ["Streetwear"],
    note: "bomber, cargo pant, boots",
    set: {
      top: "bomber",
      bottom: "cargo",
      topColor: "#46604b",
      bottomColor: "#3c3a38",
      shoes: "boot",
      hair: "braids"
    }
  }, {
    id: "v_active",
    name: "Off-duty Active",
    tag: "sporty",
    moods: ["Active"],
    note: "rib tank, track pant, sneakers",
    set: {
      top: "ribTank",
      bottom: "track",
      topColor: "#8aa382",
      bottomColor: "#3c3a38",
      shoes: "sneaker",
      hair: "highPony" === "highPony" ? "bun" : "bun"
    }
  }, {
    id: "v_satin",
    name: "Satin Evening",
    tag: "evening",
    moods: ["Night", "Polished"],
    note: "slip dress, heels",
    set: {
      top: "slipDress",
      bottom: "maxiSkirt",
      topColor: "#bd6f4f",
      bottomColor: "#bd6f4f",
      shoes: "heel",
      hair: "long",
      jewelry: "necklace"
    }
  }, {
    id: "v_downtown",
    name: "Downtown",
    tag: "downtown",
    moods: ["Night", "Streetwear"],
    note: "corset, leggings, boots",
    set: {
      top: "corset",
      bottom: "leggings",
      topColor: "#84647f",
      bottomColor: "#29231f",
      shoes: "boot",
      hair: "waves"
    }
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/avatar-studio/catalog.js", error: String((e && e.message) || e) }); }

// ui_kits/avatar-studio/icons.jsx
try { (() => {
/* designMe — Lucide-style inline icons shared across the kit */
const Ico = (p, sw) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw || 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: {
    width: "100%",
    height: "100%",
    display: "block"
  }
}, p);
window.Icons = {
  heart: () => Ico(/*#__PURE__*/React.createElement("path", {
    d: "M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
  }), 2.2),
  shuffle: () => Ico(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M16 3h5v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 3l-7 7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 21H3v-5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 21l7-7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 16v5h-5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 14l7 7"
  })), 2.2),
  back: () => Ico(/*#__PURE__*/React.createElement("path", {
    d: "M15 18l-6-6 6-6"
  }), 2.4),
  undo: () => Ico(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 7v6h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 13a9 9 0 1 0 3-7.7L3 8"
  })), 2.4),
  check: () => Ico(/*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  }), 3),
  close: () => Ico(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  })), 2.4),
  star: () => Ico(/*#__PURE__*/React.createElement("path", {
    d: "M12 3l2.2 5.6L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.8-.4z"
  }), 1.8),
  shirt: () => Ico(/*#__PURE__*/React.createElement("path", {
    d: "M8 4l4 3 4-3 4 4-3 2v9H7v-9L4 8z"
  }), 1.8),
  hair: () => Ico(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 13a7 7 0 0 1 14 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 13v4M19 13v4M12 6v3"
  })), 1.8),
  palette: () => Ico(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 3a9 9 0 1 0 0 18c1.6 0 1.5-2 2.5-3s3.5 0 3.5-2.5A6 6 0 0 0 12 3z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "11",
    r: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "11",
    r: "1"
  })), 1.8),
  face: () => Ico(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9.5",
    cy: "11",
    r: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "14.5",
    cy: "11",
    r: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 15c1.5 1.2 4.5 1.2 6 0"
  })), 1.8),
  body: () => Ico(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "6",
    r: "2.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 12c0-2 2-3 5-3s5 1 5 3l-1 8M8 20l-1-8"
  })), 1.8),
  tools: () => Ico(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "13",
    r: "3.2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "13",
    r: "3.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.2 13h5.6M2 11l2-1M22 11l-2-1"
  })), 1.8),
  top: () => Ico(/*#__PURE__*/React.createElement("path", {
    d: "M8 4l4 3 4-3 4 4-3 2v9H7v-9L4 8z"
  }), 1.8),
  layer: () => Ico(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M9 4 5 7l2 3 1-1v11h4V5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 4l4 3-2 3-1-1v11h-4"
  })), 1.8),
  bag: () => Ico(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M6 9h12l-1 11q0 1-1 1H8q-1 0-1-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 9V7a3 3 0 0 1 6 0v2"
  })), 1.8),
  bottom: () => Ico(/*#__PURE__*/React.createElement("path", {
    d: "M7 3h10l-1 18h-3l-1-11-1 11H7z"
  }), 1.8),
  shoe: () => Ico(/*#__PURE__*/React.createElement("path", {
    d: "M3 16v-5l5-2 3 3 8 2c2 .5 2 4 0 4H4z"
  }), 1.8)
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/avatar-studio/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.DiscoverHero = __ds_scope.DiscoverHero;

__ds_ns.VibeCard = __ds_scope.VibeCard;

__ds_ns.CategoryTile = __ds_scope.CategoryTile;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.ColorDot = __ds_scope.ColorDot;

__ds_ns.SubTab = __ds_scope.SubTab;

__ds_ns.Swatch = __ds_scope.Swatch;

__ds_ns.Card = __ds_scope.Card;

})();
