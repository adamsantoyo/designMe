// designMe Avatar Foundry runtime.
// Deterministic vector compiler used by both the app wrapper and local Foundry CLI.
// AI can propose/mutate genomes around this, but rendering itself is pure.

const VERSION = 1;
const VIEW_W = 240;
const VIEW_H = 490;

const DEFAULT_HERO_GENOME = Object.freeze({
  version: VERSION,
  seed: "foundry-hero-loose-waves-hoodie",
  anatomy: {
    body: "balanced",
    height: "medium",
    stance: "soft-front",
    proportions: {
      shoulder: 1,
      waist: 1,
      hip: 1,
      arm: 1,
      leg: 1,
    },
  },
  identity: {
    skin: "#a87c58",
    faceShape: "oval",
    brow: "soft",
    eye: "almond",
    eyeColor: "#2f221b",
    nose: "rounded",
    lip: "soft",
    expression: "soft",
  },
  hair: {
    family: "wavy",
    style: "wavyM",
    volume: 0.88,
    color: "#3f2b1f",
  },
  outfit: {
    top: "hoodie",
    bottom: "barrelJean",
    shoe: "classicSneaker",
    palette: "sage-denim-cream",
    topColor: "#8aa382",
    bottomColor: "#5a6f8c",
  },
  assistive: {},
  artDirection: {
    lineWeight: 1.45,
    softness: 0.78,
    detailLevel: 0.72,
    editorialWarmth: 0.9,
  },
});

const SUPPORTED = Object.freeze({
  hair: new Set(["wavyM"]),
  top: new Set(["hoodie"]),
  bottom: new Set(["barrelJean"]),
  shoe: new Set(["classicSneaker"]),
  mobility: new Set(["none", "wheelchair", undefined, null]),
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (isObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function hex(value, fallback) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function num(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return clamp(n, min, max);
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function shade(color, amount) {
  const raw = hex(color, "#888888").slice(1);
  const n = parseInt(raw, 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const target = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  r = Math.round((target - r) * p + r);
  g = Math.round((target - g) * p + g);
  b = Math.round((target - b) * p + b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function mix(a, b, t) {
  const pa = parseInt(hex(a, "#888888").slice(1), 16);
  const pb = parseInt(hex(b, "#888888").slice(1), 16);
  const c = (x, y) => Math.round(x + (y - x) * t);
  const r = c((pa >> 16) & 255, (pb >> 16) & 255);
  const g = c((pa >> 8) & 255, (pb >> 8) & 255);
  const bl = c(pa & 255, pb & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function mergeGenome(input) {
  const base = clone(DEFAULT_HERO_GENOME);
  const g = isObject(input) ? input : {};
  return {
    ...base,
    ...g,
    anatomy: { ...base.anatomy, ...(g.anatomy || {}), proportions: { ...base.anatomy.proportions, ...((g.anatomy || {}).proportions || {}) } },
    identity: { ...base.identity, ...(g.identity || {}) },
    hair: { ...base.hair, ...(g.hair || {}) },
    outfit: { ...base.outfit, ...(g.outfit || {}) },
    assistive: { ...base.assistive, ...(g.assistive || {}) },
    artDirection: { ...base.artDirection, ...(g.artDirection || {}) },
  };
}

function validateGenome(input) {
  const errors = [];
  if (!isObject(input)) return { ok: false, errors: ["Genome must be an object."] };
  const g = mergeGenome(input);
  if (g.version !== VERSION) errors.push(`Unsupported version: ${g.version}`);
  if (typeof g.seed !== "string" || !g.seed.trim()) errors.push("seed must be a non-empty string.");
  for (const path of ["anatomy", "identity", "hair", "outfit", "assistive", "artDirection"]) {
    if (!isObject(g[path])) errors.push(`${path} must be an object.`);
  }
  for (const [path, value] of [
    ["identity.skin", g.identity.skin],
    ["identity.eyeColor", g.identity.eyeColor],
    ["hair.color", g.hair.color],
    ["outfit.topColor", g.outfit.topColor],
    ["outfit.bottomColor", g.outfit.bottomColor],
  ]) {
    if (!/^#[0-9a-fA-F]{6}$/.test(String(value))) errors.push(`${path} must be a #rrggbb color.`);
  }
  if (!SUPPORTED.hair.has(g.hair.style)) errors.push(`Foundry v1 does not support hair style ${g.hair.style}.`);
  if (!SUPPORTED.top.has(g.outfit.top)) errors.push(`Foundry v1 does not support top ${g.outfit.top}.`);
  if (!SUPPORTED.bottom.has(g.outfit.bottom)) errors.push(`Foundry v1 does not support bottom ${g.outfit.bottom}.`);
  if (!SUPPORTED.shoe.has(g.outfit.shoe)) errors.push(`Foundry v1 does not support shoe ${g.outfit.shoe}.`);
  if (!SUPPORTED.mobility.has(g.assistive.mobility)) errors.push(`Foundry v1 does not support mobility ${g.assistive.mobility}.`);
  return { ok: errors.length === 0, errors };
}

function normalizeGenome(input) {
  const g = mergeGenome(input);
  g.version = VERSION;
  g.seed = String(g.seed || DEFAULT_HERO_GENOME.seed);
  g.identity.skin = hex(g.identity.skin, DEFAULT_HERO_GENOME.identity.skin);
  g.identity.eyeColor = hex(g.identity.eyeColor, DEFAULT_HERO_GENOME.identity.eyeColor);
  g.hair.color = hex(g.hair.color, DEFAULT_HERO_GENOME.hair.color);
  g.hair.volume = num(g.hair.volume, DEFAULT_HERO_GENOME.hair.volume, 0.45, 1.18);
  g.outfit.topColor = hex(g.outfit.topColor, DEFAULT_HERO_GENOME.outfit.topColor);
  g.outfit.bottomColor = hex(g.outfit.bottomColor, DEFAULT_HERO_GENOME.outfit.bottomColor);
  g.artDirection.lineWeight = num(g.artDirection.lineWeight, 1.45, 0.8, 2.4);
  g.artDirection.softness = num(g.artDirection.softness, 0.78, 0, 1);
  g.artDirection.detailLevel = num(g.artDirection.detailLevel, 0.72, 0, 1);
  g.artDirection.editorialWarmth = num(g.artDirection.editorialWarmth, 0.9, 0, 1);
  return g;
}

function genomeFromAv(av, ov) {
  const a = { ...(av || {}), ...(ov || {}) };
  const g = clone(DEFAULT_HERO_GENOME);
  g.seed = `app-${hashString(stableStringify({
    skin: a.skin,
    body: a.body,
    height: a.height,
    hair: a.hair,
    hairColor: a.hairColor,
    top: a.top,
    topColor: a.topColor,
    bottom: a.bottom,
    bottomColor: a.bottomColor,
    shoes: a.shoes,
    mobility: a.mobility,
  }))}`;
  g.anatomy.body = a.body || g.anatomy.body;
  g.anatomy.height = a.height || g.anatomy.height;
  g.identity.skin = hex(a.skin, g.identity.skin);
  g.identity.faceShape = a.faceShape || g.identity.faceShape;
  g.identity.brow = a.brow || g.identity.brow;
  g.identity.eye = a.eye || g.identity.eye;
  g.identity.eyeColor = hex(a.eyeColor, g.identity.eyeColor);
  g.identity.nose = a.nose || g.identity.nose;
  g.identity.lip = a.lip || g.identity.lip;
  g.identity.expression = a.expression || g.identity.expression;
  g.hair.style = a.hair || g.hair.style;
  g.hair.family = a.hair === "wavyM" ? "wavy" : g.hair.family;
  g.hair.color = hex(a.hairColor, g.hair.color);
  g.outfit.top = a.top || g.outfit.top;
  g.outfit.bottom = a.bottom || g.outfit.bottom;
  g.outfit.shoe = a.shoes || g.outfit.shoe;
  g.outfit.topColor = hex(a.topColor, g.outfit.topColor);
  g.outfit.bottomColor = hex(a.bottomColor, g.outfit.bottomColor);
  g.assistive.mobility = a.mobility === "wheelchair" ? "wheelchair" : undefined;
  g.assistive.aac = a.aac && a.aac !== "none" ? a.aac : undefined;
  g.assistive.hearing = a.hearing && a.hearing !== "none" ? a.hearing : undefined;
  g.assistive.glasses = a.glasses && a.glasses !== "none" ? a.glasses : undefined;
  return normalizeGenome(g);
}

function supportsAv(av, ov) {
  const a = { ...(av || {}), ...(ov || {}) };
  return SUPPORTED.hair.has(a.hair)
    && SUPPORTED.top.has(a.top)
    && SUPPORTED.bottom.has(a.bottom)
    && SUPPORTED.shoe.has(a.shoes)
    && (!a.layer || a.layer === "none")
    && SUPPORTED.mobility.has(a.mobility || "none");
}

function anatomyMetrics(g) {
  const body = {
    lean: { sh: 0.92, hip: 0.9, waist: 0.88 },
    balanced: { sh: 1, hip: 1, waist: 1 },
    broad: { sh: 1.12, hip: 1.02, waist: 1.05 },
    curves: { sh: 1, hip: 1.14, waist: 1.02 },
    full: { sh: 1.12, hip: 1.2, waist: 1.16 },
  }[g.anatomy.body] || { sh: 1, hip: 1, waist: 1 };
  const height = {
    shorter: 0.94,
    short: 0.97,
    medium: 1,
    tall: 1.04,
    taller: 1.08,
  }[g.anatomy.height] || 1;
  const p = g.anatomy.proportions || {};
  return {
    cx: 120,
    floor: 456,
    headCy: 62,
    headRx: 25 * (g.identity.faceShape === "round" ? 1.04 : g.identity.faceShape === "long" ? 0.94 : 1),
    headRy: 30 * (g.identity.faceShape === "round" ? 0.95 : g.identity.faceShape === "long" ? 1.08 : 1),
    shoulder: 43 * body.sh * num(p.shoulder, 1, 0.85, 1.2),
    waist: 34 * body.waist * num(p.waist, 1, 0.85, 1.24),
    hip: 45 * body.hip * num(p.hip, 1, 0.85, 1.28),
    scaleY: height,
  };
}

function pathHead(m) {
  const cx = m.cx;
  const rx = m.headRx;
  const ry = m.headRy;
  const top = m.headCy - ry;
  const bot = m.headCy + ry;
  const jaw = m.headCy + ry * 0.58;
  return [
    `M${round(cx)} ${round(top)}`,
    `C${round(cx - rx * 0.92)} ${round(top + 2)} ${round(cx - rx)} ${round(m.headCy + ry * 0.12)} ${round(cx - rx * 0.72)} ${round(jaw)}`,
    `C${round(cx - rx * 0.46)} ${round(bot - 2)} ${round(cx - rx * 0.18)} ${round(bot + 2)} ${round(cx)} ${round(bot + 3)}`,
    `C${round(cx + rx * 0.18)} ${round(bot + 2)} ${round(cx + rx * 0.46)} ${round(bot - 2)} ${round(cx + rx * 0.72)} ${round(jaw)}`,
    `C${round(cx + rx)} ${round(m.headCy + ry * 0.12)} ${round(cx + rx * 0.92)} ${round(top + 2)} ${round(cx)} ${round(top)} Z`,
  ].join(" ");
}

function eyePath(kind, x, y) {
  if (kind === "round") return `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="3.2"/>`;
  if (kind === "monolid") return `<path d="M${x - 5.2} ${y} Q${x} ${y - 3.1} ${x + 5.2} ${y}" fill="none"/>`;
  if (kind === "hooded") return `<path d="M${x - 5.2} ${y - 0.3} Q${x} ${y - 2.2} ${x + 5.4} ${y - 0.2}" fill="none"/><path d="M${x - 3.8} ${y + 1.2} Q${x} ${y + 2.7} ${x + 3.8} ${y + 1.2}" fill="none"/>`;
  return `<path d="M${x - 5.4} ${y} Q${x} ${y - 3.2} ${x + 5.4} ${y} Q${x} ${y + 3.1} ${x - 5.4} ${y} Z"/>`;
}

function compileAvatar(input, opts) {
  const g = normalizeGenome(input);
  const valid = validateGenome(g);
  if (!valid.ok) throw new Error(valid.errors.join(" "));

  const id = `fd${hashString(stableStringify(g)).slice(0, 10)}`;
  const m = anatomyMetrics(g);
  const skin = g.identity.skin;
  const hair = g.hair.color;
  const top = g.outfit.topColor;
  const denim = g.outfit.bottomColor;
  const lineW = g.artDirection.lineWeight;
  const ink = mix("#2d2621", hair, 0.18);
  const softInk = mix("#2f2823", hair, 0.16);
  const eye = g.identity.eyeColor;
  const lip = mix(skin, "#8f4e53", 0.46);
  const hoodieDark = shade(top, -0.17);
  const hoodieLight = shade(top, 0.18);
  const denimDark = shade(denim, -0.18);
  const denimLight = shade(denim, 0.22);
  const hairDark = shade(hair, -0.22);
  const hairLight = shade(hair, 0.22);
  const warm = mix("#fff6e8", "#ead9c4", 1 - g.artDirection.editorialWarmth);
  const crop = opts && opts.crop === "bust" ? "64 18 112 126" : `0 0 ${VIEW_W} ${VIEW_H}`;

  const shoulderL = m.cx - m.shoulder;
  const shoulderR = m.cx + m.shoulder;
  const waistL = m.cx - m.waist;
  const waistR = m.cx + m.waist;
  const hipL = m.cx - m.hip;
  const hipR = m.cx + m.hip;
  const ankleL = 98;
  const ankleR = 142;
  const fullScale = m.scaleY;
  const y = (value) => round(92 + (value - 92) * fullScale);

  const wheelchair = g.assistive.mobility === "wheelchair" ? `
    <g opacity="0.98">
      <circle cx="87" cy="351" r="54" fill="none" stroke="#3a3936" stroke-width="8"/>
      <circle cx="87" cy="351" r="39" fill="none" stroke="#817b72" stroke-width="2.6" opacity=".7"/>
      <circle cx="162" cy="394" r="17" fill="none" stroke="#3a3936" stroke-width="5"/>
      <path d="M90 312 C106 298 136 299 153 318 L165 380" fill="none" stroke="#3f3d39" stroke-width="8" stroke-linecap="round"/>
      <path d="M99 315 H156" stroke="#3f3d39" stroke-width="8" stroke-linecap="round"/>
      <path d="M104 330 L158 393" stroke="#6f6a62" stroke-width="4" stroke-linecap="round"/>
    </g>` : "";

  const pants = `
    <g>
      <path d="M${hipL + 5} ${y(218)} C${hipL - 1} ${y(260)} ${ankleL - 22} ${y(347)} ${ankleL - 13} ${y(432)}
        C${ankleL - 5} ${y(440)} ${ankleL + 15} ${y(440)} ${ankleL + 21} ${y(431)}
        C${ankleL + 18} ${y(363)} ${m.cx - 6} ${y(283)} ${m.cx - 4} ${y(229)} Z"
        fill="url(#denim_${id})"/>
      <path d="M${hipR - 5} ${y(218)} C${hipR + 1} ${y(260)} ${ankleR + 22} ${y(347)} ${ankleR + 13} ${y(432)}
        C${ankleR + 5} ${y(440)} ${ankleR - 15} ${y(440)} ${ankleR - 21} ${y(431)}
        C${ankleR - 18} ${y(363)} ${m.cx + 6} ${y(283)} ${m.cx + 4} ${y(229)} Z"
        fill="url(#denim_${id})"/>
      <path d="M${hipL + 7} ${y(220)} Q${m.cx} ${y(212)} ${hipR - 7} ${y(220)} L${hipR - 4} ${y(237)} Q${m.cx} ${y(244)} ${hipL + 4} ${y(237)} Z" fill="${denimDark}" opacity=".92"/>
      <path d="M${m.cx} ${y(238)} C${m.cx - 3} ${y(286)} ${m.cx - 5} ${y(356)} ${m.cx - 6} ${y(428)}" stroke="${denimDark}" stroke-width="1.6" opacity=".52" fill="none"/>
      <path d="M${ankleL - 12} ${y(416)} Q${ankleL + 2} ${y(423)} ${ankleL + 18} ${y(416)}" stroke="${denimLight}" stroke-width="1.5" fill="none" opacity=".45"/>
      <path d="M${ankleR - 18} ${y(416)} Q${ankleR - 2} ${y(423)} ${ankleR + 12} ${y(416)}" stroke="${denimLight}" stroke-width="1.5" fill="none" opacity=".45"/>
    </g>`;

  const shoes = `
    <g>
      <path d="M${ankleL - 20} ${y(435)} C${ankleL - 6} ${y(428)} ${ankleL + 14} ${y(430)} ${ankleL + 29} ${y(440)}
        Q${ankleL + 33} ${y(448)} ${ankleL + 24} ${y(452)} H${ankleL - 22} Q${ankleL - 31} ${y(448)} ${ankleL - 20} ${y(435)} Z" fill="#faf5eb" stroke="#d4c9b8" stroke-width="1.2"/>
      <path d="M${ankleR + 20} ${y(435)} C${ankleR + 6} ${y(428)} ${ankleR - 14} ${y(430)} ${ankleR - 29} ${y(440)}
        Q${ankleR - 33} ${y(448)} ${ankleR - 24} ${y(452)} H${ankleR + 22} Q${ankleR + 31} ${y(448)} ${ankleR + 20} ${y(435)} Z" fill="#faf5eb" stroke="#d4c9b8" stroke-width="1.2"/>
      <path d="M${ankleL - 10} ${y(438)} Q${ankleL + 5} ${y(434)} ${ankleL + 19} ${y(441)}" stroke="#b7ad9e" stroke-width="1.5" fill="none"/>
      <path d="M${ankleR + 10} ${y(438)} Q${ankleR - 5} ${y(434)} ${ankleR - 19} ${y(441)}" stroke="#b7ad9e" stroke-width="1.5" fill="none"/>
    </g>`;

  const neck = `
    <path d="M108 86 C108 99 109 107 102 116 C111 124 129 124 138 116 C131 107 132 99 132 86 Z" fill="url(#skin_${id})"/>
    <path d="M108 101 C116 108 125 108 132 101" fill="none" stroke="${shade(skin, -0.12)}" stroke-width="1.2" opacity=".45"/>`;

  const hoodie = `
    <g>
      <path d="M${shoulderL} ${y(116)}
        C${shoulderL - 16} ${y(127)} ${shoulderL - 24} ${y(164)} ${shoulderL - 20} ${y(218)}
        C${shoulderL - 10} ${y(233)} ${shoulderL + 7} ${y(232)} ${shoulderL + 11} ${y(214)}
        C${shoulderL + 3} ${y(176)} ${shoulderL + 7} ${y(144)} ${shoulderL + 16} ${y(127)} Z"
        fill="${hoodieDark}"/>
      <path d="M${shoulderR} ${y(116)}
        C${shoulderR + 16} ${y(127)} ${shoulderR + 24} ${y(164)} ${shoulderR + 20} ${y(218)}
        C${shoulderR + 10} ${y(233)} ${shoulderR - 7} ${y(232)} ${shoulderR - 11} ${y(214)}
        C${shoulderR - 3} ${y(176)} ${shoulderR - 7} ${y(144)} ${shoulderR - 16} ${y(127)} Z"
        fill="${hoodieDark}"/>
      <path d="M${shoulderL + 11} ${y(112)}
        C${waistL - 10} ${y(140)} ${waistL - 14} ${y(184)} ${hipL - 2} ${y(230)}
        Q${m.cx} ${y(244)} ${hipR + 2} ${y(230)}
        C${waistR + 14} ${y(184)} ${waistR + 10} ${y(140)} ${shoulderR - 11} ${y(112)}
        C${m.cx + 22} ${y(125)} ${m.cx - 22} ${y(125)} ${shoulderL + 11} ${y(112)} Z"
        fill="url(#hoodie_${id})"/>
      <path d="M94 ${y(111)} C98 ${y(92)} 142 ${y(92)} 146 ${y(111)} C137 ${y(126)} 104 ${y(126)} 94 ${y(111)} Z" fill="${shade(top, -0.09)}"/>
      <path d="M96 ${y(126)} C107 ${y(138)} 133 ${y(138)} 144 ${y(126)}" stroke="${hoodieLight}" stroke-width="2" fill="none" opacity=".58"/>
      <path d="M95 ${y(183)} Q${m.cx} ${y(196)} 145 ${y(183)} L143 ${y(211)} Q${m.cx} ${y(222)} 97 ${y(211)} Z" fill="${shade(top, -0.08)}" opacity=".78"/>
      <path d="M${m.cx} ${y(128)} C${m.cx - 8} ${y(152)} ${m.cx - 8} ${y(176)} ${m.cx} ${y(198)}" stroke="${shade(top, -0.18)}" stroke-width="1.2" opacity=".44" fill="none"/>
      <path d="M107 ${y(126)} C107 ${y(146)} 103 ${y(166)} 98 ${y(184)}" stroke="#f6f0e4" stroke-width="1.4" fill="none" opacity=".64"/>
      <path d="M133 ${y(126)} C133 ${y(146)} 137 ${y(166)} 142 ${y(184)}" stroke="#f6f0e4" stroke-width="1.4" fill="none" opacity=".64"/>
    </g>`;

  const hands = `
    <path d="M${shoulderL - 21} ${y(214)} C${shoulderL - 30} ${y(215)} ${shoulderL - 32} ${y(230)} ${shoulderL - 24} ${y(237)}
      C${shoulderL - 14} ${y(236)} ${shoulderL - 12} ${y(222)} ${shoulderL - 21} ${y(214)} Z" fill="url(#skin_${id})"/>
    <path d="M${shoulderR + 21} ${y(214)} C${shoulderR + 30} ${y(215)} ${shoulderR + 32} ${y(230)} ${shoulderR + 24} ${y(237)}
      C${shoulderR + 14} ${y(236)} ${shoulderR + 12} ${y(222)} ${shoulderR + 21} ${y(214)} Z" fill="url(#skin_${id})"/>`;

  const headPath = pathHead(m);
  const hairVolume = 1 + (g.hair.volume - 0.88) * 0.28;
  const hairBack = `
    <path d="M88 42
      C75 57 72 82 78 111
      C61 139 66 180 92 190
      C88 162 92 142 104 124
      C111 133 129 133 136 124
      C148 142 152 162 148 190
      C174 180 179 139 162 111
      C168 82 165 57 152 42
      C135 24 105 24 88 42 Z"
      fill="url(#hair_${id})" opacity=".98" transform="translate(${round((1 - hairVolume) * 5)} 0) scale(${hairVolume} 1)" transform-origin="120 110"/>
    <path d="M91 77 C80 107 81 139 93 174" stroke="${hairLight}" stroke-width="3" fill="none" opacity=".22" stroke-linecap="round"/>
    <path d="M151 77 C160 109 158 141 146 174" stroke="${hairDark}" stroke-width="4" fill="none" opacity=".26" stroke-linecap="round"/>`;

  const hairFront = `
    <path d="M93 45 C108 30 133 30 148 45 C139 37 125 42 120 51 C112 40 101 39 93 45 Z" fill="${hairDark}" opacity=".92"/>
    <path d="M97 52 C82 76 82 104 99 128 C88 146 84 169 95 187
      C107 190 113 177 108 162 C119 139 113 91 104 59 Z" fill="url(#hair_${id})"/>
    <path d="M143 52 C158 76 158 104 141 128 C152 146 156 169 145 187
      C133 190 127 177 132 162 C121 139 127 91 136 59 Z" fill="url(#hair_${id})"/>
    <path d="M101 66 C93 91 98 115 110 135 C101 150 99 166 104 179" stroke="${hairLight}" stroke-width="2.8" fill="none" opacity=".24" stroke-linecap="round"/>
    <path d="M139 66 C147 91 142 115 130 135 C139 150 141 166 136 179" stroke="${hairDark}" stroke-width="2.8" fill="none" opacity=".24" stroke-linecap="round"/>
    <path d="M114 42 C108 62 112 82 120 96 C128 82 132 62 126 42" stroke="${hairLight}" stroke-width="2.4" fill="none" opacity=".18" stroke-linecap="round"/>`;

  const browY = 61;
  const eyeY = 70;
  const face = `
    <g stroke="${ink}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M101 ${browY} Q108 ${browY - (g.identity.brow === "arched" ? 5 : 3)} 115 ${browY - 1}" stroke-width="${lineW + 0.4}" fill="none" opacity=".76"/>
      <path d="M125 ${browY - 1} Q132 ${browY - (g.identity.brow === "arched" ? 5 : 3)} 139 ${browY}" stroke-width="${lineW + 0.4}" fill="none" opacity=".76"/>
    </g>
    <g fill="#fffaf2" stroke="${ink}" stroke-width="${lineW}" opacity=".96">
      ${eyePath(g.identity.eye, 108, eyeY)}
      ${eyePath(g.identity.eye, 132, eyeY)}
    </g>
    <circle cx="108" cy="${eyeY}" r="2.4" fill="${eye}"/>
    <circle cx="132" cy="${eyeY}" r="2.4" fill="${eye}"/>
    <circle cx="108.6" cy="${eyeY - 0.7}" r=".7" fill="#fff" opacity=".9"/>
    <circle cx="132.6" cy="${eyeY - 0.7}" r=".7" fill="#fff" opacity=".9"/>
    <path d="M121 75 C118 81 118 86 122 88" stroke="${shade(skin, -0.26)}" stroke-width="1.2" fill="none" opacity=".34" stroke-linecap="round"/>
    <path d="M114 96 C118 100 125 100 129 96" stroke="${shade(lip, -0.22)}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M116 94 Q121 97 127 94" stroke="${lip}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".78"/>
    <circle cx="99" cy="86" r="5.5" fill="${mix(skin, "#d88f81", 0.42)}" opacity=".16"/>
    <circle cx="141" cy="86" r="5.5" fill="${mix(skin, "#d88f81", 0.42)}" opacity=".16"/>`;

  const aac = g.assistive.aac ? `
    <g transform="translate(154 ${y(160)}) rotate(8)">
      <rect x="0" y="0" width="31" height="42" rx="5" fill="#f8f4ea" stroke="#69625a" stroke-width="1.6"/>
      <rect x="5" y="7" width="8" height="8" rx="2" fill="#8aa382"/>
      <rect x="18" y="7" width="8" height="8" rx="2" fill="#c08457"/>
      <rect x="5" y="20" width="8" height="8" rx="2" fill="#8aa7bd"/>
      <rect x="18" y="20" width="8" height="8" rx="2" fill="#d39aa3"/>
    </g>` : "";

  const hearing = g.assistive.hearing ? `
    <path d="M96 73 C88 77 88 91 98 95" fill="none" stroke="#d9c8a8" stroke-width="3" stroke-linecap="round"/>
    <path d="M144 73 C152 77 152 91 142 95" fill="none" stroke="#d9c8a8" stroke-width="3" stroke-linecap="round"/>` : "";

  const glasses = g.assistive.glasses ? `
    <g fill="none" stroke="${softInk}" stroke-width="1.8">
      <rect x="98" y="64" width="20" height="14" rx="6"/>
      <rect x="122" y="64" width="20" height="14" rx="6"/>
      <path d="M118 70 H122"/>
    </g>` : "";

  return `<svg viewBox="${crop}" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" style="display:block;overflow:visible" role="img" aria-label="avatar">
  <defs>
    <linearGradient id="skin_${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade(skin, 0.13)}"/><stop offset=".56" stop-color="${skin}"/><stop offset="1" stop-color="${shade(skin, -0.11)}"/>
    </linearGradient>
    <linearGradient id="hair_${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${hairLight}"/><stop offset=".44" stop-color="${hair}"/><stop offset="1" stop-color="${hairDark}"/>
    </linearGradient>
    <linearGradient id="hoodie_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${hoodieLight}"/><stop offset=".68" stop-color="${top}"/><stop offset="1" stop-color="${hoodieDark}"/>
    </linearGradient>
    <linearGradient id="denim_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${denimLight}"/><stop offset=".62" stop-color="${denim}"/><stop offset="1" stop-color="${denimDark}"/>
    </linearGradient>
    <filter id="soft_${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#40362f" flood-opacity=".12"/>
    </filter>
  </defs>
  <g>
    <ellipse cx="120" cy="462" rx="55" ry="10" fill="${warm}" opacity=".46"/>
    ${wheelchair}
    ${hairBack}
    ${pants}
    ${shoes}
    ${neck}
    ${hoodie}
    ${hands}
    ${aac}
    <path d="${headPath}" fill="url(#skin_${id})"/>
    ${hearing}
    ${face}
    ${glasses}
    ${hairFront}
  </g>
  <metadata>${esc(stableStringify({ engine: "avatar-foundry", version: VERSION, seed: g.seed }))}</metadata>
</svg>`;
}

function critiqueGenome(genome) {
  const g = normalizeGenome(genome);
  const findings = [];
  const scores = {
    warmth: Math.round(g.artDirection.editorialWarmth * 100),
    dignity: 92,
    faceAppeal: g.identity.expression === "soft" || g.identity.expression === "calm" ? 88 : 76,
    silhouette: g.hair.style === "wavyM" && g.outfit.top === "hoodie" ? 90 : 70,
    recognizability: 86,
    outfitQuality: g.outfit.top === "hoodie" && g.outfit.bottom === "barrelJean" ? 88 : 68,
    representation: g.assistive.mobility || g.assistive.aac || g.assistive.hearing || g.assistive.glasses ? 88 : 78,
    notScary: 91,
  };
  if (scores.warmth < 80) findings.push({ code: "low-editorial-warmth", severity: 2, message: "Increase warm highlights or reduce stark contrast." });
  if (g.hair.volume < 0.62) findings.push({ code: "hair-too-flat", severity: 2, message: "Hair reads too flat for the lovable slice." });
  if (g.artDirection.detailLevel < 0.5) findings.push({ code: "low-detail", severity: 1, message: "Add a few garment or face details before promotion." });
  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);
  return { id: g.seed, scores, overall, findings };
}

module.exports = {
  VERSION,
  VIEW_W,
  VIEW_H,
  DEFAULT_HERO_GENOME,
  compileAvatar,
  critiqueGenome,
  genomeFromAv,
  hashString,
  normalizeGenome,
  stableStringify,
  supportsAv,
  validateGenome,
};
module.exports.default = compileAvatar;
