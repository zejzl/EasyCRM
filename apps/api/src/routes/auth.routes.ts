import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@crm/database';
import { loginSchema, registerSchema, type AuthResponse } from '@crm/types';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware';
import { registrationMode, verifyInvite, type InviteRole } from '../config/registration';

const router = Router();

// Helper to generate tokens
const generateTokens = (userId: string, email: string, role: string) => {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets not configured');
  }

  const accessToken = jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// GET /api/auth/registration: tells the web app whether to offer self sign-up.
router.get('/registration', (req, res) => {
  res.json({ mode: registrationMode() });
});

// GET /api/auth/invite?token=...: the email and name an invite is for, so the sign-up form can show them.
router.get('/invite', (req, res) => {
  const invite = typeof req.query.token === 'string' ? verifyInvite(req.query.token) : null;
  if (!invite) {
    res.status(400).json({ error: 'This invite link is invalid or has expired' });
    return;
  }
  res.json({ email: invite.email, name: invite.name });
});

const inviteRegisterSchema = z.object({
  invite: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).optional(),
});

// POST /api/auth/register
// With an invite token: creates the invited account (email and role come from the invite). Without one: only when
// REGISTRATION_MODE=open, as SALES_REP. Otherwise 403. (F02: the endpoint used to be open to anyone.)
router.post('/register', async (req, res, next) => {
  try {
    let email: string;
    let name: string;
    let password: string;
    let role: InviteRole = 'SALES_REP';

    if (typeof req.body?.invite === 'string') {
      const data = inviteRegisterSchema.parse(req.body);
      const invite = verifyInvite(data.invite);
      if (!invite) {
        throw new AppError(400, 'This invite link is invalid or has expired');
      }
      email = invite.email;
      name = data.name || invite.name;
      password = data.password;
      role = invite.role;
    } else if (registrationMode() === 'open') {
      const data = registerSchema.parse(req.body);
      email = data.email;
      name = data.name;
      password = data.password;
    } else {
      throw new AppError(403, 'Registration is invite-only. Ask an administrator for an invite.');
    }

    // Check if user exists (this also makes an invite single-use)
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new AppError(409, 'User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role
    );

    const response: AuthResponse = {
      user,
      accessToken,
      refreshToken,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role
    );

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(401, 'Refresh token required');
    }

    if (!process.env.JWT_REFRESH_SECRET || !process.env.JWT_SECRET) {
      throw new Error('JWT secrets not configured');
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    ) as { id: string };

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Invalid refresh token');
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.email, user.role);

    res.json(tokens);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid refresh token'));
    } else {
      next(error);
    }
  }
});

// POST /api/auth/logout (optional - client-side token removal is sufficient)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
