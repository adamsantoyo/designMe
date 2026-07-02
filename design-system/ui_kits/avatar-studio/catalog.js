/* designMe Avatar Studio — catalog data (faithful subset of the product) */
window.DM = {
  /* ---- person ---- */
  skins: [
    { id: "s1", v: "#3b2a21" }, { id: "s2", v: "#5c3f30" }, { id: "s3", v: "#7c5a45" },
    { id: "s4", v: "#8a5a3f" }, { id: "s5", v: "#a87c58" }, { id: "s6", v: "#bd8a5f" },
    { id: "s7", v: "#c99a6e" }, { id: "s8", v: "#d3b48f" }, { id: "s9", v: "#e3c4a2" }, { id: "s10", v: "#efd4b8" },
  ],
  bodies: [
    { id: "lean", label: "Lean" }, { id: "balanced", label: "Balanced" },
    { id: "broad", label: "Broad" }, { id: "curvy", label: "Curves" }, { id: "full", label: "Full" },
  ],
  heights: [
    { id: "shorter", label: "Shorter" }, { id: "short", label: "Short" },
    { id: "medium", label: "Medium" }, { id: "tall", label: "Tall" }, { id: "taller", label: "Taller" },
  ],
  hairStyles: [
    { id: "waves", label: "Waves" }, { id: "long", label: "Long" }, { id: "curly", label: "Curls" },
    { id: "bun", label: "Bun" }, { id: "braids", label: "Braids" },
    { id: "buzz", label: "Crop" }, { id: "bald", label: "Bald" },
  ],
  hairColors: [
    { v: "#211c1a", label: "Black" }, { v: "#3f2b1f", label: "Dark brown" }, { v: "#6f4a2f", label: "Brown" },
    { v: "#8a5a34", label: "Light brown" }, { v: "#c8a968", label: "Blonde" }, { v: "#cfcac3", label: "Silver" },
    { v: "#9a4a36", label: "Auburn" }, { v: "#c0673a", label: "Ginger" }, { v: "#6f4a72", label: "Plum" },
    { v: "#3f6f8a", label: "Ocean" }, { v: "#3f8a78", label: "Teal" }, { v: "#c0708f", label: "Rose" },
  ],
  expressions: [
    { id: "smile", label: "Smile" }, { id: "soft", label: "Soft" }, { id: "calm", label: "Calm" },
  ],
  features: [
    { id: "none", label: "None" }, { id: "freckles", label: "Freckles" }, { id: "vitiligo", label: "Vitiligo" },
  ],
  glasses: [
    { id: "none", label: "None" }, { id: "round", label: "Round" },
    { id: "rect", label: "Rectangle" }, { id: "cat", label: "Cat-eye" },
  ],
  hearing: [
    { id: "none", label: "None" }, { id: "aid", label: "Hearing aid" }, { id: "cochlear", label: "Cochlear" },
  ],

  /* ---- garments: each carries the design-language attributes the engine reads ---- */
  tops: [
    { id: "boxyTee",  label: "Boxy tee",      attrs: { sleeve: "short", len: "boxy", neck: "crew",   fit: "oversized", graphic: true } },
    { id: "babyTee",  label: "Baby tee",      attrs: { sleeve: "short", len: "crop", neck: "crew",   fit: "fitted" } },
    { id: "ribTank",  label: "Rib tank",      attrs: { sleeve: "tank",  len: "crop", neck: "scoop",  fit: "fitted", rib: true } },
    { id: "hoodie",   label: "Oversized hoodie", attrs: { sleeve: "long", len: "long", neck: "crew", fit: "oversized", hood: true, pocket: true } },
    { id: "bomber",   label: "Bomber jacket", attrs: { sleeve: "long",  len: "boxy", neck: "crew",   fit: "oversized", zip: true, rib: true } },
    { id: "cardigan", label: "Soft cardigan", attrs: { sleeve: "long",  len: "hip",  neck: "v",      fit: "relaxed", placket: true, chunky: true } },
    { id: "sweater",  label: "Chunky knit",   attrs: { sleeve: "long",  len: "hip",  neck: "crew",   fit: "relaxed", chunky: true } },
    { id: "turtle",   label: "Turtleneck",    attrs: { sleeve: "long",  len: "hip",  neck: "high",   fit: "fitted", chunky: true } },
    { id: "button",   label: "Relaxed shirt", attrs: { sleeve: "long",  len: "long", neck: "collar", fit: "relaxed", placket: true } },
    { id: "henley",   label: "Henley",        attrs: { sleeve: "long",  len: "hip",  neck: "crew",   fit: "fitted", placket: true } },
    { id: "corset",   label: "Crop corset",   attrs: { sleeve: "tank",  len: "crop", neck: "scoop",  fit: "fitted", corset: true } },
    { id: "slipDress",label: "Slip dress",    attrs: { sleeve: "strap", len: "dress",neck: "scoop",  fit: "drape", satin: true } },
  ],
  bottoms: [
    { id: "barrelJean",  label: "Barrel denim", attrs: { type: "barrel", denim: true } },
    { id: "wideTrouser", label: "Wide trouser", attrs: { type: "wide" } },
    { id: "cargo",       label: "Cargo pant",   attrs: { type: "cargo" } },
    { id: "track",       label: "Track pant",   attrs: { type: "track" } },
    { id: "parachute",   label: "Parachute",    attrs: { type: "parachute", ruched: true } },
    { id: "leggings",    label: "Leggings",     attrs: { type: "legg" } },
    { id: "shorts",      label: "Relaxed shorts", attrs: { type: "shorts" } },
    { id: "jorts",       label: "Baggy jorts",  attrs: { type: "jorts", denim: true } },
    { id: "midiSkirt",   label: "Midi skirt",   attrs: { type: "skirt", midi: true } },
    { id: "pleatedSkirt",label: "Pleated skirt",attrs: { type: "skirt", midi: true, pleated: true } },
    { id: "maxiSkirt",   label: "Cargo maxi",   attrs: { type: "skirt", maxi: true, cargo: true } },
  ],
  layers: [
    { id: "none",        label: "None",           attrs: { style: "none" } },
    { id: "overshirt",   label: "Open overshirt", attrs: { style: "overshirt" } },
    { id: "denimJacket", label: "Denim jacket",   attrs: { style: "denim" } },
    { id: "puffer",      label: "Puffer",         attrs: { style: "puffer" } },
    { id: "blazer",      label: "Relaxed blazer", attrs: { style: "blazer" } },
  ],
  patterns: [
    { id: "none", label: "Plain" }, { id: "stripe", label: "Stripes" }, { id: "plaid", label: "Plaid" },
  ],
  carries: [
    { id: "none", label: "None" }, { id: "tote", label: "Tote" }, { id: "crossbody", label: "Crossbody" },
  ],
  jewelry: [
    { id: "none", label: "None" }, { id: "necklace", label: "Necklace" }, { id: "earrings", label: "Earrings" },
  ],
  shoes: [
    { id: "sneaker", label: "Sneakers" }, { id: "boot", label: "Boots" },
    { id: "loafer", label: "Loafers" }, { id: "slide", label: "Slides" }, { id: "heel", label: "Heels" },
  ],
  garmentColors: [
    { v: "#e6dcc6", label: "Oat" }, { v: "#f1e9d8", label: "Cream" }, { v: "#c08457", label: "Clay" },
    { v: "#a8553a", label: "Rust" }, { v: "#bd6f4f", label: "Terracotta" }, { v: "#7d8254", label: "Olive" },
    { v: "#8aa382", label: "Sage" }, { v: "#46604b", label: "Pine" }, { v: "#3f8a86", label: "Teal" },
    { v: "#8aa7bd", label: "Sky" }, { v: "#5a6f8c", label: "Denim" }, { v: "#7a5570", label: "Plum" },
    { v: "#d39aa3", label: "Rose" }, { v: "#cda14e", label: "Mustard" }, { v: "#5e4334", label: "Cocoa" },
    { v: "#3c3a38", label: "Charcoal" },
  ],
  palettes: [
    { id: "p1", label: "Oat + graphite", top: "#f1e9d8", bottom: "#3c3a38" },
    { id: "p2", label: "Moss + denim", top: "#8aa382", bottom: "#5a6f8c" },
    { id: "p3", label: "Cocoa tonal", top: "#a9764f", bottom: "#5e4334" },
    { id: "p4", label: "Cherry accent", top: "#b23b43", bottom: "#3c3a38" },
    { id: "p5", label: "Washed blue", top: "#8aa7bd", bottom: "#3f6f7a" },
    { id: "p6", label: "Honey black", top: "#cda14e", bottom: "#29231f" },
  ],

  /* ---- vibes: one tap sets a whole outfit (top + bottom + colors + shoes) ---- */
  vibeFilters: ["All", "Everyday", "Soft", "Polished", "Streetwear", "Active", "Night"],
  vibes: [
    { id: "v_weekend", name: "Weekend Easy", tag: "easy casual", moods: ["Everyday"], note: "boxy tee, barrel denim, sneakers",
      set: { top: "boxyTee", bottom: "barrelJean", topColor: "#e6dcc6", bottomColor: "#5a6f8c", shoes: "sneaker", hair: "waves", carry: "crossbody" } },
    { id: "v_campus", name: "Campus Layer", tag: "layered casual", moods: ["Everyday", "Streetwear"], note: "striped tee, denim jacket, wide trouser",
      set: { top: "boxyTee", pattern: "stripe", bottom: "wideTrouser", topColor: "#f1e9d8", bottomColor: "#3c3a38", shoes: "sneaker", hair: "curly", layer: "denimJacket", layerColor: "#5a6f8c" } },
    { id: "v_cozy", name: "Cozy Knit", tag: "cozy neutral", moods: ["Everyday", "Soft"], note: "chunky knit, barrel denim, loafers",
      set: { top: "sweater", bottom: "barrelJean", topColor: "#c08457", bottomColor: "#5a6f8c", shoes: "loafer", hair: "bun", carry: "tote" } },
    { id: "v_romantic", name: "Soft Romantic", tag: "soft romantic", moods: ["Soft"], note: "cardigan, pleated skirt, loafers",
      set: { top: "cardigan", bottom: "pleatedSkirt", topColor: "#d39aa3", bottomColor: "#f1e9d8", shoes: "loafer", hair: "long" } },
    { id: "v_tailoring", name: "Quiet Tailoring", tag: "refined neutral", moods: ["Polished"], note: "turtleneck, wide trouser, loafers",
      set: { top: "turtle", bottom: "wideTrouser", topColor: "#5a6f8c", bottomColor: "#3c3a38", shoes: "loafer", hair: "buzz" } },
    { id: "v_mono", name: "Monochrome", tag: "monochrome", moods: ["Polished"], note: "boxy tee, wide trouser, boots",
      set: { top: "boxyTee", bottom: "wideTrouser", topColor: "#f1e9d8", bottomColor: "#29231f", shoes: "boot", hair: "curly" } },
    { id: "v_street", name: "Soft Street", tag: "oversized", moods: ["Streetwear"], note: "hoodie, barrel denim, sneakers",
      set: { top: "hoodie", bottom: "barrelJean", topColor: "#3c3a38", bottomColor: "#5a6f8c", shoes: "sneaker", hair: "curly" } },
    { id: "v_utility", name: "Utility Street", tag: "utility", moods: ["Streetwear"], note: "bomber, cargo pant, boots",
      set: { top: "bomber", bottom: "cargo", topColor: "#46604b", bottomColor: "#3c3a38", shoes: "boot", hair: "braids" } },
    { id: "v_active", name: "Off-duty Active", tag: "sporty", moods: ["Active"], note: "rib tank, track pant, sneakers",
      set: { top: "ribTank", bottom: "track", topColor: "#8aa382", bottomColor: "#3c3a38", shoes: "sneaker", hair: "highPony" === "highPony" ? "bun" : "bun" } },
    { id: "v_satin", name: "Satin Evening", tag: "evening", moods: ["Night", "Polished"], note: "slip dress, heels",
      set: { top: "slipDress", bottom: "maxiSkirt", topColor: "#bd6f4f", bottomColor: "#bd6f4f", shoes: "heel", hair: "long", jewelry: "necklace" } },
    { id: "v_downtown", name: "Downtown", tag: "downtown", moods: ["Night", "Streetwear"], note: "corset, leggings, boots",
      set: { top: "corset", bottom: "leggings", topColor: "#84647f", bottomColor: "#29231f", shoes: "boot", hair: "waves" } },
  ],
};
