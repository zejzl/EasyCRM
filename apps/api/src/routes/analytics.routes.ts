import { Router } from 'express';
import { prisma } from '@crm/database';
import type { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/analytics/overview - Dashboard overview
router.get('/overview', async (req: AuthRequest, res, next) => {
  try {
    const [
      totalDeals,
      openDeals,
      wonDeals,
      lostDeals,
      totalRevenue,
      forecastedRevenue,
      totalCompanies,
      totalContacts,
    ] = await Promise.all([
      prisma.deal.count(),
      prisma.deal.count({ where: { status: 'OPEN' } }),
      prisma.deal.count({ where: { status: 'WON' } }),
      prisma.deal.count({ where: { status: 'LOST' } }),
      prisma.deal.aggregate({
        where: { status: 'WON' },
        _sum: { value: true },
      }),
      prisma.deal.aggregate({
        where: { status: 'OPEN' },
        _sum: { value: true },
      }),
      prisma.company.count(),
      prisma.contact.count(),
    ]);

    res.json({
      deals: {
        total: totalDeals,
        open: openDeals,
        won: wonDeals,
        lost: lostDeals,
        winRate: totalDeals > 0 ? ((wonDeals / (wonDeals + lostDeals)) * 100).toFixed(1) : 0,
      },
      revenue: {
        total: totalRevenue._sum.value || 0,
        forecasted: forecastedRevenue._sum.value || 0,
      },
      entities: {
        companies: totalCompanies,
        contacts: totalContacts,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/pipeline - Pipeline metrics
router.get('/pipeline', async (req: AuthRequest, res, next) => {
  try {
    const stages = await prisma.pipelineStage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            deals: {
              where: { status: 'OPEN' },
            },
          },
        },
      },
    });

    const stageMetrics = await Promise.all(
      stages.map(async (stage) => {
        const deals = await prisma.deal.findMany({
          where: {
            stageId: stage.id,
            status: 'OPEN',
          },
          select: { value: true },
        });

        const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);
        const count = deals.length;

        return {
          stageId: stage.id,
          stageName: stage.name,
          count,
          totalValue,
          averageValue: count > 0 ? totalValue / count : 0,
          probability: stage.probability,
        };
      })
    );

    res.json(stageMetrics);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/sales-by-owner - Sales performance by user
router.get('/sales-by-owner', async (req: AuthRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const salesData = await Promise.all(
      users.map(async (user) => {
        const [openDeals, wonDeals, totalWonValue] = await Promise.all([
          prisma.deal.count({
            where: { ownerId: user.id, status: 'OPEN' },
          }),
          prisma.deal.count({
            where: { ownerId: user.id, status: 'WON' },
          }),
          prisma.deal.aggregate({
            where: { ownerId: user.id, status: 'WON' },
            _sum: { value: true },
          }),
        ]);

        return {
          userId: user.id,
          userName: user.name,
          email: user.email,
          openDeals,
          wonDeals,
          totalRevenue: totalWonValue._sum.value || 0,
        };
      })
    );

    res.json(salesData);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/activities - Activity metrics
router.get('/activities', async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const activities = await prisma.activity.groupBy({
      by: ['type'],
      where,
      _count: {
        id: true,
      },
    });

    const activityMetrics = activities.map((activity) => ({
      type: activity.type,
      count: activity._count.id,
    }));

    res.json(activityMetrics);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/revenue-forecast - Revenue forecast
router.get('/revenue-forecast', async (req: AuthRequest, res, next) => {
  try {
    const openDeals = await prisma.deal.findMany({
      where: { status: 'OPEN' },
      include: { stage: true },
    });

    const forecast = openDeals.reduce(
      (acc, deal) => {
        const weightedValue = (Number(deal.value) * deal.probability) / 100;
        return acc + weightedValue;
      },
      0
    );

    const byStage = await prisma.pipelineStage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        deals: {
          where: { status: 'OPEN' },
        },
      },
    });

    const stageForecasts = byStage.map((stage) => ({
      stageName: stage.name,
      totalValue: stage.deals.reduce((sum, deal) => sum + Number(deal.value), 0),
      weightedValue: stage.deals.reduce(
        (sum, deal) => sum + (Number(deal.value) * deal.probability) / 100,
        0
      ),
      dealCount: stage.deals.length,
    }));

    res.json({
      totalForecast: forecast,
      byStage: stageForecasts,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
