import axios from 'axios';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LoginInput, RegisterInput } from '@crm/types';
import apiClient from '../api/client';
import { API_BASE } from '../api/base';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SALES_MANAGER' | 'SALES_REP' | 'VIEWER';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;

  // Actions
  login: (credentials: LoginInput) => Promise<void>;
  register: (userData: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  initialize: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      login: async (credentials: LoginInput) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/login', credentials);
          const { user, accessToken, refreshToken } = response.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterInput) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/register', userData);
          const { user, accessToken, refreshToken } = response.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      refreshAccessToken: async (): Promise<boolean> => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          // Plain axios, not apiClient: a 401 here must fail this call, not enter apiClient's 401 handler, which is
          // itself waiting for this refresh (the queued request would never settle).
          const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          set({
            accessToken,
            refreshToken: newRefreshToken,
          });

          return true;
        } catch (error) {
          // Refresh failed, logout
          get().logout();
          return false;
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      initialize: () => {
        // Tokens are restored by the persist middleware (key 'auth-storage'); nothing else stores them.
        set({ isLoading: false });
      },

      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const authStore = useAuthStore;
