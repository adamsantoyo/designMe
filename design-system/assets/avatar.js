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
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
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
      case "curls": {
        let c = `<g ${f}>`;
        [[62, 60, 24], [82, 44, 25], [100, 38, 27], [118, 44, 25], [138, 60, 24], [54, 90, 22], [146, 90, 22]]
          .forEach((p) => (c += `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}"/>`));
        return c + `</g>`;
      }
      case "braids":
        return `<path ${f} d="M52 92 C50 54 70 40 100 40 C130 40 150 54 148 92 C140 70 122 60 100 60 C78 60 60 70 52 92 Z"/>
                <g ${f}><rect x="44" y="78" width="14" height="120" rx="7"/><rect x="142" y="78" width="14" height="120" rx="7"/></g>`;
      case "long":
        return `<path ${f} d="M48 96 C44 56 66 38 100 38 C134 38 156 56 152 96 C152 150 150 190 146 210 L132 210 C140 170 138 120 130 96 C122 74 116 64 100 64 C84 64 78 74 70 96 C62 120 60 170 68 210 L54 210 C50 190 48 150 48 96 Z"/>`;
      default: // waves
        return `<path ${f} d="M50 96 C48 54 68 38 100 38 C132 38 152 54 150 96 C150 130 144 160 138 184 L124 184 C134 150 132 118 126 96 C118 74 114 64 100 64 C86 64 82 74 74 96 C68 118 66 150 76 184 L62 184 C56 160 50 130 50 96 Z"/>`;
    }
  }

  function glassesSvg(style) {
    if (!style || style === "none") return "";
    const st = "#3a3330";
    const lens = (cx) => {
      if (style === "round")
        return `<circle cx="${cx}" cy="122" r="11" fill="#fff" fill-opacity=".10" stroke="${st}" stroke-width="3"/>`;
      if (style === "cat")
        return `<path d="M${cx - 11} 119 Q${cx - 11} 113 ${cx} 114 Q${cx + 11} 115 ${cx + 11} 122 Q${cx + 11} 131 ${cx} 131 Q${cx - 11} 131 ${cx - 11} 119 Z" fill="#fff" fill-opacity=".10" stroke="${st}" stroke-width="3"/>`;
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
      return `<g><path d="M${x + o - dir * 1} 112 Q${x + o + dir * 5} 112 ${x + o + dir * 5} 120 Q${x + o + dir * 5} 128 ${x + o} 128" fill="none" stroke="${c}" stroke-width="3.6" stroke-linecap="round"/><circle cx="${x + o + dir * 3}" cy="120" r="3.2" fill="${cd}"/>${
        style === "cochlear"
          ? `<circle cx="${x + o + dir * 2}" cy="104" r="4.2" fill="${c}"/><circle cx="${x + o + dir * 2}" cy="104" r="1.6" fill="${cd}"/><path d="M${x + o + dir * 2} 108 V115" stroke="${c}" stroke-width="2"/>`
          : ""
      }</g>`;
    };
    return ear(68, -1) + ear(132, 1);
  }

  function featureSvg(style, skin) {
    if (!style || style === "none") return "";
    if (style === "freckles") {
      let s = `<g fill="${shade(skin, -0.18)}" opacity=".5">`;
      [[80, 133], [84, 137], [88, 132], [112, 132], [116, 137], [120, 133], [100, 141], [95, 138], [105, 138]]
        .forEach((p) => (s += `<circle cx="${p[0]}" cy="${p[1]}" r="1.5"/>`));
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

    const mouth =
      expr === "soft"
        ? `<path d="M88 150 Q100 156 112 150" fill="none" stroke="${shade(skin, -0.32)}" stroke-width="3" stroke-linecap="round"/>`
        : expr === "calm"
        ? `<path d="M90 151 H110" fill="none" stroke="${shade(skin, -0.3)}" stroke-width="3" stroke-linecap="round"/>`
        : `<path d="M86 148 Q100 160 114 148" fill="none" stroke="${shade(skin, -0.34)}" stroke-width="3.4" stroke-linecap="round"/>`;

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
