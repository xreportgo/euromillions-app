// src/redux/actions/drawActions.js
import { 
  FETCH_LATEST_DRAW_REQUEST, 
  FETCH_LATEST_DRAW_SUCCESS, 
  FETCH_LATEST_DRAW_FAILURE,
  FETCH_DRAW_HISTORY_REQUEST,
  FETCH_DRAW_HISTORY_SUCCESS,
  FETCH_DRAW_HISTORY_FAILURE
} from '../types';

// Utilisons axios directement pour les requêtes API
import axios from 'axios';

// Configuration pour l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Action pour récupérer le dernier tirage
export const fetchLatestDraw = () => async (dispatch) => {
  dispatch({ type: FETCH_LATEST_DRAW_REQUEST });
  
  try {
    const response = await axios.get(`${API_BASE_URL}/draws/latest`);
    
    dispatch({
      type: FETCH_LATEST_DRAW_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération du tirage';
    
    dispatch({
      type: FETCH_LATEST_DRAW_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

// Action pour récupérer l'historique des tirages
export const fetchDrawHistory = (page = 1, limit = 10) => async (dispatch) => {
  dispatch({ type: FETCH_DRAW_HISTORY_REQUEST });
  
  try {
    const response = await axios.get(`${API_BASE_URL}/draws`, {
      params: { page, limit }
    });
    
    dispatch({
      type: FETCH_DRAW_HISTORY_SUCCESS,
      payload: {
        draws: response.data.draws,
        pagination: response.data.pagination
      }
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération de l\'historique';
    
    dispatch({
      type: FETCH_DRAW_HISTORY_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

// Action pour récupérer un tirage spécifique par date
export const fetchDrawByDate = (date) => async (dispatch) => {
  dispatch({ type: FETCH_LATEST_DRAW_REQUEST });
  
  try {
    const response = await axios.get(`${API_BASE_URL}/draws/by-date/${date}`);
    
    dispatch({
      type: FETCH_LATEST_DRAW_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération du tirage';
    
    dispatch({
      type: FETCH_LATEST_DRAW_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

// Action pour récupérer un tirage spécifique par ID
export const fetchDrawById = (id) => async (dispatch) => {
  dispatch({ type: FETCH_LATEST_DRAW_REQUEST });
  
  try {
    const response = await axios.get(`${API_BASE_URL}/draws/${id}`);
    
    dispatch({
      type: FETCH_LATEST_DRAW_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération du tirage';
    
    dispatch({
      type: FETCH_LATEST_DRAW_FAILURE,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};
