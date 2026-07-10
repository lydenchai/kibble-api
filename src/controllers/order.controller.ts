import { Request, Response } from 'express';
import { Order } from '../models/Order';

export class OrderController {
  /** GET /api/orders/my — returns all orders for the authenticated user */
  static async getMyOrders(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const query = { user: req.user._id };

      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Order.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  /** GET /api/orders/my/:id — returns a single order belonging to the authenticated user */
  static async getMyOrderById(req: Request, res: Response) {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      }).lean();

      if (!order) {
        return res.status(404).json({ success: false, error: { message: 'Order not found' } });
      }

      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
