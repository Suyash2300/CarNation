import { api } from './api';

export interface CarAvailability {
  status: 'AVAILABLE' | 'RENTED' | 'BOOKED_UNTIL';
  isCurrentlyRented: boolean;
  nextAvailableDate?: string;
  bookedUntil?: string;
  bookedDates: Array<{
    startDate: string;
    endDate: string;
    status: string;
  }>;
  activeRentalsCount: number;
}

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
  salePrice?: number;
  description?: string;
  images: string[];
  primaryImage?: string;
  city?: string;
  status: string;
  isForRent: boolean;
  availability?: CarAvailability;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface RentalCarsResponse {
  cars: Car[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    cities: string[];
    brands: string[];
  };
}

export interface CreateCarRequest {
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  transmission?: string;
  fuelType?: string;
  seats?: number;
  rentalPrice?: number;
  salePrice?: number;
  description?: string;
  images?: string[];
  primaryImage?: string;
  city?: string;
}

export interface SellerStats {
  totalCars: number;
  availableCars: number;
  soldCars: number;
  totalValue: number;
}

export interface AdminStats {
  totalEarnings: number;
  activeRentals: number;
  totalCars: number;
  pendingVerifications: number;
  todayEarnings: number;
  monthlyEarnings: number;
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
  };
  buyer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    isAadhaarVerified: boolean;
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

// Public Car API (for rent page)
export const carApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRentalCars: builder.query<
      RentalCarsResponse,
      {
        city?: string;
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: '/cars/rent',
        params,
      }),
      providesTags: ['Car'],
    }),
    getUsedCars: builder.query<
      RentalCarsResponse,
      {
        city?: string;
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: '/cars/buy',
        params,
      }),
      providesTags: ['Car'],
    }),
    getCarById: builder.query<
      { car: Car & { seller?: { id: string; name: string; email: string; phone: string | null } } },
      string
    >({
      query: (id) => ({
        url: `/cars/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Car' as const, id }],
    }),
    getUnavailableDates: builder.query<{ unavailableDates: string[] }, string>({
      query: (carId) => `/cars/${carId}/unavailable-dates`,
    }),
  }),
});

export const {
  useGetRentalCarsQuery,
  useGetUsedCarsQuery,
  useGetCarByIdQuery,
  useGetUnavailableDatesQuery,
} = carApi;

// Admin API
export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Stats
    getAdminStats: builder.query<{ stats: AdminStats }, void>({
      query: () => '/admin/stats',
      providesTags: ['Admin'],
    }),

    // Cars
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

    // Rentals
    getAdminRentals: builder.query<{ rentals: Rental[] }, { status?: string }>({
      query: (params) => ({
        url: '/admin/rentals',
        params,
      }),
      providesTags: ['Rental'],
    }),
    getAdminEarnings: builder.query<
      { period: string; totalEarnings: number; earnings: Rental[]; count: number },
      { period?: string }
    >({
      query: (params) => ({
        url: '/admin/earnings',
        params,
      }),
      providesTags: ['Admin'],
    }),

    // Users
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

// Admin API hooks
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

// Seller API
export const sellerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get seller's cars
    getSellerCars: builder.query<{ cars: Car[] }, void>({
      query: () => '/seller/cars',
      providesTags: ['Car'],
    }),
    // Get seller stats
    getSellerStats: builder.query<{ stats: SellerStats }, void>({
      query: () => '/seller/stats',
      providesTags: ['Admin'],
    }),
    // Create car for sale
    createSellerCar: builder.mutation<{ car: Car }, CreateCarRequest>({
      query: (data) => ({
        url: '/seller/cars',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Car', 'Admin'],
    }),
    // Update seller car
    updateSellerCar: builder.mutation<{ car: Car }, { id: string; data: Partial<CreateCarRequest> }>({
      query: ({ id, data }) => ({
        url: `/seller/cars/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Car', 'Admin'],
    }),
    // Delete seller car
    deleteSellerCar: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/seller/cars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Car', 'Admin'],
    }),
  }),
});

// Seller API hooks
export const {
  useGetSellerCarsQuery,
  useGetSellerStatsQuery,
  useCreateSellerCarMutation,
  useUpdateSellerCarMutation,
  useDeleteSellerCarMutation,
} = sellerApi;

