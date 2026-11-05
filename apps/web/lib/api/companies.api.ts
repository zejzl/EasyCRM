import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CreateCompanyInput, UpdateCompanyInput } from '@crm/types';
import apiClient from './client';

export interface CompaniesFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Get companies list with pagination and filters
export const useCompanies = (filters: CompaniesFilters = {}) => {
  return useQuery({
    queryKey: ['companies', filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
      if (filters.search) params.set('search', filters.search);

      const response = await apiClient.get(`/companies?${params.toString()}`);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get single company
export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const response = await apiClient.get(`/companies/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Create company
export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateCompanyInput) => {
      const response = await apiClient.post('/companies', data);
      return response.data;
    },
    onSuccess: (newCompany) => {
      // Invalidate companies list
      queryClient.invalidateQueries({ queryKey: ['companies'] });

      // Navigate to the new company
      router.push(`/companies/${newCompany.id}`);
    },
  });
};

// Update company
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCompanyInput }) => {
      const response = await apiClient.patch(`/companies/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedCompany) => {
      // Update the specific company in cache
      queryClient.setQueryData(['company', updatedCompany.id], updatedCompany);

      // Invalidate companies list
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

// Delete company
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/companies/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['company', deletedId] });

      // Invalidate companies list
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

// Search companies
export const useSearchCompanies = (query: string) => {
  return useQuery({
    queryKey: ['companies', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await apiClient.get(
        `/companies/search/query?q=${encodeURIComponent(query)}`
      );
      return response.data;
    },
    enabled: query.length > 2,
    staleTime: 10 * 1000, // 10 seconds
  });
};
