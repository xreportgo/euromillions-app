// src/redux/reducers/statReducer.js
import {
  FETCH_STATS_REQUEST,
  FETCH_STATS_SUCCESS,
  FETCH_STATS_FAILURE,
  FETCH_NUMBER_FREQUENCIES_REQUEST,
  FETCH_NUMBER_FREQUENCIES_SUCCESS,
  FETCH_NUMBER_FREQUENCIES_FAILURE,
  FETCH_STAR_FREQUENCIES_REQUEST,
  FETCH_STAR_FREQUENCIES_SUCCESS,
  FETCH_STAR_FREQUENCIES_FAILURE,
  FETCH_DRAW_DAY_DISTRIBUTION_REQUEST,
  FETCH_DRAW_DAY_DISTRIBUTION_SUCCESS,
  FETCH_DRAW_DAY_DISTRIBUTION_FAILURE
} from '../types';

const initialState = {
  general: {
    totalDraws: 0,
    firstDrawDate: null,
    lastDrawDate: null,
    biggestJackpot: {
      amount: 0,
      date: null
    },
    averageJackpot: 0
  },
  numberFrequencies: [],
  starFrequencies: [],
  drawDayDistribution: [],
  loading: false,
  error: null
};

const statReducer = (state = initialState, action) => {
  switch (action.type) {
    // Stats générales
    case FETCH_STATS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_STATS_SUCCESS:
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null
      };
    
    case FETCH_STATS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Fréquences des numéros
    case FETCH_NUMBER_FREQUENCIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_NUMBER_FREQUENCIES_SUCCESS:
      return {
        ...state,
        numberFrequencies: action.payload,
        loading: false,
        error: null
      };
    
    case FETCH_NUMBER_FREQUENCIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Fréquences des étoiles
    case FETCH_STAR_FREQUENCIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_STAR_FREQUENCIES_SUCCESS:
      return {
        ...state,
        starFrequencies: action.payload,
        loading: false,
        error: null
      };
    
    case FETCH_STAR_FREQUENCIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Distribution des jours de tirage
    case FETCH_DRAW_DAY_DISTRIBUTION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_DRAW_DAY_DISTRIBUTION_SUCCESS:
      return {
        ...state,
        drawDayDistribution: action.payload,
        loading: false,
        error: null
      };
    
    case FETCH_DRAW_DAY_DISTRIBUTION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    default:
      return state;
  }
};

export default statReducer;
