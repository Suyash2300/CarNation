import { api } from './api';

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  transmission?: string;
  fuelType?: string;
  seats?: number;
  rentalPrice: number;
  description?: string;
  images: string[];
  primaryImage?: string;
  status: string;
  isForRent: boolean;
  createdAt: string;
}

export interface Rental {
  id: string;
  carId: string;
  buyerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyPrice: number;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    primaryImage?: string;
    city?: string;
  };
  buyer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    isAadhaarVerified: boolean;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    country?: string | null;
  };
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isAadhaarVerified: boolean;
  aadhaarVerifiedAt?: string;
  createdAt: string;
}

export interface AdminStats {
  totalEarnings: number;
  activeRentals: number;
  totalCars: number;
  pendingVerifications: number;
  todayEarnings: number;
  monthlyEarnings: number;
}

export interface CreateCarRequest {
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  ownersCount?: number;
  transmission?: string;
  fuelType?: string;
  seats?: number;
  rentalPrice: number;
  description?: string;
  images?: string[];
  primaryImage?: string;
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<{ stats: AdminStats }, void>({
      query: () => '/admin/stats',
      providesTags: ['Admin'],
    }),
    getAdminCars: builder.query<{ cars: Car[] }, void>({
      query: () => '/admin/cars',
      providesTags: ['Car'],
    }),
    createCar: builder.mutation<{ car: Car }, CreateCarRequest>({
      query: (data) => ({
        url: '/admin/cars',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Car', 'Admin'],
    }),
    updateCar: builder.mutation<{ car: Car }, { id: string; data: Partial<CreateCarRequest> }>({
      query: ({ id, data }) => ({
        url: `/admin/cars/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Car', 'Admin'],
    }),
    deleteCar: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/cars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Car', 'Admin'],
    }),
    getAdminRentals: builder.query<{ rentals: Rental[] }, { status?: string }>({
      query: (params) => ({
        url: '/admin/rentals',
        params,
      }),
      providesTags: ['Rental'],
    }),
    getAdminEarnings: builder.query<{ 
      period: string; 
      totalEarnings: number; 
      earnings: Array<{
        id: string;
        totalAmount: number;
        createdAt: string;
        car: {
          brand: string;
          model: string;
        };
      }>; 
      count: number 
    }, { period?: string }>({
      query: (params) => ({
        url: '/admin/earnings',
        params,
      }),
      providesTags: ['Admin'],
    }),
    getPendingVerifications: builder.query<{ users: User[] }, void>({
      query: () => '/admin/users/pending-verification',
      providesTags: ['User'],
    }),
    verifyAadhaar: builder.mutation<{ user: User; message: string }, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/verify-aadhaar`,
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Admin'],
    }),
    getAdminUsers: builder.query<{ users: User[] }, { role?: string; verified?: string }>({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminCarsQuery,
  useCreateCarMutation,
  useUpdateCarMutation,
  useDeleteCarMutation,
  useGetAdminRentalsQuery,
  useGetAdminEarningsQuery,
  useGetPendingVerificationsQuery,
  useVerifyAadhaarMutation,
  useGetAdminUsersQuery,
} = adminApi;

