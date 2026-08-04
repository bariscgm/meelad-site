/**
 * Socket.IO Client Singleton
 * 
 * Import this wherever you need real-time updates.
 * Usage: import { socket } from '../config/socket.js';
 */
import { io } from 'socket.io-client';
import { API_URL } from './api.js';

export const socket = io(API_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

// Debug logging (remove in production if noisy)
socket.on('connect', () => {
  console.log('🔌 Socket.IO connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket.IO disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.warn('🔌 Socket.IO connection error:', err.message);
});
