import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload image to Cloudinary
 * @param filePath - Path to the file or buffer
 * @param folder - Cloudinary folder name (optional)
 * @returns Cloudinary upload result with secure URL
 */
export const uploadToCloudinary = async (
  filePath: string | Buffer,
  folder: string = 'carnation-cars'
): Promise<{ url: string; publicId: string }> => {
  try {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image' as const,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' as const, quality: 'auto' as const },
        { format: 'auto' as const },
      ],
    };

    let result;
    if (Buffer.isBuffer(filePath)) {
      // Use upload_stream for buffers
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload stream error:', error);
              reject(error);
            } else if (!result) {
              reject(new Error('Upload failed: No result returned'));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(filePath);
      }) as any;
    } else {
      // Use regular upload for file paths
      result = await cloudinary.uploader.upload(filePath, uploadOptions);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

export default cloudinary;

