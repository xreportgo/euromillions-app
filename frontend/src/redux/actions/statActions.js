import {
  FETCH_STATS_REQUEST,
  FETCH_STATS_SUCCESS,
  FETCH_STATS_FAILURE
} from '../types';

// L'import de apiClient n'étant pas utilisé, nous le supprimons
// import apiClient from '../../services/apiClient';

// Utilisons axios directement pour les requêtes API
import axios from 'axios';

// Configuration pour l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Action pour récupérer les statistiques générales
export const fetchStats = () => async (dispatch) => {
  dispatch({ type: FETCH_STATS_REQUEST });
  
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    
    dispatch({
      type: FETCH_STATS_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération des statistiques';
    
    dispatch({
      type: FETCH_STATS_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

// Action pour récupérer les fréquences des numéros
export const fetchNumberFrequencies = () => async (dispatch) => {
  dispatch({ type: FETCH_STATS_REQUEST });
  
  try {
    const response = await axios.get(`${API_BASE_URL}/stats/numbers`);
    
    dispatch({
      type: FETCH_STATS_SUCCESS,
      payload: {
        numberFrequencies: response.data
      }
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération des fréquences des numéros';
    
    dispatch({
      type: FETCH_STATS_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

// Action pour récupérer les fréquences des étoiles
export const fetchStarFrequencies = () => async (dispatch) => {
  dispatch({ type: FETCH_STATS_REQUEST });
  
  try {
    const response = await axios.get(`${API_BASE_URL}/stats/stars`);
    
    dispatch({
      type: FETCH_STATS_SUCCESS,
      payload: {
        starFrequencies: response.data
      }
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération des fréquences des étoiles';
    
    dispatch({
      type: FETCH_STATS_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

// Action pour récupérer la distribution des jours de tirage
export const fetchDrawDayDistribution = () => async (dispatch) => {
  dispatch({ type: FETCH_STATS_REQUEST });
  
  try {
    const response = await axios.get(`${API_BASE_URL}/stats/draw-days`);
    
    dispatch({
      type: FETCH_STATS_SUCCESS,
      payload: {
        drawDayDistribution: response.data
      }
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération de la distribution des jours de tirage';
    
    dispatch({
      type: FETCH_STATS_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

// Action pour récupérer toutes les statistiques en une seule requête
export const fetchAllStats = () => async (dispatch) => {
  dispatch({ type: FETCH_STATS_REQUEST });
  
  try {
    const statsPromise = axios.get(`${API_BASE_URL}/stats`);
    const numbersPromise = axios.get(`${API_BASE_URL}/stats/numbers`);
    const starsPromise = axios.get(`${API_BASE_URL}/stats/stars`);
    const drawDaysPromise = axios.get(`${API_BASE_URL}/stats/draw-days`);
    
    const [statsResponse, numbersResponse, starsResponse, drawDaysResponse] = await Promise.all([
      statsPromise, numbersPromise, starsPromise, drawDaysPromise
    ]);
    
    const payload = {
      ...statsResponse.data,
      numberFrequencies: numbersResponse.data,
      starFrequencies: starsResponse.data,
      drawDayDistribution: drawDaysResponse.data
    };
    
    dispatch({
      type: FETCH_STATS_SUCCESS,
      payload: payload
    });
    
    return payload;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération des statistiques';
    
    dispatch({
      type: FETCH_STATS_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};
