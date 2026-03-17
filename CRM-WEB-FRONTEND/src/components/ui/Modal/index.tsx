import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { MODAL_STYLES } from "@/config/styles";
import { Button } from "@/components/ui/Button";

export type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
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

export function Modal({ children, footer, isOpen, onClose, title }: ModalProps): JSX.Element | null {
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
      onClick={onClose}
      onKeyDown={onKeyDown}
      role="dialog"
    >
      <div
        className={MODAL_STYLES.panel}
        onClick={(event) => event.stopPropagation()}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className={MODAL_STYLES.header}>
          <h2 className={MODAL_STYLES.title} id={titleId}>
            {title}
          </h2>
          <Button aria-label="Cerrar modal" onClick={onClose} variant="clear">
            Cerrar
          </Button>
        </div>
        <div className={MODAL_STYLES.body}>{children}</div>
        {footer ? <div className={MODAL_STYLES.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
