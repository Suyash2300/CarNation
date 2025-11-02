import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db/prisma';
import authRoutes from './routes/auth.routes';

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Test email endpoint (for development/testing)
app.post('/api/test-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
      });
    }

    // Import email utility
    const { sendPasswordResetEmail } = await import('./utils/email');
    
    // Create a test reset URL
    const testResetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=test-token-123&email=${encodeURIComponent(email)}`;
    
    // Try to send email
    await sendPasswordResetEmail(email, testResetUrl);
    
    res.json({
      success: true,
      message: `Test email sent successfully to ${email}`,
      note: 'Check your inbox (and spam folder) for the test email',
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test email',
      hint: 'Make sure RESEND_API_KEY is set in your .env file',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;

