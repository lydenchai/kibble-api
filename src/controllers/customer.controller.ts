import { Request, Response } from 'express';
import { User } from '../models/User';
import { Order } from '../models/Order';
import mongoose from 'mongoose';

export class CustomerController {
  static async getCustomers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      
      const skip = (page - 1) * limit;

      const query: any = { role: 'customer' };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Aggregate customers to get their total orders and total spent
      const customers = await User.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'user',
            as: 'orders'
          }
        },
        {
          $addFields: {
            totalOrders: { $size: '$orders' },
            totalSpent: {
              $sum: '$orders.total'
            }
          }
        },
        {
          $project: {
            password: 0,
            refreshToken: 0,
            orders: 0
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: customers,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      console.error('Get customers error:', error);
      res.status(500).json({ success: false, error: { message: error.message || 'Failed to fetch customers' } });
    }
  }
}
