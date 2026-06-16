import React from "react";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children?: React.ReactNode;
}

/** Rounded filter/toggle pill; fills sage when selected. */
export function Chip(props: ChipProps): JSX.Element;
