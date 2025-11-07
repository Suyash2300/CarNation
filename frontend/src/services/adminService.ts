import axiosInstance from './axios';

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
  city?: string;
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
  city?: string;
}

// Admin API Services
export const adminService = {
  // Stats
  getStats: async (): Promise<{ stats: AdminStats }> => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  },

  // Cars
  getCars: async (): Promise<{ cars: Car[] }> => {
    const response = await axiosInstance.get('/admin/cars');
    return response.data;
  },

  createCar: async (data: CreateCarRequest): Promise<{ car: Car }> => {
    const response = await axiosInstance.post('/admin/cars', data);
    return response.data;
  },

  updateCar: async (id: string, data: Partial<CreateCarRequest>): Promise<{ car: Car }> => {
    const response = await axiosInstance.put(`/admin/cars/${id}`, data);
    return response.data;
  },

  deleteCar: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/admin/cars/${id}`);
    return response.data;
  },

  // Rentals
  getRentals: async (params?: { status?: string }): Promise<{ rentals: Rental[] }> => {
    const response = await axiosInstance.get('/admin/rentals', { params });
    return response.data;
  },

  getEarnings: async (params?: { period?: string }): Promise<{ period: string; totalEarnings: number; earnings: any[]; count: number }> => {
    const response = await axiosInstance.get('/admin/earnings', { params });
    return response.data;
  },

  // Users
  getPendingVerifications: async (): Promise<{ users: User[] }> => {
    const response = await axiosInstance.get('/admin/users/pending-verification');
    return response.data;
  },

  verifyAadhaar: async (userId: string): Promise<{ user: User; message: string }> => {
    const response = await axiosInstance.post(`/admin/users/${userId}/verify-aadhaar`);
    return response.data;
  },

  getUsers: async (params?: { role?: string; verified?: string }): Promise<{ users: User[] }> => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },
};

