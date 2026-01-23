import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: User | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        })
      },

      setTokens: (accessToken, refreshToken) => {
        // Store tokens in localStorage for axios interceptor
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          // Also set cookie for middleware
          document.cookie = `accessToken=${accessToken}; path=/; max-age=${15 * 60}` // 15 minutes
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
        }

        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      logout: () => {
        // Clear tokens from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')

          // Clear cookies
          document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      },

      initialize: () => {
        // Check for stored tokens on app initialization
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('accessToken')
          const refreshToken = localStorage.getItem('refreshToken')

          if (accessToken && refreshToken) {
            set({
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({
              isLoading: false,
            })
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
)
