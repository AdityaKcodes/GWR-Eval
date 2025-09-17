// client/src/components/SimpleMap.jsx
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

const SimpleMap = () => {
  const centerOfIndia = [20.5937, 78.9629];

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      border: '3px solid blue', // Visual border to see the container
      backgroundColor: 'lightyellow' // Fallback background
    }}>
      <MapContainer
        center={centerOfIndia}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};

export default SimpleMap;