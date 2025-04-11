// src/redux/reducers/index.js
import { combineReducers } from 'redux';
import drawReducer from './drawReducer';

// Importez d'autres reducers ici au besoin
// import gridReducer from './gridReducer';
// import statReducer from './statReducer';

const rootReducer = combineReducers({
  draws: drawReducer,
  // Ajoutez d'autres reducers ici
  // grids: gridReducer,
  // stats: statReducer
});

export default rootReducer;
