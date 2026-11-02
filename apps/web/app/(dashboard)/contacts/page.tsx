'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useContacts, useDeleteContact, ContactsFilters } from '@/lib/api/contacts.api';
import { DataTable, Column } from '@/components/shared/DataTable';
import { ContactForm } from '@/components/contacts/ContactForm';
import { useCreateContact, useUpdateContact } from '@/lib/api/contacts.api';

export default function ContactsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ContactsFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<any>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: contactsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useContacts({
    ...filters,
    search: searchQuery || undefined,
  });

  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreateContact = async (data: any) => {
    await createContact.mutateAsync(data);
  };

  const handleUpdateContact = async (data: any) => {
    if (editingContact) {
      await updateContact.mutateAsync({ id: editingContact.id, data });
      setEditingContact(null);
    }
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete || deleteContact.isPending) return;
    setDeleteError(null);
    try {
      await deleteContact.mutateAsync(contactToDelete.id);
      if (contactsData?.data.length === 1 && (filters.page || 1) > 1) {
        setFilters((previous) => ({ ...previous, page: (previous.page || 1) - 1 }));
      }
      setContactToDelete(null);
      setDeleteDialogOpen(false);
    } catch {
      setDeleteError('Could not confirm deletion. Please try again.');
    }
  };

  const openCreateForm = () => {
    createContact.reset();
    setEditingContact(null);
    setFormOpen(true);
  };

  const openEditForm = (contact: any) => {
    updateContact.reset();
    setEditingContact(contact);
    setFormOpen(true);
  };

  const openDeleteDialog = (contact: any) => {
    setDeleteError(null);
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const columns: Column<any>[] = [
    {
      key: 'firstName',
      header: 'Name',
      sortable: true,
      render: (value, contact) => (
        <div>
          <button
            className="text-left font-medium text-blue-700 hover:underline focus-visible:outline-2"
            onClick={() => router.push(`/contacts/${contact.id}`)}
          >
            {contact.firstName} {contact.lastName}
          </button>
          {contact.email && <div className="text-sm text-gray-500">{contact.email}</div>}
          {contact.title && <div className="text-xs text-gray-400">{contact.title}</div>}
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      render: (value) => value?.name || '-',
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (value) => value || '-',
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (value, contact) => {
        const phone = contact.phone || contact.mobile;
        return phone || '-';
      },
    },
    {
      key: '_count.deals',
      header: 'Deals',
      render: (value) => value || 0,
    },
    {
      key: 'isPrimary',
      header: 'Primary',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, contact) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`View ${contact.firstName} ${contact.lastName}`}
            onClick={() => router.push(`/contacts/${contact.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${contact.firstName} ${contact.lastName}`}
            onClick={() => openEditForm(contact)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Delete ${contact.firstName} ${contact.lastName}`}
            onClick={() => openDeleteDialog(contact)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your contact relationships and communications.
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Contacts Table */}
      <DataTable
        data={contactsData?.data || []}
        columns={columns}
        loading={isLoading || isFetching}
        error={error?.message || null}
        pagination={contactsData?.pagination}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        searchValue={searchQuery}
        searchPlaceholder="Search contacts..."
        emptyMessage="No contacts yet"
        onRetry={() => {
          void refetch();
        }}
        onCreate={openCreateForm}
        createLabel="Add Contact"
      />

      {/* Create/Edit Form */}
      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editingContact}
        onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
        loading={createContact.isPending || updateContact.isPending}
        error={
          (editingContact ? updateContact.isError : createContact.isError)
            ? 'Unable to save. Please check the details and try again.'
            : null
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleteContact.isPending) setDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{contactToDelete?.firstName}{' '}
              {contactToDelete?.lastName}&quot;? This action cannot be undone. All associated
              activities and notes will also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p role="alert" className="text-sm text-red-600">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteContact.isPending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteContact.isPending}
              onClick={handleDeleteContact}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteContact.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
