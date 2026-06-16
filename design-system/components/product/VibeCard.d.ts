import React from "react";

/**
 * The signature designMe "look" card with three-tier label (tag / name / note).
 *
 * @startingPoint section="Product" subtitle="The signature look / vibe card" viewport="700x320"
 */
export interface VibeCardProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Look preview node (a mini avatar / image). */
  preview?: React.ReactNode;
  /** Demoted trend / jargon word (small uppercase chip). */
  tag?: string;
  /** Concrete, recognition-first look name. */
  name: string;
  /** Plain-language description of the pieces. */
  note?: string;
  /** Up to two garment colors — drive the card tint and chips. */
  colors?: string[];
  selected?: boolean;
}

export function VibeCard(props: VibeCardProps): JSX.Element;
