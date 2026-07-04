import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx";

export type AlertTone = "success" | "error" | "note";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** `success` = green, `error` = red, `note` = wine/blush. */
  tone?: AlertTone;
  /** Bold heading line. */
  title?: ReactNode;
  children?: ReactNode;
}

/** Inline feedback — correct/incorrect answers, hints, and notes. */
export function Alert({ tone = "note", title, className, children, ...rest }: AlertProps) {
  return (
    <div className={cx("wset-alert", `wset-alert--${tone}`, className)} {...rest}>
      {title != null && <p className="wset-alert__title">{title}</p>}
      {children != null && <p className="wset-alert__body">{children}</p>}
    </div>
  );
}
