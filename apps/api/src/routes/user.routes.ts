import { Router } from 'express';
import { prisma } from '@crm/database';
import { AppError } from '../middleware/error.middleware';
import { z } from 'zod';
import { authorize, type AuthRequest } from '../middleware/auth.middleware';
import { INVITE_ROLES, signInvite } from '../config/registration';
import { corsOrigins } from '../config/cors';

const router = Router();

// GET /api/users/me - Get current user
router.get('/me', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// GET /api/users - List users (for assignments, etc.)
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Administrator-only user management (F02, Zejzl's D3 decision 2026-11-03: invite-only, one organisation).
const inviteSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(INVITE_ROLES).default('SALES_REP'),
});

// POST /api/users/invites - create an invite link (nothing is stored; the link is signed and expires in 7 days)
router.post('/invites', authorize('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const data = inviteSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(409, 'A user with this email already exists');
    }
    const { token, expiresAt } = signInvite(data);
    const inviteUrl = `${corsOrigins()[0]}/register?invite=${encodeURIComponent(token)}`;
    res.status(201).json({ email: data.email, role: data.role, inviteUrl, expiresAt });
  } catch (error) {
    next(error);
  }
});

const updateUserSchema = z
  .object({
    role: z.enum(INVITE_ROLES).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => d.role !== undefined || d.isActive !== undefined, { message: 'Nothing to change' });

// PATCH /api/users/:id - change a user's role or deactivate them. An administrator cannot demote or deactivate
// themselves, so the organisation cannot lock itself out by accident.
router.patch('/:id', authorize('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const data = updateUserSchema.parse(req.body);
    if (req.params.id === req.user?.id && ((data.role && data.role !== 'ADMIN') || data.isActive === false)) {
      throw new AppError(400, 'You cannot demote or deactivate your own account');
    }
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) {
      throw new AppError(404, 'User not found');
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
