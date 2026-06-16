import React from "react";

export type IconButtonShape = "circle" | "rounded";
export type IconButtonVariant = "surface" | "primary" | "ghost";

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Required accessible label (icon-only control). */
  label: string;
  /** Icon node (e.g. a Lucide <svg>). */
  children: React.ReactNode;
  shape?: IconButtonShape;
  variant?: IconButtonVariant;
  /** Square px size. Defaults to 56. */
  size?: number;
  disabled?: boolean;
}

/** Circular / rounded icon-only button on soft paper material. */
export function IconButton(props: IconButtonProps): JSX.Element;
