import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LoginInput, RegisterInput } from '@crm/types';
import apiClient from '../api/client';

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

  // Actions
  login: (credentials: LoginInput) => Promise<void>;
  register: (userData: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginInput) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/api/auth/login', credentials);
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
          const response = await apiClient.post('/api/auth/register', userData);
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
          const response = await apiClient.post('/api/auth/refresh', {
            refreshToken,
          });
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
        // Check for stored tokens on app initialization
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('accessToken');
          const refreshToken = localStorage.getItem('refreshToken');

          if (accessToken && refreshToken) {
            set({
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              isLoading: false,
            });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
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
