/* designMe — Lucide-style inline icons shared across the kit */
const Ico = (p, sw) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw || 2}
       strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%", display: "block" }}>
    {p}
  </svg>
);

window.Icons = {
  heart: () => Ico(<path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />, 2.2),
  shuffle: () => Ico(<><path d="M16 3h5v5" /><path d="M21 3l-7 7" /><path d="M8 21H3v-5" /><path d="M3 21l7-7" /><path d="M21 16v5h-5" /><path d="M14 14l7 7" /></>, 2.2),
  back: () => Ico(<path d="M15 18l-6-6 6-6" />, 2.4),
  undo: () => Ico(<><path d="M3 7v6h6" /><path d="M3 13a9 9 0 1 0 3-7.7L3 8" /></>, 2.4),
  check: () => Ico(<path d="M20 6L9 17l-5-5" />, 3),
  close: () => Ico(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>, 2.4),
  star: () => Ico(<path d="M12 3l2.2 5.6L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.8-.4z" />, 1.8),
  shirt: () => Ico(<path d="M8 4l4 3 4-3 4 4-3 2v9H7v-9L4 8z" />, 1.8),
  hair: () => Ico(<><path d="M5 13a7 7 0 0 1 14 0" /><path d="M5 13v4M19 13v4M12 6v3" /></>, 1.8),
  palette: () => Ico(<><path d="M12 3a9 9 0 1 0 0 18c1.6 0 1.5-2 2.5-3s3.5 0 3.5-2.5A6 6 0 0 0 12 3z" /><circle cx="8" cy="11" r="1" /><circle cx="12" cy="8" r="1" /><circle cx="16" cy="11" r="1" /></>, 1.8),
  face: () => Ico(<><circle cx="12" cy="12" r="8" /><circle cx="9.5" cy="11" r="1" /><circle cx="14.5" cy="11" r="1" /><path d="M9 15c1.5 1.2 4.5 1.2 6 0" /></>, 1.8),
  body: () => Ico(<><circle cx="12" cy="6" r="2.4" /><path d="M7 12c0-2 2-3 5-3s5 1 5 3l-1 8M8 20l-1-8" /></>, 1.8),
  tools: () => Ico(<><circle cx="6" cy="13" r="3.2" /><circle cx="18" cy="13" r="3.2" /><path d="M9.2 13h5.6M2 11l2-1M22 11l-2-1" /></>, 1.8),
  top: () => Ico(<path d="M8 4l4 3 4-3 4 4-3 2v9H7v-9L4 8z" />, 1.8),
  layer: () => Ico(<><path d="M9 4 5 7l2 3 1-1v11h4V5z" /><path d="M15 4l4 3-2 3-1-1v11h-4" /></>, 1.8),
  bag: () => Ico(<><path d="M6 9h12l-1 11q0 1-1 1H8q-1 0-1-1z" /><path d="M9 9V7a3 3 0 0 1 6 0v2" /></>, 1.8),
  bottom: () => Ico(<path d="M7 3h10l-1 18h-3l-1-11-1 11H7z" />, 1.8),
  shoe: () => Ico(<path d="M3 16v-5l5-2 3 3 8 2c2 .5 2 4 0 4H4z" />, 1.8),
};
