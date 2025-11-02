import { Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { ExtendedError } from 'socket.io/dist/namespace';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
  role?: string;
}

export const socketAuth = async (
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void
) => {
  try {
    // Try to get token from auth object first, then from headers
    const token = socket.handshake.auth?.token || 
                  socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
                  socket.handshake.query?.token as string;

    console.log('[Socket Auth] Attempting authentication...');
    console.log('[Socket Auth] Has auth.token:', !!socket.handshake.auth?.token);
    console.log('[Socket Auth] Has auth header:', !!socket.handshake.headers?.authorization);

    if (!token) {
      console.error('[Socket Auth] No token provided');
      const err = new Error('Authentication error: No token provided') as ExtendedError;
      err.data = { message: 'No token provided' };
      return next(err);
    }

    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      socket.email = decoded.email;
      socket.role = decoded.role;

      console.log('[Socket Auth] Authentication successful for user:', decoded.userId);
      next();
    } catch (verifyError) {
      console.error('[Socket Auth] Token verification failed:', verifyError);
      const err = new Error('Authentication error: Invalid token') as ExtendedError;
      err.data = { message: 'Invalid or expired token' };
      return next(err);
    }
  } catch (error) {
    console.error('[Socket Auth] Unexpected error:', error);
    const err = new Error('Authentication error: Unexpected error') as ExtendedError;
    err.data = { message: 'Authentication failed' };
    next(err);
  }
};

