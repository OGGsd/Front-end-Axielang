// authStore.js

import { Cookies } from "react-cookie";
import { create } from "zustand";
import {
  AXIE_STUDIO_ACCESS_TOKEN,
  AXIE_STUDIO_REFRESH_TOKEN,
  AXIE_STUDIO_AUTO_LOGIN_OPTION,
  AXIE_STUDIO_API_TOKEN
} from "@/constants/constants";
import type { AuthStoreType } from "@/types/zustand/auth";

const cookies = new Cookies();
const useAuthStore = create<AuthStoreType>((set, get) => ({
  isAdmin: false,
  isAuthenticated: !!cookies.get(AXIE_STUDIO_ACCESS_TOKEN),
  accessToken: cookies.get(AXIE_STUDIO_ACCESS_TOKEN) ?? null,
  userData: null,
  autoLogin: null,
  apiKey: cookies.get("apikey_tkn_as"),
  authenticationErrorCount: 0,

  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUserData: (userData) => set({ userData }),
  setAutoLogin: (autoLogin) => set({ autoLogin }),
  setApiKey: (apiKey) => set({ apiKey }),
  setAuthenticationErrorCount: (authenticationErrorCount) =>
    set({ authenticationErrorCount }),

  logout: async () => {
    const cookies = new Cookies();

    // Clear all cookies
    cookies.remove(AXIE_STUDIO_ACCESS_TOKEN, { path: "/" });
    cookies.remove(AXIE_STUDIO_REFRESH_TOKEN, { path: "/" });
    cookies.remove(AXIE_STUDIO_AUTO_LOGIN_OPTION, { path: "/" });
    cookies.remove(AXIE_STUDIO_API_TOKEN, { path: "/" });

    // Clear localStorage
    localStorage.removeItem(AXIE_STUDIO_ACCESS_TOKEN);
    localStorage.removeItem(AXIE_STUDIO_REFRESH_TOKEN);
    localStorage.removeItem(AXIE_STUDIO_AUTO_LOGIN_OPTION);
    localStorage.removeItem(AXIE_STUDIO_API_TOKEN);

    // Clear sessionStorage
    sessionStorage.clear();

    get().setIsAuthenticated(false);
    get().setIsAdmin(false);

    set({
      isAdmin: false,
      userData: null,
      accessToken: null,
      isAuthenticated: false,
      autoLogin: false,
      apiKey: null,
    });

    // Force page reload to clear any cached data
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  },
}));

export default useAuthStore;
