const DEV_SERVER_BASE = 'http://localhost:3000';
const PROD_SERVER_BASE = 'https://carnation-ns34.onrender.com';

const resolveServerBaseUrl = () => {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }

  // Check if we're running on Vercel (runtime check)
  // Vercel sets VERCEL=1 at build time, or check hostname at runtime
  const isVercel = typeof window !== 'undefined' && 
    (import.meta.env.VERCEL === '1' || window.location.hostname.includes('vercel.app'));
  
  // Use PROD flag OR check if we're on Vercel
  // In Vite: import.meta.env.PROD is true in production builds
  if (import.meta.env.PROD || isVercel) {
    return PROD_SERVER_BASE;
  }

  // Default to dev server for development
  return DEV_SERVER_BASE;
};

export const getServerBaseUrl = (): string => {
  return resolveServerBaseUrl();
};

export const getApiBaseUrl = (): string => {
  // Explicitly check for VITE_API_URL first (set in Vercel)
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:3000/api') {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback to computed URL
  const baseUrl = resolveServerBaseUrl();
  const apiUrl = `${baseUrl.replace(/\/$/, '')}/api`;
  
  // Always log in production to help debug
  if (typeof window !== 'undefined') {
    console.log('[API Config] VITE_API_URL:', import.meta.env.VITE_API_URL || 'not set');
    console.log('[API Config] Hostname:', window.location.hostname);
    console.log('[API Config] Using API URL:', apiUrl);
    console.log('[API Config] PROD mode:', import.meta.env.PROD);
  }
  
  return apiUrl;
};

export const getSocketBaseUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  return resolveServerBaseUrl();
};

