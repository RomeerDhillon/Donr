/**
 * Location Service
 * Handles geolocation permissions and location retrieval
 */

import * as Location from 'expo-location';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

/**
 * Request location permissions and get current location
 * @returns Promise with location coordinates
 */
export const getCurrentLocation = async (): Promise<LocationCoordinates> => {
  try {
    // Request permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};

/**
 * Check if location permissions are granted
 * @returns Promise<boolean>
 */
export const hasLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
};

