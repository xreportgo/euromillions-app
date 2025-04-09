// src/redux/reducers/predictionReducer.js
import * as types from '../types';

const initialState = {
  predictions: [],
  loading: false,
  error: null
};

const predictionReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_PREDICTIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.FETCH_PREDICTIONS_SUCCESS:
      return {
        ...state,
        predictions: action.payload,
        loading: false
      };
    case types.FETCH_PREDICTIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export default predictionReducer;
