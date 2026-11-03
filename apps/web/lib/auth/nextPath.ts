// Where to go after a login: the "from" query parameter if it is a local path, else the dashboard. Anything that is not
// a plain local path ("//evil.example", "https://...", "/\\evil", the auth pages themselves) falls back to "/".
export function safeNextPath(from: string | null | undefined): string {
  if (!from || !from.startsWith('/') || from.startsWith('//') || from.startsWith('/\\')) return '/';
  if (/^\/(login|register)(\/|\?|$)/.test(from)) return '/';
  return from;
}
