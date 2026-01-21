import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, Location } from '../types';
import { DIU_LOCATION } from '../constants';

// Fix for default marker icons in React Leaflet
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Custom Bus Icon
const BusIcon = L.divIcon({
  className: 'custom-bus-icon',
  html: `<div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

interface MapViewProps {
  buses: Bus[];
  userLocation?: Location;
}

const RecenterBtn: React.FC<{ location: Location }> = ({ location }) => {
  const map = useMap();
  const onClick = () => {
    map.flyTo([location.lat, location.lng], 15);
  };

  return (
    <button
      onClick={onClick}
      className="absolute bottom-20 right-4 z-[400] bg-white p-3 rounded-full shadow-lg text-slate-700 hover:text-emerald-600 transition-colors"
      title="Recenter Map"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    </button>
  );
};

export const MapView: React.FC<MapViewProps> = ({ buses, userLocation }) => {
  const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [DIU_LOCATION.lat, DIU_LOCATION.lng];

  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* University Marker */}
      <Marker position={[DIU_LOCATION.lat, DIU_LOCATION.lng]} icon={DefaultIcon}>
        <Popup>
          <div className="font-bold text-center">
            DIU Smart City<br/>
            <span className="text-xs text-slate-500">Main Campus</span>
          </div>
        </Popup>
      </Marker>

      {/* Bus Markers */}
      {buses.filter(b => b.status === 'active').map((bus) => (
        <Marker 
          key={bus.id} 
          position={[bus.location.lat, bus.location.lng]} 
          icon={BusIcon}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-emerald-700">{bus.name}</h3>
              <p className="text-xs font-semibold text-slate-600">Route: {bus.routeId}</p>
              <p className="text-xs">Speed: {bus.speed} km/h</p>
              <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full" 
                  style={{ width: `${(bus.passengers / bus.capacity) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-right mt-1 text-slate-400">
                {bus.passengers}/{bus.capacity} seats
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* User Location Marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={DefaultIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      <RecenterBtn location={{lat: DIU_LOCATION.lat, lng: DIU_LOCATION.lng}} />
    </MapContainer>
  );
};
