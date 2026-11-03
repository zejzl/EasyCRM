// One place for the API address. The Express API mounts every router under /api (apps/api/src/index.ts), so the
// client's base URL ends in /api and the call sites use paths like '/companies' and '/auth/login'.
// NEXT_PUBLIC_API_URL is the server origin (e.g. http://localhost:4000); a value that already ends in /api also works.
export function apiBase(origin: string | undefined = process.env.NEXT_PUBLIC_API_URL): string {
  const trimmed = (origin || 'http://localhost:4000').replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export const API_BASE = apiBase();

// Requests to these paths must never trigger a token refresh: a 401 from /auth/login means wrong credentials, and a
// 401 from /auth/refresh means the refresh token is no longer valid.
export function isAuthEndpoint(url: string | undefined): boolean {
  return !!url && /(^|\/)auth\/(login|register|refresh)(\?|$)/.test(url);
}
