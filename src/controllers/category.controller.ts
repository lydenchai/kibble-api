import { Request, Response } from 'express';
import { Category } from '../models/Category';

export class CategoryController {
  static async createCategory(req: Request, res: Response) {
    try {
      const category = await Category.create(req.body);

      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const categories = await Category.find()
        .populate('parent')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
        
      const total = await Category.countDocuments();

      res.status(200).json({ 
        success: true, 
        data: categories,
        pagination: { page, limit, total }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    try {
      const category = await Category.findById(req.params.id).populate('parent');
      if (!category) return res.status(404).json({ success: false, error: { message: 'Category not found' } });
      res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!category) return res.status(404).json({ success: false, error: { message: 'Category not found' } });
      res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) return res.status(404).json({ success: false, error: { message: 'Category not found' } });
      res.status(200).json({ success: true, data: null });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
