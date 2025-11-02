import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateResetToken, hashResetToken } from '../utils/resetToken';
import { sendPasswordResetEmail } from '../utils/email';

const router = Router();

// Register / Sign Up
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required',
      });
    }

    if (!['ADMIN', 'SELLER', 'BUYER'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be ADMIN, SELLER, or BUYER',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        role: role || 'BUYER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Login / Sign In
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Get current user profile (protected route)
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Forgot Password - Request reset token
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success (security: don't reveal if email exists)
    if (!user) {
      return res.json({
        message: 'If an account with that email exists, we have sent a password reset link.',
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashResetToken(resetToken);
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: tokenExpiry,
      } as any, // Type assertion needed until TS server reloads Prisma types
    });

    // Generate reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;


    // Send email (currently just logs, will implement email service later)
    await sendPasswordResetEmail(user.email, resetToken, resetUrl);


    res.json({
      message: 'If an account with that email exists, we have sent a password reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Reset Password - Verify token and update password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({
        error: 'Token, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    // Find user with reset token fields
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    }) as any; // Type assertion needed until TS server reloads Prisma types

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
      });
    }

    // Check if token is expired
    if (user.resetTokenExpiry < new Date()) {
      // Clear expired token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        } as any, // Type assertion needed until TS server reloads Prisma types
      });
      return res.status(400).json({
        error: 'Reset token has expired. Please request a new one.',
      });
    }

    // Verify token
    const hashedToken = hashResetToken(token);
    if (user.resetToken !== hashedToken) {
      return res.status(400).json({
        error: 'Invalid reset token',
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      } as any, // Type assertion needed until TS server reloads Prisma types
    });

    res.json({
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;

