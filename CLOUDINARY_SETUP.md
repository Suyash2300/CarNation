# Cloudinary Image Upload Setup

## 🚀 Quick Setup Guide

### 1. Create Cloudinary Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

### 2. Get Your Credentials
1. Log in to Cloudinary Dashboard
2. Go to **Settings** → **Access Keys**
3. Copy these values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Add to Backend `.env` File
Add these variables to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

### 4. Restart Backend Server
```bash
cd backend
npm run dev
```

## ✅ That's It!

Now when admins add cars:
1. They can click "Upload Image"
2. Select an image file
3. Image uploads to Cloudinary automatically
4. URL is saved to database
5. Image displays from Cloudinary CDN

## 📋 Features Implemented

✅ **Single Image Upload** - Upload one image at a time
✅ **Image Preview** - See image before saving
✅ **Auto-optimization** - Cloudinary automatically optimizes images
✅ **Secure URLs** - Uses HTTPS secure URLs
✅ **File Validation** - Only images, max 5MB
✅ **Progress Indicator** - Shows upload progress

## 🔒 Security

- Upload endpoint requires authentication
- Only authenticated admins can upload
- File size limited to 5MB
- Only image files accepted

## 📁 File Structure

```
backend/
  ├── src/
  │   ├── utils/
  │   │   └── cloudinary.ts      # Cloudinary configuration
  │   └── routes/
  │       └── upload.routes.ts   # Upload endpoints

frontend/
  ├── src/
  │   ├── components/admin/
  │   │   └── ImageUpload.tsx    # Upload component
  │   └── services/
  │       └── uploadService.ts   # Upload service
```

