import {
  FETCH_PREDICTIONS_REQUEST,
  FETCH_PREDICTIONS_SUCCESS,
  FETCH_PREDICTIONS_FAILURE,
  GENERATE_PREDICTION_REQUEST,
  GENERATE_PREDICTION_SUCCESS,
  GENERATE_PREDICTION_FAILURE
} from '../types';

// L'import de apiClient n'étant pas utilisé, nous le supprimons
// import apiClient from '../../services/apiClient';

// Utilisons axios directement pour les requêtes API
import axios from 'axios';

// Configuration pour l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Action pour récupérer les prédictions
export const fetchPredictions = () => async (dispatch) => {
  dispatch({ type: FETCH_PREDICTIONS_REQUEST });
  
  try {
    const response = await axios.get(`${API_BASE_URL}/predictions`);
    
    dispatch({
      type: FETCH_PREDICTIONS_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération des prédictions';
    
    dispatch({
      type: FETCH_PREDICTIONS_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

// Action pour générer une nouvelle prédiction
export const generatePrediction = () => async (dispatch) => {
  dispatch({ type: GENERATE_PREDICTION_REQUEST });
  
  try {
    // Simulation d'un appel API (remplacer par votre API réelle)
    // Dans un environnement de développement, nous pouvons simuler la réponse
    // Lors de l'intégration avec le backend, remplacer cette partie par un vrai appel API
    
    // Simuler un délai pour l'appel API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Générer 5 nombres aléatoires entre 1 et 50 (sans doublons)
    const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
    const numbers = [];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * allNumbers.length);
      numbers.push(allNumbers[randomIndex]);
      allNumbers.splice(randomIndex, 1);
    }
    numbers.sort((a, b) => a - b);
    
    // Générer 2 étoiles aléatoires entre 1 et 12 (sans doublons)
    const allStars = Array.from({ length: 12 }, (_, i) => i + 1);
    const stars = [];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * allStars.length);
      stars.push(allStars[randomIndex]);
      allStars.splice(randomIndex, 1);
    }
    stars.sort((a, b) => a - b);
    
    // Créer un objet prédiction
    const prediction = {
      id: Date.now().toString(),
      numbers,
      stars,
      date: new Date().toISOString(),
      confidence: Math.floor(Math.random() * 100)
    };
    
    // Lors de l'intégration avec le backend, utiliser ceci à la place :
    // const response = await axios.post(`${API_BASE_URL}/predictions/generate`);
    // const prediction = response.data;
    
    dispatch({
      type: GENERATE_PREDICTION_SUCCESS,
      payload: prediction
    });
    
    return prediction;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la génération de la prédiction';
    
    dispatch({
      type: GENERATE_PREDICTION_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

// Action pour récupérer une prédiction par ID
export const fetchPredictionById = (id) => async (dispatch) => {
  dispatch({ type: FETCH_PREDICTIONS_REQUEST });
  
  try {
    const response = await axios.get(`${API_BASE_URL}/predictions/${id}`);
    
    dispatch({
      type: FETCH_PREDICTIONS_SUCCESS,
      payload: [response.data]
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération de la prédiction';
    
    dispatch({
      type: FETCH_PREDICTIONS_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};
