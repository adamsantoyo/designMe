// Web: load the design's fonts (Nunito UI/body, Newsreader wordmark) so the
// type matches the Claude Design export. react-native-web maps fontFamily +
// fontWeight to CSS, so a CDN @font-face with all weights is enough — no refactor.
if (typeof document !== "undefined" && !document.getElementById("dm-fonts")) {
  const preconnect = (href: string, cross?: boolean) => {
    const l = document.createElement("link");
    l.rel = "preconnect";
    l.href = href;
    if (cross) l.crossOrigin = "";
    document.head.appendChild(l);
  };
  preconnect("https://fonts.googleapis.com");
  preconnect("https://fonts.gstatic.com", true);
  const css = document.createElement("link");
  css.id = "dm-fonts";
  css.rel = "stylesheet";
  css.href =
    "https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,500;1,600&family=Nunito:wght@400;500;600;700;800;900&display=swap";
  document.head.appendChild(css);
}

// Web fonts come from the CDN above (no bundled TTFs), so there is nothing to await —
// report ready immediately. Same signature as the native useFonts-backed hook.
export function useAppFonts(): [boolean, Error | null] {
  return [true, null];
}
