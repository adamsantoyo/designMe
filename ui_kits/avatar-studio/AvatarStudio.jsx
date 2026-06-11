/* designMe — Avatar Studio (UI kit recreation, outfit-first) */
const NS = window.DesignMeDesignSystem_157aab;
const { Button, IconButton, CategoryTile, Swatch, ColorDot, Chip, SubTab,
        VibeCard, DiscoverHero, Card, Toast, Badge } = NS;
const { useState, useRef } = React;
const DM = window.DM;

/* ---- resolve studio state into dmFigure options ---- */
function figOpts(s) {
  const top = DM.tops.find((t) => t.id === s.top) || DM.tops[0];
  const bottom = DM.bottoms.find((b) => b.id === s.bottom) || DM.bottoms[0];
  const layer = DM.layers.find((l) => l.id === s.layer) || DM.layers[0];
  return {
    skin: s.skin, hair: s.hair, hairColor: s.hairColor, body: s.body, height: s.height,
    expression: s.expression, glasses: s.glasses, hearing: s.hearing, feature: s.feature,
    top: { ...top.attrs, pattern: s.pattern }, topColor: s.topColor,
    bottom: bottom.attrs, bottomColor: s.bottomColor, shoes: s.shoes,
    layer: layer.attrs, layerColor: s.layerColor, carry: s.carry, jewelry: s.jewelry,
  };
}
function Figure({ state, box }) {
  return (
    <span className="figfit" style={{ width: "100%", height: "100%", ...box }}
      dangerouslySetInnerHTML={{ __html: window.dmFigure({ ...figOpts(state), height: state.height }) }} />
  );
}
/* small head-and-shoulders bust for face/hair-focused trays */
function Bust({ state }) {
  return (
    <span className="bustfit" style={{ width: "100%", height: "100%" }}
      dangerouslySetInnerHTML={{ __html: window.dmAvatar({
        skin: state.skin, hairColor: state.hairColor, hair: state.hair === "buzz" || state.hair === "bald" ? "crop" : state.hair,
        topColor: state.topColor, expression: state.expression,
        glasses: state.glasses, hearing: state.hearing, feature: state.feature, height: 120,
      }) }} />
  );
}

const CATS = [
  { id: "vibe", label: "Vibe", icon: "star" },
  { id: "top", label: "Top", icon: "top" },
  { id: "bottom", label: "Bottom", icon: "bottom" },
  { id: "layer", label: "Layer", icon: "layer" },
  { id: "shoes", label: "Shoes", icon: "shoe" },
  { id: "color", label: "Color", icon: "palette" },
  { id: "extras", label: "Extras", icon: "bag" },
  { id: "hair", label: "Hair", icon: "hair" },
  { id: "face", label: "Face", icon: "face" },
  { id: "body", label: "Body", icon: "body" },
  { id: "tools", label: "Tools", icon: "tools" },
];
const CAT_TITLE = { vibe: "Pick a vibe", top: "Tops", bottom: "Bottoms", layer: "Layers", shoes: "Shoes", color: "Palette & colors",
  extras: "Bags & jewelry", hair: "Hair", face: "Face & expression", body: "Skin & shape", tools: "Tools & access" };

const Eyebrow = ({ children }) => (
  <h3 style={{ margin: "0 0 9px", fontSize: "var(--text-2xs)", fontWeight: 800, letterSpacing: "var(--tracking-eyebrow)",
    textTransform: "uppercase", color: "var(--ink-soft)" }}>{children}</h3>
);

/* a garment preview chip: small mannequin showing just this piece on the current body */
function GarmentSwatch({ label, selected, onClick, render }) {
  return (
    <Swatch label={label} selected={selected} onClick={onClick} size="lg">
      <span className="figfit" style={{ width: 92, height: 122 }}>{render}</span>
    </Swatch>
  );
}

function AvatarStudio() {
  const [state, setState] = useState({
    skin: "#a87c58", body: "balanced", height: "medium",
    hair: "curly", hairColor: "#2e221b", expression: "smile",
    glasses: "none", hearing: "none", feature: "none",
    top: "hoodie", topColor: "#3c3a38", bottom: "barrelJean", bottomColor: "#5a6f8c", shoes: "sneaker",
    layer: "none", layerColor: "#5a6f8c", pattern: "none", carry: "none", jewelry: "none",
    vibe: null,
  });
  const [cat, setCat] = useState("vibe");
  const [vibeFilter, setVibeFilter] = useState("All");
  const [colorTarget, setColorTarget] = useState("top");
  const [looks, setLooks] = useState([]);
  const [saved, setSaved] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [discover, setDiscover] = useState(null);
  const histRef = useRef([]);

  const set = (patch) => { histRef.current.push(state); setState((s) => ({ ...s, ...patch })); };
  const undo = () => { const h = histRef.current; if (h.length) setState(h.pop()); };

  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const randomLook = () => ({
    skin: rnd(DM.skins).v, body: rnd(DM.bodies).id, height: rnd(DM.heights).id,
    hair: rnd(DM.hairStyles).id, hairColor: rnd(DM.hairColors).v, expression: rnd(DM.expressions).id,
    top: rnd(DM.tops).id, topColor: rnd(DM.garmentColors).v,
    bottom: rnd(DM.bottoms).id, bottomColor: rnd(DM.garmentColors).v, shoes: rnd(DM.shoes).id,
  });
  const shuffle = () => {
    const maybe = (a, p) => (Math.random() < p ? rnd(a.slice(1)).id : "none");
    set({ ...randomLook(), glasses: maybe(DM.glasses, 0.35), hearing: maybe(DM.hearing, 0.2), feature: maybe(DM.features, 0.3),
      layer: maybe(DM.layers, 0.3), layerColor: rnd(DM.garmentColors).v, pattern: maybe(DM.patterns, 0.22),
      carry: maybe(DM.carries, 0.3), jewelry: maybe(DM.jewelry, 0.25), vibe: null });
  };
  const saveLook = () => {
    setLooks((l) => [{ ...state }, ...l].slice(0, 12));
    setSaved(true); setPulse(true);
    setTimeout(() => setSaved(false), 1600);
    setTimeout(() => setPulse(false), 500);
  };
  const applyVibe = (v) => set({ layer: "none", pattern: "none", carry: "none", jewelry: "none", ...v.set, vibe: v.id });
  const vibePreview = (v) => ({ ...state, layer: "none", pattern: "none", carry: "none", jewelry: "none", ...v.set });

  const startDiscover = () => setDiscover({ a: { ...randomLook() }, b: { ...randomLook() }, round: 1 });
  const pick = (which) => {
    const chosen = discover[which];
    set({ ...chosen, vibe: null });
    if (discover.round >= 4) { setDiscover(null); return; }
    setDiscover({ a: chosen, b: { ...randomLook() }, round: discover.round + 1 });
  };

  const visibleVibes = vibeFilter === "All" ? DM.vibes : DM.vibes.filter((v) => v.moods.includes(vibeFilter));

  function Panel() {
    if (cat === "vibe") return (
      <div style={{ display: "grid", gap: 16 }}>
        <DiscoverHero onClick={startDiscover} />
        <div>
          <Eyebrow>Tap a style world</Eyebrow>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {DM.vibeFilters.map((f) => (
              <Chip key={f} selected={vibeFilter === f} onClick={() => setVibeFilter(f)}>{f}</Chip>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))", gap: 14 }}>
            {visibleVibes.map((v) => (
              <VibeCard key={v.id} name={v.name} tag={v.tag} note={v.note}
                colors={[v.set.topColor, v.set.bottomColor]} selected={state.vibe === v.id}
                onClick={() => applyVibe(v)} style={{ width: "100%" }}
                preview={<span className="figfit" style={{ width: "100%", height: 188 }}>
                  <Figure state={vibePreview(v)} />
                </span>} />
            ))}
          </div>
        </div>
      </div>
    );

    if (cat === "top") return (
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <Eyebrow>Top</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))", gap: 12 }}>
            {DM.tops.map((t) => (
              <GarmentSwatch key={t.id} label={t.label} selected={state.top === t.id}
                onClick={() => set({ top: t.id, vibe: null })}
                render={<Figure state={{ ...state, top: t.id }} />} />
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Pattern</Eyebrow>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DM.patterns.map((p) => (
              <Chip key={p.id} selected={state.pattern === p.id} onClick={() => set({ pattern: p.id, vibe: null })}>{p.label}</Chip>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Top color</Eyebrow>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {DM.garmentColors.map((c) => (
              <ColorDot key={c.v} color={c.v} label={c.label} selected={state.topColor === c.v}
                onClick={() => set({ topColor: c.v, vibe: null })} size={44} />
            ))}
          </div>
        </div>
      </div>
    );

    if (cat === "bottom") return (
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <Eyebrow>Bottom</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))", gap: 12 }}>
            {DM.bottoms.map((b) => (
              <GarmentSwatch key={b.id} label={b.label} selected={state.bottom === b.id}
                onClick={() => set({ bottom: b.id, vibe: null })}
                render={<Figure state={{ ...state, bottom: b.id }} />} />
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Bottom color</Eyebrow>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {DM.garmentColors.map((c) => (
              <ColorDot key={c.v} color={c.v} label={c.label} selected={state.bottomColor === c.v}
                onClick={() => set({ bottomColor: c.v, vibe: null })} size={44} />
            ))}
          </div>
        </div>
      </div>
    );

    if (cat === "layer") return (
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <Eyebrow>Layer</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))", gap: 12 }}>
            {DM.layers.map((l) => (
              <GarmentSwatch key={l.id} label={l.label} selected={state.layer === l.id}
                onClick={() => set({ layer: l.id, vibe: null })}
                render={<Figure state={{ ...state, layer: l.id }} />} />
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Layer color</Eyebrow>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {DM.garmentColors.map((c) => (
              <ColorDot key={c.v} color={c.v} label={c.label} selected={state.layerColor === c.v}
                onClick={() => set({ layerColor: c.v, vibe: null })} size={44} />
            ))}
          </div>
        </div>
      </div>
    );

    if (cat === "extras") return (
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <Eyebrow>Bags</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))", gap: 12 }}>
            {DM.carries.map((c) => (
              <GarmentSwatch key={c.id} label={c.label} selected={state.carry === c.id}
                onClick={() => set({ carry: c.id, vibe: null })}
                render={<Figure state={{ ...state, carry: c.id }} />} />
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Jewelry</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))", gap: 12 }}>
            {DM.jewelry.map((j) => (
              <GarmentSwatch key={j.id} label={j.label} selected={state.jewelry === j.id}
                onClick={() => set({ jewelry: j.id, vibe: null })}
                render={<Figure state={{ ...state, jewelry: j.id }} />} />
            ))}
          </div>
        </div>
      </div>
    );

    if (cat === "shoes") return (
      <div>
        <Eyebrow>Shoes</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))", gap: 12 }}>
          {DM.shoes.map((sh) => (
            <GarmentSwatch key={sh.id} label={sh.label} selected={state.shoes === sh.id}
              onClick={() => set({ shoes: sh.id, vibe: null })}
              render={<Figure state={{ ...state, shoes: sh.id }} />} />
          ))}
        </div>
      </div>
    );

    if (cat === "color") return (
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <Eyebrow>Coordinated palettes</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {DM.palettes.map((p) => (
              <Swatch key={p.id} label={p.label} selected={state.topColor === p.top && state.bottomColor === p.bottom}
                onClick={() => set({ topColor: p.top, bottomColor: p.bottom, vibe: null })} size="lg">
                <span style={{ display: "flex", gap: 6 }}>
                  <span style={{ width: 26, height: 46, borderRadius: 9, background: p.top, border: "1px solid rgba(0,0,0,.1)" }} />
                  <span style={{ width: 26, height: 46, borderRadius: 9, background: p.bottom, border: "1px solid rgba(0,0,0,.1)" }} />
                </span>
              </Swatch>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <SubTab selected={colorTarget === "top"} onClick={() => setColorTarget("top")}>Top</SubTab>
            <SubTab selected={colorTarget === "bottom"} onClick={() => setColorTarget("bottom")}>Bottom</SubTab>
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {DM.garmentColors.map((c) => (
              <ColorDot key={c.v} color={c.v} label={c.label}
                selected={(colorTarget === "top" ? state.topColor : state.bottomColor) === c.v}
                onClick={() => set(colorTarget === "top" ? { topColor: c.v, vibe: null } : { bottomColor: c.v, vibe: null })} size={44} />
            ))}
          </div>
        </div>
      </div>
    );

    if (cat === "hair") return (
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <Eyebrow>Hairstyle</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
            {DM.hairStyles.map((o) => (
              <Swatch key={o.id} label={o.label} selected={state.hair === o.id} onClick={() => set({ hair: o.id })} size="lg">
                <span className="bustfit" style={{ width: 78, height: 78 }}>
                  <Bust state={{ ...state, hair: o.id }} />
                </span>
              </Swatch>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Hair color</Eyebrow>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {DM.hairColors.map((o) => (
              <ColorDot key={o.v} color={o.v} label={o.label} selected={state.hairColor === o.v} onClick={() => set({ hairColor: o.v })} size={44} />
            ))}
          </div>
        </div>
      </div>
    );

    if (cat === "face") return (
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <Eyebrow>Expression</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
            {DM.expressions.map((o) => (
              <Swatch key={o.id} label={o.label} selected={state.expression === o.id} onClick={() => set({ expression: o.id })} size="lg">
                <span className="bustfit" style={{ width: 78, height: 78 }}>
                  <Bust state={{ ...state, expression: o.id }} />
                </span>
              </Swatch>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Skin features</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
            {DM.features.map((o) => (
              <Swatch key={o.id} label={o.label} selected={state.feature === o.id} onClick={() => set({ feature: o.id })} size="lg">
                <span className="bustfit" style={{ width: 78, height: 78 }}>
                  <Bust state={{ ...state, feature: o.id }} />
                </span>
              </Swatch>
            ))}
          </div>
        </div>
      </div>
    );

    if (cat === "body") return (
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <Eyebrow>Body</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(102px, 1fr))", gap: 12 }}>
            {DM.bodies.map((o) => (
              <GarmentSwatch key={o.id} label={o.label} selected={state.body === o.id}
                onClick={() => set({ body: o.id })} render={<Figure state={{ ...state, body: o.id }} />} />
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Height</Eyebrow>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DM.heights.map((o) => (
              <SubTab key={o.id} selected={state.height === o.id} onClick={() => set({ height: o.id })}>{o.label}</SubTab>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Skin tone</Eyebrow>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {DM.skins.map((o) => (
              <ColorDot key={o.v} color={o.v} selected={state.skin === o.v} onClick={() => set({ skin: o.v })} size={44} />
            ))}
          </div>
        </div>
      </div>
    );

    // tools
    return (
      <div style={{ display: "grid", gap: 18 }}>
        <p style={{ margin: "-2px 0 0", color: "var(--ink-soft)", fontSize: "var(--text-sm)", fontWeight: 650 }}>
          Glasses, hearing tech and more — everyday options, available to every avatar.
        </p>
        <div>
          <Eyebrow>Glasses</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
            {DM.glasses.map((o) => (
              <Swatch key={o.id} label={o.label} selected={state.glasses === o.id} onClick={() => set({ glasses: o.id })} size="lg">
                <span className="bustfit" style={{ width: 78, height: 78 }}>
                  <Bust state={{ ...state, glasses: o.id }} />
                </span>
              </Swatch>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>Hearing tech</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
            {DM.hearing.map((o) => (
              <Swatch key={o.id} label={o.label} selected={state.hearing === o.id} onClick={() => set({ hearing: o.id })} size="lg">
                <span className="bustfit" style={{ width: 78, height: 78 }}>
                  <Bust state={{ ...state, hearing: o.id }} />
                </span>
              </Swatch>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 14px 24px", fontFamily: "var(--font-rounded)" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 4px 10px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginRight: "auto" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 500, color: "var(--ink)" }}>
            design<b style={{ fontStyle: "italic", fontWeight: 600 }}>Me</b>
          </span>
          <span style={{ color: "var(--ink-soft)", fontSize: "var(--text-sm)", fontWeight: 700, whiteSpace: "nowrap" }}>Find Your Vibe</span>
        </div>
        <Button variant="ghost" icon={<span style={{ width: 20, height: 20, display: "block" }}><window.Icons.shuffle /></span>} onClick={shuffle}>Shuffle</Button>
        <Button variant="primary" icon={<span style={{ width: 20, height: 20, display: "block" }}><window.Icons.heart /></span>} onClick={saveLook}>Save look</Button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 380px) minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
        <section style={{ position: "sticky", top: 16 }}>
          <Card tone="raised" padding={10} style={{ borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", position: "relative" }}>
            <div className="figfit" style={{ transform: pulse ? "scale(1.03)" : "scale(1)", transition: "transform var(--dur-slow) var(--ease)", height: "min(68vh, 600px)" }}>
              <Figure state={state} />
            </div>
            <div style={{ position: "absolute", left: "50%", bottom: 14, transform: "translateX(-50%)" }}>
              <Toast tone="sage" show={saved} icon={<span style={{ width: 16, height: 16, display: "block" }}><window.Icons.check /></span>}>Saved</Toast>
            </div>
          </Card>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <nav style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(64px, 1fr)", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {CATS.map((c) => (
              <CategoryTile key={c.id} label={c.label} selected={cat === c.id} onClick={() => setCat(c.id)}
                icon={<span style={{ width: 26, height: 26, display: "block" }}>{React.createElement(window.Icons[c.icon])}</span>} />
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button variant="ghost" size="sm" disabled={!histRef.current.length} onClick={undo}
              icon={<span style={{ width: 18, height: 18, display: "block" }}><window.Icons.undo /></span>}>Undo</Button>
            <span style={{ marginLeft: "auto", color: "var(--ink-soft)", fontSize: "var(--text-sm)", fontWeight: 700 }}>Tap to try it on</span>
          </div>

          <Card padding={14} style={{ borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", minHeight: 280 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--ink)" }}>{CAT_TITLE[cat]}</h2>
            <Panel />
          </Card>

          <Card padding={12} style={{ borderRadius: "var(--radius-md)" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "var(--text-2xs)", fontWeight: 800, letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 16, height: 16, display: "block", color: "var(--ink-soft)" }}><window.Icons.heart /></span>
              Your lookbook {looks.length ? <Badge tone="sage" style={{ marginLeft: 4 }}>{looks.length}</Badge> : null}
            </h3>
            {looks.length === 0 ? (
              <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "var(--text-sm)", fontWeight: 650 }}>No saved looks yet — tap “Save look”.</p>
            ) : (
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {looks.map((lk, i) => (
                  <button key={i} onClick={() => set(lk)} aria-label={"Saved look " + (i + 1)}
                    style={{ flex: "0 0 auto", width: 86, height: 124, padding: 3, borderRadius: 14, cursor: "pointer",
                      border: "1.5px solid var(--line-2)", background: "var(--surface-2)", overflow: "hidden" }}>
                    <span className="figfit" style={{ width: "100%", height: "100%" }}>
                      <Figure state={lk} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>

      {discover ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(40,32,26,.62)" }}
          onClick={() => setDiscover(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(820px, 96vw)", background: "var(--surface)", borderRadius: "var(--radius-2xl)",
            border: "1px solid var(--line)", boxShadow: "var(--shadow-xl)", padding: "24px 24px 20px", position: "relative", textAlign: "center" }}>
            <div style={{ position: "absolute", top: 14, right: 16 }}>
              <IconButton label="Close" size={44} onClick={() => setDiscover(null)}>
                <span style={{ width: 20, height: 20, display: "block" }}><window.Icons.close /></span>
              </IconButton>
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", margin: "4px 0 2px", fontSize: 30, fontWeight: 500, color: "var(--ink)" }}>Find my vibe</h2>
            <p style={{ margin: "0 0 16px", color: "var(--ink-soft)", fontWeight: 650 }}>Tap the one you like — no wrong answers · {discover.round} of 4</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              {["a", "b"].map((k, idx) => (
                <React.Fragment key={k}>
                  <button onClick={() => pick(k)} style={{ flex: "1 1 0", minWidth: 0, border: "2px solid var(--line)", borderRadius: "var(--radius-xl)",
                    background: "radial-gradient(80% 60% at 50% 12%, rgba(255,255,255,.92), rgba(255,255,255,0) 60%), linear-gradient(180deg, rgba(255,255,255,.6), rgba(205,191,176,.26))",
                    padding: 8, cursor: "pointer", transition: "transform var(--dur-base) var(--ease)" }}>
                    <span className="figfit" style={{ width: "100%", height: 320 }}>
                      <Figure state={discover[k]} />
                    </span>
                  </button>
                  {idx === 0 ? <span style={{ fontWeight: 900, color: "var(--ink-soft)" }}>or</span> : null}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
window.AvatarStudio = AvatarStudio;
