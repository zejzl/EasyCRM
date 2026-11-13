import { Router } from 'express';
import { prisma } from '@crm/database';
import { createContactSchema, updateContactSchema } from '@crm/types';
import { AppError } from '../middleware/error.middleware';
import type { AuthRequest } from '../middleware/auth.middleware';
import { CONTACT_SORTS, parseListQuery } from './listQuery';

const router = Router();

// GET /api/contacts - List contacts
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { companyId, search } = req.query;
    const { page, limit, skip, orderBy } = parseListQuery(req.query, {
      allowed: CONTACT_SORTS,
      defaultKey: 'createdAt',
      defaultOrder: 'desc',
    });

    // Build where clause
    const where: any = {};

    if (companyId) {
      where.companyId = String(companyId);
    }

    if (search) {
      where.OR = [
        { firstName: { contains: String(search), mode: 'insensitive' } },
        { lastName: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { title: { contains: String(search), mode: 'insensitive' } },
        { company: { name: { contains: String(search), mode: 'insensitive' } } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
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
        },
        orderBy,
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({
      data: contacts,
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

// GET /api/contacts/search/query?q=term - Search contacts
router.get('/search/query', async (req: AuthRequest, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          { company: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      take: 10,
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
    });

    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

export default router;
