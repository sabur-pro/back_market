import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // месяц назад
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const totalProducts = await this.prisma.product.count();

    const activeOrders = await this.prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'PROCESSING'],
        },
      },
    });

    const totalUsers = await this.prisma.user.count();

    const completedOrders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: oneMonthAgo,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Расчёт выручки и прибыли
    let totalRevenue = 0;
    let totalProfit = 0;

    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const revenue = item.price * item.quantity;
        const cost = item.product?.costPrice ?? 0 * item.quantity;
        const profit = revenue - cost;

        totalRevenue += revenue;
        totalProfit += profit;
      });
    });

    return {
      totalProducts,
      activeOrders,
      totalUsers,
      revenue: {
        total: totalRevenue,
        profit: totalProfit,
        period: 'last_month',
      },
      completedOrdersCount: completedOrders.length,
    };
  }

  async getRevenueByPeriod(period: 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const completedOrders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalCost = 0;

    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const revenue = item.price * item.quantity;
        const cost = item.product?.costPrice ?? 0 * item.quantity;
        const profit = revenue - cost;

        totalRevenue += revenue;
        totalCost += cost;
        totalProfit += profit;
      });
    });

    return {
      period,
      startDate,
      endDate: now,
      ordersCount: completedOrders.length,
      revenue: totalRevenue,
      cost: totalCost,
      profit: totalProfit,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    };
  }
}

