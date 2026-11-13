import { Router } from 'express';
import { prisma } from '@crm/database';
import {
  createDealSchema,
  updateDealSchema,
  moveDealStageSchema,
  closeDealSchema,
} from '@crm/types';
import { AppError } from '../middleware/error.middleware';
import type { AuthRequest } from '../middleware/auth.middleware';
import { parseListQuery } from './listQuery';

const router = Router();

// GET /api/deals - List deals
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, stageId, ownerId } = req.query;
    const { page, limit, skip } = parseListQuery(req.query);

    const where: any = {};
    if (status) where.status = status;
    if (stageId) where.stageId = stageId;
    if (ownerId) where.ownerId = ownerId;

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stage: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.deal.count({ where }),
    ]);

    res.json({
      data: deals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/deals/pipeline - Get pipeline view (deals grouped by stage)
router.get('/pipeline', async (req: AuthRequest, res, next) => {
  try {
    const stages = await prisma.pipelineStage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        deals: {
          where: { status: 'OPEN' },
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
            activities: {
              where: {
                completedAt: { not: null },
              },
              include: {
                createdBy: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json(stages);
  } catch (error) {
    next(error);
  }
});

// GET /api/deals/:id - Get single deal
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        contact: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        stage: true,
        activities: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!deal) {
      throw new AppError(404, 'Deal not found');
    }

    res.json(deal);
  } catch (error) {
    next(error);
  }
});

// POST /api/deals - Create deal
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createDealSchema.parse(req.body);

    const deal = await prisma.deal.create({
      data: {
        ...data,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        stage: true,
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(deal);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/deals/:id - Update deal
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = updateDealSchema.parse(req.body);

    const deal = await prisma.deal.update({
      where: { id: req.params.id },
      data: {
        ...data,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        stage: true,
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(deal);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/deals/:id/stage - Move deal to different stage
router.patch('/:id/stage', async (req: AuthRequest, res, next) => {
  try {
    const data = moveDealStageSchema.parse(req.body);

    // Verify stage exists
    const stage = await prisma.pipelineStage.findUnique({
      where: { id: data.stageId },
    });

    if (!stage) {
      throw new AppError(404, 'Stage not found');
    }

    const deal = await prisma.deal.update({
      where: { id: req.params.id },
      data: {
        stageId: data.stageId,
        probability: stage.probability, // Update probability based on stage
      },
      include: {
        stage: true,
      },
    });

    res.json(deal);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/deals/:id/close - Close deal (won/lost)
router.patch('/:id/close', async (req: AuthRequest, res, next) => {
  try {
    const data = closeDealSchema.parse(req.body);

    const deal = await prisma.deal.update({
      where: { id: req.params.id },
      data: {
        status: data.status,
        lostReason: data.lostReason,
        actualCloseDate: data.actualCloseDate ? new Date(data.actualCloseDate) : new Date(),
        probability: data.status === 'WON' ? 100 : 0,
      },
      include: {
        stage: true,
      },
    });

    res.json(deal);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/deals/:id - Delete deal
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.deal.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/deals/search/query?q=term - Search deals
router.get('/search/query', async (req: AuthRequest, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    const deals = await prisma.deal.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { company: { name: { contains: q, mode: 'insensitive' } } },
          {
            contact: {
              OR: [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        ],
      },
      take: 10,
      include: {
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
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        stage: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(deals);
  } catch (error) {
    next(error);
  }
});

export default router;
