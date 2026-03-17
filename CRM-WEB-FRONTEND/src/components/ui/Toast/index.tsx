import type { ReactNode } from "react";
import { TOAST_STYLES, cx } from "@/config/styles";
import { Button } from "@/components/ui/Button";

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
          <Button aria-label="Cerrar notificacion" className="h-8 px-2" onClick={onDismiss} variant="clear">
            Cerrar
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default Toast;
