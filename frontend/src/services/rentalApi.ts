import { api } from './api';

export interface Rental {
  id: string;
  carId: string;
  buyerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyPrice: number;
  totalAmount: number;
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
    city?: string;
    owner?: {
      id: string;
      name: string;
      email: string;
    };
  };
  buyer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    isAadhaarVerified: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRentalRequest {
  carId: string;
  startDate: string;
  endDate: string;
}

export const rentalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createRental: builder.mutation<{ rental: Rental }, CreateRentalRequest>({
      query: (body) => ({
        url: '/rentals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rental'],
    }),
    getRentals: builder.query<{ rentals: Rental[] }, { status?: string } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) {
          searchParams.append('status', params.status);
        }
        return `/rentals?${searchParams.toString()}`;
      },
      providesTags: ['Rental'],
    }),
    getRental: builder.query<{ rental: Rental }, string>({
      query: (id) => `/rentals/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Rental', id }],
    }),
    updateRentalStatus: builder.mutation<
      { rental: Rental },
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/rentals/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Rental', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateRentalMutation,
  useGetRentalsQuery,
  useGetRentalQuery,
  useUpdateRentalStatusMutation,
} = rentalApi;

