// src/services/apiService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Une erreur est survenue';
      
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
