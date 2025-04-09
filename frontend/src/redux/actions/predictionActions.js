// src/redux/actions/predictionActions.js
import * as types from '../types';
import apiClient from '../../services/apiService';

// Fonction pour récupérer les prédictions
export const fetchPredictions = () => async (dispatch) => {
  dispatch({ type: types.FETCH_PREDICTIONS_REQUEST });
  
  try {
    // Simuler une réponse pour le développement
    // Dans une application réelle, vous feriez un appel API ici
    // const response = await apiClient.get('/predictions');
    
    // Données de prédictions simulées pour le développement
    const mockPredictions = [
      {
        id: 1,
        numbers: [7, 12, 23, 34, 45],
        stars: [3, 9],
        confidence: 0.75,
        model: 'frequency'
      },
      {
        id: 2,
        numbers: [3, 17, 25, 37, 41],
        stars: [2, 8],
        confidence: 0.68,
        model: 'hotNumbers'
      },
      {
        id: 3,
        numbers: [5, 10, 15, 20, 25],
        stars: [5, 10],
        confidence: 0.62,
        model: 'pattern'
      }
    ];
    
    setTimeout(() => {
      dispatch({
        type: types.FETCH_PREDICTIONS_SUCCESS,
        payload: mockPredictions
      });
    }, 1000); // Simule un délai de réponse
  } catch (error) {
    dispatch({
      type: types.FETCH_PREDICTIONS_FAILURE,
      payload: error.message || 'Une erreur est survenue lors de la récupération des prédictions'
    });
  }
};
