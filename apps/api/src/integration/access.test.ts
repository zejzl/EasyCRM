// Access policy against a real database (F02, Zejzl's D3 decision 2026-11-03). Needs TEST_DATABASE_URL pointing at a
// THROWAWAY Postgres: every table is emptied before each test. Skipped when it is not set.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

const DB = process.env.TEST_DATABASE_URL;
const suite = DB ? describe : describe.skip;

let base = '';
let server: Server;
let prisma: typeof import('@crm/database').prisma;
let bcrypt: typeof import('bcryptjs');
let admin: typeof import('../scripts/admin');
let registration: typeof import('../config/registration');

async function call(method: string, path: string, body?: unknown, token?: string) {
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

const PASSWORD = 'test-password-123';

async function user(email: string, role: 'ADMIN' | 'SALES_MANAGER' | 'SALES_REP' | 'VIEWER') {
  await prisma.user.create({
    data: { email, name: email.split('@')[0], password: await bcrypt.hash(PASSWORD, 4), role },
  });
  const login = await call('POST', '/auth/login', { email, password: PASSWORD });
  expect(login.status).toBe(200);
  return { id: login.body.user.id as string, token: login.body.accessToken as string };
}

suite('access policy (integration)', () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = DB;
    process.env.JWT_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.WEB_ORIGIN = 'http://crm.test';
    process.env.NODE_ENV = 'test';
    ({ prisma } = await import('@crm/database'));
    bcrypt = await import('bcryptjs');
    admin = await import('../scripts/admin');
    registration = await import('../config/registration');
    const app = (await import('../app')).default;
    server = app.listen(0);
    await new Promise((r) => server.once('listening', r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server?.close();
    await prisma?.$disconnect();
  });

  beforeEach(async () => {
    delete process.env.REGISTRATION_MODE;
    const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
      `select tablename from pg_tables where schemaname = 'public' and tablename <> '_prisma_migrations'`
    );
    if (tables.length) {
      await prisma.$executeRawUnsafe(
        `truncate ${tables.map((t) => `"${t.tablename}"`).join(', ')} cascade`
      );
    }
  });

  describe('registration', () => {
    it('is closed by default: self sign-up is refused and nothing is created', async () => {
      expect((await call('GET', '/auth/registration')).body).toEqual({ mode: 'closed' });
      const res = await call('POST', '/auth/register', {
        email: 'x@crm.test',
        name: 'X',
        password: PASSWORD,
      });
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/invite-only/);
      expect(await prisma.user.count()).toBe(0);
    });

    it('REGISTRATION_MODE=open restores public sign-up as SALES_REP', async () => {
      process.env.REGISTRATION_MODE = 'open';
      const res = await call('POST', '/auth/register', {
        email: 'x@crm.test',
        name: 'X',
        password: PASSWORD,
      });
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('SALES_REP');
    });

    it('an invite creates exactly the invited account, once', async () => {
      const a = await user('admin@crm.test', 'ADMIN');
      const inv = await call(
        'POST',
        '/users/invites',
        { email: 'ana@crm.test', name: 'Ana', role: 'SALES_MANAGER' },
        a.token
      );
      expect(inv.status).toBe(201);
      expect(inv.body.inviteUrl).toMatch(/^http:\/\/crm\.test\/register\?invite=/);
      const token = decodeURIComponent(inv.body.inviteUrl.split('invite=')[1]);
      expect((await call('GET', `/auth/invite?token=${encodeURIComponent(token)}`)).body).toEqual({
        email: 'ana@crm.test',
        name: 'Ana',
      });

      const reg = await call('POST', '/auth/register', {
        invite: token,
        password: PASSWORD,
        email: 'attacker@crm.test',
      });
      expect(reg.status).toBe(201);
      expect([reg.body.user.email, reg.body.user.role]).toEqual(['ana@crm.test', 'SALES_MANAGER']);
      expect(await prisma.user.count({ where: { email: 'attacker@crm.test' } })).toBe(0);
      expect(
        (await call('POST', '/auth/register', { invite: token, password: PASSWORD })).status
      ).toBe(409);
    });

    it('rejects forged, expired and swapped tokens', async () => {
      const a = await user('admin@crm.test', 'ADMIN');
      const { token } = registration.signInvite({
        email: 'eve@crm.test',
        name: 'Eve',
        role: 'ADMIN',
      });
      const forged = token.slice(0, -3) + (token.endsWith('aaa') ? 'bbb' : 'aaa');
      const expired = registration.signInvite(
        { email: 'eve@crm.test', name: 'Eve', role: 'ADMIN' },
        -10
      ).token;
      for (const bad of [forged, expired, a.token]) {
        expect(
          (await call('POST', '/auth/register', { invite: bad, password: PASSWORD })).status
        ).toBe(400);
      }
      expect((await call('GET', '/companies', undefined, token)).status).toBe(401); // an invite is not an access token
      expect(await prisma.user.count({ where: { email: 'eve@crm.test' } })).toBe(0);
    });

    it('only an administrator may create invites', async () => {
      const m = await user('manager@crm.test', 'SALES_MANAGER');
      expect(
        (await call('POST', '/users/invites', { email: 'n@crm.test', name: 'N' }, m.token)).status
      ).toBe(403);
      const a = await user('admin@crm.test', 'ADMIN');
      expect(
        (await call('POST', '/users/invites', { email: 'manager@crm.test', name: 'M' }, a.token))
          .status
      ).toBe(409);
    });
  });

  describe('roles on records', () => {
    it('VIEWER can read but not write', async () => {
      const v = await user('viewer@crm.test', 'VIEWER');
      expect((await call('GET', '/companies', undefined, v.token)).status).toBe(200);
      expect((await call('POST', '/companies', { name: 'Nope d.o.o.' }, v.token)).status).toBe(403);
      expect(await prisma.company.count()).toBe(0);
    });

    it('only ADMIN may delete; others can create and edit', async () => {
      const rep = await user('rep@crm.test', 'SALES_REP');
      const mgr = await user('manager@crm.test', 'SALES_MANAGER');
      const a = await user('admin@crm.test', 'ADMIN');
      const created = await call('POST', '/companies', { name: 'Kmetija Novak' }, rep.token);
      expect(created.status).toBe(201);
      const id = created.body.id;
      expect(
        (await call('PATCH', `/companies/${id}`, { name: 'Kmetija Novak d.o.o.' }, rep.token))
          .status
      ).toBe(200);
      for (const t of [rep.token, mgr.token]) {
        expect((await call('DELETE', `/companies/${id}`, undefined, t)).status).toBe(403);
      }
      expect(await prisma.company.count()).toBe(1);
      expect((await call('DELETE', `/companies/${id}`, undefined, a.token)).status).toBe(204);
      expect(await prisma.company.count()).toBe(0);
    });
  });

  describe('user management', () => {
    it('an administrator changes roles and deactivates users; a deactivated user is locked out at once', async () => {
      const a = await user('admin@crm.test', 'ADMIN');
      const rep = await user('rep@crm.test', 'SALES_REP');
      const promoted = await call('PATCH', `/users/${rep.id}`, { role: 'SALES_MANAGER' }, a.token);
      expect([promoted.status, promoted.body.role]).toEqual([200, 'SALES_MANAGER']);
      expect((await call('PATCH', `/users/${rep.id}`, { isActive: false }, a.token)).status).toBe(
        200
      );
      expect((await call('GET', '/companies', undefined, rep.token)).status).toBe(401);
      expect(
        (await call('POST', '/auth/login', { email: 'rep@crm.test', password: PASSWORD })).status
      ).toBe(401);
    });

    it('non-admins cannot manage users, and an admin cannot lock themselves out', async () => {
      const a = await user('admin@crm.test', 'ADMIN');
      const rep = await user('rep@crm.test', 'SALES_REP');
      expect((await call('PATCH', `/users/${rep.id}`, { role: 'ADMIN' }, rep.token)).status).toBe(
        403
      );
      expect((await call('PATCH', `/users/${a.id}`, { role: 'VIEWER' }, a.token)).status).toBe(400);
      expect((await call('PATCH', `/users/${a.id}`, { isActive: false }, a.token)).status).toBe(
        400
      );
      expect((await prisma.user.findUnique({ where: { id: a.id } }))?.role).toBe('ADMIN');
    });
  });

  describe('command line', () => {
    it('creates the first administrator, refuses a duplicate, promotes on request, prints invites', async () => {
      process.env.ADMIN_PASSWORD = PASSWORD;
      try {
        expect(
          await admin.run(['create-admin', '--email', 'boss@crm.test', '--name', 'Boss'])
        ).toMatch(/created/);
        expect(
          (await call('POST', '/auth/login', { email: 'boss@crm.test', password: PASSWORD })).body
            .user.role
        ).toBe('ADMIN');
        await expect(
          admin.run(['create-admin', '--email', 'boss@crm.test', '--name', 'Boss'])
        ).rejects.toThrow(/--promote/);
        await user('rep@crm.test', 'SALES_REP');
        expect(await admin.run(['create-admin', '--email', 'rep@crm.test', '--promote'])).toMatch(
          /now an administrator/
        );
        expect((await prisma.user.findUnique({ where: { email: 'rep@crm.test' } }))?.role).toBe(
          'ADMIN'
        );
        const out = await admin.run([
          'invite',
          '--email',
          'new@crm.test',
          '--name',
          'New',
          '--role',
          'viewer',
        ]);
        const token = decodeURIComponent(out.split('invite=')[1]);
        expect(registration.verifyInvite(token)).toEqual({
          email: 'new@crm.test',
          name: 'New',
          role: 'VIEWER',
        });
        await expect(
          admin.run(['invite', '--email', 'new@crm.test', '--name', 'N', '--role', 'OWNER'])
        ).rejects.toThrow(/--role/);
      } finally {
        delete process.env.ADMIN_PASSWORD;
      }
    });
  });
});
