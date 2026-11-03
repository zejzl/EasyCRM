import { afterEach, describe, expect, it } from 'vitest';
import { registrationMode, signInvite, verifyInvite } from './registration';
import { parseArgs } from '../scripts/admin';

describe('registrationMode', () => {
  it.each([
    [undefined, 'closed'],
    ['', 'closed'],
    ['closed', 'closed'],
    ['open', 'open'],
    [' OPEN ', 'open'],
    ['opne', 'closed'],
    ['invite', 'closed'],
  ])('registrationMode(%j) = %s', (value, expected) => {
    expect(registrationMode(value)).toBe(expected);
  });
});

describe('invite tokens', () => {
  const saved = process.env.JWT_SECRET;
  afterEach(() => {
    process.env.JWT_SECRET = saved;
  });

  it('round-trips and refuses tokens signed with another key or another type', async () => {
    process.env.JWT_SECRET = 'unit-secret';
    const { token } = signInvite({ email: 'a@b.test', name: 'A', role: 'VIEWER' });
    expect(verifyInvite(token)).toEqual({ email: 'a@b.test', name: 'A', role: 'VIEWER' });
    process.env.JWT_SECRET = 'other-secret';
    expect(verifyInvite(token)).toBeNull();
    const jwt = (await import('jsonwebtoken')).default;
    const accessLike = jwt.sign(
      { id: 'u1', email: 'a@b.test', role: 'ADMIN' },
      'other-secret:invite'
    );
    expect(verifyInvite(accessLike)).toBeNull();
    const badRole = jwt.sign(
      { typ: 'invite', email: 'a@b.test', name: 'A', role: 'OWNER' },
      'other-secret:invite'
    );
    expect(verifyInvite(badRole)).toBeNull();
    const otherType = jwt.sign(
      { typ: 'refresh', email: 'a@b.test', name: 'A', role: 'VIEWER' },
      'other-secret:invite'
    );
    expect(verifyInvite(otherType)).toBeNull();
  });
});

describe('admin command arguments', () => {
  it('parses commands and flags', () => {
    expect(
      parseArgs(['invite', '--email', 'a@b.test', '--name', 'Ana Novak', '--promote'])
    ).toEqual({
      command: 'invite',
      flags: { email: 'a@b.test', name: 'Ana Novak', promote: true },
    });
  });
});
