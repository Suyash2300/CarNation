import { api } from './api';

export interface PlatformFeeCalculation {
  salePrice: number;
  feePercentage: number;
  platformFee: number;
  sellerEarnings: number;
}

export interface TransactionReport {
  transactions: Array<{
    id: string;
    salePrice: number;
    platformFee?: number;
    sellerEarnings?: number;
    paymentStatus: string;
    createdAt: string;
    car: {
      id: string;
      brand: string;
      model: string;
      year: number;
      seller: {
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
  }>;
  summary: {
    totalTransactions: number;
    totalSales: number;
    totalPlatformFees: number;
    totalSellerEarnings: number;
  };
}

export const platformFeesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentFee: builder.query<{ feePercentage: number }, void>({
      query: () => '/platform-fees/current',
    }),
    getFeeHistory: builder.query<{ fees: Array<{ id: string; feePercentage: number; isActive: boolean; createdAt: string; updatedAt: string }> }, void>({
      query: () => '/platform-fees/history',
    }),
    updateFee: builder.mutation<
      { message: string; feePercentage: number },
      { feePercentage: number }
    >({
      query: (body) => ({
        url: '/platform-fees/update',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Admin'],
    }),
    calculateFee: builder.mutation<
      PlatformFeeCalculation,
      { salePrice: number }
    >({
      query: (body) => ({
        url: '/platform-fees/calculate',
        method: 'POST',
        body,
      }),
    }),
    getTransactionReport: builder.query<
      TransactionReport,
      { startDate?: string; endDate?: string; limit?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        if (params.limit) searchParams.append('limit', params.limit.toString());
        return `/platform-fees/transactions?${searchParams.toString()}`;
      },
      providesTags: ['Admin'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCurrentFeeQuery,
  useGetFeeHistoryQuery,
  useUpdateFeeMutation,
  useCalculateFeeMutation,
  useGetTransactionReportQuery,
} = platformFeesApi;

