import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';

export class MarketingController {
  static async getCoupons(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const coupons = await Coupon.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Coupon.countDocuments();

      res.json({
        success: true,
        data: coupons,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      console.error('Get coupons error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to fetch coupons' } });
    }
  }

  static async createCoupon(req: Request, res: Response) {
    try {
      const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, error: { message: 'Coupon code already exists' } });
      }

      const coupon = new Coupon({
        ...req.body,
        code: req.body.code.toUpperCase()
      });

      await coupon.save();
      res.status(201).json({ success: true, data: coupon });
    } catch (error: any) {
      console.error('Create coupon error:', error);
      res.status(400).json({ success: false, error: { message: error.message || 'Failed to create coupon' } });
    }
  }

  static async updateCoupon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // If code is updated, ensure uppercase and check uniqueness
      if (req.body.code) {
        req.body.code = req.body.code.toUpperCase();
        const existing = await Coupon.findOne({ code: req.body.code, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({ success: false, error: { message: 'Coupon code already exists' } });
        }
      }

      const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!coupon) {
        return res.status(404).json({ success: false, error: { message: 'Coupon not found' } });
      }

      res.json({ success: true, data: coupon });
    } catch (error: any) {
      console.error('Update coupon error:', error);
      res.status(400).json({ success: false, error: { message: error.message || 'Failed to update coupon' } });
    }
  }

  static async deleteCoupon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findByIdAndDelete(id);
      
      if (!coupon) {
        return res.status(404).json({ success: false, error: { message: 'Coupon not found' } });
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('Delete coupon error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to delete coupon' } });
    }
  }
}
