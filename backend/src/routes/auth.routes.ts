import { Router, Request, Response } from 'express';
import prisma from '../db/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { generateResetToken, hashResetToken } from '../utils/resetToken.js';
import { sendPasswordResetEmail } from '../utils/email.js';
import { authLimiter } from '../middleware/rateLimit.js';
import multer from 'multer';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const router = Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

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
    const userRole = role || 'BUYER';
    const now = new Date();
    const freeTierEndDate = new Date();
    freeTierEndDate.setFullYear(freeTierEndDate.getFullYear() + 100); // 100 years from now

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        role: userRole,
        // Auto-activate FREE tier for sellers
        ...(userRole === 'SELLER' ? {
          subscriptionTier: 'FREE',
          subscriptionStatus: 'ACTIVE',
          subscriptionStartDate: now,
          subscriptionEndDate: freeTierEndDate,
        } : {}),
      } as any,
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
        profileImage: user.profileImage,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        country: user.country,
        bio: user.bio,
        isAadhaarVerified: user.isAadhaarVerified,
        aadhaarVerifiedAt: user.aadhaarVerifiedAt,
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
        address: true,
        city: true,
        state: true,
        pincode: true,
        country: true,
        bio: true,
        isAadhaarVerified: true,
        aadhaarVerifiedAt: true,
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

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, phone, address, city, state, pincode, country, bio } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pincode !== undefined && { pincode }),
        ...(country !== undefined && { country }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        profileImage: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        country: true,
        bio: true,
        isAadhaarVerified: true,
        aadhaarVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
    });
  }
});

// Upload profile image
router.post(
  '/profile/image',
  authenticate,
  upload.single('profileImage'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          error: 'Please upload an image file',
        });
      }

      // Upload image to Cloudinary
      const uploadResult = await uploadToCloudinary(file.buffer, `profile-${userId}`);

      // Update user profile image
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          profileImage: uploadResult.url,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          profileImage: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          country: true,
          bio: true,
          isAadhaarVerified: true,
          aadhaarVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        message: 'Profile image uploaded successfully',
        user,
      });
    } catch (error) {
      console.error('Upload profile image error:', error);
      res.status(500).json({
        error: 'Failed to upload profile image',
      });
    }
  }
);

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
    const frontendBase =
      process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://car-nation-ten.vercel.app'
        : 'http://localhost:5173');
    const resetUrl = `${frontendBase}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError: any) {
      console.error('Failed to send password reset email:', emailError.message || emailError);
      return res.status(500).json({
        error: 'Failed to send password reset email. Please try again later or contact support.',
      });
    }

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

// Upload Aadhaar documents
router.post(
  '/upload-aadhaar',
  authenticate,
  upload.fields([
    { name: 'aadhaarFrontImage', maxCount: 1 },
    { name: 'aadhaarBackImage', maxCount: 1 },
  ]),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { aadhaarNumber } = req.body;

      if (!aadhaarNumber || aadhaarNumber.length !== 12) {
        return res.status(400).json({
          error: 'Please provide a valid 12-digit Aadhaar number',
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const frontImage = files?.aadhaarFrontImage?.[0];
      const backImage = files?.aadhaarBackImage?.[0];

      if (!frontImage || !backImage) {
        return res.status(400).json({
          error: 'Please upload both front and back images of your Aadhaar card',
        });
      }

      // Upload images to Cloudinary
      const [frontImageResult, backImageResult] = await Promise.all([
        uploadToCloudinary(frontImage.buffer, `aadhaar-front-${userId}`),
        uploadToCloudinary(backImage.buffer, `aadhaar-back-${userId}`),
      ]);

      // Update user with Aadhaar information
      await prisma.user.update({
        where: { id: userId },
        data: {
          aadhaarNumber: aadhaarNumber.slice(0, 12), // Store full number for admin verification
          aadhaarFrontImage: frontImageResult.url,
          aadhaarBackImage: backImageResult.url,
        } as any,
      });

      res.json({
        message: 'Aadhaar documents uploaded successfully. Admin will verify them shortly.',
      });
    } catch (error) {
      console.error('Upload Aadhaar error:', error);
      res.status(500).json({
        error: 'Failed to upload Aadhaar documents',
      });
    }
  }
);

export default router;

