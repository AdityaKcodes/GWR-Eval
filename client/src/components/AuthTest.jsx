// client/src/components/AuthTest.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthTest = () => {
  const { user, token, logout } = useAuth();

  const testAuth = async () => {
    try {
      //  public endpoint first
      const publicResponse = await fetch('http://localhost:5000/api/public-test');
      const publicData = await publicResponse.json();
      console.log('Public test:', publicData);

      if (token) {
        //  protected endpoint
        const response = await fetch('http://localhost:5000/api/private-test', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Auth test successful:', data);
          alert('Authentication is working!');
        } else {
          console.error('Auth test failed:', response.status);
          alert('Authentication failed: ' + response.status);
        }
      } else {
        alert('No token available');
      }
    } catch (error) {
      console.error('Auth test error:', error);
      alert('Authentication error: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', background: 'white', color: 'black' }}>
      <h2>Authentication Test</h2>
      <p>User: {user ? user.username || user.email : 'Not logged in'}</p>
      <p>Token: {token ? 'Present' : 'Missing'}</p>
      <p>Role: {user ? user.role : 'N/A'}</p>
      
      <button onClick={testAuth} style={{ margin: '10px', padding: '10px' }}>
        Test Authentication
      </button>
      
      <button onClick={logout} style={{ margin: '10px', padding: '10px', background: 'red', color: 'white' }}>
        Logout
      </button>
    </div>
  );
};

export default AuthTest;