import { Router } from 'express';
import { prisma } from '@crm/database';
import { activitySchema, updateActivitySchema } from '@crm/types';
import { AppError } from '../middleware/error.middleware';
import type { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/activities - List activities
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 20, type, dealId, contactId, dateFrom, dateTo } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    
    if (type) where.type = type;
    if (dealId) where.dealId = dealId;
    if (contactId) where.contactId = contactId;
    
    // Date filtering
    if (dateFrom && dateTo) {
      where.createdAt = {
        gte: new Date(dateFrom as string),
        lte: new Date(dateTo as string),
      };
    } else if (dateFrom) {
      where.createdAt = {
        gte: new Date(dateFrom as string),
      };
    } else if (dateTo) {
      where.createdAt = {
        lte: new Date(dateTo as string),
      };
    }

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
            },
          },
          deal: {
            select: {
              id: true,
              name: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
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
    const data = activitySchema.parse(req.body);

    const activity = await prisma.activity.create({
      data: {
        ...data,
        createdById: req.user?.id,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        emailFrom: data.emailFrom || req.user?.email,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
        deal: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

// GET /api/activities/search/query?q=term - Search activities
router.get('/search/query', async (req: AuthRequest, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          { subject: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { type: { contains: q, mode: 'insensitive' } },
          { createdBy: { name: { contains: q, mode: 'insensitive' } } },
          { deal: { name: { contains: q, mode: 'insensitive' } } },
          { deal: { company: { name: { contains: q, mode: 'insensitive' } } } },
          { contact: { 
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          } },
        ],
      },
      take: 10,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(activities);
  } catch (error) {
    next(error);
  }
});

export default router;