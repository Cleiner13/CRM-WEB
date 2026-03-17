import type { ReactNode } from "react";
import { COMMON_STATE_STYLES } from "@/config/styles";

export type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  action,
  description = "No existen registros para esta vista.",
  title = "Sin resultados",
}: EmptyStateProps): JSX.Element {
  return (
    <div className={COMMON_STATE_STYLES.card}>
      <p className={COMMON_STATE_STYLES.title}>{title}</p>
      <p className={COMMON_STATE_STYLES.description}>{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
