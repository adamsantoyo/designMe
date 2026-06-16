import React from "react";

export interface SubTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children?: React.ReactNode;
}

/** Pill sub-view tab; fills ink when selected. */
export function SubTab(props: SubTabProps): JSX.Element;
