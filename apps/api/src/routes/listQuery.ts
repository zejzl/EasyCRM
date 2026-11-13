import { z } from 'zod';

// Bounded list queries (F11). The list routes used to pass `page`, `limit`, `sortBy` and `sortOrder` from the query string
// straight into Prisma: `limit=1000000` asked the database for a million rows, and `sortBy=nope` or `page=0` became a 500.
// Every value is now checked here; a bad one is a 400 through the ZodError branch of the error handler.

// The largest page any client may ask for. The web app's pickers (ContactForm, DealForm, the activities page) load up to
// 1000 companies, contacts or deals in one request, so the cap sits there; anything above is refused.
export const MAX_PAGE_SIZE = 1000;
export const DEFAULT_PAGE_SIZE = 20;

export type SortOrder = 'asc' | 'desc';
// Sort key the client sends -> the Prisma orderBy it means. Only keys listed here are accepted.
export type SortMap = Record<string, (order: SortOrder) => Record<string, unknown>>;

export interface ListQuery {
  page: number;
  limit: number;
  skip: number;
  orderBy?: Record<string, unknown>;
}

const pageSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export function parseListQuery(
  query: Record<string, unknown>,
  sort?: { allowed: SortMap; defaultKey: string; defaultOrder: SortOrder }
): ListQuery {
  const { page, limit } = pageSchema.parse({ page: query.page, limit: query.limit });
  const result: ListQuery = { page, limit, skip: (page - 1) * limit };
  if (sort) {
    const keys = Object.keys(sort.allowed) as [string, ...string[]];
    const { sortBy, sortOrder } = z
      .object({
        sortBy: z.enum(keys).default(sort.defaultKey),
        sortOrder: z.enum(['asc', 'desc']).default(sort.defaultOrder),
      })
      .parse({ sortBy: query.sortBy, sortOrder: query.sortOrder });
    result.orderBy = sort.allowed[sortBy](sortOrder);
  }
  return result;
}

const field =
  (name: string) =>
  (order: SortOrder): Record<string, unknown> => ({ [name]: order });

function fields(...names: string[]): SortMap {
  return Object.fromEntries(names.map((n) => [n, field(n)]));
}

export const COMPANY_SORTS: SortMap = fields(
  'name', 'domain', 'industry', 'size', 'revenue', 'city', 'country', 'createdAt', 'updatedAt'
);

export const CONTACT_SORTS: SortMap = {
  ...fields('firstName', 'lastName', 'email', 'phone', 'title', 'department', 'isPrimary', 'createdAt', 'updatedAt'),
  // The contacts table's "Company" column sorts by the company's name (a relation needs a nested orderBy).
  company: (order) => ({ company: { name: order } }),
};
