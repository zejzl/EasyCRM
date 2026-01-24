'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  User,
  Building2,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContact } from '@/lib/api/contacts.api';
import { ContactForm } from '@/components/contacts/ContactForm';
import { useUpdateContact } from '@/lib/api/contacts.api';
import { Loading } from '@crm/ui';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const { data: contact, isLoading, error } = useContact(contactId);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const updateContact = useUpdateContact();

  const handleUpdateContact = async (data: any) => {
    await updateContact.mutateAsync({ id: contactId, data });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Loading contact details..." />
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Contact Not Found</h2>
        <p className="text-gray-600 mb-4">
          The contact you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Button onClick={() => router.push('/contacts')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contacts
        </Button>
      </div>
    );
  }

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
          <Button variant="ghost" size="sm" onClick={() => router.push('/contacts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              {contact.firstName} {contact.lastName}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              {contact.title && <span>{contact.title}</span>}
              {contact.title && contact.company && <span>•</span>}
              {contact.company && <span>{contact.company.name}</span>}
              {contact.isPrimary && (
                <Badge variant="default" className="text-xs">
                  Primary
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => setEditFormOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Contact
        </Button>
      </div>

      {/* Contact Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contact.department || 'Not specified'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {contact.company?.name || 'Not specified'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contact.deals?.filter((deal: any) => deal.status === 'OPEN').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contact.activities?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Deals ({contact.deals?.length || 0})</TabsTrigger>
          <TabsTrigger value="activities">
            Activities ({contact.activities?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notes">Notes ({contact.notes?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                )}

                {contact.mobile && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.mobile} (Mobile)</span>
                  </div>
                )}

                {contact.linkedinUrl && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Created</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(contact.createdAt)}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Last Updated</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(contact.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.company && (
                  <div>
                    <h4 className="font-medium mb-2">Company</h4>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-blue-600"
                      onClick={() => router.push(`/companies/${contact.company.id}`)}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      {contact.company.name}
                    </Button>
                  </div>
                )}

                {contact.title && (
                  <div>
                    <h4 className="font-medium mb-2">Title</h4>
                    <p className="text-sm">{contact.title}</p>
                  </div>
                )}

                {contact.department && (
                  <div>
                    <h4 className="font-medium mb-2">Department</h4>
                    <p className="text-sm">{contact.department}</p>
                  </div>
                )}

                {contact.isPrimary && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Primary Contact</Badge>
                    <span className="text-sm text-muted-foreground">
                      This contact is the primary point of contact for their company.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Deals</CardTitle>
              <CardDescription>Sales opportunities associated with this contact</CardDescription>
            </CardHeader>
            <CardContent>
              {contact.deals && contact.deals.length > 0 ? (
                <div className="space-y-4">
                  {contact.deals.map((deal: any) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{deal.name}</h4>
                          <Badge
                            variant={
                              deal.status === 'WON'
                                ? 'default'
                                : deal.status === 'LOST'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {deal.stage?.name || deal.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Value: {deal.value ? `$${deal.value.toLocaleString()}` : 'N/A'}
                          </span>
                          {deal.owner && <span>Owner: {deal.owner.name}</span>}
                          {deal.probability && <span>Probability: {deal.probability}%</span>}
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
                  No deals associated with this contact yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest interactions and updates for this contact</CardDescription>
            </CardHeader>
            <CardContent>
              {contact.activities && contact.activities.length > 0 ? (
                <div className="space-y-4">
                  {contact.activities.map((activity: any) => (
                    <div key={activity.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description || activity.subject}</p>
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
                  No recent activities for this contact.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Notes and observations about this contact</CardDescription>
            </CardHeader>
            <CardContent>
              {contact.notes && contact.notes.length > 0 ? (
                <div className="space-y-4">
                  {contact.notes.map((note: any) => (
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
                  No notes for this contact yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Form */}
      <ContactForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        contact={contact}
        onSubmit={handleUpdateContact}
        loading={updateContact.isPending}
      />
    </div>
  );
}
