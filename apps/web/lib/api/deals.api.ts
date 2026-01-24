import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CreateDealInput, UpdateDealInput } from '@crm/types';
import apiClient from './client';

export interface DealsFilters {
  page?: number;
  limit?: number;
  status?: string;
  stageId?: string;
  ownerId?: string;
}

// Get deals list with pagination and filters
export const useDeals = (filters: DealsFilters = {}) => {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.status) params.set('status', filters.status);
      if (filters.stageId) params.set('stageId', filters.stageId);
      if (filters.ownerId) params.set('ownerId', filters.ownerId);

      const response = await apiClient.get(`/deals?${params.toString()}`);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get pipeline view (deals grouped by stage)
export const usePipeline = () => {
  return useQuery({
    queryKey: ['pipeline'],
    queryFn: async () => {
      const response = await apiClient.get('/deals/pipeline');
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get single deal
export const useDeal = (id: string) => {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      const response = await apiClient.get(`/deals/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Create deal
export const useCreateDeal = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateDealInput) => {
      const response = await apiClient.post('/deals', data);
      return response.data;
    },
    onSuccess: (newDeal) => {
      // Invalidate deals list and pipeline
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });

      // Navigate to the new deal
      router.push(`/deals/${newDeal.id}`);
    },
  });
};

// Update deal
export const useUpdateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDealInput }) => {
      const response = await apiClient.patch(`/deals/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedDeal) => {
      // Update the specific deal in cache
      queryClient.setQueryData(['deal', updatedDeal.id], updatedDeal);

      // Invalidate deals list and pipeline
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });
};

// Move deal to different stage
export const useMoveDealStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stageId }: { id: string; stageId: string }) => {
      const response = await apiClient.patch(`/deals/${id}/stage`, { stageId });
      return response.data;
    },
    onSuccess: (updatedDeal) => {
      // Update the specific deal in cache
      queryClient.setQueryData(['deal', updatedDeal.id], updatedDeal);

      // Invalidate pipeline and deals list
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};

// Close deal (won/lost)
export const useCloseDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      lostReason,
      actualCloseDate,
    }: {
      id: string;
      status: 'WON' | 'LOST';
      lostReason?: string;
      actualCloseDate?: string;
    }) => {
      const response = await apiClient.patch(`/deals/${id}/close`, {
        status,
        lostReason,
        actualCloseDate,
      });
      return response.data;
    },
    onSuccess: (updatedDeal) => {
      // Update the specific deal in cache
      queryClient.setQueryData(['deal', updatedDeal.id], updatedDeal);

      // Invalidate pipeline and deals list
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};

// Delete deal
export const useDeleteDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/deals/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['deal', deletedId] });

      // Invalidate deals list and pipeline
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });
};

// Search deals
export const useSearchDeals = (query: string) => {
  return useQuery({
    queryKey: ['deals', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await apiClient.get(`/deals/search/query?q=${encodeURIComponent(query)}`);
      return response.data;
    },
    enabled: query.length > 2,
    staleTime: 10 * 1000, // 10 seconds
  });
};
