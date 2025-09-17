// client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  async get(endpoint, config = {}) {
    try {
      return await axios.get(`${API_BASE_URL}${endpoint}`, config);
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  async post(endpoint, data, config = {}) {
    try {
      return await axios.post(`${API_BASE_URL}${endpoint}`, data, config);
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }
};