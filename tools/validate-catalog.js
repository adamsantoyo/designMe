#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const rootDir = path.resolve(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');

function loadCatalog(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const start = html.indexOf('const CAT = {};');
  const end = html.indexOf('/* index helpers */', start);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not locate the CAT catalog block in index.html');
  }

  const sandbox = {};
  const code = `${html.slice(start, end)}\nglobalThis.CAT = CAT;`;
  vm.runInNewContext(code, sandbox, { filename: 'catalog-block.js' });

  if (!sandbox.CAT || typeof sandbox.CAT !== 'object') {
    throw new Error('CAT catalog did not evaluate to an object');
  }

  return { CAT: sandbox.CAT, html };
}

const errors = [];
const warnings = [];
const metadataKeys = [
  'category',
  'group',
  'tags',
  'status',
  'flatAssetStatus',
  'threeDStatus',
  'promptNotes',
  'svgNotes',
  'priority',
];

function error(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

function buildIdSet(CAT, category) {
  const arr = CAT[category];
  if (!Array.isArray(arr)) return new Set();
  return new Set(arr.map((item) => item && item.id));
}

function validateUniqueIds(CAT) {
  for (const [category, arr] of Object.entries(CAT)) {
    if (!Array.isArray(arr)) {
      error(`CAT.${category} is not an array`);
      continue;
    }

    const seenIds = new Map();
    const seenLabels = new Map();

    arr.forEach((item, index) => {
      const context = `CAT.${category}[${index}]`;
      if (!isPlainObject(item)) {
        error(`${context} is not an object`);
        return;
      }

      if (!isNonEmptyString(item.id)) {
        error(`${context} has a missing or empty id`);
      } else if (seenIds.has(item.id)) {
        error(`CAT.${category} has duplicate id "${item.id}" at indexes ${seenIds.get(item.id)} and ${index}`);
      } else {
        seenIds.set(item.id, index);
      }

      if (!isNonEmptyString(item.label)) {
        error(`${context} (${item.id || 'missing id'}) has a missing or empty label`);
      } else {
        const normalized = item.label.trim().toLowerCase();
        if (seenLabels.has(normalized)) {
          error(`CAT.${category} has duplicate label "${item.label}" at indexes ${seenLabels.get(normalized)} and ${index}`);
        } else {
          seenLabels.set(normalized, index);
        }
      }
    });
  }
}

function validateRefs(CAT) {
  const idSets = {};
  for (const category of Object.keys(CAT)) idSets[category] = buildIdSet(CAT, category);

  const vibeSetRefs = {
    top: 'top',
    bottom: 'bottom',
    shoe: 'shoe',
    carry: 'carry',
    texture: 'texture',
    makeup: 'makeup',
    makeupColor: 'makeupColor',
    hair: 'hair',
    hairColor: 'hairColor',
    jewelry: 'jewelry',
    glasses: 'glasses',
    mobility: 'mobility',
    aac: 'aac',
    hearing: 'hearing',
  };

  if (!Array.isArray(CAT.vibe)) {
    error('CAT.vibe is missing or not an array');
    return;
  }

  for (const vibe of CAT.vibe) {
    const context = `vibe ${vibe && vibe.id ? vibe.id : '(missing id)'}`;
    if (!isPlainObject(vibe.set)) {
      error(`${context} has missing set object`);
      continue;
    }

    if (!Array.isArray(vibe.moods) || vibe.moods.length === 0) {
      error(`${context} has missing moods`);
    } else {
      for (const mood of vibe.moods) {
        if (!idSets.vibeFilters.has(mood)) {
          error(`${context} references missing vibe filter "${mood}"`);
        }
      }
    }

    for (const [key, category] of Object.entries(vibeSetRefs)) {
      if (Object.prototype.hasOwnProperty.call(vibe.set, key) && !idSets[category].has(vibe.set[key])) {
        error(`${context} set.${key} references missing CAT.${category} id "${vibe.set[key]}"`);
      }
    }

    for (const key of ['topColor', 'bottomColor']) {
      if (Object.prototype.hasOwnProperty.call(vibe.set, key) && !isHexColor(vibe.set[key])) {
        error(`${context} set.${key} must be a #rrggbb color`);
      }
    }
  }
}

function validateCatalogMetadata(CAT) {
  const validStatuses = new Set(['keep', 'rename', 'add', 'cut', 'needs-redesign']);
  const validFlatAssetStatuses = new Set(['current-renderer', 'needs-svg', 'needs-png-concept', 'future']);
  const validThreeDStatuses = new Set(['not-started']);
  const validPriorities = new Set(['P0', 'P1', 'P2']);

  for (const [category, arr] of Object.entries(CAT)) {
    if (!Array.isArray(arr)) continue;

    for (const item of arr) {
      const context = `CAT.${category}.${item && item.id ? item.id : '(missing id)'}`;

      if (item.category !== category) {
        error(`${context}.category must equal "${category}"`);
      }
      if (!isNonEmptyString(item.group)) {
        error(`${context}.group must be a non-empty string`);
      }
      if (!Array.isArray(item.tags) || item.tags.some((tag) => !isNonEmptyString(tag))) {
        error(`${context}.tags must be an array of non-empty strings`);
      }
      if (!validStatuses.has(item.status)) {
        error(`${context}.status must be one of ${Array.from(validStatuses).join(', ')}`);
      }
      if (!validFlatAssetStatuses.has(item.flatAssetStatus)) {
        error(`${context}.flatAssetStatus must be one of ${Array.from(validFlatAssetStatuses).join(', ')}`);
      }
      if (!validThreeDStatuses.has(item.threeDStatus)) {
        error(`${context}.threeDStatus must be one of ${Array.from(validThreeDStatuses).join(', ')}`);
      }
      if (!isNonEmptyString(item.promptNotes)) {
        error(`${context}.promptNotes must be a non-empty string`);
      }
      if (!isNonEmptyString(item.svgNotes)) {
        error(`${context}.svgNotes must be a non-empty string`);
      }
      if (!validPriorities.has(item.priority)) {
        error(`${context}.priority must be one of ${Array.from(validPriorities).join(', ')}`);
      }
    }
  }
}

function validateTopContract(CAT) {
  const validSleeves = new Set(['tank', 'short', 'long', 'strap']);
  const validLengths = new Set(['crop', 'hip', 'boxy', 'long', 'dress']);
  const validNecks = new Set(['scoop', 'asym', 'v', 'collar', 'crew', 'high']);
  const validFits = new Set(['fitted', 'oversized', 'relaxed', 'boxy', 'drape']);
  const knownFlags = new Set([
    'id', 'label', 'sleeve', 'len', 'neck', 'fit',
    'corset', 'rib', 'jersey', 'layered', 'graphic', 'mesh',
    'hood', 'pocket', 'zip', 'placket', 'chunky', 'pockets',
    'panels', 'satin', 'pattern',
    ...metadataKeys,
  ]);

  if (!Array.isArray(CAT.top)) {
    error('CAT.top is missing or not an array');
    return;
  }

  for (const item of CAT.top) {
    const context = `top ${item && item.id ? item.id : '(missing id)'}`;

    for (const key of ['sleeve', 'len', 'neck', 'fit']) {
      if (!isNonEmptyString(item[key])) {
        error(`${context} is missing required render attribute "${key}"`);
      }
    }

    if (isNonEmptyString(item.sleeve) && !validSleeves.has(item.sleeve)) {
      error(`${context} has unsupported sleeve "${item.sleeve}"`);
    }
    if (isNonEmptyString(item.len) && !validLengths.has(item.len)) {
      error(`${context} has unsupported len "${item.len}"`);
    }
    if (isNonEmptyString(item.neck) && !validNecks.has(item.neck)) {
      error(`${context} has unsupported neck "${item.neck}"`);
    }
    if (isNonEmptyString(item.fit) && !validFits.has(item.fit)) {
      error(`${context} has unsupported fit "${item.fit}"`);
    }

    for (const key of Object.keys(item)) {
      if (!knownFlags.has(key)) warn(`${context} has unknown top attribute "${key}"`);
    }
  }
}

function validateBottomContract(CAT) {
  const validTypes = new Set(['jorts', 'skirt', 'wide', 'barrel', 'cargo', 'legg', 'shorts', 'track', 'parachute']);
  const knownFlags = new Set(['id', 'label', 'type', 'maxi', 'cargo', 'track', 'ruched', 'pleated', 'midi', 'denim', ...metadataKeys]);

  if (!Array.isArray(CAT.bottom)) {
    error('CAT.bottom is missing or not an array');
    return;
  }

  for (const item of CAT.bottom) {
    const context = `bottom ${item && item.id ? item.id : '(missing id)'}`;

    if (!isNonEmptyString(item.type)) {
      error(`${context} is missing required render attribute "type"`);
    } else if (!validTypes.has(item.type)) {
      error(`${context} has unsupported type "${item.type}"`);
    }

    for (const key of Object.keys(item)) {
      if (!knownFlags.has(key)) warn(`${context} has unknown bottom attribute "${key}"`);
    }

    if (item.id === 'trackPant' && item.type !== 'track') {
      warn(`${context} is labeled ${item.label} but dmFigure track treatment expects type "track"`);
    }
    if (item.id === 'parachute' && item.type !== 'parachute') {
      warn(`${context} is labeled ${item.label} but dmFigure parachute treatment expects type "parachute"`);
    }
  }
}

function validateColorValues(CAT) {
  const colorCategories = ['skin', 'eyeColor', 'makeupColor', 'hairColor', 'garmentColor', 'shoe', 'carry', 'aura'];

  for (const category of colorCategories) {
    if (!Array.isArray(CAT[category])) continue;

    for (const item of CAT[category]) {
      const context = `CAT.${category}.${item.id}`;
      for (const key of ['base', 'v', 'd', 'color', 'sole', 'c']) {
        if (Object.prototype.hasOwnProperty.call(item, key) && item[key] && !isHexColor(item[key])) {
          error(`${context}.${key} must be a #rrggbb color`);
        }
      }
    }
  }

  if (Array.isArray(CAT.palette)) {
    for (const palette of CAT.palette) {
      for (const key of ['top', 'bottom']) {
        if (!isHexColor(palette[key])) error(`palette ${palette.id}.${key} must be a #rrggbb color`);
      }
    }
  }
}

function validateTextures(CAT, html) {
  if (!Array.isArray(CAT.texture)) return;
  for (const texture of CAT.texture) {
    if (!isNonEmptyString(texture.pat)) {
      error(`texture ${texture.id} is missing pattern id`);
    } else if (!html.includes(`id="${texture.pat}"`)) {
      error(`texture ${texture.id} references missing SVG pattern "${texture.pat}"`);
    }
  }
}

function validateRendererReachability(CAT, html) {
  const shoeIds = buildIdSet(CAT, 'shoe');
  const rendererShoes = ['boot', 'heel', 'runner', 'loafer', 'mary', 'slide', 'sneaker'];
  for (const shoe of rendererShoes) {
    if (!shoeIds.has(shoe)) warn(`dmFigure supports shoe "${shoe}" but CAT.shoe does not expose it`);
  }

  const bottomTypes = new Set((CAT.bottom || []).map((item) => item.type));
  for (const type of ['track', 'parachute']) {
    if (!bottomTypes.has(type)) warn(`dmFigure has a bottom type branch for "${type}" but no CAT.bottom item uses that type`);
  }

  const topPatterns = new Set((CAT.top || []).map((item) => item.pattern).filter(Boolean));
  if (!topPatterns.has('stripe')) {
    warn('dmFigure supports top.pattern "stripe", but no current CAT.top item exposes it');
  }
  if (!topPatterns.has('plaid')) {
    warn('dmFigure supports top.pattern "plaid", but no current CAT.top item exposes it');
  }

  for (const style of ['denim', 'puffer', 'blazer', 'overshirt']) {
    warn(`dmFigure supports outer layer style "${style}", but there is no CAT layer category`);
  }

  if (html.includes('HAIR_IMG') && html.includes('<image href=')) {
    warn('Catalog/render path includes an SVG <image href>; production avatar assets should be inline SVG/renderer logic');
  }
}

function validateMainRendererCoverage() {
  // Categories still not consumed by the main dmFigure renderer.
  // Wired in 2026-06-17 renderer pass: brow, eye, eyeColor, nose, lip, makeup,
  // makeupColor, piercing, feature, aura, aac, and mobility (cane).
  const ignoredByMain = [
    'faceShape', // dmFigure head is a fixed ellipse; faceShape not yet applied
  ];

  for (const category of ignoredByMain) {
    warn(`CAT.${category} is exposed in UI but is not passed through stateToFigureOpts() to the main dmFigure renderer`);
  }

  // The shipping svgparts engine renders mobility/wheelchair (traced part, z0); only the
  // dmFigure complete-fallback still lacks a seated pose, so a wheelchair look that also
  // hits an un-traced slot degrades to a standing figure. Cosmetic, fallback-only.
  warn('dmFigure fallback renders mobility "cane" but not a seated "wheelchair" pose (svgparts renders wheelchair; standing-only fallback is a known dedicated-pass item)');
}

function printResults(CAT) {
  console.log('designMe catalog validation');
  console.log(`Categories: ${Object.keys(CAT).length}`);
  console.log(`Items: ${Object.values(CAT).reduce((sum, value) => sum + (Array.isArray(value) ? value.length : 0), 0)}`);

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.forEach((message) => console.log(`- ${message}`));
  }

  if (errors.length > 0) {
    console.error(`\nErrors (${errors.length}):`);
    errors.forEach((message) => console.error(`- ${message}`));
    process.exitCode = 1;
    return;
  }

  console.log('\nNo catalog validation errors found.');
}

try {
  const { CAT, html } = loadCatalog(indexPath);
  validateUniqueIds(CAT);
  validateRefs(CAT);
  validateCatalogMetadata(CAT);
  validateTopContract(CAT);
  validateBottomContract(CAT);
  validateColorValues(CAT);
  validateTextures(CAT, html);
  validateRendererReachability(CAT, html);
  validateMainRendererCoverage();
  printResults(CAT);
} catch (err) {
  console.error(`Catalog validation failed: ${err.message}`);
  process.exitCode = 1;
}
