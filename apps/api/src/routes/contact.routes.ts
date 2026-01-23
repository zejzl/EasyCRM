import { Router } from 'express';
import { prisma } from '@crm/database';
import { createContactSchema, updateContactSchema } from '@crm/types';
import { AppError } from '../middleware/error.middleware';
import type { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/contacts - List contacts
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 20, companyId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = companyId ? { companyId: String(companyId) } : {};

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          company: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({
      data: contacts,
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

// GET /api/contacts/:id - Get single contact
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        deals: {
          include: {
            stage: true,
          },
        },
        activities: {
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
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

    if (!contact) {
      throw new AppError(404, 'Contact not found');
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
});

// POST /api/contacts - Create contact
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createContactSchema.parse(req.body);

    const contact = await prisma.contact.create({
      data,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });

    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/contacts/:id - Update contact
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = updateContactSchema.parse(req.body);

    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });

    res.json(contact);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.contact.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
