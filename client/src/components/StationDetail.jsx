// client/src/components/StationDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WaterLevelChart from './WaterLevelChart';

const StationDetail = ({ station, onClose }) => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24');

  
  const formatValue = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return typeof value === 'number' ? value.toFixed(2) : value;
  };

  useEffect(() => {
    const fetchReadings = async () => {
      if (!station || !station.stationId) {
        setError('Invalid station data');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `http://localhost:5000/api/readings/${station.stationId}?hours=${timeRange}`
        );
        setReadings(response.data.data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load historical data. Please try again.');
        setLoading(false);
        console.error('Error fetching readings:', err);
      }
    };

    fetchReadings();
  }, [station, timeRange]);

  if (!station) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '80vh',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.4rem' }}>{station.name || 'Unknown Station'}</h2>
        <button 
          onClick={onClose}
          style={{ 
            background: '#ff4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* Station Info */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>Station ID:</strong> {station.stationId || 'N/A'}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Location:</strong> {station.district || 'Unknown'}, {station.state || 'Unknown State'}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Baseline Level:</strong> {formatValue(station.baselineValue)}m
        </div>
        <div>
          <strong>Latest Reading:</strong> {formatValue(station.latestReading)}m
        </div>
      </div>

      {/* Time Range Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="timeRange" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Time Range:
        </label>
        <select 
          id="timeRange"
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '6px', 
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        >
          <option value="24">Last 24 Hours</option>
          <option value="72">Last 3 Days</option>
          <option value="168">Last Week</option>
          <option value="720">Last 30 Days</option>
        </select>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          Loading historical data...
        </div>
      )}
      
      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffecec', 
          color: '#e74c3c', 
          borderRadius: '6px',
          marginBottom: '15px',
          border: '1px solid #f5c6cb'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Chart */}
      {!loading && !error && readings.length > 0 && (
        <WaterLevelChart readings={readings} stationName={station.name} />
      )}
      
      {!loading && !error && readings.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
          No historical data available for this time range.
        </div>
      )}
    </div>
  );
};

export default StationDetail;