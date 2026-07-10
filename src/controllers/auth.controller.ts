import { Request, Response } from 'express';
import { AuthService, registerSchema, loginSchema } from '../services/auth.service';
import { z } from 'zod';
import { verifyRefreshToken } from '../utils/jwt';
import { User } from '../models/User';
import bcrypt from 'bcrypt';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const user = await AuthService.register(data);
      res.status(201).json({ success: true, data: { userId: user._id, message: 'Registration successful. Check your email.' } });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: (error as any).errors || (error as any).issues } });
        return;
      }
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: error.message } });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await AuthService.login(data);
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({ success: true, data: { user: { id: user._id, email: user.email, name: user.name, role: user.role }, accessToken } });
    } catch (error: any) {
      require('fs').appendFileSync('login_debug.log', JSON.stringify({ time: new Date(), body: req.body, error: error.message || error }) + '\\n');
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: error.message } });
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
        return;
      }

      verifyRefreshToken(token);
      const { accessToken, refreshToken } = await AuthService.refresh(token);
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({ success: true, data: { accessToken } });
    } catch (error: any) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      if (req.user) {
        await AuthService.logout(req.user._id);
      }
      res.clearCookie('refreshToken');
      res.status(200).json({ success: true, data: null });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
  }

  static async profile(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, data: { user: req.user } });
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { name, phone, currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404).json({ success: false, error: { message: 'User not found' } });
        return;
      }

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;

      if (newPassword) {
        if (!currentPassword) {
          res.status(400).json({ success: false, error: { message: 'Current password is required to set a new password' } });
          return;
        }
        const valid = await user.comparePassword(currentPassword);
        if (!valid) {
          res.status(400).json({ success: false, error: { message: 'Current password is incorrect' } });
          return;
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }

      await user.save();
      res.status(200).json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, phone: user.phone } } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async toggleWishlist(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404).json({ success: false, error: { message: 'User not found' } });
        return;
      }

      const productId = req.params.productId;
      const idx = user.wishlist.findIndex(id => id.toString() === productId);
      if (idx === -1) {
        user.wishlist.push(productId as any);
      } else {
        user.wishlist.splice(idx, 1);
      }

      await user.save();
      res.status(200).json({ success: true, data: { wishlist: user.wishlist } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async getWishlist(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user._id).populate('wishlist').lean();
      if (!user) {
        res.status(404).json({ success: false, error: { message: 'User not found' } });
        return;
      }
      res.status(200).json({ success: true, data: { wishlist: user.wishlist } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
