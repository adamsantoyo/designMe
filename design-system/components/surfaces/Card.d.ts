import React from "react";

export type CardTone = "flat" | "raised" | "inset";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  /** Padding in px (or any CSS value). Defaults to 12. */
  padding?: number | string;
  children?: React.ReactNode;
}

/** Soft paper panel — the default grouping surface. */
export function Card(props: CardProps): JSX.Element;
