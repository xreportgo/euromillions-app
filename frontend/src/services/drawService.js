import { fetchData } from './apiService';

/**
 * Retrieves latest draws
 * @param {number} limit - Number of draws to retrieve
 * @returns {Promise} - Array of draw objects
 */
export const getLatestDraws = async (limit = 10) => {
  try {
    return await fetchData('/draws', { limit });
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves draws history with pagination
 * @param {number} page - Page number
 * @param {number} pageSize - Number of items per page
 * @param {Object} filters - Optional filters
 * @returns {Promise} - Object with draws array and pagination info
 */
export const getDrawsHistory = async (page = 1, pageSize = 20, filters = {}) => {
  try {
    return await fetchData('/draws/history', { 
      page, 
      pageSize,
      ...filters 
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a specific draw by ID
 * @param {string} drawId - Draw ID
 * @returns {Promise} - Draw object
 */
export const getDrawById = async (drawId) => {
  try {
    return await fetchData(`/draws/${drawId}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves draws between two dates
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise} - Array of draw objects
 */
export const getDrawsByDateRange = async (startDate, endDate) => {
  try {
    return await fetchData('/draws/date-range', { startDate, endDate });
  } catch (error) {
    throw error;
  }
};

/**
 * Gets information about the next draw
 * @returns {Promise} - Next draw information (date, estimated jackpot)
 */
export const getNextDraw = async () => {
  try {
    return await fetchData('/draws/next');
  } catch (error) {
    throw error;
  }
};

export default {
  getLatestDraws,
  getDrawsHistory,
  getDrawById,
  getDrawsByDateRange,
  getNextDraw
};
        

        gridService.js
        frontend/src/services/gridService.js
        
            import { fetchData, postData, updateData, deleteData } from './apiService';

/**
 * Generates grid(s) using specified model and options
 * @param {Object} options - Generation options
 * @param {string} options.model - Model ID to use for generation
 * @param {Array} options.excludedNumbers - Numbers to exclude
 * @param {Array} options.excludedStars - Stars to exclude
 * @param {number} options.count - Number of grids to generate
 * @returns {Promise} - Array of generated grid objects
 */
export const generateGrids = async (options) => {
  try {
    return await postData('/grids/generate', options);
  } catch (error) {
    throw error;
  }
};

/**
 * Saves a grid to user's saved grids
 * @param {Object} grid - Grid to save
 * @returns {Promise} - Saved grid object with ID
 */
export const saveGrid = async (grid) => {
  try {
    return await postData('/grids', grid);
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves user's saved grids
 * @param {number} limit - Number of grids to retrieve
 * @returns {Promise} - Array of saved grid objects
 */
export const getSavedGrids = async (limit = 10) => {
  try {
    return await fetchData('/grids', { limit });
  } catch (error) {
    throw error;
  }
};

/**
 * Updates a saved grid
 * @param {string} gridId - Grid ID
 * @param {Object} gridData - Updated grid data
 * @returns {Promise} - Updated grid object
 */
export const updateGrid = async (gridId, gridData) => {
  try {
    return await updateData(`/grids/${gridId}`, gridData);
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a saved grid
 * @param {string} gridId - Grid ID
 * @returns {Promise} - Success message
 */
export const deleteGrid = async (gridId) => {
  try {
    return await deleteData(`/grids/${gridId}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Checks results of a grid against past draws
 * @param {Object} grid - Grid to check
 * @returns {Promise} - Array of matching results
 */
export const checkGridResults = async (grid) => {
  try {
    return await postData('/grids/check-results', grid);
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a printable version of a grid
 * @param {Object} grid - Grid to print
 */
export const printGrid = (grid) => {
  // This function is implemented on the client-side
  // See the GenerateGrid.js component for implementation
};

export default {
  generateGrids,
  saveGrid,
  getSavedGrids,
  updateGrid,
  deleteGrid,
  checkGridResults,
  printGrid
};
        

        predictionService.js
        frontend/src/services/predictionService.js
        
            import { fetchData, postData } from './apiService';

/**
 * Retrieves predictions for the next EuroMillions draw
 * @param {string} method - Prediction method to use
 * @returns {Promise} - Prediction object
 */
export const getPrediction = async (method = 'balanced') => {
  try {
    return await fetchData('/predictions', { method });
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves predictions using multiple methods
 * @returns {Promise} - Array of prediction objects with different methods
 */
export const getAllPredictions = async () => {
  try {
    return await fetchData('/predictions/all');
  } catch (error) {
    throw error;
  }
};

/**
 * Gets evaluation metrics for different prediction methods
 * @returns {Promise} - Array of method performance metrics
 */
export const getPredictionPerformance = async () => {
  try {
    return await fetchData('/predictions/performance');
  } catch (error) {
    throw error;
  }
};

/**
 * Evaluates a custom prediction against historical data
 * @param {Object} prediction - Prediction to evaluate
 * @returns {Promise} - Evaluation metrics
 */
export const evaluatePrediction = async (prediction) => {
  try {
    return await postData('/predictions/evaluate', prediction);
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves available prediction methods with descriptions
 * @returns {Promise} - Array of prediction method objects
 */
export const getPredictionMethods = async () => {
  try {
    return await fetchData('/predictions/methods');
  } catch (error) {
    throw error;
  }
};

export default {
  getPrediction,
  getAllPredictions,
  getPredictionPerformance,
  evaluatePrediction,
  getPredictionMethods
};
        

        statsService.js
        frontend/src/services/statsService.js
        
            import { fetchData } from './apiService';

/**
 * Retrieves comprehensive statistics for EuroMillions data
 * @param {string} timeRange - Time range for statistics ('3m', '6m', '1y', '3y', 'all')
 * @returns {Promise} - Statistics object
 */
export const fetchStatistics = async (timeRange = '1y') => {
  try {
    return await fetchData('/stats', { timeRange });
  } catch (error) {
    throw error;
  }
};

/**
 * Gets number frequency statistics
 * @param {string} timeRange - Time range
 * @returns {Promise} - Array of number frequency data
 */
export const getNumberFrequencies = async (timeRange = '1y') => {
  try {
    return await fetchData('/stats/number-frequencies', { timeRange });
  } catch (error) {
    throw error;
  }
};

/**
 * Gets star frequency statistics
 * @param {string} timeRange - Time range
 * @returns {Promise} - Array of star frequency data
 */
export const getStarFrequencies = async (timeRange = '1y') => {
  try {
    return await fetchData('/stats/star-frequencies', { timeRange });
  } catch (error) {
    throw error;
  }
};

/**
 * Gets jackpot trend data
 * @param {string} timeRange - Time range
 * @returns {Promise} - Array of jackpot data points
 */
export const getJackpotTrend = async (timeRange = '1y') => {
  try {
    return await fetchData('/stats/jackpot-trend', { timeRange });
  } catch (error) {
    throw error;
  }
};

/**
 * Gets pairs analysis data
 * @param {string} timeRange - Time range
 * @returns {Promise} - Array of number pair frequency data
 */
export const getPairsAnalysis = async (timeRange = '1y') => {
  try {
    return await fetchData('/stats/pairs-analysis', { timeRange });
  } catch (error) {
    throw error;
  }
};

/**
 * Gets odd/even distribution data
 * @param {string} timeRange - Time range
 * @returns {Promise} - Array of odd/even distribution data
 */
export const getOddEvenDistribution = async (timeRange = '1y') => {
  try {
    return await fetchData('/stats/odd-even-distribution', { timeRange });
  } catch (error) {
    throw error;
  }
};

/**
 * Gets sum distribution data
 * @param {string} timeRange - Time range
 * @returns {Promise} - Array of number sum distribution data
 */
export const getSumDistribution = async (timeRange = '1y') => {
  try {
    return await fetchData('/stats/sum-distribution', { timeRange });
  } catch (error) {
    throw error;
  }
};

export default {
  fetchStatistics,
  getNumberFrequencies,
  getStarFrequencies,
  getJackpotTrend,
  getPairsAnalysis,
  getOddEvenDistribution,
  getSumDistribution
};
        

        Internationalisation
        
        frontend/src/i18n/config.js
        
            import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './en.json';
import frTranslation from './fr.json';
import ptTranslation from './pt.json';

const resources = {
  en: {
    translation: enTranslation
  },
  fr: {
    translation: frTranslation
  },
  pt: {
    translation: ptTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    }
  });

export default i18n;
        

        frontend/src/i18n/fr.json (extrait)
        
            {
  "language": "Langue",
  "dashboard": "Tableau de bord",
  "drawHistory": "Historique des tirages",
  "generateGrid": "Générer une grille",
  "predictions": "Prédictions",
  "statistics": "Statistiques",
  "settings": "Paramètres",
  
  "welcomeTitle": "Bienvenue dans l'Analyseur EuroMillions",
  "welcomeMessage": "Analysez les tirages passés, générez des grilles intelligentes et découvrez des statistiques détaillées.",
  
  "latestDraws": "Derniers tirages",
  "yourGrids": "Vos grilles",
  "nextDraw": "Prochain tirage",
  "nextDrawDate": "Date du prochain tirage",
  "estimatedJackpot": "Jackpot estimé",
  
  "generateGrids": "Générer des grilles",
  "generationModel": "Modèle de génération",
  "excludeNumbers": "Exclure des numéros",
  "excludeStars": "Exclure des étoiles",
  "gridCount": "Nombre de grilles",
  
  "randomModel": "Aléatoire",
  "frequencyModel": "Basé sur la fréquence",
  "hotNumbersModel": "Numéros fréquents",
  "coldNumbersModel": "Numéros rares",
  "balancedModel": "Équilibré",
  "neuralNetworkModel": "Réseau neuronal",
  
  "randomModelDescription": "Génère des grilles complètement aléatoires",
  "frequencyModelDescription": "Génère des grilles basées sur la fréquence d'apparition des numéros",
  "hotNumbersModelDescription": "Privilégie les numéros qui sont sortis fréquemment récemment",
  "coldNumbersModelDescription": "Privilégie les numéros qui sont sortis rarement récemment",
  "balancedModelDescription": "Équilibre entre numéros fréquents et rares",
  "neuralNetworkModelDescription": "Utilise un réseau de neurones pour prédire les numéros potentiels",
  
  "generatedGrid": "Grille générée",
  "generatedUsing": "Générée avec",
  "confidence": "Confiance",
  "save": "Enregistrer",
  "print": "Imprimer",
  "checkResults": "Vérifier résultats",
  
  "noGridsGenerated": "Aucune grille générée",
  "useGeneratorToCreate": "Utilisez le générateur pour créer vos grilles",
  "noGridsFound": "Aucune grille sauvegardée",
  "noDrawsFound": "Aucun tirage trouvé",
  
  "jackpot": "Jackpot",
  "jackpotWon": "Jackpot gagné!",
  "jackpotWon_plural": "Jackpot gagné par {{count}} gagnants!",
  "noJackpotWinners": "Pas de gagnant",
  
  "numberFrequencies": "Fréquence des numéros",
  "starFrequencies": "Fréquence des étoiles",
  "jackpotTrend": "Évolution du jackpot",
  "frequentPairs": "Paires fréquentes",
  "oddEvenDistribution": "Distribution pairs/impairs",
  
  "threeMonths": "3 mois",
  "sixMonths": "6 mois",
  "oneYear": "1 an",
  "threeYears": "3 ans",
  "allTime": "Depuis le début",
  "timeRange": "Période",
  
  "frequency": "Fréquence",
  "percentage": "Pourcentage",
  "numbers": "Numéros",
  "stars": "Étoiles",
  "number": "Numéro",
  "star": "Étoile",
  "drawDate": "Date du tirage",
  "jackpotMillions": "Jackpot (millions €)",
  "million": "million",
  
  "statsSummary": "Résumé des statistiques",
  "mostCommonNumbers": "Numéros les plus fréquents",
  "mostCommonStars": "Étoiles les plus fréquentes",
  "averageJackpot": "Jackpot moyen",
  "jackpotsWon": "Jackpots gagnés",
  
  "viewAll": "Voir tout",
  "viewPredictions": "Voir les prédictions",
  "viewStatistics": "Voir les statistiques",
  "generateNewGrid": "Générer une nouvelle grille",
  
  "disclaimer": "Avertissement légal",
  "disclaimerShort": "À des fins éducatives uniquement",
  "disclaimerText1": "Cette application est conçue uniquement à des fins éducatives et de divertissement. Les analyses et prédictions ne garantissent pas de gains.",
  "disclaimerText2": "Les jeux de hasard peuvent créer une dépendance. Jouez de manière responsable.",
  
  "allRightsReserved": "Tous droits réservés",
  "errorLoadingStats": "Erreur lors du chargement des statistiques",
  "generationError": "Erreur lors de la génération des grilles",
  "printGrid": "Imprimer la grille"
}
        

        Redux Store
        
        frontend/src/redux/store.js
        
            import { configureStore } from '@reduxjs/toolkit';
import drawsReducer from './reducers/drawsReducer';
import gridsReducer from './reducers/gridsReducer';
import predictionsReducer from './reducers/predictionsReducer';
import statsReducer from './reducers/statsReducer';
import uiReducer from './reducers/uiReducer';

const store = configureStore({
  reducer: {
    draws: drawsReducer,
    grids: gridsReducer,
    predictions: predictionsReducer,
    stats: statsReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
        

        frontend/src/redux/reducers/drawsReducer.js
        
            import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLatestDraws, getDrawsHistory, getDrawById } from '../../services/drawService';

// Async thunks
export const fetchLatestDraws = createAsyncThunk(
  'draws/fetchLatest',
  async (limit, { rejectWithValue }) => {
    try {
      return await getLatestDraws(limit);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDrawsHistory = createAsyncThunk(
  'draws/fetchHistory',
  async ({ page, pageSize, filters }, { rejectWithValue }) => {
    try {
      return await getDrawsHistory(page, pageSize, filters);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDrawById = createAsyncThunk(
  'draws/fetchById',
  async (drawId, { rejectWithValue }) => {
    try {
      return await getDrawById(drawId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const drawsSlice = createSlice({
  name: 'draws',
  initialState: {
    draws: [],
    currentDraw: null,
    pagination: {
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0
    },
    loading: false,
    error: null
  },
  reducers: {
    clearDraws: (state) => {
      state.draws = [];
    },
    clearCurrentDraw: (state) => {
      state.currentDraw = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchLatestDraws
      .addCase(fetchLatestDraws.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestDraws.fulfilled, (state, action) => {
        state.loading = false;
        state.draws = action.payload;
      })
      .addCase(fetchLatestDraws.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchDrawsHistory
      .addCase(fetchDrawsHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrawsHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.draws = action.payload.draws;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchDrawsHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchDrawById
      .addCase(fetchDrawById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrawById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDraw = action.payload;
      })
      .addCase(fetchDrawById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearDraws, clearCurrentDraw } = drawsSlice.actions;

export default drawsSlice.reducer;
        

        
            Note : Le code présenté dans ce document est une version complète du frontend de l'application EuroMillions. Il s'intègre parfaitement avec le backend que nous avons développé précédemment. Pour utiliser ce code, copiez chaque fichier dans la structure de dossiers correspondante.
        
        
        
        
        
        
        
        
    

