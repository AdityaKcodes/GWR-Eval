// client/src/components/DebugChart.jsx
import React from 'react';
import WaterLevelChart from './WaterLevelChart';

const DebugChart = () => {
  //  data for charts
  const testReadings = [
    { waterLevel: 12.5, timestamp: new Date(Date.now() - 3600000 * 5) },
    { waterLevel: 12.8, timestamp: new Date(Date.now() - 3600000 * 4) },
    { waterLevel: 13.1, timestamp: new Date(Date.now() - 3600000 * 3) },
    { waterLevel: 12.9, timestamp: new Date(Date.now() - 3600000 * 2) },
    { waterLevel: 12.7, timestamp: new Date(Date.now() - 3600000 * 1) },
    { waterLevel: 12.6, timestamp: new Date() }
  ];

  return (
    <div style={{ padding: '20px', background: 'white', margin: '20px', borderRadius: '8px' }}>
      <h3>📊 Chart Debug Test</h3>
      <WaterLevelChart readings={testReadings} stationName="Test Station" />
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f8ff', borderRadius: '4px' }}>
        <strong>If you see a chart above, charting is working!</strong>
        <p>If not, check that react-chartjs-2 and chart.js are installed.</p>
      </div>
    </div>
  );
};

export default DebugChart;