import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx";

export type BadgeTone = "distinction" | "merit" | "pass" | "fail" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Maps to the WSET result bands; `neutral` for everything else. */
  tone?: BadgeTone;
  children: ReactNode;
}

/** A result-band pill (Distinction / Merit / Pass / Fail). */
export function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx("wset-badge", `wset-badge--${tone}`, className)} {...rest}>
      {children}
    </span>
  );
}
