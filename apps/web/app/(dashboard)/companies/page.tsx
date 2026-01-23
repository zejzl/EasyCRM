'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCompanies, useDeleteCompany, CompaniesFilters } from '@/lib/api/companies.api';
import { DataTable, Column } from '@/components/shared/DataTable';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { useCreateCompany, useUpdateCompany } from '@/lib/api/companies.api';

export default function CompaniesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CompaniesFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<any>(null);

  const {
    data: companiesData,
    isLoading,
    error,
  } = useCompanies({
    ...filters,
    search: searchQuery || undefined,
  });

  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

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

  const handleCreateCompany = async (data: any) => {
    await createCompany.mutateAsync(data);
  };

  const handleUpdateCompany = async (data: any) => {
    if (editingCompany) {
      await updateCompany.mutateAsync({ id: editingCompany.id, data });
      setEditingCompany(null);
    }
  };

  const handleDeleteCompany = async () => {
    if (companyToDelete) {
      await deleteCompany.mutateAsync(companyToDelete.id);
      setCompanyToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const openCreateForm = () => {
    setEditingCompany(null);
    setFormOpen(true);
  };

  const openEditForm = (company: any) => {
    setEditingCompany(company);
    setFormOpen(true);
  };

  const openDeleteDialog = (company: any) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Company Name',
      sortable: true,
      render: (value, company) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {company.domain && <div className="text-sm text-gray-500">{company.domain}</div>}
        </div>
      ),
    },
    {
      key: 'industry',
      header: 'Industry',
      sortable: true,
      render: (value) => value || '-',
    },
    {
      key: 'size',
      header: 'Size',
      sortable: true,
      render: (value) => {
        const sizeLabels: Record<string, string> = {
          STARTUP: 'Startup',
          SMALL: 'Small',
          MEDIUM: 'Medium',
          LARGE: 'Large',
          ENTERPRISE: 'Enterprise',
        };
        return sizeLabels[value] || value || '-';
      },
    },
    {
      key: '_count.contacts',
      header: 'Contacts',
      render: (value) => value || 0,
    },
    {
      key: '_count.deals',
      header: 'Deals',
      render: (value) => value || 0,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, company) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/companies/${company.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditForm(company)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDeleteDialog(company)}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">Manage your company records and relationships.</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Companies Table */}
      <DataTable
        data={companiesData?.data || []}
        columns={columns}
        loading={isLoading}
        error={error?.message || null}
        pagination={companiesData?.pagination}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search companies..."
        emptyMessage="No companies found. Create your first company to get started."
      />

      {/* Create/Edit Form */}
      <CompanyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        company={editingCompany}
        onSubmit={editingCompany ? handleUpdateCompany : handleCreateCompany}
        loading={createCompany.isPending || updateCompany.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{companyToDelete?.name}&quot;? This action
              cannot be undone. All associated contacts and deals will also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCompany.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
