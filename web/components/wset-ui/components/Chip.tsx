import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

/** A small pill / tag for counts, labels, and metadata. */
export function Chip({ className, children, ...rest }: ChipProps) {
  return (
    <span className={cx("wset-chip", className)} {...rest}>
      {children}
    </span>
  );
}
