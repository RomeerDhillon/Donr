/**
 * User Service
 * API calls for user operations
 */

import api from '../config/api';
import { User, UserRole } from '../types';
import { LocationCoordinates } from './locationService';

/**
 * Create user profile
 */
export const createUserProfile = async (
  name: string,
  role: UserRole,
  location?: LocationCoordinates,
  fcmToken?: string
): Promise<User> => {
  const response = await api.post('/users', {
    name,
    role,
    location,
    fcmToken,
  });
  return response.data.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/users/me');
  return response.data.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  updates: {
    name?: string;
    location?: LocationCoordinates;
    fcmToken?: string;
  }
): Promise<User> => {
  const response = await api.put('/users/me', updates);
  return response.data.data;
};

