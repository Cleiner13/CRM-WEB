import type { MiPerfilResponse } from "@/types";
import { httpClientGet } from "./httpClient";

export const profileService = {
  async getMyProfile(): Promise<MiPerfilResponse> {
    return httpClientGet<MiPerfilResponse>("/profile/me");
  },
};
