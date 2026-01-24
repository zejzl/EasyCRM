'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  User,
  Building2,
  Phone,
  Mail,
  Target,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDeal } from '@/lib/api/deals.api';
import { DealForm } from '@/components/deals/DealForm';
import { useUpdateDeal, useCloseDeal } from '@/lib/api/deals.api';
import { Loading } from '@crm/ui';

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const { data: deal, isLoading, error } = useDeal(dealId);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const updateDeal = useUpdateDeal();
  const closeDeal = useCloseDeal();

  const handleUpdateDeal = async (data: any) => {
    await updateDeal.mutateAsync({ id: dealId, data });
  };

  const handleCloseDeal = async (status: 'WON' | 'LOST', lostReason?: string) => {
    await closeDeal.mutateAsync({
      id: dealId,
      status,
      lostReason: status === 'LOST' ? lostReason : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Loading deal details..." />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Deal Not Found</h2>
        <p className="text-gray-600 mb-4">
          The deal you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Button onClick={() => router.push('/deals')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pipeline
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON':
        return 'bg-green-100 text-green-800';
      case 'LOST':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStageColor = (stageName: string) => {
    const colorMap: Record<string, string> = {
      Lead: 'bg-gray-100 text-gray-700',
      Qualified: 'bg-blue-100 text-blue-700',
      Proposal: 'bg-yellow-100 text-yellow-700',
      Negotiation: 'bg-orange-100 text-orange-700',
      'Closed Won': 'bg-green-100 text-green-700',
      'Closed Lost': 'bg-red-100 text-red-700',
    };
    return colorMap[stageName] || 'bg-gray-100 text-gray-700';
  };

  const isOverdue =
    deal.expectedCloseDate &&
    new Date(deal.expectedCloseDate) < new Date() &&
    deal.status === 'OPEN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/deals')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{deal.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              {deal.company && <span>{deal.company.name}</span>}
              {deal.contact && (
                <span>
                  • {deal.contact.firstName} {deal.contact.lastName}
                </span>
              )}
              <Badge className={getStatusColor(deal.status)}>{deal.status}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {deal.status === 'OPEN' && (
            <>
              <Button variant="outline" onClick={() => setEditFormOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Deal
              </Button>
              <Button
                variant="default"
                onClick={() => handleCloseDeal('WON')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Won
              </Button>
              <Button variant="destructive" onClick={() => handleCloseDeal('LOST')}>
                <XCircle className="mr-2 h-4 w-4" />
                Mark Lost
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Deal Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deal Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(deal.value)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Probability</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deal.probability}%</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${deal.probability}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={`text-sm ${getStageColor(deal.stage?.name || '')}`}>
              {deal.stage?.name || 'No Stage'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Close</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isOverdue ? 'text-red-600' : ''}`}>
              {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : 'Not set'}
            </div>
            {isOverdue && <p className="text-xs text-red-500 mt-1">Overdue</p>}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities ({deal.activities?.length || 0})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({deal.notes?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Deal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deal.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{deal.description}</p>
                  </div>
                )}

                {deal.source && (
                  <div>
                    <h4 className="font-medium mb-2">Source</h4>
                    <p className="text-sm">{deal.source}</p>
                  </div>
                )}

                {deal.actualCloseDate && (
                  <div>
                    <h4 className="font-medium mb-2">Actual Close Date</h4>
                    <p className="text-sm">{formatDate(deal.actualCloseDate)}</p>
                  </div>
                )}

                {deal.lostReason && (
                  <div>
                    <h4 className="font-medium mb-2">Lost Reason</h4>
                    <p className="text-sm text-red-600">{deal.lostReason}</p>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Created</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(deal.createdAt)}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Last Updated</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(deal.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Associations */}
            <Card>
              <CardHeader>
                <CardTitle>Associated Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deal.company && (
                  <div>
                    <h4 className="font-medium mb-2">Company</h4>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-blue-600"
                      onClick={() => router.push(`/companies/${deal.company.id}`)}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      {deal.company.name}
                    </Button>
                  </div>
                )}

                {deal.contact && (
                  <div>
                    <h4 className="font-medium mb-2">Contact</h4>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-blue-600"
                      onClick={() => router.push(`/contacts/${deal.contact.id}`)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {deal.contact.firstName} {deal.contact.lastName}
                      {deal.contact.title && ` - ${deal.contact.title}`}
                    </Button>
                  </div>
                )}

                {deal.owner && (
                  <div>
                    <h4 className="font-medium mb-2">Deal Owner</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{deal.owner.name}</span>
                      <span className="text-muted-foreground">({deal.owner.email})</span>
                    </div>
                  </div>
                )}

                {deal.contact && (
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      {deal.contact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${deal.contact.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {deal.contact.email}
                          </a>
                        </div>
                      )}
                      {deal.contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{deal.contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Deal Activities</CardTitle>
              <CardDescription>Timeline of all activities for this deal</CardDescription>
            </CardHeader>
            <CardContent>
              {deal.activities && deal.activities.length > 0 ? (
                <div className="space-y-4">
                  {deal.activities.map((activity: any) => (
                    <div key={activity.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{activity.subject}</h4>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>{activity.createdBy?.name}</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatDateTime(activity.createdAt)}</span>
                          {activity.duration && <span>{activity.duration} min</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No activities recorded for this deal yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Deal Notes</CardTitle>
              <CardDescription>Internal notes and observations</CardDescription>
            </CardHeader>
            <CardContent>
              {deal.notes && deal.notes.length > 0 ? (
                <div className="space-y-4">
                  {deal.notes.map((note: any) => (
                    <div key={note.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{note.createdBy?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                          {note.isPinned && (
                            <Badge variant="outline" className="text-xs">
                              Pinned
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No notes for this deal yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Form */}
      <DealForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        deal={deal}
        onSubmit={handleUpdateDeal}
        loading={updateDeal.isPending}
      />
    </div>
  );
}
