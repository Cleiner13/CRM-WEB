import type { FormEvent } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AUTH_STYLES } from "@/config/styles";
import { Button, Card, Input, Toast } from "@/components/ui";
import { httpClientPost } from "@/services/httpClient";
import { isRequired } from "@/utils";

type ChangePasswordState = {
  passwordActual: string;
  passwordNueva: string;
  confirmarPassword: string;
};

type FieldState = {
  passwordActual: boolean;
  passwordNueva: boolean;
  confirmarPassword: boolean;
};

type ServerFieldErrors = {
  passwordActual?: string;
  passwordNueva?: string;
};

export type ChangePasswordFormProps = {
  title?: string;
  description?: string;
  submitLabel?: string;
  embedded?: boolean;
  onSuccess?: () => void;
};

type PasswordRules = {
  minLength: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

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
  const rules = getPasswordRules(value);
  return Object.values(rules).every(Boolean);
}

function getCurrentPasswordError(value: string, serverError?: string): string | undefined {
  if (!isRequired(value)) {
    return "La contrasena actual es obligatoria";
  }

  return serverError;
}

function getNewPasswordError(passwordActual: string, value: string, serverError?: string): string | undefined {
  if (!isRequired(value)) {
    return "La nueva contrasena es obligatoria";
  }

  if (passwordActual && value === passwordActual) {
    return "La nueva contrasena debe ser diferente a la actual";
  }

  if (!isStrongPassword(value)) {
    return "La nueva contrasena no cumple la politica minima de seguridad";
  }

  return serverError;
}

function getConfirmPasswordError(passwordNueva: string, value: string): string | undefined {
  if (!isRequired(value)) {
    return "Debe confirmar la nueva contrasena";
  }

  if (passwordNueva !== value) {
    return "Las contrasenas nuevas no coinciden";
  }

  return undefined;
}

export function ChangePasswordForm({
  title = "Cambiar Contrasena",
  description = "Por seguridad, debe cambiar su contrasena antes de continuar.",
  submitLabel = "Cambiar Contrasena",
  embedded = false,
  onSuccess,
}: ChangePasswordFormProps): JSX.Element {
  const [form, setForm] = useState<ChangePasswordState>({
    passwordActual: "",
    passwordNueva: "",
    confirmarPassword: "",
  });
  const [touched, setTouched] = useState<FieldState>({
    passwordActual: false,
    passwordNueva: false,
    confirmarPassword: false,
  });
  const [serverFieldErrors, setServerFieldErrors] = useState<ServerFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<Record<keyof ChangePasswordState, boolean>>({
    passwordActual: false,
    passwordNueva: false,
    confirmarPassword: false,
  });

  const passwordRules = getPasswordRules(form.passwordNueva);

  const passwordActualError = touched.passwordActual
    ? getCurrentPasswordError(form.passwordActual, serverFieldErrors.passwordActual)
    : undefined;
  const passwordNuevaError = touched.passwordNueva
    ? getNewPasswordError(form.passwordActual, form.passwordNueva, serverFieldErrors.passwordNueva)
    : undefined;
  const confirmarPasswordError = touched.confirmarPassword
    ? getConfirmPasswordError(form.passwordNueva, form.confirmarPassword)
    : undefined;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setServerFieldErrors({});
    setError(null);

    const nextTouched = {
      passwordActual: true,
      passwordNueva: true,
      confirmarPassword: true,
    };
    setTouched(nextTouched);

    const nextPasswordActualError = getCurrentPasswordError(form.passwordActual);
    const nextPasswordNuevaError = getNewPasswordError(form.passwordActual, form.passwordNueva);
    const nextConfirmPasswordError = getConfirmPasswordError(form.passwordNueva, form.confirmarPassword);

    if (nextPasswordActualError || nextPasswordNuevaError || nextConfirmPasswordError) {
      return;
    }

    try {
      setIsSubmitting(true);

      await httpClientPost("/auth/change-password", {
        passwordActual: form.passwordActual,
        passwordNueva: form.passwordNueva,
      });

      onSuccess?.();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Error al cambiar contrasena";
      const normalized = message.toLowerCase();

      if (normalized.includes("actual") || normalized.includes("incorrect")) {
        setServerFieldErrors({ passwordActual: "La contrasena actual no es correcta" });
        setTouched((current) => ({ ...current, passwordActual: true }));
        return;
      }

      if (normalized.includes("nueva") || normalized.includes("politica") || normalized.includes("seguridad")) {
        setServerFieldErrors({ passwordNueva: message });
        setTouched((current) => ({ ...current, passwordNueva: true }));
        return;
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPasswordAdornment = (field: keyof ChangePasswordState, visibleLabel: string, hiddenLabel: string): JSX.Element => (
    <button
      aria-label={visibleFields[field] ? hiddenLabel : visibleLabel}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full"
      onClick={() => setVisibleFields((current) => ({ ...current, [field]: !current[field] }))}
      type="button"
    >
      {visibleFields[field] ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  const requirementClass = (passed: boolean): string =>
    passed ? "text-emerald-700" : "text-slate-500";

  return (
    <div className={embedded ? "space-y-5" : AUTH_STYLES.formStack}>
      <div className={AUTH_STYLES.formHeader}>
        <h1 className={embedded ? "text-[2rem] font-bold leading-none text-[#2e0810]" : AUTH_STYLES.formBrandTitle}>{title}</h1>
        <p className={embedded ? "mt-2 text-[15px] leading-7 text-slate-600" : AUTH_STYLES.formBrandText}>{description}</p>
      </div>

      {error ? <Toast message={error} onDismiss={() => setError(null)} title="Error" variant="error" /> : null}

      <Card className={AUTH_STYLES.formCard} bodyClassName="px-6 py-5 sm:px-7 sm:py-6">
        <form className={AUTH_STYLES.form} onSubmit={handleSubmit}>
          <Input
            autoComplete="current-password"
            className="h-11 rounded-[11px] border-[#d7d8df] bg-white px-3.5 text-[14px]"
            containerClassName="space-y-1.5"
            errorText={passwordActualError}
            label="Contrasena Actual"
            onBlur={() => setTouched((current) => ({ ...current, passwordActual: true }))}
            onChange={(event) => {
              const value = event.target.value;
              setForm((current) => ({ ...current, passwordActual: value }));
              setServerFieldErrors((current) => ({ ...current, passwordActual: undefined }));
            }}
            placeholder="********"
            rightAdornment={renderPasswordAdornment("passwordActual", "Mostrar contrasena actual", "Ocultar contrasena actual")}
            type={visibleFields.passwordActual ? "text" : "password"}
            value={form.passwordActual}
          />

          <div className="space-y-2">
            <Input
              autoComplete="new-password"
              className="h-11 rounded-[11px] border-[#d7d8df] bg-white px-3.5 text-[14px]"
              containerClassName="space-y-1.5"
              errorText={passwordNuevaError}
              helperText={passwordNuevaError ? undefined : "Debe ser distinta a la contrasena actual"}
              label="Nueva Contrasena"
              onBlur={() => setTouched((current) => ({ ...current, passwordNueva: true }))}
              onChange={(event) => {
                const value = event.target.value;
                setForm((current) => ({ ...current, passwordNueva: value }));
                setServerFieldErrors((current) => ({ ...current, passwordNueva: undefined }));
              }}
              placeholder="********"
              rightAdornment={renderPasswordAdornment("passwordNueva", "Mostrar nueva contrasena", "Ocultar nueva contrasena")}
              type={visibleFields.passwordNueva ? "text" : "password"}
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
          </div>

          <Input
            autoComplete="new-password"
            className="h-11 rounded-[11px] border-[#d7d8df] bg-white px-3.5 text-[14px]"
            containerClassName="space-y-1.5"
            errorText={confirmarPasswordError}
            label="Confirmar Nueva Contrasena"
            onBlur={() => setTouched((current) => ({ ...current, confirmarPassword: true }))}
            onChange={(event) => setForm((current) => ({ ...current, confirmarPassword: event.target.value }))}
            placeholder="********"
            rightAdornment={renderPasswordAdornment(
              "confirmarPassword",
              "Mostrar confirmacion de contrasena",
              "Ocultar confirmacion de contrasena"
            )}
            type={visibleFields.confirmarPassword ? "text" : "password"}
            value={form.confirmarPassword}
          />

          <div className={AUTH_STYLES.actions}>
            <Button
              className="h-11 rounded-[11px] bg-[#8b1515] text-[16px] font-semibold shadow-[0_8px_18px_rgba(139,21,21,0.24)] hover:bg-[#741111]"
              fullWidth
              loading={isSubmitting}
              type="submit"
              variant="create"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ChangePasswordForm;
