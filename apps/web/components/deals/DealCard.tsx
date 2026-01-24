'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  User,
  Building2,
  Phone,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';

interface DealCardProps {
  deal: {
    id: string;
    name: string;
    value: number;
    probability: number;
    expectedCloseDate?: string;
    company?: { id: string; name: string };
    contact?: { id: string; firstName: string; lastName: string };
    owner?: { id: string; name: string };
  };
}

export function DealCard({ deal }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600 bg-green-50';
    if (probability >= 50) return 'text-yellow-600 bg-yellow-50';
    if (probability >= 25) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const isOverdue = deal.expectedCloseDate && new Date(deal.expectedCloseDate) < new Date();

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2">
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-tight truncate pr-2">{deal.name}</h4>
              {deal.company && (
                <div className="flex items-center gap-1 mt-1">
                  <Building2 className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 truncate">{deal.company.name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  // Quick activity creation - log a call for this deal
                  console.log(`Logging call for deal: ${deal.id}`);
                }}
              >
                <Phone className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {/* Deal Value */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-sm">{formatCurrency(deal.value)}</span>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs ${getProbabilityColor(deal.probability)}`}
              >
                {deal.probability}%
              </Badge>
            </div>

            {/* Probability Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${deal.probability}%` }}
              />
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                {deal.expectedCloseDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                      {format(new Date(deal.expectedCloseDate), 'MMM d')}
                    </span>
                  </div>
                )}
                {deal.contact && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-20">{deal.contact.firstName}</span>
                  </div>
                )}
              </div>
              {deal.probability >= 75 && <TrendingUp className="h-3 w-3 text-green-600" />}
            </div>

            {/* Owner and Close Date */}
            <div className="flex items-center justify-between text-xs">
              {deal.owner && <span className="text-gray-400">{deal.owner.name}</span>}
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
