import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { COMPANY_SORTS, CONTACT_SORTS, MAX_PAGE_SIZE, parseListQuery } from './listQuery';

const companySort = { allowed: COMPANY_SORTS, defaultKey: 'createdAt', defaultOrder: 'desc' as const };

describe('parseListQuery (F11)', () => {
  it('uses the defaults when nothing is given', () => {
    expect(parseListQuery({}, companySort)).toEqual({ page: 1, limit: 20, skip: 0, orderBy: { createdAt: 'desc' } });
  });

  it('reads page, limit and an allowed sort from query strings', () => {
    expect(parseListQuery({ page: '3', limit: '50', sortBy: 'name', sortOrder: 'asc' }, companySort)).toEqual({
      page: 3,
      limit: 50,
      skip: 100,
      orderBy: { name: 'asc' },
    });
  });

  it('accepts the largest page the web pickers ask for', () => {
    expect(parseListQuery({ limit: String(MAX_PAGE_SIZE) }).limit).toBe(1000);
  });

  it.each([
    ['limit above the cap', { limit: '100000' }],
    ['limit zero', { limit: '0' }],
    ['limit not a number', { limit: 'all' }],
    ['fractional limit', { limit: '2.5' }],
    ['page zero', { page: '0' }],
    ['negative page', { page: '-1' }],
    ['repeated limit', { limit: ['10', '20'] }],
  ])('refuses %s', (_name, query) => {
    expect(() => parseListQuery(query)).toThrow(ZodError);
  });

  it.each([['__proto__'], ['constructor'], ['password'], ['nope'], ['name; drop table']])(
    'refuses sortBy=%s',
    (sortBy) => {
      expect(() => parseListQuery({ sortBy }, companySort)).toThrow(ZodError);
    }
  );

  it('refuses a sort order other than asc or desc', () => {
    expect(() => parseListQuery({ sortBy: 'name', sortOrder: 'sideways' }, companySort)).toThrow(ZodError);
  });

  it("sorts contacts by the company's name, which the old code sent to Prisma as an invalid orderBy", () => {
    const q = parseListQuery(
      { sortBy: 'company', sortOrder: 'asc' },
      { allowed: CONTACT_SORTS, defaultKey: 'createdAt', defaultOrder: 'desc' }
    );
    expect(q.orderBy).toEqual({ company: { name: 'asc' } });
  });

  it('ignores sortBy on routes without a sort map', () => {
    expect(parseListQuery({ sortBy: '__proto__' })).toEqual({ page: 1, limit: 20, skip: 0 });
  });
});
