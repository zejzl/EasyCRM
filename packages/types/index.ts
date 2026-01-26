import { z } from 'zod';

// ============================================
// CORE ENTITIES
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  teamId?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  size?: string;
  revenue?: number;
  website?: string;
  linkedinUrl?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  logoUrl?: string;
  phone?: string;
  ownerId?: string;
  createdById: string;
  updatedById: string;
  deals?: Deal[];
  contacts?: Contact[];
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  isPrimary: boolean;
  companyId?: string;
  dealId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface Deal {
  id: string;
  name: string;
  value: number;
  probability: number;
  status: 'OPEN' | 'WON' | 'LOST';
  expectedCloseDate?: string;
  actualCloseDate?: string;
  source?: string;
  description?: string;
  notes?: string;
  companyId?: string;
  contactId?: string;
  ownerId?: string;
  stageId?: string;
  stage?: {
    id: string;
    name: string;
    probability: number;
    order: number;
    isActive: boolean;
    color: string;
  };
  activities?: Activity[];
}

export interface Activity {
  id: string;
  type: 'EMAIL' | 'CALL' | 'MEETING' | 'TASK' | 'NOTE' | 'SMS';
  subject: string;
  description?: string;
  duration?: number;
  scheduledAt?: string;
  completedAt?: string;
  emailFrom?: string;
  emailTo?: string[];
  emailCc?: string[];
  emailSubject?: string;
  emailBody?: string;
  emailThreadId?: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  metadata?: Record<string, any>;
  createdById: string;
  isCompleted?: boolean;
  isPinned?: boolean;
}

// ============================================
// ANALYTICS & METRICS
// ============================================

export interface AnalyticsOverview {
  deals: {
    totalDeals: number;
    totalValue: number;
    openDeals: number;
    wonDeals: number;
    averageDealSize: number;
    winRate: number;
    lostDeals?: number;
    conversionRate?: number;
  };
  activities: {
    totalActivities: number;
    completedActivities: number;
  };
  team: TeamMetrics;
  performance: Performance;
  forecast: Forecast;
}

export interface Performance {
  totalDeals: number;
  totalValue: number;
  winRate: number;
  averageDealSize: number;
  conversionRate: number;
}

export interface PipelineStage {
  stageId: string;
  stageName: string;
  dealCount: number;
  totalValue: number;
  averageDealSize: number;
  probability: number;
}

export interface TeamMetrics {
  totalUsers: number;
  teamMetrics: Array<{
    userId: string;
    userName: string;
    email?: string;
    role?: string;
    totalActivities: number;
    completedActivities: number;
    averageActivitiesPerDay: number;
  }>;
  topPerformer?: {
    userId: string;
    userName: string;
    totalActivities: number;
    completedActivities: number;
    averageActivitiesPerDay: number;
  } | null;
}

export interface Forecast {
  projectedRevenue: number;
  confidence: number;
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
  revenue: z.number().optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  isPrimary: z.boolean().default(false),
  companyId: z.string(),
});

export const updateContactSchema = createContactSchema.partial();

export const createDealSchema = z.object({
  name: z.string().min(1, 'Deal name is required'),
  value: z.number().min(0, 'Deal value must be positive'),
  probability: z.number().min(0).max(100),
  status: z.enum(['OPEN', 'WON', 'LOST']),
  expectedCloseDate: z.string().datetime().optional(),
  source: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  companyId: z.string(),
  contactId: z.string().optional(),
  ownerId: z.string().optional(),
  stageId: z.string(),
});

export const updateDealSchema = createDealSchema.partial();

export const moveDealStageSchema = z.object({
  stageId: z.string(),
});

export const closeDealSchema = z.object({
  status: z.enum(['WON', 'LOST']),
  lostReason: z.string().optional(),
  actualCloseDate: z.string().datetime().optional(),
});

export const activitySchema = z.object({
  type: z.enum(['EMAIL', 'CALL', 'MEETING', 'TASK', 'NOTE', 'SMS']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  duration: z.number().optional(),
  scheduledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  emailFrom: z.string().email().optional(),
  emailTo: z.array(z.string()).optional(),
  emailCc: z.array(z.string()).optional(),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
  emailThreadId: z.string().optional(),
  dealId: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const createActivitySchema = activitySchema;
export const updateActivitySchema = activitySchema.partial();

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  isPinned: z.boolean().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  companyId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'VIEWER']),
  teamId: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial();

// ============================================
// TYPE INFERENCE
// ============================================

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
