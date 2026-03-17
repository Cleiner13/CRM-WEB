import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { authService } from "@/services";

export function ProtectedRoute(): JSX.Element {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    return <Navigate replace state={{ from: location }} to={ROUTES.login} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
