import { io, Socket } from 'socket.io-client';

// Socket.io connects to the base server URL (not /api)
// Extract base URL from API_URL if it includes /api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Remove /api suffix if present since Socket.io connects to the base server
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

let socket: Socket | null = null;
let previewSocket: Socket | null = null;

export const getSocket = (): Socket | null => {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  // If socket already exists and is connected, return it
  if (socket && socket.connected) {
    return socket;
  }

  // Disconnect existing socket if it exists but is not connected
  if (socket && !socket.connected) {
    socket.disconnect();
    socket = null;
  }

  // Create new socket connection with explicit path
  console.log('[Socket] Connecting to:', SOCKET_URL);
  console.log('[Socket] Token exists:', !!token);
  
  socket = io(SOCKET_URL, {
    path: '/socket.io/', // Explicitly set the Socket.io path
    auth: {
      token,
    },
    transports: ['polling', 'websocket'], // Try polling first, then websocket
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    forceNew: true, // Force new connection
    timeout: 10000, // 10 second timeout
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    // Log more details in development
    if (import.meta.env.DEV) {
      console.error('Socket error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type,
      });
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('Socket reconnection failed');
  });

  return socket;
};

export const getSocketWithToken = (overrideToken: string): Socket => {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const URL = API_BASE.replace(/\/api\/?$/, '');
  if (previewSocket && previewSocket.connected) return previewSocket;
  if (previewSocket && !previewSocket.connected) {
    previewSocket.disconnect();
    previewSocket = null;
  }
  previewSocket = io(URL, {
    path: '/socket.io/',
    auth: { token: overrideToken },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    forceNew: true,
    timeout: 10000,
  });
  return previewSocket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  if (previewSocket) {
    previewSocket.disconnect();
    previewSocket = null;
  }
};

export default getSocket;

