// src/redux/actions/statActions.js
import * as types from '../types';
import apiClient from '../../services/apiService';

// Fonction pour récupérer les statistiques générales
export const fetchStatistics = () => async (dispatch) => {
  dispatch({ type: types.FETCH_STATISTICS_REQUEST });
  
  try {
    // Simuler une réponse pour le développement
    // Dans une application réelle, vous feriez un appel API ici
    // const response = await apiClient.get('/stats');
    
    // Données de statistiques simulées pour le développement
    const mockStatistics = {
      numberFrequencies: Array.from({ length: 50 }, (_, i) => ({
        number: i + 1,
        frequency: Math.floor(Math.random() * 100) + 1
      })).sort((a, b) => b.frequency - a.frequency),
      
      starFrequencies: Array.from({ length: 12 }, (_, i) => ({
        star: i + 1,
        frequency: Math.floor(Math.random() * 100) + 1
      })).sort((a, b) => b.frequency - a.frequency),
      
      numberPairs: [
        { numbers: [1, 17], occurrences: 12 },
        { numbers: [23, 44], occurrences: 10 },
        { numbers: [7, 32], occurrences: 9 }
      ],
      
      patterns: [
        { description: 'Numéros consécutifs', occurrences: '15%' },
        { description: 'Numéros tous impairs', occurrences: '8%' },
        { description: 'Numéros tous pairs', occurrences: '7%' }
      ]
    };
    
    setTimeout(() => {
      dispatch({
        type: types.FETCH_STATISTICS_SUCCESS,
        payload: mockStatistics
      });
    }, 1000); // Simule un délai de réponse
  } catch (error) {
    dispatch({
      type: types.FETCH_STATISTICS_FAILURE,
      payload: error.message || 'Une erreur est survenue lors de la récupération des statistiques'
    });
  }
};
