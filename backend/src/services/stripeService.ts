import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const USE_MOCK_MODE = !STRIPE_SECRET_KEY;

// Determine if we have test keys (keys starting with sk_test_)
const HAS_TEST_KEYS = STRIPE_SECRET_KEY?.startsWith('sk_test_') || false;
const HAS_LIVE_KEYS = STRIPE_SECRET_KEY?.startsWith('sk_live_') || false;

let stripeInstance: Stripe | null = null;

// Determine Stripe mode based on available credentials

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
    return 'pk_test_mock';
  }

  // Get publishable key from environment
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY?.trim();
  
  if (!publishableKey) {
    if (HAS_TEST_KEYS) {
      return 'pk_test_placeholder';
    }
    return 'pk_live_placeholder';
  }

  return publishableKey;
};

