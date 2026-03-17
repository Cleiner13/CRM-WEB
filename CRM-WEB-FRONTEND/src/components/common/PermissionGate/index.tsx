import type { ReactNode } from "react";
import { ErrorState } from "@/components/common/ErrorState";

export type PermissionGateProps = {
  allowed: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({ allowed, children, fallback }: PermissionGateProps): JSX.Element {
  if (!allowed) {
    return <>{fallback ?? <ErrorState description="No tienes permisos para acceder a esta seccion." title="Acceso restringido" />}</>;
  }

  return <>{children}</>;
}

export default PermissionGate;
