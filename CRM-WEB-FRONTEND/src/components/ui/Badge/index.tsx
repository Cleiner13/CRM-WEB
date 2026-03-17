import type { ReactNode } from "react";
import { BADGE_STYLES, cx } from "@/config/styles";

export type BadgeVariant = keyof typeof BADGE_STYLES.variants;

export type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ children, className, variant = "neutral" }: BadgeProps): JSX.Element {
  return <span className={cx(BADGE_STYLES.base, BADGE_STYLES.variants[variant], className)}>{children}</span>;
}

export default Badge;
