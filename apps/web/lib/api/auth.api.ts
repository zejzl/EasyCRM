import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoginInput, RegisterInput, AuthResponse } from '@crm/types'
import apiClient from './client'
import { useAuthStore } from '../store/auth.store'
import { useRouter } from 'next/navigation'

// Login mutation
export const useLogin = () => {
  const { setUser, setTokens } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const { data } = await apiClient.post<AuthResponse>(
        '/api/auth/login',
        credentials
      )
      return data
    },
    onSuccess: (data) => {
      // Store tokens
      setTokens(data.accessToken, data.refreshToken)

      // Store user
      setUser(data.user)

      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })

      // Redirect to dashboard
      router.push('/')
    },
    onError: (error: any) => {
      console.error('Login failed:', error.response?.data?.error || error.message)
    },
  })
}

// Register mutation
export const useRegister = () => {
  const { setUser, setTokens } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: RegisterInput) => {
      const { data } = await apiClient.post<AuthResponse>(
        '/api/auth/register',
        userData
      )
      return data
    },
    onSuccess: (data) => {
      // Store tokens
      setTokens(data.accessToken, data.refreshToken)

      // Store user
      setUser(data.user)

      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })

      // Redirect to dashboard
      router.push('/')
    },
    onError: (error: any) => {
      console.error(
        'Registration failed:',
        error.response?.data?.error || error.message
      )
    },
  })
}

// Get current user query
export const useCurrentUser = () => {
  const { isAuthenticated, setUser, setLoading } = useAuthStore()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/users/me')
      return data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    onSuccess: (data) => {
      setUser(data)
      setLoading(false)
    },
    onError: () => {
      setUser(null)
      setLoading(false)
    },
  })
}

// Logout mutation
export const useLogout = () => {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Call logout endpoint (optional, mainly for server-side cleanup)
      await apiClient.post('/api/auth/logout')
    },
    onSettled: () => {
      // Clear all queries
      queryClient.clear()

      // Logout from store (clears tokens and redirects)
      logout()
    },
  })
}
