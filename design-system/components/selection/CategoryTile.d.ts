import React from "react";

export interface CategoryTileProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Lucide-style icon node (24px viewBox). */
  icon?: React.ReactNode;
  label: string;
  selected?: boolean;
}

/** Vertical icon + label navigation tile for primary categories. */
export function CategoryTile(props: CategoryTileProps): JSX.Element;
