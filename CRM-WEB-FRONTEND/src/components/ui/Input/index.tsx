import type { InputHTMLAttributes, ReactNode } from "react";
import { INPUT_STYLES, cx } from "@/config/styles";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  helperText?: string;
  errorText?: string;
  containerClassName?: string;
  rightAdornment?: ReactNode;
};

export function Input({
  containerClassName,
  errorText,
  helperText,
  id,
  label,
  className,
  rightAdornment,
  ...props
}: InputProps): JSX.Element {
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={cx(INPUT_STYLES.fieldWrapper, containerClassName)}>
      <label className={INPUT_STYLES.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={INPUT_STYLES.inputWrap}>
        <input
          aria-invalid={Boolean(errorText)}
          className={cx(
            INPUT_STYLES.baseField,
            rightAdornment ? INPUT_STYLES.withRightAdornment : "",
            errorText ? INPUT_STYLES.error : INPUT_STYLES.focus,
            className,
          )}
          id={inputId}
          {...props}
        />
        {rightAdornment ? <div className={INPUT_STYLES.rightAdornment}>{rightAdornment}</div> : null}
      </div>
      {errorText ? (
        <p className={INPUT_STYLES.errorText} role="alert">
          {errorText}
        </p>
      ) : helperText ? (
        <p className={INPUT_STYLES.helperText}>{helperText}</p>
      ) : null}
    </div>
  );
}

export default Input;
