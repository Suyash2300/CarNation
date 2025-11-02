import { api } from './api';

export interface Deal {
  id: string;
  conversationId: string;
  carId: string;
  buyerId: string;
  sellerId: string;
  agreedPrice: number;
  dealType: 'PURCHASE' | 'RENTAL';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    primaryImage?: string;
  };
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
  };
  purchase?: {
    id: string;
    platformFee?: number;
    sellerEarnings?: number;
    paymentStatus: string;
  };
  rental?: {
    id: string;
    totalAmount: number;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealRequest {
  conversationId: string;
  carId: string;
  agreedPrice: number;
  dealType: 'PURCHASE' | 'RENTAL';
}

export const dealsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDeals: builder.query<{ deals: Deal[] }, { status?: string } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) {
          searchParams.append('status', params.status);
        }
        return `/deals?${searchParams.toString()}`;
      },
      providesTags: ['Deals'],
    }),
    createDeal: builder.mutation<{ deal: Deal }, CreateDealRequest>({
      query: (body) => ({
        url: '/deals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Deals', 'Conversations'],
    }),
    updateDealStatus: builder.mutation<
      { deal: Deal },
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/deals/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Deals'],
    }),
    linkDealToPurchase: builder.mutation<
      { message: string },
      { dealId: string; purchaseId: string }
    >({
      query: ({ dealId, purchaseId }) => ({
        url: `/deals/${dealId}/link-purchase`,
        method: 'POST',
        body: { purchaseId },
      }),
      invalidatesTags: ['Deals'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDealsQuery,
  useCreateDealMutation,
  useUpdateDealStatusMutation,
  useLinkDealToPurchaseMutation,
} = dealsApi;

