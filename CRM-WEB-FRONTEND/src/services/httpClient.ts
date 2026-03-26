import { authService } from "./auth";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7076/api";

function getProp<T = unknown>(value: unknown, ...keys: string[]): T | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  for (const key of keys) {
    if (key in record) {
      return record[key] as T;
    }
  }

  return undefined;
}

export async function httpClient<TResponse>(endpoint: string, options: RequestOptions = {}): Promise<TResponse> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = authService.getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("NetworkError") ||
      errorMessage.includes("ERR_CONNECTION_REFUSED")
    ) {
      throw new Error("El servidor no esta disponible. Por favor, contacte a sistemas o intente mas tarde.");
    }

    throw new Error("Error de conexion. Por favor, verifique su conexion a internet.");
  }

  const isAuthEndpoint =
    endpoint.startsWith("/auth/login") || endpoint.startsWith("/auth/refresh-token") || endpoint.startsWith("/auth/logout");

  if (response.status === 401 && !isAuthEndpoint) {
    try {
      await authService.refreshToken();
      const newToken = authService.getAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          method: options.method ?? "GET",
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (retryResponse.ok) {
          const retryData = await retryResponse.json().catch(() => null);
          const retrySuccess = getProp<boolean>(retryData, "success", "Success");
          const retryPayload = getProp<unknown>(retryData, "data", "Data");

          if (retryData && typeof retryData === "object" && typeof retrySuccess === "boolean") {
            return retryPayload as TResponse;
          }

          return retryData as TResponse;
        }
      }
    } catch (refreshError) {
      authService.logout();
      const mensajeCrudo = (refreshError as Error).message || "No autorizado";
      const error = new Error(`Refresh token fallido: ${mensajeCrudo}`) as Error & { status?: number };
      error.status = 401;
      throw error;
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    let errorDetails: unknown = undefined;

    try {
      const errorData = await response.json();
      errorMessage =
        getProp<string>(errorData, "message", "Message") ||
        getProp<string>(errorData, "error", "Error") ||
        getProp<string[]>(errorData, "errors", "Errors")?.[0] ||
        errorMessage;
      errorDetails = getProp<unknown>(errorData, "details", "Details") ?? errorData;
    } catch {
      if (response.status >= 500) {
        errorMessage = "Error del servidor. Por favor, intente mas tarde.";
      } else if (response.status >= 400) {
        errorMessage = "Error en la solicitud. Verifique los datos e intente de nuevo.";
      }
    }

    const error = new Error(errorMessage) as Error & { status?: number; details?: unknown };
    error.status = response.status;
    error.details = errorDetails;
    throw error;
  }

  const data = await response.json().catch(() => null);
  const success = getProp<boolean>(data, "success", "Success");
  const payload = getProp<unknown>(data, "data", "Data");
  const message = getProp<string>(data, "message", "Message");
  const errors = getProp<string[]>(data, "errors", "Errors");
  const details = getProp<unknown>(data, "details", "Details");

  if (data && typeof data === "object" && typeof success === "boolean") {
    if (!success) {
      const error = new Error(message || "Error en la solicitud.") as Error & { status?: number; details?: unknown };
      error.status = response.status;
      error.details = details ?? errors ?? data;
      throw error;
    }

    return payload as TResponse;
  }

  return data as TResponse;
}

export const httpClientGet = <T>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
  httpClient<T>(endpoint, { ...options, method: "GET" });

export const httpClientPost = <T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestOptions, "method" | "body">
) => httpClient<T>(endpoint, { ...options, method: "POST", body });

export const httpClientPut = <T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestOptions, "method" | "body">
) => httpClient<T>(endpoint, { ...options, method: "PUT", body });

export const httpClientPatch = <T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestOptions, "method" | "body">
) => httpClient<T>(endpoint, { ...options, method: "PATCH", body });

export const httpClientDelete = <T>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
  httpClient<T>(endpoint, { ...options, method: "DELETE" });
