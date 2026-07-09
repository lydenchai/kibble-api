import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';

export class AnalyticsController {
  static async getDashboardMetrics(req: Request, res: Response) {
    try {
      // 1. Revenue over time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const revenueByDay = await Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // 2. Top selling products
      const topProducts = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: "$product" },
        {
          $project: {
            name: "$product.name",
            totalSold: 1,
            revenue: 1
          }
        }
      ]);

      // 3. Order count by status
      const ordersByStatus = await Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      // 4. Low stock products (e.g. stock < 10)
      const lowStockProducts = await Product.aggregate([
        { $unwind: "$variants" },
        { $match: { "variants.stock": { $lt: 10 } } },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            variants: { $push: { sku: "$variants.sku", stock: "$variants.stock" } }
          }
        },
        { $limit: 10 }
      ]);

      // Total metrics for cards
      const totalRevenueResult = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]);
      const totalRevenue = totalRevenueResult[0]?.total || 0;
      const activeOrdersCount = await Order.countDocuments({ status: { $in: ['pending', 'processing', 'shipped'] } });
      const totalCustomers = await User.countDocuments({ role: 'customer' });

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalRevenue,
            activeOrdersCount,
            totalCustomers,
            lowStockCount: lowStockProducts.length
          },
          revenueByDay,
          topProducts,
          ordersByStatus,
          lowStockProducts
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
  }
}
