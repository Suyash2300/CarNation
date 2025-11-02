import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db/prisma';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

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


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;

