import { COMMON_STATE_STYLES } from "@/config/styles";
import { Button } from "@/components/ui";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  description = "Ocurrio un error al cargar esta vista.",
  onRetry,
  title = "Error",
}: ErrorStateProps): JSX.Element {
  return (
    <div className={COMMON_STATE_STYLES.card} role="alert">
      <p className={COMMON_STATE_STYLES.title}>{title}</p>
      <p className={COMMON_STATE_STYLES.description}>{description}</p>
      {onRetry ? (
        <div className="mt-4 flex justify-center">
          <Button onClick={onRetry} variant="search">
            Reintentar
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default ErrorState;
