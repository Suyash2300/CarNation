import { api } from './api';

export interface StripePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  publishableKey: string;
}

export interface PaymentVerificationRequest {
  rentalId?: string;
  purchaseId?: string;
  paymentIntentId: string;
}

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createRentalOrder: builder.mutation<
      StripePaymentIntentResponse,
      { rentalId: string }
    >({
      query: (body) => ({
        url: '/payments/rental/create-order',
        method: 'POST',
        body,
      }),
    }),
    verifyRentalPayment: builder.mutation<
      { message: string },
      PaymentVerificationRequest
    >({
      query: (body) => ({
        url: '/payments/rental/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rental', 'Deals', 'Car'],
    }),
    createPurchaseOrder: builder.mutation<
      StripePaymentIntentResponse,
      { purchaseId: string }
    >({
      query: (body) => ({
        url: '/payments/purchase/create-order',
        method: 'POST',
        body,
      }),
    }),
    verifyPurchasePayment: builder.mutation<
      { message: string; platformFee?: number; sellerEarnings?: number },
      PaymentVerificationRequest
    >({
      query: (body) => ({
        url: '/payments/purchase/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Purchase', 'Deals', 'Car'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateRentalOrderMutation,
  useVerifyRentalPaymentMutation,
  useCreatePurchaseOrderMutation,
  useVerifyPurchasePaymentMutation,
} = paymentApi;
