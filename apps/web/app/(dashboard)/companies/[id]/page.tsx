'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Building2,
  Users,
  Briefcase,
  MapPin,
  Globe,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompany } from '@/lib/api/companies.api';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { useUpdateCompany } from '@/lib/api/companies.api';
import { Loading } from '@crm/ui';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const { data: company, isLoading, error } = useCompany(companyId);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const updateCompany = useUpdateCompany();

  const handleUpdateCompany = async (data: any) => {
    await updateCompany.mutateAsync({ id: companyId, data });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Loading company details..." />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Company Not Found</h2>
        <p className="text-gray-600 mb-4">
          The company you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Button onClick={() => router.push('/companies')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/companies')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              {company.name}
            </h1>
            {company.domain && <p className="text-muted-foreground">{company.domain}</p>}
          </div>
        </div>
        <Button onClick={() => setEditFormOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Company
        </Button>
      </div>

      {/* Company Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.industry || 'Not specified'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {company.size
                ? company.size.charAt(0) + company.size.slice(1).toLowerCase()
                : 'Not specified'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.contacts?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {company.deals?.filter(
                (deal: any) => deal.stage !== 'CLOSED_WON' && deal.stage !== 'CLOSED_LOST'
              ).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({company.contacts?.length || 0})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({company.deals?.length || 0})</TabsTrigger>
          <TabsTrigger value="activities">
            Activities ({company.activities?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{company.description}</p>
                  </div>
                )}

                {company.revenue && (
                  <div>
                    <h4 className="font-medium mb-2">Annual Revenue</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(company.revenue)}
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Created</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(company.createdAt)}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Last Updated</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(company.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{company.phone}</span>
                  </div>
                )}

                {company.linkedinUrl && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={company.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}

                {(company.address || company.city || company.state || company.country) && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        {company.address && <div>{company.address}</div>}
                        {(company.city || company.state) && (
                          <div>{[company.city, company.state].filter(Boolean).join(', ')}</div>
                        )}
                        {company.country && <div>{company.country}</div>}
                        {company.postalCode && <div>{company.postalCode}</div>}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>People associated with this company</CardDescription>
            </CardHeader>
            <CardContent>
              {company.contacts && company.contacts.length > 0 ? (
                <div className="space-y-4">
                  {company.contacts.map((contact: any) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {contact.firstName?.[0]}
                            {contact.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{contact.title}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/contacts/${contact.id}`)}
                      >
                        View Contact
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No contacts associated with this company yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Deals</CardTitle>
              <CardDescription>Sales opportunities associated with this company</CardDescription>
            </CardHeader>
            <CardContent>
              {company.deals && company.deals.length > 0 ? (
                <div className="space-y-4">
                  {company.deals.map((deal: any) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{deal.title}</h4>
                          <Badge
                            variant={
                              deal.stage === 'CLOSED_WON'
                                ? 'default'
                                : deal.stage === 'CLOSED_LOST'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {deal.stage?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Value: {deal.value ? formatCurrency(deal.value) : 'N/A'}</span>
                          {deal.owner && <span>Owner: {deal.owner.name}</span>}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/deals/${deal.id}`)}
                      >
                        View Deal
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No deals associated with this company yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest interactions and updates for this company</CardDescription>
            </CardHeader>
            <CardContent>
              {company.activities && company.activities.length > 0 ? (
                <div className="space-y-4">
                  {company.activities.map((activity: any) => (
                    <div key={activity.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{activity.createdBy?.name}</span>
                          <span>•</span>
                          <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent activities for this company.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Form */}
      <CompanyForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        company={company}
        onSubmit={handleUpdateCompany}
        loading={updateCompany.isPending}
      />
    </div>
  );
}
