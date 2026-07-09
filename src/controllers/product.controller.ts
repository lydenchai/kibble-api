import { Request, Response } from "express";
import { Product } from "../models/Product";

export class ProductController {
  static async createProduct(req: Request, res: Response) {
    try {
      const product = await Product.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res
        .status(400)
        .json({ success: false, error: { message: error.message } });
    }
  }

  static async getProducts(req: Request, res: Response) {
    try {
      // Basic pagination & filtering
      const {
        page = 1,
        limit = 10,
        category,
        petType,
        search,
        showInactive,
      } = req.query;
      const query: any = {};

      if (!showInactive) {
        query.isActive = true;
      }

      if (category) query.category = category;
      if (petType) query.petType = petType;

      if (search) {
        query.$text = { $search: search as string };
      }

      const products = await Product.find(query)
        .populate("category")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Product.countDocuments(query);

      res.status(200).json({
        success: true,
        data: products,
        pagination: { page: Number(page), limit: Number(limit), total },
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, error: { message: error.message } });
    }
  }

  static async getProductBySlug(req: Request, res: Response) {
    try {
      const product = await Product.findOne({
        slug: req.params.slug,
        isActive: true,
      }).populate("category");
      if (!product)
        return res
          .status(404)
          .json({ success: false, error: { message: "Product not found" } });
      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, error: { message: error.message } });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const product = await Product.findById(req.params.id).populate(
        "category",
      );
      if (!product)
        return res
          .status(404)
          .json({ success: false, error: { message: "Product not found" } });
      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, error: { message: error.message } });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!product)
        return res
          .status(404)
          .json({ success: false, error: { message: "Product not found" } });
      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res
        .status(400)
        .json({ success: false, error: { message: error.message } });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product)
        return res
          .status(404)
          .json({ success: false, error: { message: "Product not found" } });
      res.status(200).json({ success: true, data: null });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, error: { message: error.message } });
    }
  }
}
