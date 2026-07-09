import { z } from 'zod';
import { User, IUser } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    const { name, email, password } = data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password, role: 'customer' });
    
    // In a real app, send an email here with a verification token
    console.log(`Mock Email: Please verify your email for ${email}`);
    
    return user;
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const { email, password } = data;
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const accessToken = generateAccessToken(user._id as unknown as string, user.role);
    const refreshToken = generateRefreshToken(user._id as unknown as string);

    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  static async refresh(token: string) {
    const user = await User.findOne({ refreshToken: token });
    if (!user) throw new Error('Invalid refresh token');

    const accessToken = generateAccessToken(user._id as unknown as string, user.role);
    const refreshToken = generateRefreshToken(user._id as unknown as string);
    
    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  }

  static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
}
