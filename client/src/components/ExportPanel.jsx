// client/src/components/ExportPanel.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ExportPanel = ({ station, onClose }) => {
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('7');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  if (!station) return null;

  const getDateRangeValues = () => {
    const end = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '1': start.setDate(end.getDate() - 1); break;
      case '7': start.setDate(end.getDate() - 7); break;
      case '30': start.setMonth(end.getMonth() - 1); break;
      case '90': start.setMonth(end.getMonth() - 3); break;
      case 'custom': 
        return { 
          start: customStart ? new Date(customStart) : null, 
          end: customEnd ? new Date(customEnd) : null 
        };
      default: start.setDate(end.getDate() - 7);
    }

    return { start, end };
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError('');
    
    try {
      const { start, end } = getDateRangeValues();
      
      const params = new URLSearchParams();
      if (start) params.append('startDate', start.toISOString());
      if (end) params.append('endDate', end.toISOString());
      params.append('limit', '100');

      let url;
      switch (format) {
        case 'csv':
          url = `http://localhost:5000/api/export/readings/${station.stationId}/csv?${params}`;
          break;
        case 'json':
          url = `http://localhost:5000/api/export/readings/${station.stationId}/json?${params}`;
          break;
        case 'excel':
          url = `http://localhost:5000/api/export/readings/${station.stationId}/excel?${params}`;
          break;
        default:
          return;
      }

      // Add authorization 
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      //  endpoint exists 
      try {
        const testResponse = await axios.get(url, config);
        
        
        window.open(url, '_blank');
        
      } catch (testError) {
        console.error('Export endpoint failed:', testError);
        setError('Export feature is not available yet. Please try the test export.');
        
        // Fallback 
        window.open('http://localhost:5000/api/export/test', '_blank');
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      setError('Export failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '400px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: 1002
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>📊 Export Data</h3>
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ✕
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Station: {station.name}
        </label>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ID: {station.stationId}
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Format:</label>
        <select 
          value={format} 
          onChange={(e) => setFormat(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="excel">Excel</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Time Range:</label>
        <select 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="1">Last 24 Hours</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 3 Months</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {dateRange === 'custom' && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Start Date:</label>
              <input
                type="datetime-local"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>End Date:</label>
              <input
                type="datetime-local"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={handleExport}
        disabled={isExporting}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isExporting ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {isExporting ? '⏳ Exporting...' : '⬇️ Download Data'}
      </button>

      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        Exports include water level readings with timestamps. Maximum 100 records per export.
      </p>
    </div>
  );
};

export default ExportPanel;