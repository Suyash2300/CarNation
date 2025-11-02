# Quick Fix: Stripe Keys Not Loading

## Issue
Backend has Stripe keys in `.env` but frontend still shows "MOCK PAYMENT MODE"

## Solution: Restart Backend

The backend needs to be restarted to load the new environment variables.

### Steps:

1. **Stop the current backend server** (Ctrl+C in the terminal running `npm run dev`)

2. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Check the console output** - You should see:
   ```
   🔧 Stripe TEST KEYS detected - Using Stripe test API
   ```

4. **If you DON'T see that message**, the keys aren't loading. Check:
   - Keys are in `backend/.env` (not root `.env`)
   - No extra quotes around keys in `.env`
   - Keys start with `sk_test_` and `pk_test_`

5. **Test in frontend:**
   - Try booking a rental or purchase
   - You should now see the Stripe payment form (not mock button)

## Debug: Check What Backend is Returning

After restarting, check backend console logs when creating a payment:
- Look for: `✅ Returning Stripe test publishable key: pk_test_...`

If you see `⚠️` warnings instead, the keys aren't being read correctly.

