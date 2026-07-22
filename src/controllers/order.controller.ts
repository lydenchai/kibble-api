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

  /** GET /api/orders — returns all orders (Admin only ideally, but keeping it simple) */
  static async getAllOrders(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || '';

      const query: any = {};
      
      // If there's a search term, try to match by order ID if it's a valid hex string, 
      // otherwise this would need a text index on customer names (which we might not have)
      if (search) {
        if (search.length === 24) {
          query._id = search;
        }
      }

      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('user', 'name email')
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

  /** GET /api/orders/:id — returns a single order (Admin) */
  static async getOrderById(req: Request, res: Response) {
    try {
      const order = await Order.findById(req.params.id)
        .populate('user', 'name email phone')
        .lean();

      if (!order) {
        return res.status(404).json({ success: false, error: { message: 'Order not found' } });
      }

      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  /** PUT /api/orders/:id/status — updates the status of an order */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, trackingNumber, courier, trackingUrl } = req.body;

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (courier !== undefined) updateData.courier = courier;
      if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl;

      const order = await Order.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('user', 'name email').lean();

      if (!order) {
        return res.status(404).json({ success: false, error: { message: 'Order not found' } });
      }

      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
