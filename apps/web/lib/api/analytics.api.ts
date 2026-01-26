import { useQuery } from '@tanstack/react-query';
import apiClient from './client';

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  timeframe?: string;
}

export const useAnalyticsOverview = (filters: AnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ['analytics', 'overview', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (filters.timeframe) params.set('timeframe', filters.timeframe);

      const response = await apiClient.get(`/analytics/overview?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePipelineAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'pipeline'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/pipeline');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSalesByUser = () => {
  return useQuery({
    queryKey: ['analytics', 'sales-by-user'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/sales-by-user');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRevenueForecast = (months: number = 3) => {
  return useQuery({
    queryKey: ['analytics', 'revenue-forecast', months],
    queryFn: async () => {
      const response = await apiClient.get(`/analytics/revenue-forecast?months=${months}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
