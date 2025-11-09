const DEV_SERVER_BASE = 'http://localhost:3000';
const PROD_SERVER_BASE = 'https://carnation-ns34.onrender.com';

const resolveServerBaseUrl = () => {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }

  // Use PROD flag (more reliable than MODE)
  // In Vite: import.meta.env.PROD is true in production builds
  if (import.meta.env.PROD) {
    return PROD_SERVER_BASE;
  }

  // Default to dev server for development
  return DEV_SERVER_BASE;
};

export const getServerBaseUrl = (): string => {
  return resolveServerBaseUrl();
};

export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const baseUrl = resolveServerBaseUrl();
  return `${baseUrl.replace(/\/$/, '')}/api`;
};

export const getSocketBaseUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  return resolveServerBaseUrl();
};

