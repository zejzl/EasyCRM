'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';

interface PipelineAnalyticsProps {
  stages: Array<{
    id: string;
    name: string;
    order: number;
    probability: number;
    color: string;
    deals: any[];
  }>;
}

export function PipelineAnalytics({ stages }: PipelineAnalyticsProps) {
  const totalDeals = stages.reduce((sum, stage) => sum + stage.deals.length, 0);
  const totalValue = stages.reduce(
    (sum, stage) => sum + stage.deals.reduce((dealSum, deal) => dealSum + (deal.value || 0), 0),
    0
  );

  // Calculate weighted pipeline value (value × probability)
  const weightedValue = stages.reduce((sum, stage) => {
    const stageValue = stage.deals.reduce((dealSum, deal) => dealSum + (deal.value || 0), 0);
    return sum + (stageValue * stage.probability) / 100;
  }, 0);

  // Average deal size
  const openDeals = stages.flatMap((stage) => stage.deals).filter((deal) => deal.status === 'OPEN');
  const avgDealSize = openDeals.length > 0 ? totalValue / openDeals.length : 0;

  // Conversion rates between stages
  const getConversionRate = (fromStage: string, toStage: string) => {
    const fromDeals = stages.find((s) => s.name === fromStage)?.deals.length || 0;
    const toDeals = stages.find((s) => s.name === toStage)?.deals.length || 0;
    return fromDeals > 0 ? Math.round((toDeals / fromDeals) * 100) : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Deals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDeals}</div>
          <p className="text-xs text-muted-foreground">
            {openDeals.filter((deal) => deal.status === 'OPEN').length} open deals
          </p>
        </CardContent>
      </Card>

      {/* Pipeline Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCompactCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Weighted: {formatCompactCurrency(weightedValue)}
          </p>
        </CardContent>
      </Card>

      {/* Average Deal Size */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCompactCurrency(avgDealSize)}</div>
          <p className="text-xs text-muted-foreground">Across {openDeals.length} open deals</p>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getConversionRate('Proposal', 'Closed Won')}%</div>
          <p className="text-xs text-muted-foreground">Proposal to Won conversion</p>
        </CardContent>
      </Card>
    </div>
  );
}
