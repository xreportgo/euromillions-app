// redux/reducers/gridReducer.js
import * as types from '../types';

const initialState = {
  savedGrids: [],
  loading: false,
  error: null
};

const gridReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch saved grids
    case types.FETCH_SAVED_GRIDS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.FETCH_SAVED_GRIDS_SUCCESS:
      return {
        ...state,
        savedGrids: action.payload,
        loading: false
      };
    case types.FETCH_SAVED_GRIDS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    // Save grid  
    case types.SAVE_GRID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.SAVE_GRID_SUCCESS:
      return {
        ...state,
        savedGrids: [action.payload, ...state.savedGrids],
        loading: false
      };
    case types.SAVE_GRID_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Update grid
    case types.UPDATE_GRID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.UPDATE_GRID_SUCCESS:
      return {
        ...state,
        savedGrids: state.savedGrids.map(grid => 
          grid._id === action.payload._id ? action.payload : grid
        ),
        loading: false
      };
    case types.UPDATE_GRID_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Delete grid
    case types.DELETE_GRID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.DELETE_GRID_SUCCESS:
      return {
        ...state,
        savedGrids: state.savedGrids.filter(
          grid => grid._id !== action.payload
        ),
        loading: false
      };
    case types.DELETE_GRID_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
      
    default:
      return state;
  }
};

export default gridReducer;
