import type { HTMLAttributes } from "react";
import { cx } from "../lib/cx";

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Fill width as a percentage, 0–100 (clamped). */
  percent: number;
  /** Left-hand label, e.g. "LO3 Principal varieties". */
  label?: string;
  /** Right-hand caption, e.g. "12/19 · 63%". */
  caption?: string;
  /** Greys the row out — e.g. when there's no data yet. */
  dim?: boolean;
}

/** A labelled progress row: label · track · caption. */
export function ProgressBar({ percent, label, caption, dim = false, className, ...rest }: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className={cx("wset-bar", dim && "wset-bar--dim", className)} {...rest}>
      {label != null && <span className="wset-bar__label">{label}</span>}
      <span className="wset-bar__track">
        <span className="wset-bar__fill" style={{ width: `${width}%` }} />
      </span>
      {caption != null && <span className="wset-bar__value">{caption}</span>}
    </div>
  );
}
