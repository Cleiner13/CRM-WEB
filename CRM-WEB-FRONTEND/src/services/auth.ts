import type { Usuario, LoginResponse } from "@/types";
import { httpClientGet, httpClientPost } from "./httpClient";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export type LoginPayload = {
  username: string;
  password: string;
};

type AuthError = Error & {
  blockedUntil?: string;
};

let currentUser: Usuario | null = null;
let isRefreshing = false;

function formatBlockedUntil(value: unknown): { iso: string; label: string } | null {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return {
    iso: parsed.toISOString(),
    label: new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsed),
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<Usuario> {
    if (!payload.username || !payload.password) {
      throw new Error("Credenciales requeridas");
    }

    try {
      const response = await httpClientPost<LoginResponse>("/auth/login", payload);

      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

      const { accessToken, refreshToken, accessTokenExpiraEn, ...user } = response;
      return user;
    } catch (rawError: any) {
      const error = rawError as AuthError & { status?: number; details?: unknown };
      const message = error?.message || "Error en login";

      const isCredentialError =
        error?.status === 401 ||
        message.toLowerCase().includes("contrasena") ||
        message.toLowerCase().includes("contraseña") ||
        message.toLowerCase().includes("password") ||
        message.toLowerCase().includes("usuario o contrasena") ||
        message.toLowerCase().includes("usuario o contraseña") ||
        message.toLowerCase().includes("credenciales") ||
        message.toLowerCase().includes("no existe") ||
        message.toLowerCase().includes("invalido") ||
        message.toLowerCase().includes("inválido");

      const isBlockedError = message.toLowerCase().includes("bloqueado");

      if (isBlockedError) {
        const blockedUntil = formatBlockedUntil((error?.details as { bloqueadoHasta?: unknown } | undefined)?.bloqueadoHasta);
        const nextError = new Error(
          blockedUntil
            ? `Cuenta bloqueada temporalmente. Intente nuevamente el ${blockedUntil.label}.`
            : "Cuenta bloqueada temporalmente. Intente mas tarde."
        ) as AuthError;

        if (blockedUntil) {
          nextError.blockedUntil = blockedUntil.iso;
        }

        throw nextError;
      }

      if (error?.status === 403 || message.toLowerCase().includes("inactivo") || message.toLowerCase().includes("desactivado")) {
        throw new Error("Su usuario ha sido desactivado. Contacte a sistemas.");
      }

      if (isCredentialError) {
        throw new Error("Credenciales incorrectas. Verifique usuario y contrasena.");
      }

      if ((error?.status ?? 0) >= 500) {
        throw new Error("Error interno del servidor. Reporte este problema a sistemas con el codigo de error.");
      }

      if (message.includes("disponible") || message.includes("No esta disponible") || message.includes("No está disponible")) {
        throw error;
      }

      throw new Error(message || "Error en login");
    }
  },

  async refreshToken(): Promise<void> {
    if (isRefreshing) return;

    isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) throw new Error("No refresh token");

      const response = await httpClientPost<LoginResponse>("/auth/refresh-token", {
        refreshToken,
      });

      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    } finally {
      isRefreshing = false;
    }
  },

  logout(): void {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      httpClientPost("/auth/logout", { refreshToken }).catch(() => {});
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  async fetchCurrentUser(): Promise<Usuario> {
    const response = await httpClientGet<Usuario>("/auth/me");
    currentUser = response;
    return response;
  },

  setCurrentUser(user: Usuario | null): void {
    currentUser = user;
  },

  getCurrentUser(): Usuario | null {
    return currentUser;
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};
