'use client';

import { useState } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Phone, Mail, MessageSquare, Calendar, CheckCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface Activity {
  id: string;
  type: string;
  subject: string;
  description?: string;
  duration?: number;
  completedAt?: string;
  scheduledAt?: string;
  emailTo?: string[];
  createdById: {
    id: string;
    name: string;
  };
  deal?: {
    id: string;
    name: string;
    company?: {
      id: string;
      name: string;
    };
  };
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

import { useCreateActivity } from '@/lib/api/activities.api';

interface ActivityFeedProps {
  activities: Activity[];
  onCreateActivity?: (type: string, dealId?: string, contactId?: string) => void;
}

const activityTypes = [
  { value: 'CALL', label: 'Call', icon: Phone, color: 'bg-blue-100 text-blue-700' },
  { value: 'EMAIL', label: 'Email', icon: Mail, color: 'bg-green-100 text-green-700' },
  { value: 'MEETING', label: 'Meeting', icon: Calendar, color: 'bg-purple-100 text-purple-700' },
  { value: 'TASK', label: 'Task', icon: CheckCircle, color: 'bg-orange-100 text-orange-700' },
  { value: 'NOTE', label: 'Note', icon: MessageSquare, color: 'bg-gray-100 text-gray-700' },
  { value: 'SMS', label: 'SMS', icon: MessageSquare, color: 'bg-pink-100 text-pink-700' },
];

export function ActivityFeed({ activities, onCreateActivity }: ActivityFeedProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newActivityType, setNewActivityType] = useState<string>('CALL');
  const [dealId, setDealId] = useState<string>('');
  const [contactId, setContactId] = useState<string>('');

  const createActivity = useCreateActivity();

  const handleCreateActivity = () => {
    if (onCreateActivity) {
      const activityData: any = {
        type: newActivityType,
        dealId: dealId || undefined,
        contactId: contactId || undefined,
      };

      createActivity.mutate(activityData);
    }
    setShowCreateForm(false);
    setNewActivityType('CALL');
    setDealId('');
    setContactId('');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const getActivityIcon = (type: string) => {
    const activity = activityTypes.find((a) => a.value === type);
    return activity?.icon || MessageSquare;
  };

  const getActivityColor = (type: string) => {
    const activity = activityTypes.find((a) => a.value === type);
    return activity?.color || 'bg-gray-100 text-gray-700';
  };

  const isOverdue = (scheduledAt?: string) => {
    return scheduledAt && new Date(scheduledAt) < new Date();
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activities recorded yet</p>
            <p className="text-sm">Start logging activities to track your interactions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">Activity Feed</CardTitle>
        <Button onClick={() => setShowCreateForm(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Log Activity
        </Button>
      </div>

      {/* Quick Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Activity Type</label>
                <select
                  value={newActivityType}
                  onChange={(e) => setNewActivityType(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {activityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Associated Deal (Optional)</label>
                <input
                  type="text"
                  value={dealId}
                  onChange={(e) => setDealId(e.target.value)}
                  placeholder="Enter deal ID"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Associated Contact (Optional)</label>
                <input
                  type="text"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  placeholder="Enter contact ID"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateActivity}>Create Activity</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      <div className="space-y-3">
        {activities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {React.createElement(getActivityIcon(activity.type), { className: 'h-4 w-4' })}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.subject}</h4>
                    {activity.deal && (
                      <p className="text-sm text-blue-600">
                        Deal: {activity.deal.name}
                        {activity.deal.company && ` (${activity.deal.company.name})`}
                      </p>
                    )}
                    {activity.contact && (
                      <p className="text-sm text-green-600">
                        Contact: {activity.contact.firstName} {activity.contact.lastName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getActivityColor(activity.type)}>{activity.type}</Badge>
                  {activity.duration && (
                    <span className="text-sm text-muted-foreground">{activity.duration}min</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {activity.description && (
                <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>By {activity.createdById?.name}</span>
                  {activity.completedAt && (
                    <>
                      <Calendar className="h-3 w-3" />
                      <span>Completed: {formatDate(activity.completedAt)}</span>
                    </>
                  )}
                  {activity.scheduledAt && !activity.completedAt && (
                    <>
                      <Clock className="h-3 w-3" />
                      <span
                        className={
                          isOverdue(activity.scheduledAt) ? 'text-red-500 font-medium' : ''
                        }
                      >
                        Scheduled: {formatDate(activity.scheduledAt)}
                      </span>
                    </>
                  )}
                </div>
                {activity.completedAt && <CheckCircle className="h-3 w-3 text-green-600" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
