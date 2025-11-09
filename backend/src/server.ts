import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import prisma from './db/prisma.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes, { supportRouter } from './routes/admin.routes.js';
import { socketAuth } from './middleware/socketAuth.js';
import { setupChatHandler } from './socket/chatHandler.js';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://car-nation-ten.vercel.app'
    : 'http://localhost:5173');

// CORS origin checker - allows production URL and all Vercel preview URLs
const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return callback(null, true);
  
  const allowedOrigins = [
    FRONTEND_ORIGIN,
    'https://car-nation-ten.vercel.app',
    'https://car-nation-teal.vercel.app', // Keep old URL for backward compatibility
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  // Allow any Vercel preview URL (*.vercel.app)
  if (origin.endsWith('.vercel.app')) {
    return callback(null, true);
  }
  
  // Check against allowed origins
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  
  callback(new Error('Not allowed by CORS'));
};

// Compression middleware (gzip/brotli) - should be early in middleware chain
app.use(compression({
  filter: (req: Request, res: Response) => {
    // Don't compress responses if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for all other responses
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9, 6 is a good balance)
  threshold: 1024, // Only compress responses larger than 1KB
}));

// Initialize Socket.io
const io = new SocketServer(httpServer, {
  path: '/socket.io/', // Explicit Socket.io path
  cors: {
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
  },
  transports: ['polling', 'websocket'], // Polling first, then upgrade to websocket
  allowEIO3: true, // Allow Engine.IO v3 clients
});


// Apply Socket.io authentication middleware
io.use(socketAuth);

// Setup chat handler
setupChatHandler(io);

// Middleware - CORS configuration
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers with increased size limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Apply general rate limiting to all API routes
import { apiLimiter } from './middleware/rateLimit.js';
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'CarNation API is running' });
});

// Database connection test endpoint
app.get('/api/db-test', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try a simple query
    const userCount = await prisma.user.count();
    
    res.json({
      status: 'connected',
      message: 'Database connection successful',
      userCount,
      database: 'neondb (PostgreSQL)',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Config endpoint - expose public configuration (no auth required)
app.get('/api/config', (req: Request, res: Response) => {
  // Import at function level to avoid circular dependency issues
  const { isTestMode } = require('./services/razorpayService');
  res.json({
    razorpayTestMode: isTestMode(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to CarNation API' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);
// Public support helper
app.use('/api', supportRouter);

// Public car routes
import carsRoutes from './routes/cars.routes.js';
app.use('/api/cars', carsRoutes);

// Car detail route (must be after /cars routes to avoid conflicts)
import carDetailRoutes from './routes/carDetail.routes.js';
app.use('/api/cars', carDetailRoutes);

// Seller routes (requires authentication)
import sellerRoutes from './routes/seller.routes.js';
app.use('/api/seller', sellerRoutes);

// Upload routes (requires authentication)
import uploadRoutes from './routes/upload.routes.js';
app.use('/api/upload', uploadRoutes);

// Chat routes (requires authentication)
import chatRoutes from './routes/chat.routes.js';
app.use('/api/chat', chatRoutes);

// Rental routes (requires authentication)
import rentalRoutes from './routes/rental.routes.js';
app.use('/api/rentals', rentalRoutes);

// Purchase routes (requires authentication)
import purchaseRoutes from './routes/purchase.routes.js';
app.use('/api/purchases', purchaseRoutes);

// Platform fees routes
import platformFeesRoutes from './routes/platformFees.routes.js';
app.use('/api/platform-fees', platformFeesRoutes);

// Deals routes (requires authentication)
import dealsRoutes from './routes/deals.routes.js';
app.use('/api/deals', dealsRoutes);

// Subscription routes (requires authentication for most)
import subscriptionRoutes from './routes/subscription.routes.js';
app.use('/api/subscriptions', subscriptionRoutes);

// Payment routes (requires authentication)
import paymentRoutes from './routes/payment.routes.js';
app.use('/api/payments', paymentRoutes);

// Shops routes (public + admin)
import shopsRoutes from './routes/shops.routes.js';
app.use('/api/shops', shopsRoutes);


// Scheduled jobs
import cron from 'node-cron';
import { checkSubscriptionExpiry } from './services/subscriptionService.js';

// Run subscription expiry check daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    await checkSubscriptionExpiry();
  } catch (error) {
    console.error('Subscription expiry job failed:', error);
  }
});

// Run rental status update check every hour
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const completedRentals = await prisma.rental.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: now,
        },
      },
      data: {
        status: 'COMPLETED',
      },
    });

    await prisma.rental.updateMany({
      where: {
        status: 'PENDING',
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      data: {
        status: 'ACTIVE',
      },
    });
    
    // Update car statuses for completed rentals
    const rentalCarIds = await prisma.rental.findMany({
      where: {
        status: 'COMPLETED',
        endDate: {
          lt: now,
        },
      },
      select: { carId: true },
      distinct: ['carId'],
    });

    for (const { carId } of rentalCarIds) {
      // Check if car has other active rentals
      const activeRentals = await prisma.rental.count({
        where: {
          carId,
          status: { in: ['PENDING', 'ACTIVE'] },
        },
      });

      if (activeRentals === 0) {
        await prisma.car.update({
          where: { id: carId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

  } catch (error) {
    console.error('Rental status update job failed:', error);
  }
});

// Start server
httpServer.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Server listening on http://localhost:${PORT}`);
  }
});

export default app;
export { io };

