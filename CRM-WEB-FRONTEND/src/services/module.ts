import type { AppModule, ModuleOperationResponse, SaveModuleRequest, SaveModuleResponse } from "@/types";
import { httpClientDelete, httpClientGet, httpClientPost } from "./httpClient";

let modulesCache: AppModule[] | null = null;
let modulesPromise: Promise<AppModule[]> | null = null;

export const moduleService = {
  async getAll(search?: string, onlyActive = true): Promise<AppModule[]> {
    const normalizedSearch = search?.trim();

    if (!normalizedSearch && onlyActive && modulesCache) {
      return modulesCache;
    }

    if (!normalizedSearch && onlyActive && !modulesPromise) {
      modulesPromise = httpClientGet<AppModule[]>("/modulos").then((modules) => {
        modulesCache = modules;
        return modules;
      });
    }

    if (normalizedSearch || !onlyActive) {
      const params = new URLSearchParams();
      if (normalizedSearch) {
        params.set("buscar", normalizedSearch);
      }
      params.set("soloActivos", String(onlyActive));

      return httpClientGet<AppModule[]>(`/modulos?${params.toString()}`);
    }

    return modulesPromise as Promise<AppModule[]>;
  },

  async save(payload: SaveModuleRequest): Promise<SaveModuleResponse> {
    const response = await httpClientPost<SaveModuleResponse>("/modulos", payload);
    this.clearCache();
    return response;
  },

  async remove(moduleId: number): Promise<ModuleOperationResponse> {
    const response = await httpClientDelete<ModuleOperationResponse>(`/modulos/${moduleId}`);
    this.clearCache();
    return response;
  },

  clearCache(): void {
    modulesCache = null;
    modulesPromise = null;
  },
};
