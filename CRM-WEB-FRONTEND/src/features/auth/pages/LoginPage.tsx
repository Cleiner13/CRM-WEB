import type { FormEvent } from "react";
import { useState } from "react";
import fondoLogin from "@/assets/images/Fondo_Login.jpeg";
import logoFull from "@/assets/logos/Logo_Completo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { AUTH_STYLES } from "@/config/styles";
import { ROUTES } from "@/config/routes";
import { Button, Card, Input, Toast } from "@/components/ui";
import { authService } from "@/services";
import { isEmail, isRequired } from "@/utils";

type LoginState = {
  username: string;
  password: string;
};

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<LoginState>({ username: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locationState = (location.state as LocationState | null) ?? null;
  const redirectTo = locationState?.from?.pathname || ROUTES.dashboard;
  const usernameError = form.username && !isEmail(form.username) ? "Ingrese un correo valido" : undefined;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isRequired(form.username) || !isRequired(form.password)) {
      setError("Complete usuario y contrasena para continuar.");
      return;
    }

    if (!isEmail(form.username)) {
      setError("El usuario debe ser un correo valido.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await authService.login({ password: form.password, username: form.username });
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "No se pudo iniciar sesion";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={AUTH_STYLES.page}>
      <div className={AUTH_STYLES.shell}>
        <aside className={AUTH_STYLES.visual}>
          <img alt="ALMPES fondo login" className={AUTH_STYLES.visualImage} src={fondoLogin} />
          <div aria-hidden="true" className={AUTH_STYLES.visualOverlay} />
          <div aria-hidden="true" className={AUTH_STYLES.visualGlow} />
          <div aria-hidden="true" className={AUTH_STYLES.diagonalLine} />
          <div className={AUTH_STYLES.visualContent}>
            <div className={AUTH_STYLES.visualTextWrap}>
              <h1 className={AUTH_STYLES.visualTitle}>ALMPES ERP/CRM</h1>
              <p className={AUTH_STYLES.visualText}>
                Plataforma de gestion administrativa y operativa. Acceso para usuarios autorizados.
              </p>
            </div>
          </div>
        </aside>

        <section className={AUTH_STYLES.formPanel}>
          <div aria-hidden="true" className={AUTH_STYLES.formPanelBg} />
          <div className={AUTH_STYLES.formStack}>
            <div className={AUTH_STYLES.formBrand}>
              <div className={AUTH_STYLES.formBrandLogoWrap}>
                <img alt="ALMPES" className={AUTH_STYLES.formBrandLogo} src={logoFull} />
              </div>
              <div className={AUTH_STYLES.formHeader}>
                <h1 className={AUTH_STYLES.formBrandTitle}>Bienvenido</h1>
                <p className={AUTH_STYLES.formBrandText}>Ingrese sus credenciales para continuar.</p>
              </div>
            </div>

            {error ? (
              <Toast message={error} onDismiss={() => setError(null)} title="Error de acceso" variant="error" />
            ) : null}

            <Card className={AUTH_STYLES.formCard}>
              <form className={AUTH_STYLES.form} onSubmit={handleSubmit}>
                <Input
                  autoComplete="username"
                  errorText={usernameError}
                  helperText="Formato esperado: usuario@almpes.local"
                  label="Usuario"
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  placeholder="usuario@almpes.local"
                  type="email"
                  value={form.username}
                />
                <Input
                  autoComplete="current-password"
                  label="Contrasena"
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="********"
                  type="password"
                  value={form.password}
                />
                <div className={AUTH_STYLES.formOptions}>
                  <label className={AUTH_STYLES.rememberWrap}>
                    <input className={AUTH_STYLES.checkbox} type="checkbox" />
                    Recordarme
                  </label>
                  <button className={AUTH_STYLES.link} type="button">
                    Recuperar acceso
                  </button>
                </div>
                <div className={AUTH_STYLES.actions}>
                  <Button fullWidth loading={isSubmitting} type="submit" variant="create">
                    Ingresar
                  </Button>
                </div>
              </form>
              <p className={AUTH_STYLES.footerHint}>Solo usuarios con permisos ALMPES pueden ingresar.</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
