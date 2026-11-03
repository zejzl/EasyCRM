// Which browser origins may call the API. This is the WEB app's address, not the API's own: the old code used
// NEXT_PUBLIC_API_URL (http://localhost:4000 in .env.example), so a browser on http://localhost:3000 was refused.
// WEB_ORIGIN may list several origins separated by commas.
export function corsOrigins(value: string | undefined = process.env.WEB_ORIGIN): string[] {
  const origins = (value || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return origins.length ? origins : ['http://localhost:3000'];
}
