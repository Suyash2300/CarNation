import { api } from './api';

export interface ShopLocation {
  id: string;
  city: string;
  addressLine: string;
  landmark?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  hoursStart: string;
  hoursEnd: string;
  phone?: string;
  isActive: boolean;
}

export const shopApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getShopsByCity: builder.query<{ shops: ShopLocation[] }, { city?: string }>({
      query: ({ city }) => ({ url: `/shops`, params: city ? { city } : undefined }),
      providesTags: ['Admin'],
    }),
    createShop: builder.mutation<{ shop: ShopLocation }, Partial<ShopLocation>>({
      query: (body) => ({ url: '/shops', method: 'POST', body }),
      invalidatesTags: ['Admin'],
    }),
    updateShop: builder.mutation<{ shop: ShopLocation }, { id: string; data: Partial<ShopLocation> }>({
      query: ({ id, data }) => ({ url: `/shops/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Admin'],
    }),
    deleteShop: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/shops/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const { useGetShopsByCityQuery, useCreateShopMutation, useUpdateShopMutation, useDeleteShopMutation } = shopApi;


