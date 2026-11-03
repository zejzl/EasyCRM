// Auth journey regressions (Hermes, 2026-11-03; findings F08-F10 in the project review). No server: a fake axios adapter
// stands in for the API, so these run offline in node.
import axios, { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiBase, isAuthEndpoint } from './base';
import apiClient from './client';
import { useAuthStore } from '../store/auth.store';
import { safeNextPath } from '../auth/nextPath';

type Handler = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown };

function reply(config: InternalAxiosRequestConfig, status: number, data: unknown = {}): Promise<AxiosResponse> {
  const response = { data, status, statusText: String(status), headers: {}, config } as AxiosResponse;
  if (status >= 400) {
    return Promise.reject(new axios.AxiosError(`status ${status}`, String(status), config, null, response));
  }
  return Promise.resolve(response);
}

let calls: { url: string; auth?: string }[] = [];

function serve(handler: Handler) {
  const adapter: AxiosAdapter = (config) => {
    calls.push({ url: `${config.baseURL ?? ''}${config.url}`, auth: config.headers?.Authorization as string | undefined });
    const { status, data } = handler(config);
    return reply(config, status, data);
  };
  apiClient.defaults.adapter = adapter;
}

function withTimeout<T>(p: Promise<T>, ms = 1000): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('HUNG: promise never settled')), ms))]);
}

beforeEach(() => {
  calls = [];
  useAuthStore.setState({ user: null, accessToken: 'old-access', refreshToken: 'refresh-1', isAuthenticated: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('API base URL (F09)', () => {
  it.each([
    [undefined, 'http://localhost:4000/api'],
    ['http://localhost:4000', 'http://localhost:4000/api'],
    ['https://crm.example.net/', 'https://crm.example.net/api'],
    ['https://crm.example.net/api', 'https://crm.example.net/api'],
    ['https://crm.example.net/api/', 'https://crm.example.net/api'],
  ])('apiBase(%s) = %s', (origin, expected) => {
    expect(apiBase(origin)).toBe(expected);
  });

  it('list calls reach the routes the API mounts under /api', async () => {
    serve(() => ({ status: 200, data: { data: [] } }));
    await apiClient.get('/companies');
    await apiClient.get('/contacts');
    await apiClient.get('/deals/pipeline');
    expect(calls.map((c) => c.url)).toEqual([
      'http://localhost:4000/api/companies',
      'http://localhost:4000/api/contacts',
      'http://localhost:4000/api/deals/pipeline',
    ]);
    expect(calls[0].auth).toBe('Bearer old-access');
  });

  it('every call site in the web app uses a path without the /api prefix', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const { join } = await import('node:path');
    const dir = join(__dirname);
    const offenders = readdirSync(dir)
      .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && f !== 'base.ts')
      .flatMap((f) => readFileSync(join(dir, f), 'utf8').split('\n').filter((l) => /apiClient\.\w+\(\s*[`'"]\/api\//.test(l)));
    const store = readFileSync(join(dir, '..', 'store', 'auth.store.ts'), 'utf8');
    expect(offenders).toEqual([]);
    expect(store).not.toMatch(/apiClient\.\w+\(\s*[`'"]\/api\//);
  });
});

describe('token refresh (F10)', () => {
  it('a 401 refreshes once and retries with the new token', async () => {
    const refresh = vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'new-access', refreshToken: 'refresh-2' } });
    serve((c) => ((c.headers?.Authorization as string) === 'Bearer new-access' ? { status: 200, data: { ok: true } } : { status: 401 }));
    const res = await withTimeout(apiClient.get('/companies'));
    expect(res.data).toEqual({ ok: true });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh.mock.calls[0][0]).toBe('http://localhost:4000/api/auth/refresh');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-2');
  });

  it('concurrent 401s share one refresh and all succeed', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const refresh = vi.spyOn(axios, 'post').mockImplementation(async () => {
      await gate;
      return { data: { accessToken: 'new-access', refreshToken: 'refresh-2' } };
    });
    serve((c) => ((c.headers?.Authorization as string) === 'Bearer new-access' ? { status: 200, data: c.url } : { status: 401 }));
    const all = Promise.all([apiClient.get('/companies'), apiClient.get('/contacts'), apiClient.get('/deals')]);
    await new Promise((r) => setTimeout(r, 20));
    release();
    const results = await withTimeout(all);
    expect(results.map((r) => r.data)).toEqual(['/companies', '/contacts', '/deals']);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('a rejected refresh fails the request and logs out instead of hanging', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new axios.AxiosError('status 401', '401'));
    serve(() => ({ status: 401 }));
    await expect(withTimeout(apiClient.get('/companies'))).rejects.not.toThrow(/HUNG/);
    const s = useAuthStore.getState();
    expect([s.accessToken, s.refreshToken, s.isAuthenticated]).toEqual([null, null, false]);
  });

  it('the refresh request itself never goes through apiClient', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'a', refreshToken: 'b' } });
    serve(() => ({ status: 200 }));
    await useAuthStore.getState().refreshAccessToken();
    expect(calls).toEqual([]);
  });
});

describe('login errors reach the form', () => {
  it('a wrong password is a 401 the caller sees; no refresh, no logout', async () => {
    const refresh = vi.spyOn(axios, 'post');
    useAuthStore.setState({ accessToken: null, refreshToken: null, isAuthenticated: false });
    serve((c) => (c.url === '/auth/login' ? { status: 401, data: { error: 'Invalid credentials' } } : { status: 500 }));
    const err = await withTimeout(useAuthStore.getState().login({ email: 'a@b.c', password: 'wrong-pass' })).catch((e) => e);
    expect(err.response?.status).toBe(401);
    expect(err.response?.data).toEqual({ error: 'Invalid credentials' });
    expect(refresh).not.toHaveBeenCalled();
    expect(calls.map((c) => c.url)).toEqual(['http://localhost:4000/api/auth/login']);
  });

  it('a successful login stores the tokens', async () => {
    useAuthStore.setState({ accessToken: null, refreshToken: null, isAuthenticated: false });
    serve(() => ({ status: 200, data: { user: { id: 'u1' }, accessToken: 'acc', refreshToken: 'ref' } }));
    await useAuthStore.getState().login({ email: 'a@b.c', password: 'right-pass' });
    const s = useAuthStore.getState();
    expect([s.accessToken, s.refreshToken, s.isAuthenticated]).toEqual(['acc', 'ref', true]);
  });

  it.each([
    ['/auth/login', true],
    ['/auth/refresh', true],
    ['/auth/register', true],
    ['/auth/logout', false],
    ['/companies', false],
    ['/companies/auth/login-report', false],
  ])('isAuthEndpoint(%s) = %s', (url, expected) => {
    expect(isAuthEndpoint(url)).toBe(expected);
  });
});

describe('redirect after login (F08)', () => {
  it.each([
    [null, '/'],
    ['/companies', '/companies'],
    ['/companies?page=2', '/companies?page=2'],
    ['//evil.example', '/'],
    ['https://evil.example', '/'],
    ['/\\evil.example', '/'],
    ['/login', '/'],
    ['/register?x=1', '/'],
    ['/loginhistory', '/loginhistory'],
  ])('safeNextPath(%s) = %s', (from, expected) => {
    expect(safeNextPath(from)).toBe(expected);
  });

  it('the store reports that it has rehydrated, so the guards stop showing the spinner', () => {
    expect(useAuthStore.getState().hasHydrated).toBe(true);
  });

  it('no middleware gates on a cookie that nothing sets', async () => {
    const { existsSync, readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const web = join(__dirname, '..', '..');
    expect(existsSync(join(web, 'middleware.ts'))).toBe(false);
    expect(readFileSync(join(web, 'app', '(dashboard)', 'layout.tsx'), 'utf8')).toMatch(/<RequireAuth>/);
    expect(readFileSync(join(web, 'app', '(auth)', 'layout.tsx'), 'utf8')).toMatch(/<RedirectIfAuthenticated>/);
  });
});
