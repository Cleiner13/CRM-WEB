import type { ReactNode } from "react";
import { LAYOUT_STYLES } from "@/config/styles";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  tag?: string;
};

export function PageHeader({ actions, subtitle, tag = "ALMPES", title }: PageHeaderProps): JSX.Element {
  return (
    <header className={LAYOUT_STYLES.pageHeader}>
      <div className={LAYOUT_STYLES.pageHeaderRow}>
        <div className={LAYOUT_STYLES.pageHeaderTitleWrap}>
          <div className={LAYOUT_STYLES.pageHeaderTopMeta}>
            <span className={LAYOUT_STYLES.pageHeaderPill}>
              <span aria-hidden="true" className={LAYOUT_STYLES.pageHeaderDot} />
              {tag}
            </span>
          </div>
          <h1 className={LAYOUT_STYLES.pageHeaderTitle}>{title}</h1>
          {subtitle ? <p className={LAYOUT_STYLES.pageHeaderSubtitle}>{subtitle}</p> : null}
        </div>
        {actions ? <div className={LAYOUT_STYLES.pageHeaderActions}>{actions}</div> : null}
      </div>
    </header>
  );
}

export default PageHeader;
