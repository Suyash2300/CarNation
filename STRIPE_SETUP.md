# Stripe Setup Guide for CarNation

## Quick Setup

Stripe is now integrated! No validation hassles - just sign up and get your keys instantly.

## Step 1: Create Stripe Account

1. Go to **https://dashboard.stripe.com/register**
2. Sign up with your email (no credit card required for test mode)
3. You'll get access immediately - no verification needed!

## Step 2: Get Your API Keys

1. After logging in, you'll see the dashboard
2. Click on **"Developers"** in the left sidebar
3. Click **"API keys"**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`) - This is for the frontend
   - **Secret key** (starts with `sk_test_`) - This is for the backend

## Step 3: Add to Environment Variables

### Backend `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"
```

**That's it!** No validation, no waiting, no hassle.

## Step 4: Test Payments

### Test Card Numbers:

**Success:**
- Card: `4242 4242 4242 4242`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- ZIP: Any 5 digits (e.g., `12345`)

**Decline:**
- Card: `4000 0000 0000 0002`

## How It Works

1. **Test Mode (Default):**
   - Keys start with `pk_test_` and `sk_test_`
   - No real charges
   - Perfect for development

2. **Live Mode (Production):**
   - Switch to `pk_live_` and `sk_live_` keys
   - Real payments processed
   - Requires account activation (one-time)

## Features Supported

✅ **Rental Payments** - Rent cars  
✅ **Purchase Payments** - Buy used cars  
✅ **Subscription Payments** - Seller tier upgrades  

## Mock Mode

If you don't add Stripe keys, the system will automatically use **mock mode**:
- All payments succeed automatically
- No Stripe account needed
- Perfect for initial development

## Benefits Over Razorpay

- ✅ **No Validation** - Instant access, no KYC
- ✅ **Easy Setup** - Just copy-paste keys
- ✅ **Better Docs** - Comprehensive documentation
- ✅ **Global Support** - Works worldwide
- ✅ **Test Cards** - Built-in test cards for development

## Support

- Stripe Docs: https://stripe.com/docs
- Stripe Dashboard: https://dashboard.stripe.com
- Test Mode: Automatically enabled with test keys

