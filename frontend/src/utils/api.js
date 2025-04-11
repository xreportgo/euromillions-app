// frontend/src/utils/api.js - Correction

import axios from 'axios';

// Création d'une instance axios avec configuration de base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteur pour détecter les erreurs et les données suspectes
api.interceptors.response.use(
  response => {
    const url = response.config.url;
    const data = response.data;
    
    // Vérifier les données des tirages
    if (url.includes('/draws/latest') || url.includes('/draws/')) {
      if (data && data.date) {
        const drawDate = new Date(data.date);
        const today = new Date();
        
        // Vérifier si la date du tirage est dans le futur (données fictives)
        if (drawDate > today) {
          console.error('⚠️ Données suspectes détectées: Date dans le futur:', data);
          throw new Error('Données invalides détectées: date dans le futur');
        }
      }
    }
    
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

// API des tirages
export const drawsApi = {
  getAll: (page = 1, limit = 10) => api.get(`/draws?page=${page}&limit=${limit}`),
  getLatest: () => api.get('/draws/latest'),
  getById: (id) => api.get(`/draws/${id}`),
  getByDate: (date) => api.get(`/draws/date/${date}`)
};

// API des prédictions
export const predictionsApi = {
  generate: (method = 'frequency') => api.get(`/predictions?method=${method}`)
};

// API des statistiques
export const statsApi = {
  getGeneral: () => api.get('/stats'),
  getNumberFrequencies: () => api.get('/stats/numbers'),
  getStarFrequencies: () => api.get('/stats/stars'),
  getIntervalStats: () => api.get('/stats/intervals')
};

export default {
  draws: drawsApi,
  predictions: predictionsApi,
  stats: statsApi
};
