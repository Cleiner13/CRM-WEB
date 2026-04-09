import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useMemo, useRef } from "react";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { createPortal } from "react-dom";
import { MODAL_STYLES, cx } from "@/config/styles";

export type ModalVariant = "error" | "warning" | "info";

export type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  variant?: ModalVariant;
  panelClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

function getModalIcon(variant: ModalVariant): JSX.Element {
  if (variant === "warning") {
    return <AlertTriangle size={34} strokeWidth={2.25} />;
  }

  if (variant === "info") {
    return <Info size={34} strokeWidth={2.25} />;
  }

  return <AlertCircle size={34} strokeWidth={2.25} />;
}

function getIconClassName(variant: ModalVariant): string {
  if (variant === "warning") {
    return MODAL_STYLES.iconWarning;
  }

  if (variant === "info") {
    return MODAL_STYLES.iconInfo;
  }

  return MODAL_STYLES.iconError;
}

export function Modal({
  children,
  footer,
  isOpen,
  onClose,
  title,
  variant = "error",
  panelClassName,
  bodyClassName,
  footerClassName,
}: ModalProps): JSX.Element | null {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    if (panel) {
      const focusables = getFocusableElements(panel);
      (focusables[0] ?? panel).focus();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const onKeyDown = useMemo(
    () => (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const focusables = getFocusableElements(panel);
      if (focusables.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className={MODAL_STYLES.overlay}
      onKeyDown={onKeyDown}
      role="dialog"
    >
      <div
        className={cx(MODAL_STYLES.panel, panelClassName)}
        onClick={(event) => event.stopPropagation()}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className={MODAL_STYLES.header}>
          <div className={MODAL_STYLES.headerMain}>
            <div className={cx(MODAL_STYLES.iconWrap, getIconClassName(variant))}>{getModalIcon(variant)}</div>
            <div className={MODAL_STYLES.titleWrap}>
              <h2 className={MODAL_STYLES.title} id={titleId}>
                {title}
              </h2>
            </div>
          </div>

          <button aria-label="Cerrar modal" className={MODAL_STYLES.closeIconButton} onClick={onClose} type="button">
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        <div aria-hidden="true" className={MODAL_STYLES.divider} />
        <div className={cx(MODAL_STYLES.body, bodyClassName)}>{children}</div>
        {footer ? <div className={cx(MODAL_STYLES.footer, footerClassName)}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
