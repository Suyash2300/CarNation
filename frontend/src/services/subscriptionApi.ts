import { api } from './api';

export interface SubscriptionTier {
  name: string;
  price: number;
  maxListings: number;
  features: string[];
}

export interface SubscriptionStatus {
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  tierInfo: SubscriptionTier;
  currentListings: number;
  canListMore: boolean;
  maxListings: number;
  reason?: string;
}

export interface CreateOrderResponse {
  clientSecret: string;
  paymentIntentId: string;
  publishableKey: string;
}

export const subscriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTiers: builder.query<{ tiers: Record<string, SubscriptionTier> }, void>({
      query: () => '/subscriptions/tiers',
    }),
    getSubscriptionStatus: builder.query<SubscriptionStatus, void>({
      query: () => '/subscriptions/status',
    }),
    createSubscriptionOrder: builder.mutation<CreateOrderResponse, { tier: 'BASIC' | 'PREMIUM' }>({
      query: (body) => ({
        url: '/subscriptions/create-order',
        method: 'POST',
        body,
      }),
    }),
    verifySubscriptionPayment: builder.mutation<
      { message: string; tier: string; startDate: string; endDate: string },
      {
        paymentIntentId: string;
        tier: 'BASIC' | 'PREMIUM';
      }
    >({
      query: (body) => ({
        url: '/subscriptions/verify-payment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    activateFreeTier: builder.mutation<
      { message: string; tier: string; startDate: string; endDate: string },
      void
    >({
      query: () => ({
        url: '/subscriptions/activate-free',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    cancelSubscription: builder.mutation<
      { message: string; endDate: string; note: string },
      void
    >({
      query: () => ({
        url: '/subscriptions/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTiersQuery,
  useGetSubscriptionStatusQuery,
  useCreateSubscriptionOrderMutation,
  useVerifySubscriptionPaymentMutation,
  useActivateFreeTierMutation,
  useCancelSubscriptionMutation,
} = subscriptionApi;

