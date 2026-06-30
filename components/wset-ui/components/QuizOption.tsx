import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx";

export type QuizOptionState = "default" | "selected" | "correct" | "wrong" | "dimmed";

export interface QuizOptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The option letter, e.g. "A". */
  letter: string;
  /** Visual state, driven by the quiz engine. */
  state?: QuizOptionState;
  /** The answer text. */
  children: ReactNode;
}

const STATE_CLASS: Record<QuizOptionState, string> = {
  default: "",
  selected: "wset-option--selected",
  correct: "wset-option--correct",
  wrong: "wset-option--wrong",
  dimmed: "wset-option--dimmed",
};

/** An answer button with a letter badge and five visual states. */
export function QuizOption({
  letter,
  state = "default",
  type = "button",
  className,
  children,
  ...rest
}: QuizOptionProps) {
  return (
    <button type={type} className={cx("wset-option", STATE_CLASS[state], className)} {...rest}>
      <span className="wset-option__letter">{letter}</span>
      <span>{children}</span>
    </button>
  );
}
