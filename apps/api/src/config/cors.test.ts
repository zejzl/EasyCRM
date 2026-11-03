import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { corsOrigins } from './cors';

describe('corsOrigins', () => {
  it.each([
    [undefined, ['http://localhost:3000']],
    ['', ['http://localhost:3000']],
    ['https://crm.example.net/', ['https://crm.example.net']],
    ['https://a.example, https://b.example', ['https://a.example', 'https://b.example']],
    [' , ', ['http://localhost:3000']],
  ])('corsOrigins(%j) = %j', (value, expected) => {
    expect(corsOrigins(value)).toEqual(expected);
  });

  it('the server uses WEB_ORIGIN, not the API URL, for CORS', () => {
    const index = readFileSync(join(__dirname, '..', 'app.ts'), 'utf8');
    expect(index).toMatch(/origin: corsOrigins\(\)/);
    expect(index).not.toMatch(/origin: process\.env\.NEXT_PUBLIC_API_URL/);
  });
});
