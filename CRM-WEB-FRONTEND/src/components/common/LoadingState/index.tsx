import { COMMON_STATE_STYLES } from "@/config/styles";

export type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({
  description = "Estamos cargando la informacion solicitada.",
  title = "Cargando...",
}: LoadingStateProps): JSX.Element {
  return (
    <div aria-live="polite" className={COMMON_STATE_STYLES.card} role="status">
      <p className={COMMON_STATE_STYLES.title}>{title}</p>
      <p className={COMMON_STATE_STYLES.description}>{description}</p>
    </div>
  );
}

export default LoadingState;
