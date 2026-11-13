import { Router } from 'express';
import { prisma } from '@crm/database';
import { createCompanySchema, updateCompanySchema } from '@crm/types';
import { AppError } from '../middleware/error.middleware';
import type { AuthRequest } from '../middleware/auth.middleware';
import { COMPANY_SORTS, parseListQuery } from './listQuery';

const router = Router();

// GET /api/companies - List all companies with pagination
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit, skip, orderBy } = parseListQuery(req.query, {
      allowed: COMPANY_SORTS,
      defaultKey: 'createdAt',
      defaultOrder: 'desc',
    });

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              contacts: true,
              deals: true,
            },
          },
        },
      }),
      prisma.company.count(),
    ]);

    res.json({
      data: companies,
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

// GET /api/companies/:id - Get single company
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        contacts: {
          orderBy: { createdAt: 'desc' },
        },
        deals: {
          include: {
            stage: true,
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        notes: {
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) {
      throw new AppError(404, 'Company not found');
    }

    res.json(company);
  } catch (error) {
    next(error);
  }
});

// POST /api/companies - Create company
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createCompanySchema.parse(req.body);

    const company = await prisma.company.create({
      data,
    });

    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/companies/:id - Update company
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = updateCompanySchema.parse(req.body);

    const company = await prisma.company.update({
      where: { id: req.params.id },
      data,
    });

    res.json(company);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/companies/:id - Delete company
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.company.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/companies/search - Search companies
router.get('/search/query', async (req: AuthRequest, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      throw new AppError(400, 'Search query required');
    }

    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { domain: { contains: q, mode: 'insensitive' } },
          { industry: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      include: {
        _count: {
          select: {
            contacts: true,
            deals: true,
          },
        },
      },
    });

    res.json(companies);
  } catch (error) {
    next(error);
  }
});

export default router;
