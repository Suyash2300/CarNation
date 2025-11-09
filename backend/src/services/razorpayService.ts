import Razorpay from 'razorpay';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_TEST_MODE = process.env.RAZORPAY_TEST_MODE === 'true';
const USE_MOCK_MODE = !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET; // Use mock only if NO keys provided

// Determine if we have test keys (keys starting with rzp_test_)
const HAS_TEST_KEYS = RAZORPAY_KEY_ID?.startsWith('rzp_test_') || false;
const HAS_LIVE_KEYS = RAZORPAY_KEY_ID?.startsWith('rzp_live_') || false;

if (USE_MOCK_MODE) {
  console.log('🔧 Razorpay credentials not found. Using MOCK MODE - Payments will be simulated locally');
} else if (HAS_TEST_KEYS && !RAZORPAY_TEST_MODE) {
  console.log('🔧 Razorpay TEST KEYS detected - Using Razorpay test API (like Stripe test mode)');
} else if (RAZORPAY_TEST_MODE) {
  console.log('🔧 Razorpay TEST MODE explicitly enabled - Using Razorpay test API');
} else if (HAS_LIVE_KEYS) {
  console.log('✅ Razorpay LIVE KEYS detected - Using Razorpay live API (production)');
} else {
  console.log('✅ Razorpay configured - Using Razorpay API');
}

let razorpayInstance: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay | null => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return null;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayInstance;
};

export interface CreateOrderParams {
  amount: number; // in paise (₹1 = 100 paise)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export const createOrder = async (params: CreateOrderParams) => {
  // Mock mode: Only if NO keys provided (fully offline simulation)
  if (USE_MOCK_MODE) {
    const mockOrder = {
      id: `order_test_${Date.now()}`,
      entity: 'order',
      amount: params.amount,
      amount_paid: 0,
      amount_due: params.amount,
      currency: params.currency || 'INR',
      receipt: params.receipt || `receipt_${Date.now()}`,
      status: 'created',
      attempts: 0,
      notes: params.notes || {},
      created_at: Math.floor(Date.now() / 1000),
    };
    console.log('🔧 MOCK MODE: Created simulated Razorpay order:', mockOrder.id);
    return mockOrder;
  }

  // Real Razorpay API (works with test keys or live keys - like Stripe)
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    throw new Error('Razorpay is not configured');
  }

  // This will use Razorpay test API if test keys are provided, live API if live keys
  // Just like Stripe - test keys = test API, live keys = live API
  const order = await razorpay.orders.create({
    amount: params.amount,
    currency: params.currency || 'INR',
    receipt: params.receipt || `receipt_${Date.now()}`,
    notes: params.notes || {},
  });

  if (HAS_TEST_KEYS) {
    console.log('🔧 Using Razorpay TEST API (like Stripe test mode):', order.id);
  }

  return order;
};

export const verifyPayment = (razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string): boolean => {
  // Mock mode: Auto-approve (only when NO keys provided)
  if (USE_MOCK_MODE) {
    console.log('🔧 MOCK MODE: Payment verified automatically (no Razorpay keys):', razorpay_payment_id);
    return true;
  }

  // Real Razorpay signature verification (works with test or live keys - like Stripe)
  if (!RAZORPAY_KEY_SECRET) {
    return false;
  }

  const text = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generated_signature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  const isValid = generated_signature === razorpay_signature;
  
  if (HAS_TEST_KEYS && isValid) {
    console.log('🔧 Razorpay TEST API: Payment signature verified:', razorpay_payment_id);
  }

  return isValid;
};

export const capturePayment = async (paymentId: string, amount: number) => {
  // Mock mode: Return mock payment (only when NO keys provided)
  if (USE_MOCK_MODE) {
    const mockPayment = {
      id: paymentId,
      entity: 'payment',
      amount: amount,
      currency: 'INR',
      status: 'captured',
      captured: true,
      created_at: Math.floor(Date.now() / 1000),
    };
    console.log('🔧 MOCK MODE: Captured simulated payment:', paymentId);
    return mockPayment;
  }

  // Real Razorpay API (works with test or live keys - like Stripe)
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    throw new Error('Razorpay is not configured');
  }

  const payment = await razorpay.payments.capture(paymentId, amount, 'INR');
  
  if (HAS_TEST_KEYS) {
    console.log('🔧 Razorpay TEST API: Payment captured:', paymentId);
  }
  
  return payment;
};

// Helper to check if test mode is enabled or if using test keys
export const isTestMode = (): boolean => {
  // Test mode if: explicitly enabled OR using test keys OR mock mode
  return USE_MOCK_MODE || HAS_TEST_KEYS || RAZORPAY_TEST_MODE;
};

