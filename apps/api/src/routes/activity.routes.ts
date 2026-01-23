import { Router } from 'express';
import { prisma } from '@crm/database';
import { createActivitySchema, updateActivitySchema } from '@crm/types';
import { AppError } from '../middleware/error.middleware';
import type { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/activities - List activities
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 50, type, companyId, contactId, dealId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (type) where.type = type;
    if (companyId) where.companyId = companyId;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          deal: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activity.count({ where }),
    ]);

    res.json({
      data: activities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/activities/:id - Get single activity
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: true,
        contact: true,
        deal: true,
      },
    });

    if (!activity) {
      throw new AppError(404, 'Activity not found');
    }

    res.json(activity);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities - Create activity
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createActivitySchema.parse(req.body);

    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const activity = await prisma.activity.create({
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:id - Update activity
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = updateActivitySchema.parse(req.body);

    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(activity);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/activities/:id - Delete activity
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.activity.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
