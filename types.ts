
export type Language = 'en' | 'ar';

export type Page = 'Home' | 'My Rides' | 'Create Ride' | 'Chat' | 'Profile' | 'RideDetail';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo: string;
  preferredRideType: 'Motorcycle' | 'ATV' | 'Side-by-Side' | 'Bicycle' | 'Off-road Truck';
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface RideGroup {
  id: string;
  name: string;
  date: string; // ISO string
  description: string;
  destination: {
    name: string;
    mapsLink: string;
  };
  createdBy: string; // User ID
  rideStatus: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  participants: string[]; // Array of User IDs
  reminder: 'none' | '1h' | '24h';
  ratings?: { userId: string; rating: number }[];
  distance?: number; // in km
  duration?: string; // e.g., "2h 30m"
}

export interface Message {
  id: string;
  rideId: string;
  senderId: string;
  message: string;
  timestamp: number;
}

export interface DestinationInfo {
  name: string;
  description: string;
  mapsLink: string;
}