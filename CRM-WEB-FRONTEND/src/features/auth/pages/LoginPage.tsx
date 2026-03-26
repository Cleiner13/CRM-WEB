import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ChevronRight, Eye, EyeOff, Mail } from "lucide-react";
import fondoLogin from "@/assets/images/Fondo_Login.jpeg";
import logoFull from "@/assets/logos/Logo_Completo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { AUTH_STYLES } from "@/config/styles";
import { ROUTES } from "@/config/routes";
import { Button, Card, Input, Modal, Toast } from "@/components/ui";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { authService } from "@/services";
import { isDNI, isRequired } from "@/utils";

type LoginState = {
  username: string;
  password: string;
};

type FieldState = {
  username: boolean;
  password: boolean;
};

type LocationState = {
  from?: {
    pathname?: string;
  };
};

type ModalTone = "error" | "warning" | "info";
type AuthError = Error & { blockedUntil?: string };

function getUsernameError(value: string): string | undefined {
  if (!isRequired(value)) return "El usuario es obligatorio";
  if (!isDNI(value)) return "Ingrese un DNI valido de 8 digitos";
  return undefined;
}

function getPasswordError(value: string): string | undefined {
  if (!isRequired(value)) return "La contrasena es obligatoria";
  return undefined;
}

function formatRemaining(targetIso: string | null): string | null {
  if (!targetIso) return null;

  const target = new Date(targetIso);
  const diffMs = target.getTime() - Date.now();
  if (Number.isNaN(target.getTime()) || diffMs <= 0) return null;

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<LoginState>({ username: "", password: "" });
  const [touched, setTouched] = useState<FieldState>({ username: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalVariant, setModalVariant] = useState<ModalTone>("error");
  const [modalPrimaryAction, setModalPrimaryAction] = useState<(() => void) | null>(null);
  const [modalPrimaryLabel, setModalPrimaryLabel] = useState("Cerrar");
  const [modalSupportAction, setModalSupportAction] = useState<(() => void) | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const locationState = (location.state as LocationState | null) ?? null;
  const redirectTo = locationState?.from?.pathname || ROUTES.dashboard;

  const usernameError = touched.username ? getUsernameError(form.username) : undefined;
  const passwordError = touched.password ? getPasswordError(form.password) : undefined;

  useEffect(() => {
    if (!blockedUntil || !isModalOpen) {
      setRemainingTime(null);
      return undefined;
    }

    const updateRemaining = (): void => {
      setRemainingTime(formatRemaining(blockedUntil));
    };

    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(intervalId);
  }, [blockedUntil, isModalOpen]);

  const openSupportModal = (): void => {
    openModal(
      "Contacta a sistemas",
      "Si necesita ayuda inmediata para recuperar el acceso o verificar el bloqueo de su cuenta, contacte a sistemas.",
      "info",
      null,
      "Cerrar"
    );
  };

  const openModal = (
    title: string,
    message: string,
    variant: ModalTone = "error",
    primaryAction: (() => void) | null = null,
    primaryLabel = "Cerrar",
    supportAction: (() => void) | null = null,
    nextBlockedUntil: string | null = null
  ): void => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVariant(variant);
    setModalPrimaryAction(() => primaryAction);
    setModalPrimaryLabel(primaryLabel);
    setModalSupportAction(() => supportAction);
    setBlockedUntil(nextBlockedUntil);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setModalVariant("error");
    setModalPrimaryAction(null);
    setModalPrimaryLabel("Cerrar");
    setModalSupportAction(null);
    setBlockedUntil(null);
    setRemainingTime(null);
  };

  const openChangePasswordModal = (): void => {
    closeModal();
    setIsChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = (): void => {
    setIsChangePasswordModalOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTouched = { username: true, password: true };
    setTouched(nextTouched);

    const nextUsernameError = getUsernameError(form.username);
    const nextPasswordError = getPasswordError(form.password);

    if (nextUsernameError || nextPasswordError) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const user = await authService.login({ password: form.password, username: form.username });

      await authService.fetchCurrentUser();

      if (!user.activo) {
        openModal("Usuario inactivo", "Su usuario esta desactivado. Contacte a sistemas para reactivar.", "warning");
        return;
      }

      if (user.requiereCambioPassword) {
        openModal(
          "Cambio de contrasena requerido",
          "Su cuenta requiere que cambie la contrasena antes de continuar.",
          "warning",
          openChangePasswordModal,
          "Cambiar ahora"
        );
        return;
      }

      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      const authError = submitError as AuthError;
      const message = authError instanceof Error ? authError.message : "No se pudo iniciar sesion";

      if (authError.blockedUntil) {
        openModal(
          "Cuenta bloqueada",
          `${message} Puede esperar el desbloqueo automatico o contactar a sistemas si necesita apoyo.`,
          "warning",
          null,
          "Cerrar",
          openSupportModal,
          authError.blockedUntil
        );
        return;
      }

      openModal("Error de acceso", message, "error");
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
        </aside>

        <section className={AUTH_STYLES.formPanel}>
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-25 lg:opacity-16"
            src={fondoLogin}
          />
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

            <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle} variant={modalVariant}>
              <p>{modalMessage}</p>
              {remainingTime ? (
                <div className="mt-4 rounded-2xl border border-[#7f1d1d]/15 bg-[#7f1d1d]/5 px-4 py-3 text-sm font-medium text-[#7f1d1d]">
                  Podra volver a intentarlo en aproximadamente {remainingTime}.
                </div>
              ) : null}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {modalPrimaryAction ? (
                  <Button
                    className="h-14 rounded-[16px] bg-[linear-gradient(135deg,#4d0b12,#7f1d1d)] text-lg font-semibold shadow-[0_10px_24px_rgba(77,11,18,0.25)] hover:brightness-110"
                    fullWidth
                    onClick={() => {
                      closeModal();
                      modalPrimaryAction();
                    }}
                    type="button"
                    variant="create"
                  >
                    {modalPrimaryLabel}
                  </Button>
                ) : null}
                {modalSupportAction ? (
                  <Button
                    className="h-14 rounded-[16px] bg-[linear-gradient(135deg,#4d0b12,#7f1d1d)] text-lg font-semibold shadow-[0_10px_24px_rgba(77,11,18,0.25)] hover:brightness-110"
                    fullWidth
                    onClick={() => {
                      modalSupportAction();
                    }}
                    type="button"
                    variant="create"
                  >
                    Contacta aqui
                  </Button>
                ) : null}
                <Button
                  className="h-14 rounded-[16px] bg-[linear-gradient(135deg,#d62828,#9d0208)] text-lg font-semibold shadow-[0_10px_24px_rgba(214,40,40,0.22)] hover:brightness-110"
                  fullWidth
                  onClick={closeModal}
                  type="button"
                  variant="create"
                >
                  Cerrar
                </Button>
              </div>
            </Modal>

            <Modal
              isOpen={isChangePasswordModalOpen}
              onClose={closeChangePasswordModal}
              title="Actualizar contrasena"
              variant="warning"
            >
              <ChangePasswordForm
                description="Por seguridad, debe cambiar su contrasena antes de continuar."
                embedded
                submitLabel="Cambiar Contrasena"
                title="Cambiar Contrasena"
                onSuccess={() => {
                  closeChangePasswordModal();
                  navigate(ROUTES.dashboard, { replace: true });
                }}
              />
            </Modal>

            <Card className={AUTH_STYLES.formCard} bodyClassName="px-6 py-5 sm:px-7 sm:py-6">
              <form className={AUTH_STYLES.form} onSubmit={handleSubmit}>
                <Input
                  autoComplete="username"
                  className="h-11 rounded-[11px] border-[#d7d8df] bg-white px-3.5 text-[14px]"
                  containerClassName="space-y-1.5"
                  errorText={usernameError}
                  helperText={usernameError ? undefined : "Formato esperado 8 digitos (DNI)"}
                  label="Usuario"
                  onBlur={() => setTouched((current) => ({ ...current, username: true }))}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  placeholder="12345678"
                  type="text"
                  value={form.username}
                />

                <Input
                  autoComplete="current-password"
                  className="h-11 rounded-[11px] border-[#d7d8df] bg-white px-3.5 text-[14px]"
                  containerClassName="space-y-1.5"
                  errorText={passwordError}
                  label="Contrasena"
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="********"
                  rightAdornment={
                    <button
                      aria-label={isPasswordVisible ? "Ocultar contrasena" : "Mostrar contrasena"}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                      onClick={() => setIsPasswordVisible((value) => !value)}
                      type="button"
                    >
                      {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  type={isPasswordVisible ? "text" : "password"}
                  value={form.password}
                />

                <div className={AUTH_STYLES.actions}>
                  <Button
                    className="h-11 rounded-[11px] bg-[#8b1515] text-[16px] font-semibold shadow-[0_8px_18px_rgba(139,21,21,0.24)] hover:bg-[#741111]"
                    fullWidth
                    loading={isSubmitting}
                    type="submit"
                    variant="create"
                  >
                    Ingresar
                  </Button>
                </div>

                <div className="space-y-2 border-t border-[#efe6e2] pt-4 text-center text-sm text-slate-600">
                  <span className="block">Olvidaste tu contrasena?</span>
                  <button
                    className="inline-flex items-center gap-1.5 font-medium text-[#7f1d1d] hover:text-[#5f0f12]"
                    type="button"
                    onClick={openSupportModal}
                  >
                    <Mail size={15} strokeWidth={2} />
                    Contacta aqui
                    <ChevronRight size={14} strokeWidth={2} />
                  </button>
                </div>
              </form>
              <p className={AUTH_STYLES.footerHint}>Solo usuarios con permiso ALMPES pueden ingresar.</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
