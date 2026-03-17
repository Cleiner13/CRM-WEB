import type { Usuario } from "@/types";

const AUTH_KEY = "almpes-auth";

const MOCK_USER: Usuario = {
  id: "u-1",
  nombre: "ALMPES User",
  correo: "user@almpes.local",
  permisos: [{ codigo: "*", descripcion: "Acceso total en scaffold" }],
};

export type LoginPayload = {
  username: string;
  password: string;
};

export const authService = {
  async login(payload: LoginPayload): Promise<Usuario> {
    if (!payload.username || !payload.password) {
      throw new Error("Credenciales requeridas");
    }

    window.localStorage.setItem(AUTH_KEY, "1");
    return MOCK_USER;
  },
  logout(): void {
    window.localStorage.removeItem(AUTH_KEY);
  },
  isAuthenticated(): boolean {
    return window.localStorage.getItem(AUTH_KEY) === "1";
  },
  getCurrentUser(): Usuario {
    return MOCK_USER;
  },
};


