// src/redux/reducers/index.js
import { combineReducers } from 'redux';
import drawReducer from './drawReducer';
import statReducer from './statReducer';
import predictionReducer from './predictionReducer';

const rootReducer = combineReducers({
  draws: drawReducer,
  stats: statReducer,
  predictions: predictionReducer
});

export default rootReducer;
