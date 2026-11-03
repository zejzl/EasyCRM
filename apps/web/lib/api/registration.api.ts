import { useQuery } from '@tanstack/react-query';
import apiClient from './client';

// Registration policy (F02): the API says whether self sign-up is open; invites carry the email and name.
export type RegistrationMode = 'open' | 'closed';

export const useRegistrationMode = () =>
  useQuery({
    queryKey: ['registrationMode'],
    queryFn: async (): Promise<RegistrationMode> => {
      const response = await apiClient.get('/auth/registration');
      return response.data.mode === 'open' ? 'open' : 'closed';
    },
    staleTime: 5 * 60 * 1000,
  });

export const useInvite = (token: string | null) =>
  useQuery({
    queryKey: ['invite', token],
    queryFn: async (): Promise<{ email: string; name: string }> => {
      const response = await apiClient.get('/auth/invite', { params: { token } });
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });
