import React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

/** Tiny uppercase editorial eyebrow chip (demoted trend/jargon word). */
export function Tag(props: TagProps): JSX.Element;
