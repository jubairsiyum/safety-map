'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';

export interface Incident {
  _id: string;
  title: string;
  description: string;
  incidentType: 'robbery' | 'accident' | 'assault' | 'harassment' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  dateTime: string;
  reporterName?: string;
  verified: boolean;
  upvotes: number;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return '#dc2626'; // red-600
    case 'high':
      return '#ea580c'; // orange-600
    case 'medium':
      return '#ca8a04'; // yellow-600
    case 'low':
      return '#16a34a'; // green-600
    default:
      return '#6b7280'; // gray-500
  }
};

const getIncidentIcon = (severity: string) => {
  const color = getSeverityColor(severity);
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const getSelectedIcon = () => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <path fill="#3b82f6" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface MapClickHandlerProps {
  onMapClick: (latlng: LatLng) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

interface SafetyMapProps {
  incidents: Incident[];
  selectedLocation: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
  height?: string;
}

export default function SafetyMap({
  incidents,
  selectedLocation,
  onMapClick,
  height = '500px',
}: SafetyMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const defaultCenter = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : [23.8103, 90.4125]; // Dhaka coordinates

  return (
    <MapContainer
      center={defaultCenter as [number, number]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height, width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler
        onMapClick={(latlng) => {
          onMapClick(latlng.lat, latlng.lng);
        }}
      />

      {/* Selected location marker */}
      {selectedLocation && (
        <Marker
          position={[selectedLocation.lat, selectedLocation.lng]}
          icon={getSelectedIcon()}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Selected Location</p>
              <p className="text-gray-600">
                Lat: {selectedLocation.lat.toFixed(4)}
              </p>
              <p className="text-gray-600">
                Lng: {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Incident markers */}
      {incidents.map((incident) => (
        <Marker
          key={incident._id}
          position={[incident.location.lat, incident.location.lng]}
          icon={getIncidentIcon(incident.severity)}
        >
          <Popup>
            <div className="min-w-[250px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{incident.title}</h3>
                {incident.verified && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getSeverityColor(incident.severity),
                    }}
                  />
                  <span className="text-sm capitalize">{incident.incidentType}</span>
                  <span className="text-sm text-gray-500">
                    • {incident.severity} severity
                  </span>
                </div>

                <p className="text-sm text-gray-700">{incident.description}</p>

                {incident.location.address && (
                  <p className="text-sm text-gray-600">
                    📍 {incident.location.address}
                  </p>
                )}

                <p className="text-sm text-gray-500">
                  🕒 {format(new Date(incident.dateTime), 'MMM d, yyyy HH:mm')}
                </p>

                {incident.reporterName && (
                  <p className="text-sm text-gray-600">
                    👤 Reported by: {incident.reporterName}
                  </p>
                )}

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span>👍</span>
                  <span>{incident.upvotes} confirmations</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
