'use client';

import { useState } from 'react';
import { useAnalyticsOverview, usePipelineAnalytics } from '@/lib/api/analytics.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  DollarSign, 
  Users, 
  Calendar
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsOverview {
  deals: {
    totalDeals: number;
    totalValue: number;
    winRate: number;
    averageDealSize: number;
  };
  performance: {
    totalDeals: number;
    totalValue: number;
    winRate: number;
    averageDealSize: number;
  };
}

interface PipelineAnalytics {
  stages: Array<{
    stageId: string;
    stageName: string;
    dealCount: number;
    totalValue: number;
    averageDealSize: number;
    probability: number;
  }>;
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('month');
  const [showDateFilter, setShowDateFilter] = useState(false);

  const { data: overviewData, isLoading, error } = useAnalyticsOverview({ timeframe });
  const { data: pipelineData } = usePipelineAnalytics();

  const handleExportReport = () => {
    console.log('Exporting analytics report...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Analytics Error</h2>
        <p className="text-gray-600 mb-4">
          Failed to load analytics data. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!overviewData || !pipelineData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
        <p className="text-gray-600 mb-4">
          Analytics data is not available. Please ensure your database is seeded.
        </p>
        <Button onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights and sales intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowDateFilter(!showDateFilter)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {showDateFilter ? 'Hide Date Filter' : 'Show Date Filter'}
          </Button>
        </div>
        <Button onClick={handleExportReport}>
          <TrendingUp className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics Cards */}
      {overviewData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deals Overview</CardTitle>
              <DollarSign />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold">{overviewData.deals.totalDeals}</p>
                  <p className="text-xs text-muted-foreground">Total Deals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{overviewData.performance.totalValue}</p>
                  <p className="text-xs text-muted-foreground">Total Pipeline Value</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{overviewData.performance.winRate}%</p>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activities</CardTitle>
              <Users />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold">{overviewData.activities.totalActivities}</p>
                  <p className="text-xs text-muted-foreground">Total Activities</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{overviewData.activities.completedActivities}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {overviewData?.performance && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
              <BarChart3 />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold text-green-600">{overviewData.performance.averageDealSize}</p>
                  <p className="text-xs text-muted-foreground">Avg Deal Size</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{overviewData.performance.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
      )}

      {/* Pipeline Analytics */}
      {pipelineData && (
        <Card>
          <CardHeader className="text-lg font-medium flex items-center gap-2">
            <BarChart3 />
            Sales Pipeline Analytics
          </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineData.stages && pipelineData.stages.length > 0 ? (
                  pipelineData.stages.map((stage: any) => (
                    <div key={stage.stageId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{stage.stageName}</h4>
                        <span className="text-sm text-muted-foreground">{stage.dealCount} deals</span>
                        <span className="text-sm text-muted-foreground">
                          {stage.averageDealSize ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stage.averageDealSize) : '0'} avg
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${stage.probability}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No pipeline data available</p>
                )}
              </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}