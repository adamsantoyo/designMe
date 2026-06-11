import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Rounded pill action button in the designMe brand.
 *
 * @startingPoint section="Buttons" subtitle="Pill action button — primary / secondary / ghost" viewport="700x150"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. "primary" = terracotta commit action; "secondary" = paper default; "ghost" = transparent. */
  variant?: ButtonVariant;
  /** Target size. Defaults to "md" (48px floor). */
  size?: ButtonSize;
  /** Optional leading icon node (e.g. a Lucide <svg>). */
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
