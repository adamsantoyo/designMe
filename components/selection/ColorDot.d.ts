import React from "react";

export interface ColorDotProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "aria-label"> {
  /** Any CSS color or gradient string. */
  color?: string;
  label?: string;
  selected?: boolean;
  /** Square px diameter. Defaults to 56. */
  size?: number;
}

/** Round color choice (skin / hair / garment) with selected ring. */
export function ColorDot(props: ColorDotProps): JSX.Element;
