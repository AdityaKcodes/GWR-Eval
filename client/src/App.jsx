// client/src/App.jsx 
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import MainApp from './components/MainApp';
import DebugTest from './components/DebugTest';
import 'leaflet/dist/leaflet.css';
import './App.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }
  if (connectionError) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#ffecec',
        color: '#e74c3c',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2>🚫 Connection Error</h2>
        <p>Cannot connect to the server. Please make sure:</p>
        <ul style={{ textAlign: 'left', maxWidth: '400px' }}>
          <li>The backend server is running on port 5000</li>
          <li>You have a stable internet connection</li>
          <li>No browser extensions are blocking the requests</li>
        </ul>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return isRegistering ? (
      <Register onSwitchToLogin={() => setIsRegistering(false)} />
    ) : (
      <Login onSwitchToRegister={() => setIsRegistering(true)} />
    );
  }

  return <MainApp />;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;