// src/redux/reducers/drawReducer.js
import {
  FETCH_LATEST_DRAW_REQUEST,
  FETCH_LATEST_DRAW_SUCCESS,
  FETCH_LATEST_DRAW_FAILURE,
  FETCH_DRAW_HISTORY_REQUEST,
  FETCH_DRAW_HISTORY_SUCCESS,
  FETCH_DRAW_HISTORY_FAILURE
} from '../types';

const initialState = {
  latestDraw: null,
  draws: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null
};

const drawReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LATEST_DRAW_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_LATEST_DRAW_SUCCESS:
      return {
        ...state,
        latestDraw: action.payload,
        loading: false,
        error: null
      };
    
    case FETCH_LATEST_DRAW_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case FETCH_DRAW_HISTORY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_DRAW_HISTORY_SUCCESS:
      return {
        ...state,
        draws: action.payload.draws,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };
    
    case FETCH_DRAW_HISTORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    default:
      return state;
  }
};

export default drawReducer;
