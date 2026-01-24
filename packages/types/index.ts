// Types for EasyCRM System

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
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

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  size?: string;
  revenue?: number;
  website?: string;
  description?: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  logoUrl?: string;
  phone?: string;
  ownerId?: string;
  createdById: string;
  updatedById: string;
  deals: Deal[];
  contacts: Contact[];
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
  description: string;
  notes: string;
  companyId?: string;
  contactId?: string;
  ownerId: string;
  stageId?: string;
  stage: {
    id: string;
    name: string;
    probability: number;
    order: number;
    isActive: boolean;
    color: string;
  };
  activities: Activity[];
}

export interface Activity {
  id: string;
  type: 'EMAIL' | 'CALL' | 'MEETING' | 'TASK' | 'NOTE' | 'SMS';
  subject: string;
  description: string;
  duration?: number;
  scheduledAt?: string;
  completedAt?: string;
  emailFrom: string;
  emailTo?: string[];
  emailCc?: string[];
  emailSubject?: string;
  emailBody?: string;
  emailThreadId?: string;
  dealId?: string;
  contactId?: string;
  companyId?: string;
  metadata?: Record<string, any>;
  createdById: string;
  isCompleted?: boolean;
  isPinned: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  teamId?: string;
}

export interface AnalyticsOverview {
  deals: {
    totalDeals: number;
    totalValue: number;
    openDeals: number;
    wonDeals: number;
    averageDealSize: number;
    winRate: number;
  };
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

export interface AnalyticsOverview {
  deals: AnalyticsOverview;
  activities: {
    totalActivities: number;
    completedActivities: number;
  };
  team: TeamMetrics;
  performance: Performance;
  forecast: Forecast;
  };
}

export interface TeamMetrics {
  totalUsers: number;
  teamMetrics: Array<{
    userId: string;
    userName: string;
    totalActivities: number;
    completedActivities: number;
    averageActivitiesPerDay: number;
    totalUsers: number;
  teamMetrics: Array<{
    userId: string;
    userName: string;
    email: string;
    role: string;
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
    } : null;
  };
  });
}

// Activity schemas
export const createActivitySchema = z.object({
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

export const updateActivitySchema = activitySchema.partial();

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
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

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  size?: string;
  revenue?: number;
  website?: string;
  description?: string;
  address?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  logoUrl?: string;
  phone?: string;
  ownerId?: string;
  createdById: string;
  updatedById: string;
  deals: Deal[];
  contacts: Contact[];
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
  description: string;
  notes: string;
  companyId?: string;
  contactId?: string;
  ownerId?: string;
  stageId?: string;
  stage: {
    id: string;
    name: string;
    probability: number;
    order: number;
    isActive: boolean;
    color: string;
  };
  activities: Activity[];
}

export interface Activity {
  id: string;
  type: 'EMAIL' | 'CALL' | ' 'MEETING' | 'TASK' | 'NOTE' | 'SMS';
  subject: string;
  description: string;
  duration?: number;
  scheduledAt?: string;
  completedAt?: string;
  emailFrom?: string;
  emailTo?: string[];
  emailCc?: string[];
  emailSubject?: string;
  emailBody?: string;
  emailThreadId?: string;
  dealId?: string;
  contactId?: string;
  companyId?: string;
  metadata?: Record<string, any>;
  createdById: string;
  companyId?: string;
  contactId?: string;
  userId?: string;
  dealId?: string;
  isCompleted?: boolean;
  isPinned: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  teamId?: string;
}

// Zod schemas
export const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
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
  ownerId: z.string(),
  stageId: z.string(),
});

export const moveDealStageSchema = z.object({
  stageId: z.string(),
});

export const closeDealSchema = z.object({
  status: z.enum(['WON', 'LOST']),
  lostReason: z.string().optional(),
  actualCloseDate: z.string().datetime().optional(),
});

export const createActivitySchema = z.object({
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

export const updateActivitySchema = activitySchema.partial();

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'SALES_REP', 'MANAGER', 'SALES_REP']),
  teamId: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial();

// Note schemas
export const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  isPinned: z.boolean().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  companyId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// Activity schemas
export const activitySchema = z.object({
  type: z.enum(['EMAIL', 'fresh', 'CALL', 'MEETING', 'TASK', 'NOTE', 'SMS']),
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

export const updateActivitySchema = activitySchema.partial();

export type CreateActivityInput = z.infer<typeof activitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
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

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  size?: string;
  revenue?: number;
  website?: string;
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
  deals: Deal[];
  contacts: Contact[];
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
  stage: {
    id: string;
    name: string;
    probability: number;
    order: number;
    isActive: boolean;
    color: string;
  };
  activities: Activity[];
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
  companyId?: string;
  contactId?: string;
  userId?: string;
  dealId?: string;
  isCompleted?: boolean;
  isPinned: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  teamId?: string;
}

// Zod schemas
export const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
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
  ownerId: z.string(),
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

// Activity schemas
export const createActivitySchema = z.object({
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

export const updateActivitySchema = activitySchema.partial();

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

// Note schemas
export const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  isPinned: z.boolean().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  companyId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'SALES_REP', 'MANAGER', 'SALES_REP']),
  teamId: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial();
