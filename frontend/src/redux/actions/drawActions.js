// src/redux/actions/drawActions.js
import * as types from '../types';
import apiClient from '../../services/apiService';

// Fonction pour récupérer les derniers tirages
export const fetchLatestDraws = () => async (dispatch) => {
  dispatch({ type: types.FETCH_LATEST_DRAWS_REQUEST });
  
  try {
    // Simuler une réponse pour le développement
    // Dans une application réelle, vous feriez un appel API ici
    // const response = await apiClient.get('/draws/latest');
    
    // Données de tirage simulées pour le développement
    const mockLatestDraw = {
      id: '1',
      date: new Date().toISOString(),
      numbers: [5, 15, 23, 32, 45],
      stars: [2, 7]
    };
    
    setTimeout(() => {
      dispatch({
        type: types.FETCH_LATEST_DRAWS_SUCCESS,
        payload: mockLatestDraw
      });
    }, 1000); // Simule un délai de réponse
  } catch (error) {
    dispatch({
      type: types.FETCH_LATEST_DRAWS_FAILURE,
      payload: error.message || 'Une erreur est survenue lors de la récupération des tirages'
    });
  }
};

// Fonction pour récupérer l'historique des tirages
export const fetchDrawHistory = (page = 1, limit = 10) => async (dispatch) => {
  dispatch({ type: types.FETCH_DRAW_HISTORY_REQUEST });
  
  try {
    // Simuler une réponse pour le développement
    // Dans une application réelle, vous feriez un appel API ici
    // const response = await apiClient.get(`/draws?page=${page}&limit=${limit}`);
    
    // Données d'historique simulées pour le développement
    const mockDrawHistory = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(), // i semaines en arrière
      numbers: [
        Math.floor(Math.random() * 50) + 1,
        Math.floor(Math.random() * 50) + 1,
        Math.floor(Math.random() * 50) + 1,
        Math.floor(Math.random() * 50) + 1,
        Math.floor(Math.random() * 50) + 1
      ].sort((a, b) => a - b),
      stars: [
        Math.floor(Math.random() * 12) + 1,
        Math.floor(Math.random() * 12) + 1
      ].sort((a, b) => a - b)
    }));
    
    setTimeout(() => {
      dispatch({
        type: types.FETCH_DRAW_HISTORY_SUCCESS,
        payload: {
          draws: mockDrawHistory,
          pagination: {
            page,
            limit,
            total: 100 // Nombre total simulé de tirages
          }
        }
      });
    }, 1000); // Simule un délai de réponse
  } catch (error) {
    dispatch({
      type: types.FETCH_DRAW_HISTORY_FAILURE,
      payload: error.message || 'Une erreur est survenue lors de la récupération de l\'historique'
    });
  }
};
