import { Route, Bus } from './types';

export const DIU_LOCATION = { lat: 23.8768, lng: 90.3204 }; // DSC Campus

export const ROUTES: Route[] = [
  {
    id: 'R1',
    name: 'DSC - Mirpur',
    origin: 'Daffodil Smart City',
    destination: 'Mirpur 10',
    stops: ['DSC', 'Birulia', 'Mirpur 1', 'Mirpur 10'],
    color: '#10b981', // Emerald
  },
  {
    id: 'R2',
    name: 'DSC - Savar',
    origin: 'Daffodil Smart City',
    destination: 'Savar Bus Stand',
    stops: ['DSC', 'Khagan', 'Savar'],
    color: '#3b82f6', // Blue
  },
  {
    id: 'R3',
    name: 'DSC - Mugda',
    origin: 'Daffodil Smart City',
    destination: 'Mugda Stadium',
    stops: ['DSC', 'Gabtoli', 'Asad Gate', 'Mugda'],
    color: '#f59e0b', // Amber
  },
  {
    id: 'R4',
    name: 'DSC - Dhanmondi',
    origin: 'Daffodil Smart City',
    destination: 'Dhanmondi 32',
    stops: ['DSC', 'Shyamoli', 'Dhanmondi 27', 'Dhanmondi 32'],
    color: '#8b5cf6', // Violet
  },
  {
    id: 'R5',
    name: 'DSC - Uttara',
    origin: 'Daffodil Smart City',
    destination: 'Uttara House Building',
    stops: ['DSC', 'Abdullahpur', 'Uttara'],
    color: '#ec4899', // Pink
  },
  {
    id: 'R6',
    name: 'DSC - ECB',
    origin: 'Daffodil Smart City',
    destination: 'ECB Chattar',
    stops: ['DSC', 'Kalshi', 'ECB'],
    color: '#ef4444', // Red
  },
];

// Generate 60 buses as requested
export const MOCK_BUSES: Bus[] = Array.from({ length: 60 }, (_, i) => {
  const routeIndex = i % ROUTES.length;
  const isMoving = Math.random() > 0.3;
  
  // Random dispersion around DSC for demo purposes
  const latOffset = (Math.random() - 0.5) * 0.1;
  const lngOffset = (Math.random() - 0.5) * 0.1;

  return {
    id: `B-${1000 + i}`,
    name: `DIU Bus ${1000 + i}`,
    routeId: ROUTES[routeIndex].id,
    driverName: `Driver ${i + 1}`,
    status: isMoving ? 'active' : 'inactive',
    location: {
      lat: DIU_LOCATION.lat + latOffset,
      lng: DIU_LOCATION.lng + lngOffset,
    },
    speed: isMoving ? Math.floor(Math.random() * 40) + 10 : 0,
    capacity: 50,
    passengers: Math.floor(Math.random() * 45),
    lastUpdated: new Date(),
  };
});
