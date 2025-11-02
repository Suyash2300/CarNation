import { api } from './api';

export interface Purchase {
  id: string;
  carId: string;
  buyerId: string;
  salePrice: number;
  platformFee?: number;
  sellerEarnings?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentStatus: string;
  status: string;
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    primaryImage?: string;
    seller?: {
      id: string;
      name: string;
      email: string;
    };
  };
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseRequest {
  carId: string;
  salePrice: number;
}

export const purchaseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPurchase: builder.mutation<{ purchase: Purchase }, CreatePurchaseRequest>({
      query: (body) => ({
        url: '/purchases',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Purchase'],
    }),
    getPurchases: builder.query<{ purchases: Purchase[] }, { status?: string } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) {
          searchParams.append('status', params.status);
        }
        return `/purchases?${searchParams.toString()}`;
      },
      providesTags: ['Purchase'],
    }),
    getPurchase: builder.query<{ purchase: Purchase }, string>({
      query: (id) => `/purchases/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Purchase', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreatePurchaseMutation,
  useGetPurchasesQuery,
  useGetPurchaseQuery,
} = purchaseApi;

