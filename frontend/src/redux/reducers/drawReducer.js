// src/redux/reducers/drawReducer.js
import * as types from '../types';

const initialState = {
  latestDraw: null,
  drawHistory: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  loading: false,
  error: null
};

const drawReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch latest draws
    case types.FETCH_LATEST_DRAWS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.FETCH_LATEST_DRAWS_SUCCESS:
      return {
        ...state,
        latestDraw: action.payload,
        loading: false
      };
    case types.FETCH_LATEST_DRAWS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    // Fetch draw history
    case types.FETCH_DRAW_HISTORY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.FETCH_DRAW_HISTORY_SUCCESS:
      return {
        ...state,
        drawHistory: action.payload.draws,
        pagination: action.payload.pagination,
        loading: false
      };
    case types.FETCH_DRAW_HISTORY_FAILURE:
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
