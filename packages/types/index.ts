import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================
// COMPANY SCHEMAS
// ============================================

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
  revenue: z.number().optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

// ============================================
// CONTACT SCHEMAS
// ============================================

export const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  isPrimary: z.boolean().optional(),
  companyId: z.string(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
});

export const updateContactSchema = createContactSchema.partial().required({ companyId: true });

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

// ============================================
// DEAL SCHEMAS
// ============================================

export const createDealSchema = z.object({
  name: z.string().min(1, 'Deal name is required'),
  value: z.number().min(0, 'Value must be positive'),
  probability: z.number().min(0).max(100),
  expectedCloseDate: z.string().datetime().optional(),
  stageId: z.string(),
  companyId: z.string(),
  contactId: z.string().optional(),
  ownerId: z.string(),
  source: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
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

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type MoveDealStageInput = z.infer<typeof moveDealStageSchema>;
export type CloseDealInput = z.infer<typeof closeDealSchema>;

// ============================================
// ACTIVITY SCHEMAS
// ============================================

export const createActivitySchema = z.object({
  type: z.enum(['EMAIL', 'CALL', 'MEETING', 'TASK', 'NOTE', 'SMS']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  duration: z.number().optional(),
  scheduledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  emailFrom: z.string().optional(),
  emailTo: z.array(z.string()).optional(),
  emailCc: z.array(z.string()).optional(),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

// ============================================
// NOTE SCHEMAS
// ============================================

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  isPinned: z.boolean().optional(),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// ============================================
// ACTIVITY SCHEMAS
// ============================================

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
  metadata: z.record(z.any()).optional(),
});

export const updateActivitySchema = activitySchema.partial();

export type CreateActivityInput = z.infer<typeof activitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

export type CreateActivityInput = z.infer<typeof activitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

// ============================================
// USER SCHEMAS
// ============================================

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  role: z.enum(['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'VIEWER']).optional(),
  teamId: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================
// FILTER & PAGINATION
// ============================================

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DealsByStageMetrics {
  stageId: string;
  stageName: string;
  count: number;
  totalValue: number;
  averageValue: number;
}

export interface SalesFunnelMetrics {
  stages: Array<{
    name: string;
    count: number;
    value: number;
    conversionRate: number;
  }>;
}

export interface RevenueMetrics {
  period: string;
  totalRevenue: number;
  wonDeals: number;
  averageDealSize: number;
  forecastedRevenue: number;
}

export interface ActivityMetrics {
  userId: string;
  userName: string;
  totalActivities: number;
  byType: Record<string, number>;
}
