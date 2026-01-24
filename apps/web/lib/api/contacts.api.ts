import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CreateContactInput, UpdateContactInput } from '@crm/types';
import apiClient from './client';

export interface ContactsFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  companyId?: string;
}

// Get contacts list with pagination and filters
export const useContacts = (filters: ContactsFilters = {}) => {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
      if (filters.search) params.set('search', filters.search);
      if (filters.companyId) params.set('companyId', filters.companyId);

      const response = await apiClient.get(`/contacts?${params.toString()}`);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get single contact
export const useContact = (id: string) => {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      const response = await apiClient.get(`/contacts/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Create contact
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateContactInput) => {
      const response = await apiClient.post('/contacts', data);
      return response.data;
    },
    onSuccess: (newContact) => {
      // Invalidate contacts list
      queryClient.invalidateQueries({ queryKey: ['contacts'] });

      // Navigate to the new contact
      router.push(`/contacts/${newContact.id}`);
    },
  });
};

// Update contact
export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateContactInput }) => {
      const response = await apiClient.patch(`/contacts/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedContact) => {
      // Update the specific contact in cache
      queryClient.setQueryData(['contact', updatedContact.id], updatedContact);

      // Invalidate contacts list
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

// Delete contact
export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/contacts/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['contact', deletedId] });

      // Invalidate contacts list
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

// Search contacts
export const useSearchContacts = (query: string) => {
  return useQuery({
    queryKey: ['contacts', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await apiClient.get(`/contacts/search/query?q=${encodeURIComponent(query)}`);
      return response.data;
    },
    enabled: query.length > 2,
    staleTime: 10 * 1000, // 10 seconds
  });
};
