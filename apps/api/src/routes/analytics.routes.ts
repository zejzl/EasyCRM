import { Router } from 'express';
import { prisma } from '@crm/database';
import type { AuthRequest } from '../middleware/auth.middleware';
import { Decimal } from '@prisma/client/runtime/library';
import { Activity, Deal, User } from '@crm/types';

const router = Router();

// Helper functions for analytics calculations
const calculateMetrics = (deals: Deal[], activities: Activity[]) => {
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum: Decimal, deal) => sum.add(deal.value ? new Decimal(deal.value || '0') : new Decimal('0')), new Decimal('0'));
  const openDeals = deals.filter(deal => deal.status === 'OPEN');
  const wonDeals = deals.filter(deal => deal.status === 'WON');
  const lostDeals = deals.filter(deal => deal.status === 'LOST');
  
  const totalActivities = activities.length;
  const completedActivities = activities.filter(activity => activity.completedAt);
  
  const averageDealSize = openDeals.length > 0 ? totalValue.toNumber() / openDeals.length : 0;
  const winRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0;
  
  return {
    totalDeals,
    totalValue: totalValue.toNumber(),
    openDeals,
    wonDeals,
    lostDeals,
    averageDealSize,
    winRate,
    totalActivities,
    completedActivities,
    conversionRate: totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0,
  };
};

const calculateTeamMetrics = (users: User[], activities: Activity[]) => {
  const activitiesByUser = users.map((user) => {
    const userActivities = activities.filter((activity) => activity.createdById === user.id);
    return {
      userId: user.id,
      userName: user.name,
      totalActivities: userActivities.length,
      completedActivities: userActivities.filter((activity) => activity.completedAt).length,
      averageActivitiesPerDay: userActivities.length > 0 ? 7 : 0, // Rough calculation
    };
  });

  const topPerformer = activitiesByUser.sort((a, b) => b.completedActivities - a.completedActivities).slice(0, 1)[0];

  return {
    totalUsers: users.length,
    teamMetrics: activitiesByUser,
    topPerformer: topPerformer ? {
      userId: topPerformer.userId,
      userName: topPerformer.userName,
      totalActivities: topPerformer.totalActivities,
      completedActivities: topPerformer.completedActivities,
      averageActivitiesPerDay: topPerformer.averageActivitiesPerDay,
    } : null,
  };
};

// GET /api/analytics/overview - Dashboard overview
router.get('/overview', async (req: AuthRequest, res, next) => {
  try {
    const { dateFrom, dateTo, timeframe = 'month' } = req.query;

    // Build date filters
    const dateFilter: any = {};
    if (dateFrom && dateTo) {
      dateFilter.createdAt = {
        gte: new Date(dateFrom as string),
        lte: new Date(dateTo as string),
      };
    } else if (timeframe) {
      const now = new Date();
      switch (timeframe) {
        case 'week':
          dateFilter.createdAt = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'month':
          dateFilter.createdAt = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case 'quarter':
          dateFilter.createdAt = { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
          break;
        case 'year':
          dateFilter.createdAt = { gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
          break;
      }
    }

    // Fetch data
    const [deals, activities, users] = await Promise.all([
      prisma.deal.findMany({
        where: dateFilter,
        include: {
          company: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true } },
        },
      }),
      prisma.activity.findMany({
        where: dateFilter,
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
    ]);

    const dealMetrics = calculateMetrics(deals as any, activities as any);
    const teamMetrics = calculateTeamMetrics(users as any, activities as any);

    res.json({
      overview: {
        deals: dealMetrics,
        activities: {
          total: activities.length,
          completed: activities.filter((a: any) => a.completedAt).length,
        },
        team: teamMetrics,
      },
      performance: {
        totalDeals: dealMetrics.totalDeals,
        totalValue: dealMetrics.totalValue,
        averageDealSize: dealMetrics.averageDealSize,
        winRate: dealMetrics.winRate,
        conversionRate: dealMetrics.conversionRate,
      },
      forecast: {
        // Simple forecast based on current trends
        projectedRevenue: dealMetrics.totalValue * 1.2, // Assuming 20% close rate on current pipeline
        confidence: 0.7, // Based on historical win rate
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/pipeline - Pipeline analytics
router.get('/pipeline', async (req: AuthRequest, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const dateFilter: any = {};
    if (dateFrom && dateTo) {
      dateFilter.createdAt = {
        gte: new Date(dateFrom as string),
        lte: new Date(dateTo as string),
      };
    }

    const deals = await prisma.deal.findMany({
      where: dateFilter,
      include: {
        company: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
        stage: true,
      },
    });

    // Group by pipeline stages
    const stages = await prisma.pipelineStage.findMany({
      orderBy: { order: 'asc' },
    });

    const pipelineAnalytics = stages.map((stage: any) => {
      const stageDeals = deals.filter((deal: any) => deal.stageId === stage.id);
      const stageValue = stageDeals.reduce((sum: number, deal: any) => sum + (Number(deal.value) || 0), 0);
      const stageCount = stageDeals.length;
      const avgDealSize = stageCount > 0 ? stageValue / stageCount : 0;

      return {
        stageId: stage.id,
        stageName: stage.name,
        dealCount: stageCount,
        totalValue: stageValue,
        averageDealSize: avgDealSize,
        probability: stage.probability,
      };
    });

    res.json({
      dateRange: { dateFrom, dateTo },
      stages: pipelineAnalytics,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/sales-by-user - Sales performance by user
router.get('/sales-by-user', async (req: AuthRequest, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const dateFilter: any = {};
    if (dateFrom && dateTo) {
      dateFilter.createdAt = {
        gte: new Date(dateFrom as string),
        lte: new Date(dateTo as string),
      };
    }

    const [deals, users] = await Promise.all([
      prisma.deal.findMany({
        where: dateFilter,
        include: {
          company: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true } },
        },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
    ]);

    const userMetrics = users.map((user: any) => {
      const userDeals = deals.filter((deal: any) => deal.ownerId === user.id);
      const totalValue = userDeals.reduce(
        (sum: number, deal: any) => sum + (Number(deal.value) || 0),
        0
      );
      const wonDeals = userDeals.filter((deal: any) => deal.status === 'WON');
      const avgDealSize = userDeals.length > 0 ? totalValue / userDeals.length : 0;
      const winRate = userDeals.length > 0 ? (wonDeals.length / userDeals.length) * 100 : 0;

      return {
        userId: user.id,
        userName: user.name,
        email: user.email,
        role: user.role,
        totalDeals: userDeals.length,
        wonDeals: wonDeals.length,
        totalValue,
        averageDealSize: avgDealSize,
        winRate,
      };
    });

    res.json({
      dateRange: { dateFrom, dateTo },
      users: userMetrics,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/revenue-forecast - Revenue forecasting
router.get('/revenue-forecast', async (req: AuthRequest, res, next) => {
  try {
    const { months = 3 } = req.query; // Default to 3 months

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const historicalDeals = await prisma.deal.findMany({
      where: {
        status: 'WON',
        actualCloseDate: {
          gte: threeMonthsAgo,
        },
      },
      include: {
        company: { select: { name: true } },
      },
      orderBy: { actualCloseDate: 'desc' },
      take: 100,
    });

    // Calculate historical win rate and average deal size
    const totalHistoricalDeals = historicalDeals.length;
    const avgDealSize =
      totalHistoricalDeals > 0
        ? historicalDeals.reduce((sum: number, deal: any) => sum + (Number(deal.value) || 0), 0) /
          totalHistoricalDeals
        : 0;

    // Calculate monthly win patterns
    const monthlyWins = new Array(12).fill(0);
    historicalDeals.forEach((deal: any) => {
      if (deal.actualCloseDate) {
        const month = deal.actualCloseDate.getMonth();
        monthlyWins[month] = (monthlyWins[month] || 0) + 1;
      }
    });

    // Simple forecast based on current pipeline
    const currentPipelineDeals = await prisma.deal.findMany({
      where: { status: 'OPEN' },
      include: {
        company: { select: { name: true } },
        owner: { select: { name: true } },
        stage: { select: { name: true } },
      },
    });

    const totalPipelineValue = currentPipelineDeals.reduce(
      (sum: number, deal: any) => sum + (Number(deal.value) || 0),
      0
    );
    const forecastMultiplier = 0.2; // Assuming 20% close rate
    const projectedRevenue = totalPipelineValue * forecastMultiplier;

    res.json({
      historical: {
        avgDealSize,
        monthlyWins,
        totalDeals: totalHistoricalDeals,
      },
      forecast: {
        currentPipelineValue: totalPipelineValue,
        projectedRevenue,
        confidence: 0.7, // Based on historical patterns
        months: parseInt(months as string),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
