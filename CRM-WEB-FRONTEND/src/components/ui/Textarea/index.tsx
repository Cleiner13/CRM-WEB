import type { TextareaHTMLAttributes } from "react";
import { INPUT_STYLES, cx } from "@/config/styles";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helperText?: string;
  errorText?: string;
  containerClassName?: string;
};

export function Textarea({
  className,
  containerClassName,
  errorText,
  helperText,
  id,
  label,
  ...props
}: TextareaProps): JSX.Element {
  const textareaId = id ?? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={cx(INPUT_STYLES.fieldWrapper, containerClassName)}>
      <label className={INPUT_STYLES.label} htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        aria-invalid={Boolean(errorText)}
        className={cx(
          INPUT_STYLES.baseField,
          INPUT_STYLES.textarea,
          errorText ? INPUT_STYLES.error : INPUT_STYLES.focus,
          className,
        )}
        id={textareaId}
        {...props}
      />
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

export default Textarea;
