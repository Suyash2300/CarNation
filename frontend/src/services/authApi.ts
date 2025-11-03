import { api } from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<
      { message: string; user: User },
      {
        name?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
        bio?: string;
      }
    >({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update user in localStorage
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...storedUser, ...data.user }));
        } catch (error) {
          console.error('Update profile failed:', error);
        }
      },
    }),
    uploadProfileImage: builder.mutation<
      { message: string; user: User },
      FormData
    >({
      query: (formData) => ({
        url: '/auth/profile/image',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update user in localStorage
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...storedUser, ...data.user }));
        } catch (error) {
          console.error('Upload profile image failed:', error);
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
} = authApi;

