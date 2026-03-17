import type { ReactNode } from "react";
import { CARD_STYLES, cx } from "@/config/styles";

export type CardProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function Card({
  actions,
  bodyClassName,
  children,
  className,
  footer,
  subtitle,
  title,
}: CardProps): JSX.Element {
  return (
    <section className={cx(CARD_STYLES.base, className)}>
      {title || subtitle || actions ? (
        <div className={CARD_STYLES.header}>
          <div>
            {title ? <h3 className={CARD_STYLES.title}>{title}</h3> : null}
            {subtitle ? <p className={CARD_STYLES.subtitle}>{subtitle}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className={cx(CARD_STYLES.body, bodyClassName)}>{children}</div>
      {footer ? <div className={CARD_STYLES.footer}>{footer}</div> : null}
    </section>
  );
}

export default Card;
