// client/src/components/WaterLevelChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const WaterLevelChart = ({ readings, stationName }) => {
  
  const validReadings = readings?.filter(reading => 
    reading && 
    reading.waterLevel !== null && 
    reading.waterLevel !== undefined &&
    reading.timestamp
  ) || [];

  if (validReadings.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px', 
        color: '#666',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        📊 No data available for chart
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        label: 'Water Level (meters)',
        data: validReadings.map(reading => ({
          x: new Date(reading.timestamp),
          y: reading.waterLevel
        })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75, 192, 192)'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Water Level - ${stationName || 'Station'}`,
        font: {
          size: 16,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Water Level: ${context.parsed.y.toFixed(2)}m`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          tooltipFormat: 'MMM dd, yyyy HH:mm'
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Water Level (meters)'
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div style={{ width: '100%', height: '300px', marginTop: '15px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default WaterLevelChart;