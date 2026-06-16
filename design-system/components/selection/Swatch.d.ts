import React from "react";

/**
 * Recognition-first choice tile with selected ring + checkmark.
 *
 * @startingPoint section="Selection" subtitle="Recognition-first choice tile with selected state" viewport="700x150"
 */
export interface SwatchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Accessible label, also shown below the preview. */
  label?: string;
  /** Visual preview node (mini avatar / color dot / garment). */
  children?: React.ReactNode;
  selected?: boolean;
  size?: "md" | "lg";
}

export function Swatch(props: SwatchProps): JSX.Element;
