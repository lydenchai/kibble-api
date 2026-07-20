import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import uploadRoutes from './routes/upload.routes';
import checkoutRoutes from './routes/checkout.routes';
import analyticsRoutes from './routes/analytics.routes';
import settingsRoutes from './routes/settings.routes';
import auditRoutes from './routes/audit.routes';
import orderRoutes from './routes/order.routes';
import sseRoutes from './routes/sse.routes';
import customerRoutes from './routes/customer.routes';
import marketingRoutes from './routes/marketing.routes';


const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL?.trim()
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Stripe webhook must bypass express.json()
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', sseRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/marketing', marketingRoutes);
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

export default app;
