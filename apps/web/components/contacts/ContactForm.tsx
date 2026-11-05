'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContactSchema, CreateContactInput, UpdateContactInput } from '@crm/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useCompanies } from '@/lib/api/companies.api';

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: any; // Contact type from API
  onSubmit: (data: CreateContactInput | UpdateContactInput) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const departments = [
  'Executive',
  'Sales',
  'Marketing',
  'Engineering',
  'Product',
  'Design',
  'Customer Success',
  'Support',
  'HR',
  'Finance',
  'Operations',
  'Legal',
  'Other',
];

const titles = [
  'CEO',
  'CTO',
  'CFO',
  'CMO',
  'COO',
  'President',
  'Vice President',
  'Director',
  'Manager',
  'Senior Manager',
  'Team Lead',
  'Senior',
  'Junior',
  'Specialist',
  'Analyst',
  'Coordinator',
  'Assistant',
  'Other',
];

const contactValues = (contact?: any) =>
  contact
    ? {
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        title: contact.title || '',
        department: contact.department || '',
        linkedinUrl: contact.linkedinUrl || '',
        avatarUrl: contact.avatarUrl || '',
        isPrimary: contact.isPrimary || false,
        companyId: contact.company?.id || contact.companyId || '',
      }
    : {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        mobile: '',
        title: '',
        department: '',
        linkedinUrl: '',
        avatarUrl: '',
        isPrimary: false,
        companyId: '',
      };

export function ContactForm({
  open,
  onOpenChange,
  contact,
  onSubmit,
  loading = false,
  error = null,
}: ContactFormProps) {
  const isEditing = !!contact;

  // Fetch companies for the dropdown
  const { data: companiesData } = useCompanies({ limit: 1000 });
  const companies = companiesData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema),
    defaultValues: contactValues(contact),
  });

  // Forms stay mounted between records; react-hook-form reads defaults only once.
  useEffect(() => {
    if (open) reset(contactValues(contact));
  }, [open, contact, reset]);

  const watchedCompanyId = watch('companyId');
  const watchedTitle = watch('title');
  const watchedDepartment = watch('department');
  const watchedIsPrimary = watch('isPrimary');

  const handleFormSubmit = async (data: CreateContactInput) => {
    try {
      await onSubmit(data);
      if (!isEditing) {
        reset();
      }
      onOpenChange(false);
    } catch {
      // The parent displays mutation errors; keep the form and its input open.
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Contact' : 'Create New Contact'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update contact information below.'
              : 'Fill in details to create a new contact record.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...register('firstName')} placeholder="Enter first name" />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...register('lastName')} placeholder="Enter last name" />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contact@company.com"
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyId">Company *</Label>
                <Select
                  value={watchedCompanyId}
                  onValueChange={(value) => setValue('companyId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company: any) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companyId && (
                  <p className="text-sm text-red-600">{errors.companyId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Select value={watchedTitle} onValueChange={(value) => setValue('title', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    {titles.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={watchedDepartment}
                  onValueChange={(value) => setValue('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} placeholder="+1 (555) 123-4567" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" {...register('mobile')} placeholder="+1 (555) 987-6543" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                {...register('linkedinUrl')}
                placeholder="https://linkedin.com/in/contact-name"
              />
              {errors.linkedinUrl && (
                <p className="text-sm text-red-600">{errors.linkedinUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                {...register('avatarUrl')}
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.avatarUrl && (
                <p className="text-sm text-red-600">{errors.avatarUrl.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isPrimary"
                type="checkbox"
                checked={watchedIsPrimary}
                onChange={(e) => setValue('isPrimary', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="isPrimary">Primary Contact</Label>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditing ? (
                'Update Contact'
              ) : (
                'Create Contact'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
