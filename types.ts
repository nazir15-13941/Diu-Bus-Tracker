export type UserRole = 'student' | 'driver' | 'admin';

export interface Location {
  lat: number;
  lng: number;
}

export interface Bus {
  id: string;
  name: string;
  routeId: string;
  driverName?: string;
  status: 'active' | 'inactive' | 'maintenance';
  location: Location;
  speed: number; // km/h
  capacity: number;
  passengers: number;
  lastUpdated: Date;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  stops: string[];
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
