// Command line for the first administrator and for invite links (no API call, no web UI needed).
//
//   npm run admin --workspace apps/api -- create-admin --email you@example.com --name "Your Name"
//       Creates an ADMIN (password read from the ADMIN_PASSWORD environment variable, or typed on stdin).
//       With --promote, an existing user with that email becomes ADMIN instead.
//   npm run admin --workspace apps/api -- invite --email ana@example.com --name "Ana" [--role SALES_REP]
//       Prints an invite link valid for 7 days. Roles: ADMIN, SALES_MANAGER, SALES_REP, VIEWER.
//
// Needs DATABASE_URL and JWT_SECRET, like the API.
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline';
import { prisma } from '@crm/database';
import { INVITE_ROLES, signInvite, type InviteRole } from '../config/registration';
import { corsOrigins } from '../config/cors';

config();

export function parseArgs(argv: string[]): {
  command?: string;
  flags: Record<string, string | true>;
} {
  const [command, ...rest] = argv;
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (!arg.startsWith('--')) continue;
    const next = rest[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      flags[arg.slice(2)] = next;
      i++;
    } else {
      flags[arg.slice(2)] = true;
    }
  }
  return { command, flags };
}

async function readPassword(): Promise<string> {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  const answer = await new Promise<string>((resolve) =>
    rl.question('Password (at least 8 characters): ', resolve)
  );
  rl.close();
  return answer.trim();
}

function text(flags: Record<string, string | true>, name: string): string {
  const value = flags[name];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`--${name} is required`);
  }
  return value.trim();
}

export async function run(argv: string[]): Promise<string> {
  const { command, flags } = parseArgs(argv);
  if (command === 'create-admin') {
    const email = text(flags, 'email');
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (flags.promote !== true)
        throw new Error(`${email} already exists; add --promote to make it an administrator`);
      await prisma.user.update({ where: { email }, data: { role: 'ADMIN', isActive: true } });
      return `[OK] ${email} is now an administrator`;
    }
    const name = text(flags, 'name');
    const password = await readPassword();
    if (password.length < 8) throw new Error('The password must be at least 8 characters');
    await prisma.user.create({
      data: { email, name, password: await bcrypt.hash(password, 10), role: 'ADMIN' },
    });
    return `[OK] administrator ${email} created`;
  }
  if (command === 'invite') {
    const email = text(flags, 'email');
    const name = text(flags, 'name');
    const role = (
      typeof flags.role === 'string' ? flags.role.toUpperCase() : 'SALES_REP'
    ) as InviteRole;
    if (!INVITE_ROLES.includes(role))
      throw new Error(`--role must be one of ${INVITE_ROLES.join(', ')}`);
    if (await prisma.user.findUnique({ where: { email } }))
      throw new Error(`${email} already has an account`);
    const { token, expiresAt } = signInvite({ email, name, role });
    return `[OK] invite for ${email} (${role}), valid until ${expiresAt}:\n${corsOrigins()[0]}/register?invite=${encodeURIComponent(token)}`;
  }
  throw new Error(
    'Usage: admin create-admin --email E --name N [--promote] | admin invite --email E --name N [--role R]'
  );
}

if (require.main === module) {
  run(process.argv.slice(2))
    .then((out) => console.log(out))
    .catch((err: Error) => {
      console.error(`[ERROR] ${err.message}`);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
