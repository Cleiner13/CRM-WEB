import { useNavigate } from "react-router-dom";
import { AUTH_STYLES } from "@/config/styles";
import { ROUTES } from "@/config/routes";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";

export function ChangePasswordPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className={AUTH_STYLES.page}>
      <div className={AUTH_STYLES.shell}>
        <section className={AUTH_STYLES.formPanel}>
          <div aria-hidden="true" className={AUTH_STYLES.formPanelBg} />
          <ChangePasswordForm onSuccess={() => navigate(ROUTES.dashboard, { replace: true })} />
        </section>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
