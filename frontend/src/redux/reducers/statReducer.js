// src/redux/reducers/statReducer.js
import * as types from '../types';

const initialState = {
  stats: null,
  loading: false,
  error: null
};

const statReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_STATISTICS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.FETCH_STATISTICS_SUCCESS:
      return {
        ...state,
        stats: action.payload,
        loading: false
      };
    case types.FETCH_STATISTICS_FAILURE:
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
