// client/src/components/MainApp.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Map from './Map';

const MainApp = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <header style={{ 
        padding: '1rem 2rem', 
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Jal Darpan 🇮🇳</h1>
          <p style={{ margin: '0.5rem 0 0 0' }}>Real-Time Groundwater Monitoring</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '14px' }}>
            Welcome, <strong>{user?.username || user?.email || 'User'}</strong> ({user?.role || 'user'})
          </span>
          <button
            onClick={logout}
            style={{
              padding: '8px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', position: 'relative' }}>
        <Map />
      </main>
    </>
  );
};

export default MainApp;