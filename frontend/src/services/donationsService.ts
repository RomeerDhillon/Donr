/**
 * Donations Service
 * API calls for donation operations
 */

import api from '../config/api';
import { Donation } from '../types';
import { LocationCoordinates } from './locationService';

/**
 * Create a new donation
 */
export const createDonation = async (
  foodType: string,
  quantity: string,
  expirationDate: Date,
  location?: LocationCoordinates,
  address?: string
): Promise<Donation> => {
  const response = await api.post('/donations', {
    foodType,
    quantity,
    expirationDate: expirationDate.toISOString(),
    location,
    address,
  });
  return response.data.data;
};

/**
 * Get nearby donations
 */
export const getNearbyDonations = async (
  lat?: number,
  lng?: number,
  radius?: number
): Promise<Donation[]> => {
  const params: any = {};
  if (lat !== undefined && lng !== undefined) {
    params.lat = lat;
    params.lng = lng;
  }
  if (radius !== undefined) {
    params.radius = radius;
  }

  const response = await api.get('/donations', { params });
  return response.data.data;
};

/**
 * Claim a donation (Distributor only)
 */
export const claimDonation = async (donationId: string): Promise<Donation> => {
  const response = await api.put(`/donations/${donationId}/claim`);
  return response.data.data;
};

/**
 * Mark donation as distributed (Distributor only)
 */
export const markAsDistributed = async (
  donationId: string
): Promise<Donation> => {
  const response = await api.put(`/donations/${donationId}/distribute`);
  return response.data.data;
};

