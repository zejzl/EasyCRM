import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CreateActivityInput, UpdateActivityInput } from '@crm/types';
import apiClient from './client';

export interface ActivitiesFilters {
  page?: number;
  limit?: number;
  type?: string;
  dealId?: string;
  contactId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Get activities list with pagination and filters
export const useActivities = (filters: ActivitiesFilters = {}) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.type) params.set('type', filters.type);
      if (filters.dealId) params.set('dealId', filters.dealId);
      if (filters.contactId) params.set('contactId', filters.contactId);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);

      const response = await apiClient.get(`/activities?${params.toString()}`);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get single activity
export const useActivity = (id: string) => {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      const response = await apiClient.get(`/activities/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Create activity
export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateActivityInput) => {
      const response = await apiClient.post('/activities', data);
      return response.data;
    },
    onSuccess: (newActivity) => {
      // Invalidate activities list
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      // Also invalidate deals if activity is associated with a deal
      if (newActivity.dealId) {
        queryClient.invalidateQueries({ queryKey: ['deals'] });
        queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      }

      // Navigate to activities to see the new activity
      router.push('/activities');
    },
  });
};

// Update activity
export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateActivityInput }) => {
      const response = await apiClient.patch(`/activities/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedActivity) => {
      // Update the specific activity in cache
      queryClient.setQueryData(['activity', updatedActivity.id], updatedActivity);

      // Invalidate activities list
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      // Invalidate deals if activity is associated with a deal
      if (updatedActivity.dealId) {
        queryClient.invalidateQueries({ queryKey: ['deals'] });
        queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      }
    },
  });
};

// Delete activity
export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/activities/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['activity', deletedId] });

      // Invalidate activities list
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      // Invalidate deals if activity was associated with a deal
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });
};

// Search activities
export const useSearchActivities = (query: string) => {
  return useQuery({
    queryKey: ['activities', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await apiClient.get(
        `/activities/search/query?q=${encodeURIComponent(query)}`
      );
      return response.data;
    },
    enabled: query.length > 2,
    staleTime: 10 * 1000, // 10 seconds
  });
};
