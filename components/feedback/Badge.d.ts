import React from "react";

export type BadgeTone = "neutral" | "sage" | "terra" | "ink";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children?: React.ReactNode;
}

/** Small uppercase status/count pill. */
export function Badge(props: BadgeProps): JSX.Element;
