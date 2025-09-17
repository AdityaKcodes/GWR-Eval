// client/src/components/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = ({ station, onClose }) => {
  const [activeTab, setActiveTab] = useState('trends');
  const [trendData, setTrendData] = useState(null);
  const [regionalData, setRegionalData] = useState(null);
  const [seasonalData, setSeasonalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (station) {
      loadTrendData();
    }
  }, [station, token]);

  const loadTrendData = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = token ? { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      } : {};
      
      console.log('Loading trend data for station:', station.stationId);
      const response = await axios.get(
        `http://localhost:5000/api/analytics/trends/${station.stationId}?days=30`,
        config
      );
      
      console.log('Trend data response:', response.data);
      
      if (response.data.success) {
        setTrendData(response.data.data);
      } else {
        setError(response.data.error || 'Failed to load trend data');
      }
    } catch (err) {
      console.error('Error loading trend data:', err);
      if (err.response?.status === 401) {
        setError('Please login again to access analytics');
      } else if (err.response?.status === 404) {
        setError('No data available for this station yet');
        //  mock data for demo
        setTrendData(createMockTrendData(station));
      } else {
        setError('Analytics service temporarily unavailable');
        //  mock data for demo
        setTrendData(createMockTrendData(station));
      }
    }
    setLoading(false);
  };

  const loadRegionalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = token ? { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      } : {};
      
      const response = await axios.get(
        `http://localhost:5000/api/analytics/regional?state=${station.state}`,
        config
      );
      
      if (response.data.success) {
        setRegionalData(response.data.data);
      } else {
        setError(response.data.error || 'Failed to load regional data');
      }
    } catch (err) {
      console.error('Error loading regional data:', err);
      setError('Regional data not available');
      //  mock data for demo
      setRegionalData(createMockRegionalData(station));
    }
    setLoading(false);
  };

  const loadSeasonalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = token ? { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      } : {};
      
      const response = await axios.get(
        `http://localhost:5000/api/analytics/seasonal/${station.stationId}?years=2`,
        config
      );
      
      if (response.data.success) {
        setSeasonalData(response.data.data);
      } else {
        setError(response.data.error || 'Failed to load seasonal data');
      }
    } catch (err) {
      console.error('Error loading seasonal data:', err);
      setError('Seasonal data not available');
      //  mock data for demo
      setSeasonalData(createMockSeasonalData(station));
    }
    setLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    
    switch (tab) {
      case 'regional':
        if (!regionalData) loadRegionalData();
        break;
      case 'seasonal':
        if (!seasonalData) loadSeasonalData();
        break;
      default:
        if (!trendData) loadTrendData();
    }
  };

  //  data functions for demo
  const createMockTrendData = (station) => {
    const readings = [
      { waterLevel: 12.5, timestamp: new Date(Date.now() - 86400000 * 30) },
      { waterLevel: 12.8, timestamp: new Date(Date.now() - 86400000 * 25) },
      { waterLevel: 13.1, timestamp: new Date(Date.now() - 86400000 * 20) },
      { waterLevel: 12.9, timestamp: new Date(Date.now() - 86400000 * 15) },
      { waterLevel: 12.7, timestamp: new Date(Date.now() - 86400000 * 10) },
      { waterLevel: 12.6, timestamp: new Date(Date.now() - 86400000 * 5) },
      { waterLevel: 12.5, timestamp: new Date() }
    ];

    return {
      stationId: station.stationId,
      period: '30 days',
      readingsCount: readings.length,
      trend: {
        direction: 'stable',
        percentageChange: '-0.5%',
        change: '-0.05m'
      },
      statistics: {
        average: 12.75,
        min: 12.50,
        max: 13.10,
        range: 0.60
      },
      readings: readings
    };
  };

  const createMockRegionalData = (station) => {
    return {
      region: station.state,
      totalStations: 8,
      stationsWithData: 6,
      criticalStations: 1,
      warningStations: 2,
      normalStations: 3,
      stations: [
        { stationId: 'DWLR-0142', name: station.name, district: station.district, latestReading: 12.5, status: 'normal' },
        { stationId: 'DWLR-0143', name: 'North Station', district: station.district, latestReading: 14.8, status: 'warning' },
        { stationId: 'DWLR-0144', name: 'South Station', district: station.district, latestReading: 16.2, status: 'critical' },
        { stationId: 'DWLR-0145', name: 'East Station', district: 'Other District', latestReading: 11.9, status: 'normal' }
      ]
    };
  };

  const createMockSeasonalData = (station) => {
    return {
      stationId: station.stationId,
      totalReadings: 45,
      seasonalPatterns: [
        { month: 0, monthName: 'January', average: 13.2, readings: 5 },
        { month: 1, monthName: 'February', average: 12.8, readings: 4 },
        { month: 2, monthName: 'March', average: 12.5, readings: 6 },
        { month: 3, monthName: 'April', average: 12.1, readings: 5 },
        { month: 4, monthName: 'May', average: 11.8, readings: 4 },
        { month: 5, monthName: 'June', average: 12.0, readings: 5 },
        { month: 6, monthName: 'July', average: 12.5, readings: 6 },
        { month: 7, monthName: 'August', average: 12.9, readings: 5 },
        { month: 8, monthName: 'September', average: 13.2, readings: 4 },
        { month: 9, monthName: 'October', average: 13.0, readings: 5 },
        { month: 10, monthName: 'November', average: 12.7, readings: 4 },
        { month: 11, monthName: 'December', average: 12.9, readings: 6 }
      ]
    };
  };

  if (!station) return null;

  const renderTrendTab = () => {
    if (!trendData) return <div>Loading trends...</div>;

    const chartData = {
      labels: trendData.readings.map(r => new Date(r.timestamp).toLocaleDateString()),
      datasets: [
        {
          label: 'Water Level (m)',
          data: trendData.readings.map(r => r.waterLevel),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }
      ]
    };

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Trend Analysis</h4>
            <p><strong>Direction:</strong> {trendData.trend.direction}</p>
            <p><strong>Change:</strong> {trendData.trend.change}</p>
            <p><strong>Percentage:</strong> {trendData.trend.percentageChange}</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Statistics</h4>
            <p><strong>Average:</strong> {trendData.statistics.average.toFixed(2)}m</p>
            <p><strong>Range:</strong> {trendData.statistics.min.toFixed(2)}m - {trendData.statistics.max.toFixed(2)}m</p>
            <p><strong>Readings:</strong> {trendData.readingsCount}</p>
          </div>
        </div>
        
        <div style={{ height: '300px' }}>
          <Line data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Water Level Trend (Last 30 Days)' }
            }
          }} />
        </div>
      </div>
    );
  };

  const renderRegionalTab = () => {
    if (!regionalData) return <div>Loading regional data...</div>;

    return (
      <div>
        <h4>Regional Overview: {regionalData.region}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px', textAlign: 'center' }}>
            <h3>{regionalData.normalStations}</h3>
            <p>Normal Stations</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', textAlign: 'center' }}>
            <h3>{regionalData.warningStations}</h3>
            <p>Warning Stations</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px', textAlign: 'center' }}>
            <h3>{regionalData.criticalStations}</h3>
            <p>Critical Stations</p>
          </div>
        </div>

        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <h5>Station Details:</h5>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Station</th>
                <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Water Level</th>
                <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {regionalData.stations.map((station) => (
                <tr key={station.stationId}>
                  <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{station.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                    {station.latestReading ? `${station.latestReading.toFixed(2)}m` : 'N/A'}
                  </td>
                  <td style={{ 
                    padding: '8px', 
                    border: '1px solid #dee2e6',
                    color: station.status === 'critical' ? '#dc3545' : 
                           station.status === 'warning' ? '#ffc107' : '#28a745'
                  }}>
                    {station.status.toUpperCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSeasonalTab = () => {
    if (!seasonalData) return <div>Loading seasonal patterns...</div>;

    const chartData = {
      labels: seasonalData.seasonalPatterns.map(sp => sp.monthName),
      datasets: [
        {
          label: 'Average Water Level (m)',
          data: seasonalData.seasonalPatterns.map(sp => sp.average),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };

    return (
      <div>
        <h4>Seasonal Patterns ({seasonalData.totalReadings} readings)</h4>
        <div style={{ height: '300px', marginBottom: '20px' }}>
          <Bar data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Monthly Average Water Levels' }
            }
          }} />
        </div>

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <h5>Monthly Details:</h5>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Month</th>
                <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Average</th>
                <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Readings</th>
              </tr>
            </thead>
            <tbody>
              {seasonalData.seasonalPatterns.map((month) => (
                <tr key={month.month}>
                  <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{month.monthName}</td>
                  <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{month.average.toFixed(2)}m</td>
                  <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{month.readings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: 1002,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0 }}>📈 Analytics Dashboard - {station.name}</h3>
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

      <div style={{ borderBottom: '1px solid #dee2e6' }}>
        <div style={{ display: 'flex' }}>
          <button
            onClick={() => handleTabChange('trends')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: activeTab === 'trends' ? '#007bff' : 'transparent',
              color: activeTab === 'trends' ? 'white' : '#007bff',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Trends
          </button>
          <button
            onClick={() => handleTabChange('regional')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: activeTab === 'regional' ? '#007bff' : 'transparent',
              color: activeTab === 'regional' ? 'white' : '#007bff',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Regional
          </button>
          <button
            onClick={() => handleTabChange('seasonal')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: activeTab === 'seasonal' ? '#007bff' : 'transparent',
              color: activeTab === 'seasonal' ? 'white' : '#007bff',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Seasonal
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
        {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading analytics...</div>}
        {error && (
          <div style={{ 
            color: '#dc3545', 
            padding: '10px', 
            textAlign: 'center',
            backgroundColor: '#f8d7da',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        {!loading && !error && (
          <>
            {activeTab === 'trends' && renderTrendTab()}
            {activeTab === 'regional' && renderRegionalTab()}
            {activeTab === 'seasonal' && renderSeasonalTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;