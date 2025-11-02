import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// Upload single image
router.post(
  '/image',
  authenticate,
  (req: AuthRequest, res: Response, next: any) => {
    upload.single('image')(req, res, (err: any) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          error: err.message || 'File upload failed',
        });
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      console.log('📤 Uploading image to Cloudinary...');
      console.log('   File size:', req.file.size, 'bytes');
      console.log('   File type:', req.file.mimetype);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, 'carnation-cars');

      console.log('✅ Image uploaded successfully:', result.url);

      res.json({
        url: result.url,
        publicId: result.publicId,
        message: 'Image uploaded successfully',
      });
    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      console.error('   Error details:', error);
      res.status(500).json({
        error: error.message || 'Failed to upload image',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
);

// Upload multiple images
router.post(
  '/images',
  authenticate,
  upload.array('images', 10), // Max 10 images
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
      }

      const files = req.files as Express.Multer.File[];
      const uploadPromises = files.map((file) =>
        uploadToCloudinary(file.buffer, 'carnation-cars')
      );

      const results = await Promise.all(uploadPromises);

      res.json({
        images: results.map((result) => ({
          url: result.url,
          publicId: result.publicId,
        })),
        message: `${results.length} image(s) uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Images upload error:', error);
      res.status(500).json({
        error: error.message || 'Failed to upload images',
      });
    }
  }
);

export default router;

