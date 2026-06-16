import React from "react";

export interface DiscoverHeroProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  title?: string;
  subtitle?: string;
  /** Leading glyph (emoji or node). Defaults to ✨. */
  icon?: React.ReactNode;
}

/** Warm "Find my vibe" CTA that opens the this-or-that discovery flow. */
export function DiscoverHero(props: DiscoverHeroProps): JSX.Element;
