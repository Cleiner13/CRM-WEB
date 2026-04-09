import type { SelectHTMLAttributes } from "react";
import { INPUT_STYLES, cx } from "@/config/styles";

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  label: string;
  hideLabel?: boolean;
  options: SelectOption[];
  helperText?: string;
  errorText?: string;
  containerClassName?: string;
};

export function Select({
  className,
  containerClassName,
  errorText,
  helperText,
  hideLabel = false,
  id,
  label,
  options,
  ...props
}: SelectProps): JSX.Element {
  const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={cx(INPUT_STYLES.fieldWrapper, containerClassName)}>
      <label className={cx(INPUT_STYLES.label, hideLabel && "sr-only")} htmlFor={selectId}>
        {label}
      </label>
      <div className="relative">
        <select
          aria-invalid={Boolean(errorText)}
          className={cx(
            INPUT_STYLES.baseField,
            INPUT_STYLES.selectRightIconSpace,
            errorText ? INPUT_STYLES.error : INPUT_STYLES.focus,
            className,
          )}
          id={selectId}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

export default Select;
