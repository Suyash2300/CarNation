import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiBaseUrl } from '../utils/env';

const API_BASE_URL = getApiBaseUrl();

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Car', 'Rental', 'Purchase', 'Admin', 'Conversations', 'Conversation', 'Messages', 'Deals', 'PlatformFees', 'Payment'],
  // Performance optimizations: cache configuration
  keepUnusedDataFor: 60, // Keep unused data for 60 seconds (1 minute)
  refetchOnMountOrArgChange: false, // Don't refetch on mount if data exists in cache
  refetchOnFocus: false, // Don't refetch when window regains focus (prevents unnecessary requests)
  refetchOnReconnect: true, // Refetch on reconnect (network recovery)
  endpoints: () => ({}),
});

