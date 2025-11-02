# How to Run CarNation

## Prerequisites

1. Node.js (v18 or higher)
2. PostgreSQL database (Neon or local)
3. Environment variables configured

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Make sure your .env file has these variables:
# DATABASE_URL="your-postgresql-connection-string"
# JWT_SECRET="your-secret-key"
# PORT=3000
# FRONTEND_URL="http://localhost:5173"
# CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
# CLOUDINARY_API_KEY="your-cloudinary-key"
# CLOUDINARY_API_SECRET="your-cloudinary-secret"
# RAZORPAY_KEY_ID="your-razorpay-key"
# RAZORPAY_KEY_SECRET="your-razorpay-secret"
# SMTP settings (for email)

# Push database schema (use this for Neon PostgreSQL)
npm run prisma:generate
npx prisma db push

# Start backend server
npm run dev
```

Backend will run on: `http://localhost:3000`

### 2. Frontend Setup

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Quick Start (Both Servers)

Open **two terminal windows**:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables Required

### Backend (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key-here"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Razorpay (for payments)
# Option 1: Test Mode (No real payments, works without Razorpay dashboard)
RAZORPAY_TEST_MODE="true"  # Set to "true" to enable test mode
# Note: In test mode, you don't need to set KEY_ID and KEY_SECRET

# Option 2: Real Razorpay (For production)
# RAZORPAY_TEST_MODE="false"  # or omit this line
RAZORPAY_KEY_ID="rzp_test_xxxxx"  # Test key starts with rzp_test_
RAZORPAY_KEY_SECRET="your-razorpay-secret"

# Get Razorpay Test Keys:
# 1. Go to https://dashboard.razorpay.com
# 2. Login/Signup
# 3. Go to Settings → API Keys
# 4. Click "Generate Test Key" (for development)
# 5. Copy Key ID and Key Secret

# Test Card Numbers (for testing payments):
# - Success: 4111 1111 1111 1111
# - Failure: 4000 0000 0000 0002
# - Any CVV, any expiry date in future

# Email (SMTP - optional for password reset)
SMTP_HOST="smtp.brevo.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-smtp-password"
BREVO_API_KEY="your-brevo-api-key"
```

### Frontend (.env - optional, defaults work)
```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Access the Application

1. Open browser: `http://localhost:5173`
2. Register a new account or sign in
3. Start using the platform!

## Features Available

✅ **Rental Cars**
- Browse rental cars with availability status
- Book rentals with date selection
- Real-time availability checking
- Razorpay payment integration

✅ **Used Cars**
- Browse used cars for sale
- Purchase with platform fee calculation
- Razorpay payment integration

✅ **Chat System**
- Real-time chat between buyers, sellers, and admins
- Deal tracking from conversations

✅ **Subscription System**
- Sellers can upgrade subscription tiers
- Listing limits based on tier

✅ **Admin Dashboard**
- Manage cars, rentals, users
- Configure platform fees
- View transaction reports

## Troubleshooting

**Database connection issues:**
- Check your `DATABASE_URL` in backend `.env`
- Run `npx prisma db push` to sync schema

**Frontend can't connect to backend:**
- Ensure backend is running on port 3000
- Check `VITE_API_BASE_URL` in frontend

**Payment issues:**
- Verify Razorpay credentials in backend `.env`
- Check Razorpay dashboard for test keys

**Image upload issues:**
- Verify Cloudinary credentials in backend `.env`

