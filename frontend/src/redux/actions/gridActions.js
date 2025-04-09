// redux/actions/gridActions.js
import * as types from '../types';
import * as gridService from '../../services/gridService';

export const fetchSavedGrids = () => async (dispatch) => {
  dispatch({ type: types.FETCH_SAVED_GRIDS_REQUEST });
  try {
    const grids = await gridService.getAllGrids();
    dispatch({ 
      type: types.FETCH_SAVED_GRIDS_SUCCESS, 
      payload: grids 
    });
  } catch (error) {
    dispatch({ 
      type: types.FETCH_SAVED_GRIDS_FAILURE, 
      payload: error.message 
    });
  }
};

export const saveGrid = (grid) => async (dispatch) => {
  dispatch({ type: types.SAVE_GRID_REQUEST });
  try {
    const savedGrid = await gridService.saveGrid(grid);
    dispatch({ 
      type: types.SAVE_GRID_SUCCESS, 
      payload: savedGrid 
    });
    return savedGrid;
  } catch (error) {
    dispatch({ 
      type: types.SAVE_GRID_FAILURE, 
      payload: error.message 
    });
    throw error;
  }
};

export const updateGridName = (id, name) => async (dispatch) => {
  dispatch({ type: types.UPDATE_GRID_REQUEST });
  try {
    const updatedGrid = await gridService.updateGrid(id, { name });
    dispatch({ 
      type: types.UPDATE_GRID_SUCCESS, 
      payload: updatedGrid 
    });
    return updatedGrid;
  } catch (error) {
    dispatch({ 
      type: types.UPDATE_GRID_FAILURE, 
      payload: error.message 
    });
    throw error;
  }
};

export const deleteGrid = (id) => async (dispatch) => {
  dispatch({ type: types.DELETE_GRID_REQUEST, payload: id });
  try {
    await gridService.deleteGrid(id);
    dispatch({ 
      type: types.DELETE_GRID_SUCCESS, 
      payload: id 
    });
  } catch (error) {
    dispatch({ 
      type: types.DELETE_GRID_FAILURE, 
      payload: { id, error: error.message } 
    });
    throw error;
  }
};
