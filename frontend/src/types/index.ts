/**
 * TypeScript Type Definitions
 */

export type UserRole = 'donator' | 'distributor' | 'acceptor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: {
    lat: number;
    lng: number;
  };
  fcmToken?: string;
  createdAt?: any;
}

export interface Donation {
  id: string;
  donatorId: string;
  distributorId?: string;
  foodType: string;
  quantity: string;
  expirationDate: any;
  status: 'available' | 'claimed' | 'distributed';
  location: {
    lat: number;
    lng: number;
  };
  distance?: number;
  createdAt?: any;
}

export interface Location {
  lat: number;
  lng: number;
}

