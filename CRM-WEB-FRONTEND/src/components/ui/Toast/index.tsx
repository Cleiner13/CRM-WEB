import type { ReactNode } from "react";
import { X } from "lucide-react";
import { TOAST_STYLES, cx } from "@/config/styles";

export type ToastVariant = keyof typeof TOAST_STYLES.variants;

export type ToastProps = {
  title: string;
  message?: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  action?: ReactNode;
  className?: string;
};

export function Toast({
  action,
  className,
  message,
  onDismiss,
  title,
  variant = "info",
}: ToastProps): JSX.Element {
  return (
    <div className={cx(TOAST_STYLES.base, TOAST_STYLES.variants[variant], className)} role="status">
      <div className={TOAST_STYLES.messageWrap}>
        <p className={TOAST_STYLES.title}>{title}</p>
        {message ? <p className={TOAST_STYLES.message}>{message}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        {action}
        {onDismiss ? (
          <button aria-label="Cerrar notificacion" className={TOAST_STYLES.dismiss} onClick={onDismiss} type="button">
            <X size={18} strokeWidth={2.25} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default Toast;
