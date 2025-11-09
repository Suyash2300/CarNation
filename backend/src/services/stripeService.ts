import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const USE_MOCK_MODE = !STRIPE_SECRET_KEY;

// Determine if we have test keys (keys starting with sk_test_)
const HAS_TEST_KEYS = STRIPE_SECRET_KEY?.startsWith('sk_test_') || false;
const HAS_LIVE_KEYS = STRIPE_SECRET_KEY?.startsWith('sk_live_') || false;

let stripeInstance: Stripe | null = null;

if (USE_MOCK_MODE) {
  console.log('🔧 Stripe credentials not found. Using MOCK MODE - Payments will be simulated locally');
} else if (HAS_TEST_KEYS) {
  console.log('🔧 Stripe TEST KEYS detected - Using Stripe test API');
} else if (HAS_LIVE_KEYS) {
  console.log('✅ Stripe LIVE KEYS detected - Using Stripe live API (production)');
} else {
  console.log('✅ Stripe configured');
}

export const getStripeInstance = (): Stripe | null => {
  if (!STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });
  }

  return stripeInstance;
};

export interface CreatePaymentIntentParams {
  amount: number; // in smallest currency unit (paise for INR, cents for USD)
  currency?: string;
  metadata?: Record<string, string>;
}

export const createPaymentIntent = async (params: CreatePaymentIntentParams) => {
  // Mock mode: Return mock payment intent
  if (USE_MOCK_MODE) {
    const mockPaymentIntent = {
      id: `pi_test_${Date.now()}`,
      client_secret: `pi_test_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
      amount: params.amount,
      currency: params.currency || 'inr',
      status: 'requires_payment_method',
      metadata: params.metadata || {},
    };
    console.log('🔧 MOCK MODE: Created simulated Stripe payment intent:', mockPaymentIntent.id);
    return mockPaymentIntent as any;
  }

  // Real Stripe API
  const stripe = getStripeInstance();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency || 'inr',
    metadata: params.metadata || {},
    automatic_payment_methods: {
      enabled: true,
    },
  });

  if (HAS_TEST_KEYS) {
    console.log('🔧 Stripe TEST API: Created payment intent:', paymentIntent.id);
  }

  return paymentIntent;
};

export const retrievePaymentIntent = async (paymentIntentId: string) => {
  // Mock mode: Return mock payment intent
  if (USE_MOCK_MODE) {
    const mockPaymentIntent = {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 10000,
      currency: 'inr',
    };
    console.log('🔧 MOCK MODE: Retrieved simulated payment intent:', paymentIntentId);
    return mockPaymentIntent as any;
  }

  // Real Stripe API
  const stripe = getStripeInstance();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

export const confirmPaymentIntent = async (paymentIntentId: string) => {
  // Mock mode: Auto-confirm
  if (USE_MOCK_MODE) {
    console.log('🔧 MOCK MODE: Payment confirmed automatically:', paymentIntentId);
    return { id: paymentIntentId, status: 'succeeded' } as any;
  }

  // Real Stripe API
  const stripe = getStripeInstance();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return await stripe.paymentIntents.confirm(paymentIntentId);
};

// Helper to check if test mode is enabled
export const isTestMode = (): boolean => {
  return USE_MOCK_MODE || HAS_TEST_KEYS;
};

// Get publishable key for frontend
export const getPublishableKey = (): string => {
  if (USE_MOCK_MODE) {
    console.log('⚠️ Stripe MOCK MODE: Returning pk_test_mock (no secret key found)');
    return 'pk_test_mock';
  }

  // Get publishable key from environment
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY?.trim();
  
  if (!publishableKey) {
    console.warn('⚠️ STRIPE_PUBLISHABLE_KEY not found in env, but STRIPE_SECRET_KEY exists');
    // If not provided, derive from secret key pattern (this is just for convenience)
    if (HAS_TEST_KEYS) {
      console.warn('⚠️ Returning pk_test_placeholder - STRIPE_PUBLISHABLE_KEY should be set');
      return 'pk_test_placeholder';
    }
    return 'pk_live_placeholder';
  }

  if (HAS_TEST_KEYS && publishableKey.startsWith('pk_test_')) {
    console.log('✅ Returning Stripe test publishable key:', publishableKey.substring(0, 20) + '...');
  }

  return publishableKey;
};

