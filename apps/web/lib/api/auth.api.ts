import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoginInput, RegisterInput } from '@crm/types';
import { useAuthStore } from '../store/auth.store';

// Login mutation
export const useLogin = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      return await login(credentials);
    },
  });
};

// Register mutation
export const useRegister = () => {
  const register = useAuthStore((state) => state.register);

  return useMutation({
    mutationFn: async (userData: RegisterInput) => {
      return await register(userData);
    },
  });
};

// Current user query
export const useCurrentUser = () => {
  const { user, isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const userData = await response.json();
      setUser(userData);
      return userData;
    },
    enabled: isAuthenticated && !user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Logout mutation
export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      logout();
    },
    onSettled: () => {
      // Clear all queries
      queryClient.clear();
    },
  });
};
