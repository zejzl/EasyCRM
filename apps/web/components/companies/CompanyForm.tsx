'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCompanySchema, CreateCompanyInput, UpdateCompanyInput } from '@crm/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: any; // Company type from API
  onSubmit: (data: CreateCompanyInput | UpdateCompanyInput) => Promise<void>;
  loading?: boolean;
}

const companySizes = [
  { value: 'STARTUP', label: 'Startup (1-10 employees)' },
  { value: 'SMALL', label: 'Small (11-50 employees)' },
  { value: 'MEDIUM', label: 'Medium (51-200 employees)' },
  { value: 'LARGE', label: 'Large (201-1000 employees)' },
  { value: 'ENTERPRISE', label: 'Enterprise (1000+ employees)' },
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Consulting',
  'Real Estate',
  'Media',
  'Transportation',
  'Energy',
  'Agriculture',
  'Other',
];

export function CompanyForm({
  open,
  onOpenChange,
  company,
  onSubmit,
  loading = false,
}: CompanyFormProps) {
  const isEditing = !!company;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: company
      ? {
          name: company.name || '',
          domain: company.domain || '',
          industry: company.industry || '',
          size: company.size || undefined,
          revenue: company.revenue || undefined,
          description: company.description || '',
          website: company.website || '',
          linkedinUrl: company.linkedinUrl || '',
          phone: company.phone || '',
          address: company.address || '',
          city: company.city || '',
          state: company.state || '',
          country: company.country || '',
          postalCode: company.postalCode || '',
        }
      : {
          name: '',
          domain: '',
          industry: '',
          description: '',
          website: '',
          linkedinUrl: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
  });

  const watchedSize = watch('size');
  const watchedIndustry = watch('industry');

  const handleFormSubmit = async (data: CreateCompanyInput) => {
    try {
      await onSubmit(data);
      if (!isEditing) {
        reset();
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
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
          <DialogTitle>{isEditing ? 'Edit Company' : 'Create New Company'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the company information below.'
              : 'Fill in the details to create a new company record.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" {...register('name')} placeholder="Enter company name" />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input id="domain" {...register('domain')} placeholder="company.com" />
                {errors.domain && <p className="text-sm text-red-600">{errors.domain.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={watchedIndustry}
                  onValueChange={(value) => setValue('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Company Size</Label>
                <Select
                  value={watchedSize}
                  onValueChange={(value) => setValue('size', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of the company"
                rows={3}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...register('website')} placeholder="https://company.com" />
                {errors.website && <p className="text-sm text-red-600">{errors.website.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} placeholder="+1 (555) 123-4567" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                {...register('linkedinUrl')}
                placeholder="https://linkedin.com/company/company-name"
              />
              {errors.linkedinUrl && (
                <p className="text-sm text-red-600">{errors.linkedinUrl.message}</p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address</h3>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input id="address" {...register('address')} placeholder="123 Main Street" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} placeholder="City" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input id="state" {...register('state')} placeholder="State" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" {...register('postalCode')} placeholder="12345" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register('country')} placeholder="Country" />
            </div>
          </div>

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
                'Update Company'
              ) : (
                'Create Company'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
