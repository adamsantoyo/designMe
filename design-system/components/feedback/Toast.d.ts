import React from "react";

export type ToastTone = "ink" | "sage";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: ToastTone;
  icon?: React.ReactNode;
  /** Controls visibility (fade/slide). Defaults to true. */
  show?: boolean;
  children?: React.ReactNode;
}

/** Gentle, low-arousal confirmation pill. */
export function Toast(props: ToastProps): JSX.Element;
