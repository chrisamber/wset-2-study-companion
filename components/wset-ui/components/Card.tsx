import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a hover lift + wine border — use for clickable cards. */
  interactive?: boolean;
  children: ReactNode;
}

/** The one surface everything in the WSET UI sits on. */
export function Card({ interactive = false, className, children, ...rest }: CardProps) {
  return (
    <div className={cx("wset-card", interactive && "wset-card--interactive", className)} {...rest}>
      {children}
    </div>
  );
}
