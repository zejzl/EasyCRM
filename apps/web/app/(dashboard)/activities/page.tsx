'use client';

import { useState } from 'react';
import { ActivityFeed } from '@/components/activities/ActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeals } from '@/lib/api/deals.api';
import { Search, Filter } from 'lucide-react';

export default function ActivitiesPage() {
  const [filters, setFilters] = useState({
    type: '',
    dealId: '',
    dateRange: '',
  });

  const { data: dealsData } = useDeals({ limit: 1000 });
  const deals = dealsData?.data || [];

  // Mock recent activities for demonstration
  const mockActivities = [
    {
      id: '1',
      type: 'CALL',
      subject: 'Discovery call with Acme Corp',
      description: 'Discussed their requirements and timeline for enterprise software deal',
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdById: { id: '1', name: 'John Doe' },
      deal: {
        id: 'deal1',
        name: 'Enterprise Software Deal',
        company: { id: 'comp1', name: 'Acme Corp' },
      },
    },
    {
      id: '2',
      type: 'EMAIL',
      subject: 'Follow-up: Pricing Proposal',
      description: 'Sent detailed pricing proposal for enterprise license',
      emailTo: ['contact@acme.example.com'],
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      createdById: { id: '1', name: 'John Doe' },
      deal: {
        id: 'deal1',
        name: 'Enterprise Software Deal',
        company: { id: 'comp1', name: 'Acme Corp' },
      },
    },
    {
      id: '3',
      type: 'MEETING',
      subject: 'Product Demo',
      description: 'Live product demonstration with technical team',
      duration: 45,
      scheduledAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      createdById: { id: '1', name: 'John Doe' },
      deal: {
        id: 'deal2',
        name: 'Mobile App Integration',
        company: { id: 'comp2', name: 'Tech Innovations' },
      },
    },
    {
      id: '4',
      type: 'TASK',
      subject: 'Update Contract Terms',
      description: 'Legal review of contract terms for enterprise deal',
      createdById: { id: '2', name: 'Jane Smith' },
      deal: {
        id: 'deal1',
        name: 'Enterprise Software Deal',
        company: { id: 'comp1', name: 'Acme Corp' },
      },
    },
  ];

  const handleCreateActivity = (type: string, dealId?: string, contactId?: string) => {
    console.log(`Creating ${type} activity:`, { type, dealId, contactId });
    // In a real implementation, this would call the API
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">
            Track all your customer interactions and communications
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Activity Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="CALL">Calls</SelectItem>
                  <SelectItem value="EMAIL">Emails</SelectItem>
                  <SelectItem value="MEETING">Meetings</SelectItem>
                  <SelectItem value="TASK">Tasks</SelectItem>
                  <SelectItem value="NOTE">Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Deal</label>
              <Select
                value={filters.dealId}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, dealId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All deals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All deals</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="quarter">This quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <ActivityFeed activities={mockActivities} onCreateActivity={handleCreateActivity} />

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Activities completed on time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">John Doe</div>
            <p className="text-xs text-muted-foreground">12 activities this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 hrs</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
