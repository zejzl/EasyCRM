'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { usePipeline, useMoveDealStage } from '@/lib/api/deals.api';
import { DealCard } from './DealCard';
import { StageColumn } from './StageColumn';
import { PipelineAnalytics } from './PipelineAnalytics';
import { ActivityFeed } from '../activities/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Activity } from 'lucide-react';
import { DealForm } from './DealForm';
import { Loading } from '@crm/ui';

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
  deals: any[];
}

export function PipelineBoard() {
  const { data: pipelineData, isLoading, error, refetch } = usePipeline();
  const moveDealStage = useMoveDealStage();
  const [formOpen, setFormOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    // Optional: Add visual feedback
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Prevent default to allow dropping
    event.over && event.active && event.active.id !== event.over.id;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const dealId = active.id as string;
    const newStageId = over.id as string;

    // Only move if the stage actually changed
    const currentDeal = pipelineData?.flatMap((stage: PipelineStage) =>
      stage.deals.filter((deal) => deal.id === dealId)
    )[0];

    if (currentDeal && currentDeal.stageId !== newStageId) {
      await moveDealStage.mutateAsync({
        id: dealId,
        stageId: newStageId,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Loading pipeline..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Pipeline Error</h2>
        <p className="text-gray-600 mb-4">Failed to load pipeline data. Please try again.</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!pipelineData || pipelineData.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Pipeline Stages</h2>
        <p className="text-gray-600 mb-4">Configure your sales pipeline stages to get started.</p>
      </div>
    );
  }

  // Filter stages to only show active ones (exclude closed won/lost for pipeline view)
  const activeStages = pipelineData.filter(
    (stage: PipelineStage) => stage.name !== 'Closed Won' && stage.name !== 'Closed Lost'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground">Drag and drop deals to move them between stages</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configure Stages
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Pipeline Analytics */}
      <PipelineAnalytics stages={pipelineData} />

      {/* Recent Activity Feed */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activities
        </h3>

        {/* Collect recent activities from all deals */}
        {(() => {
          const allActivities =
            pipelineData?.flatMap(
              (stage: any) => stage.deals?.flatMap((deal: any) => deal.activities || []) || []
            ) || [];

          // Get unique activities and sort by date
          const uniqueActivities = allActivities
            .filter(
              (activity: any, index: number, self: any[]) =>
                index === allActivities.findIndex((a: any) => a.id === activity.id)
            )
            .sort(
              (a: any, b: any) =>
                new Date(b.completedAt || b.createdAt).getTime() -
                new Date(a.completedAt || a.createdAt).getTime()
            )
            .reverse()
            .slice(0, 10); // Show last 10 activities

          return (
            <ActivityFeed
              activities={uniqueActivities}
              onCreateActivity={(type, dealId, contactId) => {
                // Create activity with optional deal association
                console.log(`Creating ${type} activity for deal: ${dealId}`);
              }}
            />
          );
        })()}
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-max pb-4">
            {activeStages.map((stage: PipelineStage) => (
              <SortableContext
                key={stage.id}
                items={stage.deals.map((deal) => deal.id)}
                strategy={verticalListSortingStrategy}
              >
                <StageColumn stage={stage} deals={stage.deals} />
              </SortableContext>
            ))}
          </div>
        </DndContext>
      </div>

      {/* Add Deal Form */}
      <DealForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (data: any) => {
          // Deal creation is handled by the mutation in the form
          setFormOpen(false);
        }}
      />
    </div>
  );
}
