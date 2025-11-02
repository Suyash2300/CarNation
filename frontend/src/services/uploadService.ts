import axiosInstance from './axios';

export interface UploadResponse {
  url: string;
  publicId: string;
  message: string;
}

export interface MultiUploadResponse {
  images: Array<{ url: string; publicId: string }>;
  message: string;
}

/**
 * Upload single image to Cloudinary via backend
 */
export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axiosInstance.post('/upload/image', formData);

  return response.data;
};

/**
 * Upload multiple images to Cloudinary via backend
 */
export const uploadImages = async (files: File[]): Promise<MultiUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await axiosInstance.post('/upload/images', formData);

  return response.data;
};

