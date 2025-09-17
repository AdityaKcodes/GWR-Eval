// client/src/components/NotificationCenter.jsx
import React from 'react';

const NotificationCenter = ({ notifications, onClear }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50px',
      right: '10px',
      width: '350px',
      maxHeight: '300px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      zIndex: 1001,
      overflowY: 'auto'
    }}>
      <div style={{
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h4 style={{ margin: 0 }}>🚨 Alerts ({notifications.length})</h4>
        <button 
          onClick={onClear}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ padding: '10px' }}>
        {notifications.map((notification, index) => (
          <div key={index} style={{
            padding: '8px',
            marginBottom: '8px',
            borderRadius: '4px',
            backgroundColor: notification.isCritical ? '#fff5f5' : '#fffbf0',
            borderLeft: `4px solid ${notification.isCritical ? '#e53e3e' : '#d69e2e'}`
          }}>
            <div style={{ 
              fontWeight: 'bold',
              color: notification.isCritical ? '#e53e3e' : '#d69e2e'
            }}>
              {notification.isCritical ? '🚨 CRITICAL' : '⚠️ WARNING'}: {notification.stationId}
            </div>
            <div>Water Level: {notification.waterLevel?.toFixed(2) || 'N/A'}m</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {new Date(notification.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;