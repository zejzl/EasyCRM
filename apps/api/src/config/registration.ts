import jwt from 'jsonwebtoken';

// Who may create an account (F02, Zejzl's D3 decision 2026-11-03: single organisation, invite-only).
//   closed (default): no self sign-up; an administrator sends invite links (POST /api/users/invites or `npm run invite`).
//   open: anyone may register as SALES_REP (the old behaviour; for local demos only).
// Any other value counts as closed, so a typo never opens sign-up.
export type RegistrationMode = 'closed' | 'open';

export function registrationMode(
  value: string | undefined = process.env.REGISTRATION_MODE
): RegistrationMode {
  return (value || '').trim().toLowerCase() === 'open' ? 'open' : 'closed';
}

export const INVITE_ROLES = ['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'VIEWER'] as const;
export type InviteRole = (typeof INVITE_ROLES)[number];

export interface Invite {
  email: string;
  name: string;
  role: InviteRole;
}

export const INVITE_TTL_SECONDS = 7 * 24 * 60 * 60;

// Invites are signed with a key derived from JWT_SECRET and carry their own type, so an invite can never pass as an
// access token and an access token can never pass as an invite. An invite is single-use in effect: once the account
// exists, registering with the same email fails.
function inviteSecret(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return `${process.env.JWT_SECRET}:invite`;
}

export function signInvite(
  invite: Invite,
  ttlSeconds: number = INVITE_TTL_SECONDS
): { token: string; expiresAt: string } {
  const token = jwt.sign(
    { typ: 'invite', email: invite.email, name: invite.name, role: invite.role },
    inviteSecret(),
    {
      expiresIn: ttlSeconds,
    }
  );
  return { token, expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString() };
}

export function verifyInvite(token: string): Invite | null {
  try {
    const p = jwt.verify(token, inviteSecret()) as Record<string, unknown>;
    if (p.typ !== 'invite' || typeof p.email !== 'string' || typeof p.name !== 'string')
      return null;
    if (!INVITE_ROLES.includes(p.role as InviteRole)) return null;
    return { email: p.email, name: p.name, role: p.role as InviteRole };
  } catch {
    return null;
  }
}
