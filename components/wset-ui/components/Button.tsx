import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx";

export type ButtonVariant = "primary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primary` = filled wine, `ghost` = outlined. */
  variant?: ButtonVariant;
  children: ReactNode;
}

/** Primary and ghost actions, with a built-in focus ring. */
export function Button({
  variant = "primary",
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={cx("wset-btn", `wset-btn--${variant}`, className)} {...rest}>
      {children}
    </button>
  );
}
