import { api } from './api';

export interface AppConfig {
  razorpayTestMode: boolean;
  environment: string;
}

export const configApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConfig: builder.query<AppConfig, void>({
      query: () => '/config',
    }),
  }),
  overrideExisting: false,
});

export const { useGetConfigQuery } = configApi;

