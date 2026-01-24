'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDealSchema, CreateDealInput, UpdateDealInput } from '@crm/types';
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
import { useCompanies } from '@/lib/api/companies.api';
import { useContacts } from '@/lib/api/contacts.api';
import { usePipeline } from '@/lib/api/deals.api';
import { useCurrentUser } from '@/lib/api/auth.api';

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: any; // Deal type from API
  onSubmit: (data: CreateDealInput | UpdateDealInput) => Promise<void>;
  loading?: boolean;
}

const dealSources = [
  'Website',
  'Referral',
  'Cold Call',
  'Email Campaign',
  'Social Media',
  'Conference',
  'Partner',
  'Other',
];

export function DealForm({ open, onOpenChange, deal, onSubmit, loading = false }: DealFormProps) {
  const isEditing = !!deal;

  // Fetch data for dropdowns
  const { data: companiesData } = useCompanies({ limit: 1000 });
  const { data: contactsData } = useContacts({ limit: 1000 });
  const { data: pipelineData } = usePipeline();
  const { data: currentUser } = useCurrentUser();

  const companies = companiesData?.data || [];
  const contacts = contactsData?.data || [];
  const pipelineStages = pipelineData || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDealInput>({
    resolver: zodResolver(createDealSchema),
    defaultValues: deal
      ? {
          name: deal.name || '',
          value: deal.value || 0,
          probability: deal.probability || 50,
          expectedCloseDate: deal.expectedCloseDate
            ? new Date(deal.expectedCloseDate).toISOString().slice(0, 16)
            : '',
          stageId: deal.stage?.id || deal.stageId || '',
          companyId: deal.company?.id || deal.companyId || '',
          contactId: deal.contact?.id || deal.contactId || '',
          ownerId: deal.owner?.id || deal.ownerId || currentUser?.id || '',
          source: deal.source || '',
          description: deal.description || '',
        }
      : {
          name: '',
          value: 0,
          probability: 50,
          expectedCloseDate: '',
          stageId: '',
          companyId: '',
          contactId: '',
          ownerId: currentUser?.id || '',
          source: '',
          description: '',
        },
  });

  const watchedCompanyId = watch('companyId');
  const watchedStageId = watch('stageId');

  // Filter contacts by selected company
  const filteredContacts = watchedCompanyId
    ? contacts.filter((contact: any) => contact.companyId === watchedCompanyId)
    : contacts;

  const handleFormSubmit = async (data: CreateDealInput) => {
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
          <DialogTitle>{isEditing ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update deal information and stage.'
              : 'Fill in details to create a new sales opportunity.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Deal Name *</Label>
              <Input id="name" {...register('name')} placeholder="Enter deal name" />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Deal Value ($) *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  {...register('value', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.value && <p className="text-sm text-red-600">{errors.value.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  {...register('probability', { valueAsNumber: true })}
                  placeholder="50"
                />
                {errors.probability && (
                  <p className="text-sm text-red-600">{errors.probability.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the deal and opportunity details..."
                rows={3}
              />
            </div>
          </div>

          {/* Associations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Associations</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyId">Company *</Label>
                <Select
                  value={watchedCompanyId}
                  onValueChange={(value) => {
                    setValue('companyId', value);
                    setValue('contactId', ''); // Reset contact when company changes
                  }}
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

              <div className="space-y-2">
                <Label htmlFor="contactId">Contact</Label>
                <Select
                  value={watch('contactId')}
                  onValueChange={(value) => setValue('contactId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredContacts.map((contact: any) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName}
                        {contact.title && ` - ${contact.title}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contactId && (
                  <p className="text-sm text-red-600">{errors.contactId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stageId">Pipeline Stage *</Label>
                <Select
                  value={watchedStageId}
                  onValueChange={(value) => {
                    setValue('stageId', value);
                    // Auto-set probability based on stage
                    const stage = pipelineStages.find((s: any) => s.id === value);
                    if (stage) {
                      setValue('probability', stage.probability);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelineStages.map((stage: any) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name} ({stage.probability}% prob)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.stageId && <p className="text-sm text-red-600">{errors.stageId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select
                  value={watch('source')}
                  onValueChange={(value) => setValue('source', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Timing</h3>

            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
              <Input
                id="expectedCloseDate"
                type="datetime-local"
                {...register('expectedCloseDate')}
              />
              {errors.expectedCloseDate && (
                <p className="text-sm text-red-600">{errors.expectedCloseDate.message}</p>
              )}
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
                'Update Deal'
              ) : (
                'Create Deal'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
