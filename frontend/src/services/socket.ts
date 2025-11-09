import { io, Socket } from 'socket.io-client';
import { getServerBaseUrl } from '../utils/env';

// Socket.io connects to the base server URL (not /api)
const SERVER_BASE_URL = getServerBaseUrl();
const SOCKET_URL = SERVER_BASE_URL.replace(/\/$/, '');

type SocketError = Error & {
  description?: string;
  context?: unknown;
  type?: string;
};

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
  if (import.meta.env.DEV) {
    console.log('[Socket] Connecting to:', SOCKET_URL);
    console.log('[Socket] Token exists:', !!token);
  }
  
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
    if (import.meta.env.DEV) {
      console.log('Socket connected:', socket?.id);
    }
  });

  socket.on('disconnect', (reason) => {
    if (import.meta.env.DEV) {
      console.log('Socket disconnected:', reason);
    }
  });

  socket.on('connect_error', (error: SocketError) => {
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
    if (import.meta.env.DEV) {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    }
  });

  socket.on('reconnect_error', (error) => {
    if (import.meta.env.DEV) {
      console.error('Socket reconnection error:', error);
    }
  });

  socket.on('reconnect_failed', () => {
    if (import.meta.env.DEV) {
      console.error('Socket reconnection failed');
    }
  });

  return socket;
};

export const getSocketWithToken = (overrideToken: string): Socket => {
  const URL = SOCKET_URL;
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

