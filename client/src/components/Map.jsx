// client/src/components/Map.jsx 
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import io from 'socket.io-client';
import StationDetail from './StationDetail';
import NotificationCenter from './NotificationCenter';
import ExportPanel from './ExportPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import { alertSound } from '../utils/alertSound';
import { useAuth } from '../context/AuthContext';


import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const centerOfIndia = [20.5937, 78.9629];

const formatWaterLevel = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'No data available';
  }
  return `${value.toFixed(2)}m`;
};

const isWithinIndia = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }
  
  // Coordinates from database are in [lng, lat] format
  const [lng, lat] = coordinates;
  return (
    lat >= 8.0 && lat <= 35.0 &&   // Latitude range (South to North)
    lng >= 68.0 && lng <= 97.0     // Longitude range (West to East)
  );
};

// Function to determine color based on water level and baseline
const getMarkerColor = (latestReading, baselineValue) => {
  
  if (!latestReading || !baselineValue) return 'gray';
  
  
  if (latestReading > baselineValue + 2) return 'red';     // Clearly higher
  if (latestReading > baselineValue + 1) return 'orange';  // Slightly higher
  if (latestReading < baselineValue - 1) return 'blue';    // Lower 
  return 'green';                                          // Normal
};


const createCustomIcon = (color) => {
  let backgroundColor;
  
  switch(color) {
    case 'red':
      backgroundColor = '#e74c3c';
      break;
    case 'orange':
      backgroundColor = '#f39c12';
      break;
    case 'green':
      backgroundColor = '#27ae60';
      break;
    case 'gray':
      backgroundColor = '#95a5a6'; 
      break;
    default:
      backgroundColor = '#95a5a6'; 
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${backgroundColor};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background-color: white;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          opacity: 0.8;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const Map = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [exportStation, setExportStation] = useState(null);
  const [analyticsStation, setAnalyticsStation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);
  const { token } = useAuth();

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    // Initialize Socket.io 
    socketRef.current = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socketRef.current.on('new-reading', (data) => {
      console.log('📡 Received new reading:', data);
      
      // Update stations
      setStations(prevStations => 
        prevStations.map(station => 
          station.stationId === data.stationId 
            ? { ...station, latestReading: data.waterLevel }
            : station
        )
      );

      // notification if critical or warning
      if (data.isCritical || data.isWarning) {
        const newNotification = {
          stationId: data.stationId,
          waterLevel: data.waterLevel,
          timestamp: data.timestamp,
          isCritical: data.isCritical,
          isWarning: data.isWarning
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);

        //alert sound
        if (data.isCritical) {
          alertSound.playAlert(true);
        } else if (data.isWarning) {
          alertSound.playAlert(false);
        }
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const config = token ? {
          headers: { Authorization: `Bearer ${token}` }
        } : {};
        
        
        const response = await axios.get('http://localhost:5000/api/stations-with-status', config);
        
        
        const indianStations = response.data.data
          .filter(station => 
            station.location && 
            station.location.coordinates &&
            isWithinIndia(station.location.coordinates)
          )
          .map(station => ({
            ...station,
            
            location: {
              ...station.location,
              coordinates: [station.location.coordinates[1], station.location.coordinates[0]]
            }
          }));
        
        
        console.log('📍 Stations loaded:', indianStations.map(s => ({
          id: s.stationId,
          latest: s.latestReading,
          baseline: s.baselineValue,
          color: getMarkerColor(s.latestReading, s.baselineValue)
        })));
        
        setStations(indianStations);
        setLoading(false);
        
      } catch (err) {
        console.error('Failed to load station data:', err);
        setError('Failed to load station data. Using demo data.');
        
        // Final fallback: manual test
        const testStations = [
          {
            _id: '1',
            stationId: 'DWLR-0001',
            name: 'Mumbai Central Station',
            location: { coordinates: [19.0760, 72.8777] }, // [lat, lng] for Leaflet
            state: 'Maharashtra',
            district: 'Mumbai',
            baselineValue: 12.5,
            latestReading: 16.5 // red 
          },
          {
            _id: '2',
            stationId: 'DWLR-0002',
            name: 'Delhi Monitoring Station',
            location: { coordinates: [28.7041, 77.1025] }, // [lat, lng] for Leaflet
            state: 'Delhi',
            district: 'New Delhi',
            baselineValue: 15.2,
            latestReading: 17.0 // orange 
          },
          {
            _id: '3',
            stationId: 'DWLR-0003',
            name: 'Chennai Test Station',
            location: { coordinates: [13.0827, 80.2707] }, // [lat, lng] for Leaflet
            state: 'Tamil Nadu',
            district: 'Chennai',
            baselineValue: 10.0,
            latestReading: 10.5 //  green 
          }
        ];
        
        setStations(testStations);
        setLoading(false);
      }
    };

    fetchStations();
  }, [token]);

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      fontSize: '1.2rem',
      color: '#2c3e50'
    }}>
      Loading map... 🗺️
    </div>
  );
  
  if (error) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      fontSize: '1.2rem',
      color: '#e74c3c'
    }}>
      {error}
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Real-time status indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        padding: '8px 12px',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '14px',
        backgroundColor: isConnected ? '#27ae60' : '#e74c3c',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {isConnected ? '🟢 LIVE' : '🔴 OFFLINE'} - Real-time updates
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        notifications={notifications}
        onClear={clearNotifications}
      />

      {/* Station Detail Panel */}
      {selectedStation && (
        <StationDetail 
          station={selectedStation} 
          onClose={() => setSelectedStation(null)} 
        />
      )}

      {/* Export Panel */}
      {exportStation && (
        <ExportPanel 
          station={exportStation} 
          onClose={() => setExportStation(null)} 
        />
      )}

      {/* Analytics Dashboard */}
      {analyticsStation && (
        <AnalyticsDashboard 
          station={analyticsStation} 
          onClose={() => setAnalyticsStation(null)} 
        />
      )}
      
      <MapContainer
        center={centerOfIndia}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {stations.map((station) => {
          const color = getMarkerColor(station.latestReading, station.baselineValue);
          const customIcon = createCustomIcon(color);

          return (
            <Marker
              key={station._id || station.stationId}
              position={station.location.coordinates} // [lat, lng] format
              icon={customIcon}
              eventHandlers={{ click: () => setSelectedStation(station) }}
            >
              <Popup>
                <div style={{ minWidth: '250px', padding: '5px' }}>
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    color: '#2c3e50',
                    borderBottom: '2px solid #3498db',
                    paddingBottom: '8px',
                    fontSize: '1.2rem'
                  }}>
                    {station.name}
                  </h3>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '5px 0' }}><strong>ID:</strong> {station.stationId}</p>
                    <p style={{ margin: '5px 0' }}><strong>Location:</strong> {station.district}, {station.state}</p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Latest Reading:</strong> {formatWaterLevel(station.latestReading)}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Baseline:</strong> {formatWaterLevel(station.baselineValue)}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Status:</strong>
                      <span style={{ 
                        color: color === 'red' ? '#e74c3c' : 
                              color === 'orange' ? '#f39c12' : '#27ae60',
                        fontWeight: 'bold', 
                        marginLeft: '8px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: color === 'red' ? '#ffecec' : 
                                      color === 'orange' ? '#fff5e6' : '#f0fff4'
                      }}>
                        {color === 'red' ? 'CRITICAL' : color === 'orange' ? 'WARNING' : 'GOOD'}
                      </span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button 
                      style={{ 
                        padding: '10px',
                        fontSize: '0.9rem',
                        borderRadius: '6px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => setAnalyticsStation(station)}
                    >
                      📊 View Analytics
                    </button>
                    <button 
                      style={{ 
                        padding: '10px',
                        fontSize: '0.9rem',
                        borderRadius: '6px',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => setExportStation(station)}
                    >
                      📤 Export Data
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;