import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AUTH_STYLES } from "@/config/styles";
import { Button, Card, Input, Toast } from "@/components/ui";
import { httpClientPost } from "@/services/httpClient";
import { isRequired } from "@/utils";

type Step = 1 | 2 | 3;

type ForgotPasswordState = {
  correoPersonal: string;
  codigo: string;
  passwordNueva: string;
  confirmarPassword: string;
};

type TouchedState = {
  correoPersonal: boolean;
  codigo: boolean;
  passwordNueva: boolean;
  confirmarPassword: boolean;
};

type PasswordRules = {
  minLength: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

export type ForgotPasswordFlowProps = {
  onBackToLogin?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPasswordRules(value: string): PasswordRules {
  return {
    minLength: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };
}

function isStrongPassword(value: string): boolean {
  return Object.values(getPasswordRules(value)).every(Boolean);
}

function getCorreoError(value: string): string | undefined {
  if (!isRequired(value)) return "El correo personal es obligatorio";
  if (!isEmail(value)) return "Ingrese un correo valido";
  return undefined;
}

function getCodigoError(value: string): string | undefined {
  if (!isRequired(value)) return "El codigo es obligatorio";
  if (value.trim().length < 4) return "Ingrese un codigo valido";
  return undefined;
}

function getNuevaPasswordError(value: string): string | undefined {
  if (!isRequired(value)) return "La nueva contrasena es obligatoria";
  if (!isStrongPassword(value)) return "La nueva contrasena no cumple la politica minima de seguridad";
  return undefined;
}

function getConfirmPasswordError(passwordNueva: string, value: string): string | undefined {
  if (!isRequired(value)) return "Debe confirmar la nueva contrasena";
  if (passwordNueva !== value) return "Las contrasenas nuevas no coinciden";
  return undefined;
}

export function ForgotPasswordFlow({ onBackToLogin, onDirtyChange }: ForgotPasswordFlowProps): JSX.Element {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<ForgotPasswordState>({
    correoPersonal: "",
    codigo: "",
    passwordNueva: "",
    confirmarPassword: "",
  });
  const [touched, setTouched] = useState<TouchedState>({
    correoPersonal: false,
    codigo: false,
    passwordNueva: false,
    confirmarPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const correoError = touched.correoPersonal ? getCorreoError(form.correoPersonal) : undefined;
  const codigoError = touched.codigo ? getCodigoError(form.codigo) : undefined;
  const passwordNuevaError = touched.passwordNueva ? getNuevaPasswordError(form.passwordNueva) : undefined;
  const confirmarPasswordError = touched.confirmarPassword
    ? getConfirmPasswordError(form.passwordNueva, form.confirmarPassword)
    : undefined;
  const passwordRules = getPasswordRules(form.passwordNueva);

  useEffect(() => {
    const dirty =
      !isCompleted &&
      (step > 1 ||
        Boolean(form.correoPersonal.trim()) ||
        Boolean(form.codigo.trim()) ||
        Boolean(form.passwordNueva.trim()) ||
        Boolean(form.confirmarPassword.trim()));

    onDirtyChange?.(dirty);
  }, [form, isCompleted, onDirtyChange, step]);

  const requirementClass = (passed: boolean): string => (passed ? "text-emerald-700" : "text-slate-500");

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched((current) => ({ ...current, correoPersonal: true }));
    const nextCorreoError = getCorreoError(form.correoPersonal);
    if (nextCorreoError) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      await httpClientPost("/auth/forgot-password/request", {
        correoPersonal: form.correoPersonal,
      });

      setStep(2);
      setSuccessMessage("Si el correo existe, hemos enviado un codigo de verificacion.");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "No se pudo enviar el codigo";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched((current) => ({ ...current, codigo: true }));
    const nextCodigoError = getCodigoError(form.codigo);
    if (nextCodigoError) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      await httpClientPost("/auth/forgot-password/verify", {
        correoPersonal: form.correoPersonal,
        codigo: form.codigo,
      });

      setStep(3);
      setSuccessMessage("Codigo verificado correctamente. Ahora puede definir una nueva contrasena.");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "No se pudo verificar el codigo";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTouched((current) => ({
      ...current,
      passwordNueva: true,
      confirmarPassword: true,
    }));

    const nextPasswordNuevaError = getNuevaPasswordError(form.passwordNueva);
    const nextConfirmarPasswordError = getConfirmPasswordError(form.passwordNueva, form.confirmarPassword);
    if (nextPasswordNuevaError || nextConfirmarPasswordError) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      await httpClientPost("/auth/forgot-password/reset", {
        correoPersonal: form.correoPersonal,
        codigo: form.codigo,
        passwordNueva: form.passwordNueva,
      });

      setIsCompleted(true);
      setSuccessMessage(null);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "No se pudo restablecer la contrasena";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="space-y-5">
        <div className={AUTH_STYLES.formHeader}>
          <h1 className="text-[2rem] font-bold leading-none text-[#2e0810]">Contrasena Restablecida</h1>
          <p className="mt-2 text-[15px] leading-7 text-slate-600">
            Su contrasena se actualizo correctamente. Ya puede volver a iniciar sesion con su nueva contrasena.
          </p>
        </div>

        <Card className={AUTH_STYLES.formCard} bodyClassName="px-6 py-6 sm:px-7 sm:py-7">
          <div className="space-y-5 text-center">
            <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
              La recuperacion finalizo con exito. Use su nueva contrasena para ingresar nuevamente.
            </div>

            <Button
              className="h-11 rounded-[11px] bg-[#8b1515] text-[16px] font-semibold shadow-[0_8px_18px_rgba(139,21,21,0.24)] hover:bg-[#741111]"
              fullWidth
              onClick={onBackToLogin}
              type="button"
              variant="create"
            >
              Volver al Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className={AUTH_STYLES.formHeader}>
        <h1 className="text-[2rem] font-bold leading-none text-[#2e0810]">Recuperar Contrasena</h1>
        <p className="mt-2 text-[15px] leading-7 text-slate-600">
          Ingrese su correo personal, valide el codigo recibido y defina una nueva contrasena.
        </p>
      </div>

      {successMessage ? (
        <Toast message={successMessage} onDismiss={() => setSuccessMessage(null)} title="Correcto" variant="success" />
      ) : null}
      {error ? <Toast message={error} onDismiss={() => setError(null)} title="Error" variant="error" /> : null}

      <Card className={AUTH_STYLES.formCard} bodyClassName="px-6 py-5 sm:px-7 sm:py-6">
        {step === 1 ? (
          <form className={AUTH_STYLES.form} onSubmit={handleRequestCode}>
            <Input
              className="h-11 rounded-[11px] border-[#d7d8df] bg-white px-3.5 text-[14px]"
              containerClassName="space-y-1.5"
              errorText={correoError}
              helperText={correoError ? undefined : "Use el correo personal registrado en su ficha"}
              label="Correo Personal"
              onBlur={() => setTouched((current) => ({ ...current, correoPersonal: true }))}
              onChange={(event) => setForm((current) => ({ ...current, correoPersonal: event.target.value }))}
              placeholder="correo@ejemplo.com"
              type="email"
              value={form.correoPersonal}
            />

            <div className={AUTH_STYLES.actions}>
              <Button
                className="h-11 rounded-[11px] bg-[#8b1515] text-[16px] font-semibold shadow-[0_8px_18px_rgba(139,21,21,0.24)] hover:bg-[#741111]"
                fullWidth
                loading={isSubmitting}
                type="submit"
                variant="create"
              >
                Enviar Codigo
              </Button>
            </div>
          </form>
        ) : null}

        {step === 2 ? (
          <form className={AUTH_STYLES.form} onSubmit={handleVerifyCode}>
            <Input
              className="h-11 rounded-[11px] border-[#d7d8df] bg-slate-50 px-3.5 text-[14px]"
              containerClassName="space-y-1.5"
              label="Correo Personal"
              readOnly
              type="email"
              value={form.correoPersonal}
            />
            <Input
              className="h-11 rounded-[11px] border-[#d7d8df] bg-white px-3.5 text-[14px]"
              containerClassName="space-y-1.5"
              errorText={codigoError}
              helperText={codigoError ? undefined : "Revise su correo e ingrese el codigo enviado"}
              label="Codigo de Verificacion"
              onBlur={() => setTouched((current) => ({ ...current, codigo: true }))}
              onChange={(event) => setForm((current) => ({ ...current, codigo: event.target.value }))}
              placeholder="123456"
              type="text"
              value={form.codigo}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="h-11 rounded-[11px]" fullWidth onClick={() => setStep(1)} type="button" variant="create">
                Volver
              </Button>
              <Button
                className="h-11 rounded-[11px] bg-[#8b1515] text-[16px] font-semibold shadow-[0_8px_18px_rgba(139,21,21,0.24)] hover:bg-[#741111]"
                fullWidth
                loading={isSubmitting}
                type="submit"
                variant="create"
              >
                Verificar Codigo
              </Button>
            </div>
          </form>
        ) : null}

        {step === 3 ? (
          <form className={AUTH_STYLES.form} onSubmit={handleResetPassword}>
            <Input
              className="h-11 rounded-[11px] border-[#d7d8df] bg-slate-50 px-3.5 text-[14px]"
              containerClassName="space-y-1.5"
              label="Correo Personal"
              readOnly
              type="email"
              value={form.correoPersonal}
            />
            <Input
              className="h-11 rounded-[11px] border-[#d7d8df] bg-slate-50 px-3.5 text-[14px]"
              containerClassName="space-y-1.5"
              label="Codigo Verificado"
              readOnly
              type="text"
              value={form.codigo}
            />
            <Input
              className="h-11 rounded-[11px] border-[#d7d8df] bg-white px-3.5 text-[14px]"
              containerClassName="space-y-1.5"
              errorText={passwordNuevaError}
              helperText={passwordNuevaError ? undefined : "Debe ser distinta a la contrasena anterior"}
              label="Nueva Contrasena"
              onBlur={() => setTouched((current) => ({ ...current, passwordNueva: true }))}
              onChange={(event) => setForm((current) => ({ ...current, passwordNueva: event.target.value }))}
              placeholder="********"
              rightAdornment={
                <button
                  aria-label={showPassword ? "Ocultar nueva contrasena" : "Mostrar nueva contrasena"}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              type={showPassword ? "text" : "password"}
              value={form.passwordNueva}
            />

            <div className="rounded-[14px] border border-[#efe6e2] bg-[#faf7f5] px-4 py-3 text-sm">
              <p className="font-medium text-slate-700">La nueva contrasena debe incluir:</p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                <span className={requirementClass(passwordRules.minLength)}>Al menos 8 caracteres</span>
                <span className={requirementClass(passwordRules.upper)}>Una letra mayuscula</span>
                <span className={requirementClass(passwordRules.lower)}>Una letra minuscula</span>
                <span className={requirementClass(passwordRules.number)}>Un numero</span>
                <span className={requirementClass(passwordRules.symbol)}>Un simbolo</span>
              </div>
            </div>

            <Input
              className="h-11 rounded-[11px] border-[#d7d8df] bg-white px-3.5 text-[14px]"
              containerClassName="space-y-1.5"
              errorText={confirmarPasswordError}
              label="Confirmar Nueva Contrasena"
              onBlur={() => setTouched((current) => ({ ...current, confirmarPassword: true }))}
              onChange={(event) => setForm((current) => ({ ...current, confirmarPassword: event.target.value }))}
              placeholder="********"
              rightAdornment={
                <button
                  aria-label={showConfirmPassword ? "Ocultar confirmacion de contrasena" : "Mostrar confirmacion de contrasena"}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  type="button"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmarPassword}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="h-11 rounded-[11px]" fullWidth onClick={() => setStep(2)} type="button" variant="create">
                Volver
              </Button>
              <Button
                className="h-11 rounded-[11px] bg-[#8b1515] text-[16px] font-semibold shadow-[0_8px_18px_rgba(139,21,21,0.24)] hover:bg-[#741111]"
                fullWidth
                loading={isSubmitting}
                type="submit"
                variant="create"
              >
                Restablecer Contrasena
              </Button>
            </div>
          </form>
        ) : null}
      </Card>
    </div>
  );
}

export default ForgotPasswordFlow;
