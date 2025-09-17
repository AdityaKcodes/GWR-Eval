// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jal-darpan-token'));
  const [loading, setLoading] = useState(true);

  //  axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('jal-darpan-token', token);
      
      // token if available
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.userId,
          username: payload.username || payload.email,
          email: payload.email,
          role: payload.role || 'user'
        });
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('jal-darpan-token');
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      if (response.data.success) {
        const { token: newToken, user } = response.data;
        setToken(newToken);
        setUser(user);
        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please make sure the server is running.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      if (response.data.success) {
        const { token: newToken, user } = response.data;
        setToken(newToken);
        setUser(user);
        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please make sure the server is running.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    register,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;