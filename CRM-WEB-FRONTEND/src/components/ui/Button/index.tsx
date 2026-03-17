import type { ButtonHTMLAttributes, ReactNode } from "react";
import { BUTTON_STYLES, cx } from "@/config/styles";

export type ButtonVariant = keyof typeof BUTTON_STYLES.variants;
export type ButtonSize = keyof typeof BUTTON_STYLES.sizes;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  children,
  className,
  disabled,
  fullWidth = false,
  leftIcon,
  loading = false,
  rightIcon,
  size = "md",
  type = "button",
  variant = "create",
  ...props
}: ButtonProps): JSX.Element {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cx(
        BUTTON_STYLES.base,
        BUTTON_STYLES.sizes[size],
        BUTTON_STYLES.variants[variant],
        fullWidth && BUTTON_STYLES.fullWidth,
        className,
      )}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {loading ? <span aria-hidden="true" className={BUTTON_STYLES.spinner} /> : leftIcon}
      <span>{children}</span>
      {!loading ? rightIcon : null}
    </button>
  );
}

export default Button;
