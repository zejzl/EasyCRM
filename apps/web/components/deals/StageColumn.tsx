'use client';

import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DealCard } from './DealCard';

interface StageColumnProps {
  stage: {
    id: string;
    name: string;
    order: number;
    probability: number;
    color: string;
    deals: any[];
  };
  deals: any[];
}

export function StageColumn({ stage, deals }: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = deals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStageColor = (stageName: string) => {
    const colorMap: Record<string, string> = {
      Lead: 'bg-gray-100 text-gray-700 border-gray-200',
      Qualified: 'bg-blue-100 text-blue-700 border-blue-200',
      Proposal: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
      'Closed Won': 'bg-green-100 text-green-700 border-green-200',
      'Closed Lost': 'bg-red-100 text-red-700 border-red-200',
    };
    return colorMap[stageName] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="flex-shrink-0 w-80">
      <Card className={`h-full ${isOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>
        <CardHeader className={`pb-3 ${getStageColor(stage.name)}`}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">{stage.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {deals.length}
              </Badge>
              {deals.length > 0 && (
                <span className="text-xs font-medium">{formatCurrency(totalValue)}</span>
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full"
                style={{ width: `${stage.probability}%` }}
              />
            </div>
            <div className="text-xs mt-1 opacity-75">{stage.probability}% probability</div>
          </div>
        </CardHeader>
        <CardContent ref={setNodeRef} className="pt-0 min-h-[400px] max-h-[600px] overflow-y-auto">
          <div className="space-y-2">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}

            {deals.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">No deals in this stage</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
