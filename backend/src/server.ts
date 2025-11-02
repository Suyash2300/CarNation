import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db/prisma';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import { socketAuth } from './middleware/socketAuth';
import { setupChatHandler } from './socket/chatHandler';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.io
const io = new SocketServer(httpServer, {
  path: '/socket.io/', // Explicit Socket.io path
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
  },
  transports: ['polling', 'websocket'], // Polling first, then upgrade to websocket
  allowEIO3: true, // Allow Engine.IO v3 clients
});

// Log Socket.io initialization
console.log('🔌 Socket.io initialized with path: /socket.io/');
console.log('🔌 CORS origin:', process.env.FRONTEND_URL || 'http://localhost:5173');

// Apply Socket.io authentication middleware
io.use(socketAuth);

// Setup chat handler
setupChatHandler(io);

// Middleware - CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers with increased size limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Apply general rate limiting to all API routes
import { apiLimiter } from './middleware/rateLimit';
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

// Public car routes
import carsRoutes from './routes/cars.routes';
app.use('/api/cars', carsRoutes);

// Car detail route (must be after /cars routes to avoid conflicts)
import carDetailRoutes from './routes/carDetail.routes';
app.use('/api/cars', carDetailRoutes);

// Seller routes (requires authentication)
import sellerRoutes from './routes/seller.routes';
app.use('/api/seller', sellerRoutes);

// Upload routes (requires authentication)
import uploadRoutes from './routes/upload.routes';
app.use('/api/upload', uploadRoutes);

// Chat routes (requires authentication)
import chatRoutes from './routes/chat.routes';
app.use('/api/chat', chatRoutes);

// Rental routes (requires authentication)
import rentalRoutes from './routes/rental.routes';
app.use('/api/rentals', rentalRoutes);

// Purchase routes (requires authentication)
import purchaseRoutes from './routes/purchase.routes';
app.use('/api/purchases', purchaseRoutes);

// Platform fees routes
import platformFeesRoutes from './routes/platformFees.routes';
app.use('/api/platform-fees', platformFeesRoutes);

// Deals routes (requires authentication)
import dealsRoutes from './routes/deals.routes';
app.use('/api/deals', dealsRoutes);

// Subscription routes (requires authentication for most)
import subscriptionRoutes from './routes/subscription.routes';
app.use('/api/subscriptions', subscriptionRoutes);

// Payment routes (requires authentication)
import paymentRoutes from './routes/payment.routes';
app.use('/api/payments', paymentRoutes);


// Scheduled jobs
import cron from 'node-cron';
import { checkSubscriptionExpiry } from './services/subscriptionService';

// Run subscription expiry check daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('🔄 Running subscription expiry check...');
  try {
    await checkSubscriptionExpiry();
    console.log('✅ Subscription expiry check completed');
  } catch (error) {
    console.error('❌ Error in subscription expiry check:', error);
  }
});

// Run rental status update check every hour
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Checking for completed rentals...');
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

    if (completedRentals.count > 0) {
      console.log(`✅ Updated ${completedRentals.count} rental(s) to COMPLETED`);
    }
  } catch (error) {
    console.error('❌ Error updating rental statuses:', error);
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Socket.io is ready for real-time chat`);
  console.log(`⏰ Scheduled jobs initialized (subscription expiry daily, rental updates hourly)`);
});

export default app;
export { io };

